#!/bin/sh

#
# (c) 2025 Cezary Jackiewicz <cezary@eko.one.pl>
#

DEVICE=$(uci -q get network.wan.device)
if [ -z "$DEVICE" ]; then
	echo '{"error":"Device not found"}'
	exit 0
fi

. /usr/share/libubox/jshn.sh
mmcli -m "$DEVICE" --signal-setup=3 >/dev/null 2>&1

json_load "$(mmcli -m "$DEVICE" -J --get-cell-info | jsonfilter -q -e '@.modem.*')"
if json_is_a "cell-info" array; then
	json_select "cell-info"
	idx=1
	while json_is_a ${idx} string; do
		json_get_var line $idx
		if echo "$line" | grep -q "serving: yes"; then
			IFS=','
			for F in $line; do
				KEY=""
				VAL=""
				eval $(echo "$F" | awk -F: '{gsub(" ", "");printf "KEY=%s, VAL=%s\n", $1, $2}')
				case "$KEY" in
					"celltype")
						MODE=$VAL
						_MODE=$(echo "$VAL" | tr 'a-z' 'A-Z')
						case "$_MODE" in
							"LTE")
								MODE_NUM=7
								;;
							"UMTS")
								MODE_NUM=2
								;;
						esac
						;;
					"operatorid")
						COPS_NUM=$VAL
						_plmn_mcc=${COPS_NUM:0:3}
						_plmn_mnc=${COPS_NUM:3:3}
						_plmn_mnc=$(printf "%02d" $_plmn_mnc)
						;;
					"tac")
						_TAC=$VAL
						;;
					"ci")
						_CELLID=$VAL
						;;
					"physicalci")
						_pci=$(printf "%d" "0x$VAL")
						;;
					"earfcn")
						_earfcn=$VAL
						;;
					"rsrp")
						_rsrp=$VAL
						;;
					"rsrq")
						_rsrq=$VAL
						;;
				esac
			done
			break
		fi
		idx=$((idx + 1))
	done
fi

_SIGNAL=0
T=$(mmcli -m "$DEVICE" -J --signal-get | jsonfilter -q -e '@.modem.signal.'$MODE)
if [ -n "$T" ]; then
	_rsrp=""
	_rseq=""
	_rssi=""
	_snr=""
	_rscp=""
	_ecio=""
	eval $(echo "$T" | jsonfilter -q -e "_rsrp=@.rsrp" -e "_rsrq=@.rsrq" -e "_rssi=@.rssi" -e "_snr=@.snr" -e "_rscp=@.rscp" -e "_ecio=@.ecio")
	if [ -n "_rssi" ]; then
		[ "$(echo "$_rssi" | awk '{printf "%d\n", $1}')" -ge -51 ] && _rssi=-51
		_SIGNAL=$(((_rssi+113)*100/62))
	fi
fi

T=$(mmcli -m "$DEVICE" -J)
if [ -n "$FORCE_PLMN" ]; then
	_plmn_description=$(awk -F[\;] '/'$COPS_NUM'/ {print $2}' /usr/share/easyconfig/modem/mccmnc.dat)
	[ -z "$_plmn_description" ] && _plmn_description="$COPS_NUM"
else
	_plmn_description=$(echo "$T" | jsonfilter -q -e "@.modem['3gpp']['operator-name']")
fi
T=$(echo "$T" | jsonfilter -q -e "@.modem['3gpp']['registration-state']")
case "$T" in
	"home")
		_registration=1
		;;
	*)
		_registration=0
		;;
esac

echo "{"
echo "\"signal\":\"$_SIGNAL\","
echo "\"operator_name\":\"$_plmn_description\","
echo "\"operator_mcc\":\"$_plmn_mcc\","
echo "\"operator_mnc\":\"$_plmn_mnc\","
echo "\"mode\":\"$_MODE\","
echo "\"registration\":\"$_registration\","
if [ "$MODE_NUM" = "7" ]; then
	[ -n "$_CELLID" ] && _CELLID_DEC=$(printf "%d" "0x$_CELLID")
fi
echo "\"lac_dec\":\"\",\"lac_hex\":\"\",\"cid_dec\":\"$_CELLID_DEC\",\"cid_hex\":\"$_CELLID\",\"addon\":["
[ -n "$_rssi" ] && echo "{\"idx\":35,\"key\":\"RSSI\",\"value\":\"$(printf "%.1f" $_rssi) dBm\"},"
if [ "$MODE_NUM" = "7" ]; then
	[ -n "$_rsrp" ] && echo "{\"idx\":36,\"key\":\"RSRP\",\"value\":\"$(printf "%.1f" $_rsrp) dBm\"},"
	[ -n "$_rsrq" ] && echo "{\"idx\":37,\"key\":\"RSRQ\",\"value\":\"$(printf "%.1f" $_rsrq) dB\"},"
	[ -n "$_snr" ] && echo "{\"idx\":38,\"key\":\"SNR\",\"value\":\"$(printf "%.1f" $_snr) dB\"},"
	if [ -n "$_TAC" ]; then
		T_HEX=$(printf "%X" $_TAC)
		echo "{\"idx\":23,\"key\":\"TAC\",\"value\":\"$_TAC (${T_HEX})\"},"
	fi
fi
if [ "$MODE_NUM" = "2" ]; then
	[ -n "$_ecio" ] && echo "{\"idx\":36,\"key\":\"ECIO\",\"value\":\"$_ecio dB\"},"
fi
if [ -n "$_pci" ]; then
	echo "{\"idx\":33,\"key\":\"PCI\",\"value\":\"$_pci\"},"
fi
if [ -n "$_earfcn" ]; then 
	echo "{\"idx\":34,\"key\":\"EARFCN\",\"value\":\"$_earfcn\"},"
fi
echo "]}"

exit 0
