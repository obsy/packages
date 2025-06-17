#!/bin/sh

#
# (c) 2023-2025 Cezary Jackiewicz <cezary@eko.one.pl>
#

DEVICE=$(uci -q get network.wan.device)
if [ -z "$DEVICE" ]; then
	echo '{"error":"Device not found"}'
	exit 0
fi
if [ ! -e "$DEVICE" ]; then
	echo '{"error":"Device not found"}'
	exit 0
fi

MBIM=""
[ "x$(uci -q get network.wan.proto)" = "xmbim" ] && MBIM="-m"

. /usr/share/libubox/jshn.sh

json_load "$(uqmi $MBIM -sd $DEVICE --get-serving-system --get-signal-info | sed 'N;s|\n| |;s|} {|,|')"
json_get_vars type rssi rsrq rsrp snr ecio registration plmn_mcc plmn_mnc plmn_description roaming

MODE=$(echo $type | tr 'a-z' 'A-Z')
case "$MODE" in
	"LTE") MODE_NUM=7;;
	"WCDMA") MODE_NUM=2;;
	*) MODE_NUM=0;;
esac

if [ "x$FORCE_PLMN" = "x1" ]; then
	COPS_NUM="$plmn_mcc"$(printf %02d $plmn_mnc)
	plmn_description=$(awk -F[\;] '/'$COPS_NUM'/ {print $2}' /usr/share/easyconfig/modem/mccmnc.dat)
	[ -z "$plmn_description" ] && plmn_description="$COPS_NUM"
fi

if [ -n "$rssi" ]; then
	[ $rssi -ge -51 ] && rssi=-51
	SIGNAL=$(((rssi+113)*100/62))
else
	SIGNAL=0
fi

case "$registration" in
	"not_registered")
		registration="0"
		;;
	"registered")
		registration="1"
		[ "x$roaming" = "x1" ] && registration="5"
		;;
	"searching")
		registration="2"
		;;
	"registering_denied")
		registration="3"
		;;
	*)
		registration=""
		;;
esac

PB=""
PF=""
PBW=""
S1B=""
S1F=""
S1BW=""
S1STATE=""
S2B=""
S2F=""
S2BW=""
S2STATE=""
S3B=""
S3F=""
S3BW=""
S3STATE=""
S4B=""
S4F=""
S4BW=""
S4STATE=""
if [ "$MODE_NUM" = "7" ]; then
	eval $(uqmi $MBIM -sd $DEVICE --get-lte-cphy-ca-info 2>/dev/null | jsonfilter -q \
		-e 'PB=@.primary.band' -e 'PF=@.primary.frequency' -e 'PBW=@.primary.bandwidth' \
		-e 'S1B=@.secondary_1.band' -e 'S1F=@.secondary_1.frequency' -e 'S1BW=@.secondary_1.bandwidth' -e 'S1STATE=@.secondary_1.state' \
		-e 'S2B=@.secondary_2.band' -e 'S2F=@.secondary_2.frequency' -e 'S2BW=@.secondary_2.bandwidth' -e 'S2STATE=@.secondary_2.state' \
		-e 'S3B=@.secondary_3.band' -e 'S3F=@.secondary_3.frequency' -e 'S3BW=@.secondary_3.bandwidth' -e 'S3STATE=@.secondary_3.state' \
		-e 'S4B=@.secondary_4.band' -e 'S4F=@.secondary_4.frequency' -e 'S4BW=@.secondary_4.bandwidth' -e 'S4STATE=@.secondary_4.state')
	[ -n "$PB" ] && MODE="${MODE} B${PB} (${PF} MHz)"
	[ -n "$S1B" ] && [ "x$S1STATE" = "xactivated" ] && MODE="${MODE} / B${S1B} (${S1F} MHz)"
	[ -n "$S2B" ] && [ "x$S2STATE" = "xactivated" ] && MODE="${MODE} / B${S2B} (${S2F} MHz)"
	[ -n "$S3B" ] && [ "x$S3STATE" = "xactivated" ] && MODE="${MODE} / B${S3B} (${S3F} MHz)"
	[ -n "$S4B" ] && [ "x$S4STATE" = "xactivated" ] && MODE="${MODE} / B${S4B} (${S4F} MHz)"
	echo "$MODE" | grep -q " / B" && MODE=${MODE/LTE/LTE_A}
fi

echo "{"
echo "\"signal\":\"$SIGNAL\","
echo "\"operator_name\":\"$plmn_description\","
echo "\"operator_mcc\":\"$plmn_mcc\","
echo "\"operator_mnc\":\"$(printf "%02d" $plmn_mnc)\","
echo "\"mode\":\"$MODE\","
echo "\"registration\":\"$registration\","
TAC=""
CELLID=""
if [ "$MODE_NUM" = "7" ]; then
	SCELLID=""
	ENODEBID=""
	eval $(uqmi $MBIM -sd $DEVICE --get-system-info 2>/dev/null | jsonfilter -q -e 'TAC=@.lte.tracking_area_code' -e 'SCELLID=@.lte.cell_id' -e 'ENODEBID=@.lte.enodeb_id')
	if [ -n "$SCELLID" ] && [ -n "$ENODEBID" ]; then
		CELLID=$(printf "%X%X" $ENODEBID $SCELLID )
		CELLID_DEC=$(printf "%d" "0x$CELLID")
	fi
fi
echo "\"lac_dec\":\"\",\"lac_hex\":\"\",\"cid_dec\":\"$CELLID_DEC\",\"cid_hex\":\"$CELLID\",\"addon\":["
[ -n "$rssi" ] && echo "{\"idx\":35,\"key\":\"RSSI\",\"value\":\"$rssi dBm\"},"
if [ "$MODE_NUM" = "7" ]; then
	[ -n "$rsrp" ] && echo "{\"idx\":36,\"key\":\"RSRP\",\"value\":\"$rsrp dBm\"},"
	[ -n "$rsrq" ] && echo "{\"idx\":37,\"key\":\"RSRQ\",\"value\":\"$rsrq dB\"},"
	[ -n "$snr" ] && echo "{\"idx\":38,\"key\":\"SNR\",\"value\":\"$(printf "%.1f" $snr) dB\"},"
	[ -n "$PB" ] && echo "{\"idx\":30,\"key\":\"Primary band\",\"value\":\"B${PB} (${PF} MHz) @${PBW} MHz\"},"
	[ -n "$S1B" ] && [ "x$S1STATE" = "xactivated" ] && echo "{\"idx\":50,\"key\":\"(S1) band\",\"value\":\"B${S1B} (${S1F} MHz) @${S1BW} MHz\"},"
	[ -n "$S2B" ] && [ "x$S2STATE" = "xactivated" ] && echo "{\"idx\":60,\"key\":\"(S2) band\",\"value\":\"B${S2B} (${S2F} MHz) @${S2BW} MHz\"},"
	[ -n "$S3B" ] && [ "x$S3STATE" = "xactivated" ] && echo "{\"idx\":70,\"key\":\"(S3) band\",\"value\":\"B${S3B} (${S3F} MHz) @${S3BW} MHz\"},"
	[ -n "$S4B" ] && [ "x$S4STATE" = "xactivated" ] && echo "{\"idx\":80,\"key\":\"(S4) band\",\"value\":\"B${S4B} (${S4F} MHz) @${S4BW} MHz\"},"
	if [ -n "$TAC" ]; then
		T_HEX=$(printf "%X" $TAC)
		echo "{\"idx\":23,\"key\":\"TAC\",\"value\":\"$TAC (${T_HEX})\"},"
	fi
fi
if [ "$MODE_NUM" = "2" ]; then
	[ -n "$ecio" ] && echo "{\"idx\":36,\"key\":\"ECIO\",\"value\":\"$ecio dB\"},"
fi
echo "]}"

exit 0
