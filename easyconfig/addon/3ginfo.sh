#!/bin/sh

#
# (c) 2010-2018 Cezary Jackiewicz <cezary@eko.one.pl>
#

RES="/usr/share/3ginfo-lite"

DEVICE=$(uci -q get 3ginfo.@3ginfo[0].device)
if [ "x$DEVICE" = "x" ]; then
	touch /tmp/modem
	DEVICE=$(cat /tmp/modem)
else
	echo "$DEVICE" > /tmp/modem
fi

if [ "x$DEVICE" = "x" ]; then
	devices=$(ls /dev/ttyUSB* /dev/cdc-wdm* /dev/ttyACM* /dev/ttyHS* 2>/dev/null | sort -r)
	for d in $devices; do
		DEVICE=$d gcom -s $RES/probeport.gcom > /dev/null 2>&1
		if [ $? = 0 ]; then
			echo "$d" > /tmp/modem
			break
		fi
	done
	DEVICE=$(cat /tmp/modem)
fi

if [ "x$DEVICE" = "x" ]; then
	echo '{"error":"Device not found"}'
	exit 0
fi

#O=$(gcom -d $DEVICE -s $RES/3ginfo.gcom 2>/dev/null)
O=$(sms_tool -d $DEVICE at "AT+CSQ;+COPS=3,0;+COPS?;+COPS=3,2;+COPS?;+CREG=2;+CREG?")

# CSQ
CSQ=$(echo "$O" | awk -F[,\ ] '/^\+CSQ/ {print $2}')

[ "x$CSQ" = "x" ] && CSQ=-1
if [ $CSQ -ge 0 -a $CSQ -le 31 ]; then
	CSQ_PER=$(($CSQ * 100/31))
else
	CSQ="-"
	CSQ_PER="0"
fi

# COPS numeric
COPS_NUM=$(echo "$O" | awk -F[\"] '/^\+COPS: .,2/ {print $2}')
if [ "x$COPS_NUM" = "x" ]; then
	COPS_NUM="-"
	COPS_MCC="-"
	COPS_MNC="-"
else
	COPS_MCC=${COPS_NUM:0:3}
	COPS_MNC=${COPS_NUM:3:3}
	COPS=$(awk -F[\;] '/'$COPS_NUM'/ {print $2}' $RES/mccmnc.dat)
fi
[ "x$COPS" = "x" ] && COPS=$COPS_NUM

if [ -z "$FORCE_PLMN" ]; then
	# COPS alphanumeric
	T=$(echo "$O" | awk -F[\"] '/^\+COPS: .,0/ {print $2}')
	[ "x$T" != "x" ] && COPS="$T"
fi

# CREG
eval $(echo "$O" | awk -F[,] '/^\+CREG/ {gsub(/[[:space:]"]+/,"");printf "T=\"%d\";LAC_HEX=\"%X\";CID_HEX=\"%X\";LAC_DEC=\"%d\";CID_DEC=\"%d\";MODE1=\"%d\"", $2, "0x"$3, "0x"$4, "0x"$3, "0x"$4, $5}')
case "$T" in
	0*) REG="0";;
	1*) REG="1";;
	2*) REG="2";;
	3*) REG="3";;
	5*) REG="5";;
	 *) REG="-";;
esac

# MODE
[ -z "$MODE1" -o "x$MODE1" = "x0" ] && MODE1=$(echo "$O" | awk -F[,] '/^\+COPS/ {print $4;exit}')
case "$MODE1" in
	2*) MODE="UMTS";;
	3*) MODE="EDGE";;
	4*) MODE="HSDPA";;
	5*) MODE="HSUPA";;
	6*) MODE="HSPA";;
	7*) MODE="LTE";;
	 *) MODE="-";;
esac

T=$(echo "$O" | awk -F[,\ ] '/^\+CME ERROR:/ {print $0;exit}')
if [ -n "$T" ]; then
	case "$T" in
	"+CME ERROR: 10"*) REG="SIM not inserted";;
	"+CME ERROR: 11"*) REG="SIM PIN required";;
	"+CME ERROR: 12"*) REG="SIM PUK required";;
	"+CME ERROR: 13"*) REG="SIM failure";;
	"+CME ERROR: 14"*) REG="SIM busy";;
	"+CME ERROR: 15"*) REG="SIM wrong";;
	"+CME ERROR: 17"*) REG="SIM PIN2 required";;
	"+CME ERROR: 18"*) REG="SIM PUK2 required";;
			*) REG=$(echo "$T" | cut -f2 -d: | xargs);;
	esac
fi

# Huawei E3272
if grep -q "Vendor=12d1 ProdID=1506" /sys/kernel/debug/usb/devices; then
	O=$(sms_tool -d $DEVICE at "at^chiptemp?;^hcsq?")

	T=$(echo "$O" | awk -F[,:] '/^\^HCSQ:/ {print $2}' | xargs)
	if [ -n "$T" ]; then
		MODE="$T"

		case "$MODE" in
			WCDMA*)
				PARAM2=$(echo "$O" | awk -F[,:] '/^\^HCSQ:/ {print $4}' | xargs)
				PARAM3=$(echo "$O" | awk -F[,:] '/^\^HCSQ:/ {print $5}' | xargs)
				RSCP=$(awk 'BEGIN {print -121 + '$PARAM2'}')
				[ -n "$ADDON" ] && ADDON="$ADDON,"
				ADDON="$ADDON"'{"RSCP":"'$RSCP' dBm"}'
				ECIO=$(awk 'BEGIN {print -32.5 + '$PARAM3'/2}')
				[ -n "$ADDON" ] && ADDON="$ADDON,"
				ADDON="$ADDON"'{"ECIO":"'$ECIO' dB"}'
				;;
			LTE*)
				PARAM2=$(echo "$O" | awk -F[,:] '/^\^HCSQ:/ {print $4}' | xargs)
				PARAM3=$(echo "$O" | awk -F[,:] '/^\^HCSQ:/ {print $5}' | xargs)
				PARAM4=$(echo "$O" | awk -F[,:] '/^\^HCSQ:/ {print $6}' | xargs)
				RSRP=$(awk 'BEGIN {print -141 + '$PARAM2'}')
				[ -n "$ADDON" ] && ADDON="$ADDON,"
				ADDON="$ADDON"'{"RSRP":"'$RSRP' dBm"}'
				SINR=$(awk 'BEGIN {print -20.2 + '$PARAM3'/5}')
				[ -n "$ADDON" ] && ADDON="$ADDON,"
				ADDON="$ADDON"'{"SINR":"'$SINR' dB"}'
				RSRQ=$(awk 'BEGIN {print -20 + '$PARAM4'/2}')
				[ -n "$ADDON" ] && ADDON="$ADDON,"
				ADDON="$ADDON"'{"RSRQ":"'$RSRQ' dB"}'
				;;
		esac
	fi

	T=$(echo "$O" | awk -F[,:] '/^\^CHIPTEMP/ {t=0;for(i=2;i<=NF;i++)if($i!=65535){if($i>100){$i=$i/10};if($i>t){t=$i}};printf "%.1f", t}')
	if [ "x$T" != "x0.0" ]; then
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"Temperatura":"'$T' &deg;C"}'
	fi
fi

# ZTE MF821
if grep -q "Vendor=19d2 ProdID=0167" /sys/kernel/debug/usb/devices; then
	O=$(sms_tool -d $DEVICE at "at+zcellinfo?")
	BAND=$(echo "$O" | awk -F[,:] '/^\+ZCELLINFO:/ {print $4}')
	case "$MODE1" in
		7*)
			case "$BAND" in
				*"B1") MODE="$MODE B1 (2100 MHz)";;
				*"B3") MODE="$MODE B3 (1800 MHz)";;
				*"B7") MODE="$MODE B7 (2600 MHz)";;
				*"B8") MODE="$MODE B8 (900 MHz)";;
				*"B20") MODE="$MODE B20 (800 MHz)";;
				*) MODE="$MODE $BAND";;
			esac
			;;
		*)
			MODE="$MODE $BAND"
			;;
	esac
fi

# BroadMobi BM806U
if grep -q "Vendor=2020 ProdID=2033" /sys/kernel/debug/usb/devices; then
	O=$(sms_tool -d $DEVICE at "AT+BMTCELLINFO")

	ADDON=""
	T=$(echo "$O" | awk -F[,:] '/^RSSI:/ {print $2}' | xargs)
	if [ -n "$T" ]; then
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"RSSI":"-'$T' dBm"}'
	fi
	T=$(echo "$O" | awk -F[,:] '/^RSRP:/ {print $2}' | xargs)
	if [ -n "$T" ]; then
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"RSRP":"'$T' dBm"}'
	fi
	T=$(echo "$O" | awk -F[,:] '/^RSRQ:/ {print $2}' | xargs)
	if [ -n "$T" ]; then
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"RSRQ":"'$T' dB"}'
	fi
	T=$(echo "$O" | awk -F[,:] '/^SINR:/ {print $2}' | xargs)
	if [ -n "$T" ]; then
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"SINR":"'$T' dB"}'
	fi
	T=$(echo "$O" | awk -F[,:] '/^ACTIVE BAND:/ {print $2}' | xargs)
	if [ -n "$T" ]; then
		case "$T" in
			*"1") MODE="LTE B1 (2100 MHz)";;
			*"3") MODE="LTE B3 (1800 MHz)";;
			*"7") MODE="LTE B7 (2600 MHz)";;
			*"8") MODE="LTE B8 (900 MHz)";;
			*"20") MODE="LTE B20 (800 MHz)";;
			*) MODE="$T";;
		esac
	fi
fi

# Quectel EC20/EC25/EP06/EM12
QUECTEL=0
grep -q "Vendor=05c6 ProdID=9215" /sys/kernel/debug/usb/devices && QUECTEL=1
grep -q "Vendor=2c7c ProdID=0125" /sys/kernel/debug/usb/devices && QUECTEL=1
grep -q "Vendor=2c7c ProdID=0306" /sys/kernel/debug/usb/devices && QUECTEL=1
if [ "$QUECTEL" -eq 1 ]; then
	O=$(sms_tool -d $DEVICE at "at+qtemp;+qnwinfo;+qeng=\"servingcell\"";+qspn)

	T=$(echo "$O" | awk -F[,:] '/^\+QTEMP/ {t=$2*1;if($3*1>t)t=$3*1;if($4*1>t)t=$4*1;printf "%d", t}')
	if [ -n "$T" ]; then
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"Temperatura":"'$T' &deg;C"}'
	fi

	T=$(echo "$O" | awk -F[,:] '/^\+QNWINFO/ {print $2"/"$4}' | xargs)
	if [ -n "$T" ]; then
		case "$T" in
			*"LTE BAND 1") MODE="LTE B1 (2100 MHz)";;
			*"LTE BAND 3") MODE="LTE B3 (1800 MHz)";;
			*"LTE BAND 7") MODE="LTE B7 (2600 MHz)";;
			*"LTE BAND 8") MODE="LTE B8 (900 MHz)";;
			*"LTE BAND 20") MODE="LTE B20 (800 MHz)";;
			*) MODE="$T";;
		esac
	fi

	T=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $4}' | xargs)
	if [ "x$T" = "xLTE" ]; then
#		CELLID=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $8}' | xargs)
#		PCID=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $9}' | xargs)
#		EARFCN=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $10}' | xargs)
#		FREQ_BAND_IND=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $11}' | xargs)
#		UL_BANDWIDTH=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $12}' | xargs)
#		DL_BANDWIDTH=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $13}' | xargs)
#		TAC=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $14}' | xargs)
		RSRP=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $15}' | xargs)
		RSRQ=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $16}' | xargs)
		RSSI=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $17}' | xargs)
		SINR=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $18}' | xargs)
#		SRXLEV=$(echo "$O" | awk -F[,:] '/^\+QENG:/ {print $19}' | xargs)
#		[ -n "$ADDON" ] && ADDON="$ADDON,"
#		ADDON="$ADDON"'{"CELLID":"'$CELLID'"}'
#		[ -n "$ADDON" ] && ADDON="$ADDON,"
#		ADDON="$ADDON"'{"PCID":"'$PCID'"}'
#		[ -n "$ADDON" ] && ADDON="$ADDON,"
#		ADDON="$ADDON"'{"EARFCN":"'$EARFCN'"}'
#		[ -n "$ADDON" ] && ADDON="$ADDON,"
#		ADDON="$ADDON"'{"FREQ_BAND_IND":"'$FREQ_BAND_IND'"}'
#		[ -n "$ADDON" ] && ADDON="$ADDON,"
#		ADDON="$ADDON"'{"UL_BANDWIDTH":"'$UL_BANDWIDTH'"}'
#		[ -n "$ADDON" ] && ADDON="$ADDON,"
#		ADDON="$ADDON"'{"DL_BANDWIDTH":"'$DL_BANDWIDTH'"}'
#		[ -n "$ADDON" ] && ADDON="$ADDON,"
#		ADDON="$ADDON"'{"TAC":"'$TAC'"}'
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"RSRP":"'$RSRP' dBm"}'
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"RSRQ":"'$RSRQ' dB"}'
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"RSSI":"'$RSSI' dBm"}'
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"SINR":"'$SINR' dB"}'
#		[ -n "$ADDON" ] && ADDON="$ADDON,"
#		ADDON="$ADDON"'{"SRXLEV":"'$SRXLEV'"}'
	fi

	T=$(echo "$O" | awk -F[,:] '/^\+QSPN/ {print $4}' | xargs)
	if [ -n "$T" ]; then
		COPS="$T"
	fi
fi

# Quectel EP06
if grep -q "Vendor=2c7c ProdID=0306" /sys/kernel/debug/usb/devices; then
	O=$(sms_tool -d $DEVICE at "AT+QCAINFO")
	T=$(echo "$O" | awk -F[,] '/^\+QCAINFO: "pss"/{print $4}')
	[ -z "$T" ] && T=$(echo "$O" | awk -F[,] '/^\+QCAINFO: "pcc"/{print $4}')
	if [ -n "$T" ]; then
		case $T in
			*"LTE BAND 1") MODE="LTE B1 (2100 MHz)";;
			*"LTE BAND 3") MODE="LTE B3 (1800 MHz)";;
			*"LTE BAND 7") MODE="LTE B7 (2600 MHz)";;
			*"LTE BAND 8") MODE="LTE B8 (900 MHz)";;
			*"LTE BAND 20") MODE="LTE B20 (800 MHz)";;
			*) MODE=${T:-$MODE};;
		esac

		T=$(echo "$O" | awk -F[,] '/^\+QCAINFO: "sss"/{print $4}')
		[ -z "$T" ] && T=$(echo "$O" | awk -F[,] '/^\+QCAINFO: "scc"/{print $4}')
		if [ -n "$T" ]; then
			case $T in
				*"LTE BAND 1") MODE="$MODE / B1 (2100 MHz)";;
				*"LTE BAND 3") MODE="$MODE / B3 (1800 MHz)";;
				*"LTE BAND 7") MODE="$MODE / B7 (2600 MHz)";;
				*"LTE BAND 8") MODE="$MODE / B8 (900 MHz)";;
				*"LTE BAND 20") MODE="$MODE / B20 (800 MHz)";;
				*) MODE="$MODE / "${T:-$MODE};;
			esac
		fi
	fi
fi

# ASKEY WWHC050
if grep -q "Vendor=1690 ProdID=7588" /sys/kernel/debug/usb/devices; then
	O=$(sms_tool -d $DEVICE at "at\$qcai?;+ccputemp;+cgcelli;+cgnws")

	T=$(echo "$O" | awk 'BEGIN{FS="BEARER:"}/^\+CGCELLI/{print $2}' | awk 'BEGIN{FS=","}{print $1}')

	case "$T" in
	"0x01"*)
		MODE="GPRS";;
	"0x02"*)
		MODE="EDGE";;
	"0x03"*)
		MODE="HSDPA";;
	"0x04"*)
		MODE="HSUPA";;
	"0x05"*)
		MODE="WCDMA";;
	"0x06"*)
		MODE="CDMA";;
	"0x07"*)
		MODE="EV-DO REV 0";;
	"0x08"*)
		MODE="EV-DO REV A";;
	"0x09"*)
		MODE="GSM";;
	"0x0a"*|"0x0A"*)
		MODE="EV-DO REV B";;
	"0x0b"*|"0x0B"*)
		MODE="LTE";;
	"0x0c"*|"0x0C"*)
		MODE="HSDPA+";;
	"0x0d"*|"0x0D"*)
		MODE="DC-HSDPA+";;
	esac

	if [ $MODE != "LTE" ]; then
		O1=$(echo "$O" | grep CGCELLI | sed 's/+CGCELLI://')
		T1="$O1"
		while true; do
			T2=${T1%%,*}
			[ -z "$T2" ] && break
			if echo "$T2" | grep -q ":"; then
				F1=${T2%%:*}
				F2=${T2##*:}
				UNIT=""
				IGNORE=0
				case "$F1" in
					RSCP|RSRP|RSSI) UNIT=" dBm";;
					ECIO|SINR|RSRQ) UNIT=" dB";;
					LAC|PLMN|BEARER) IGNORE=1;;
				esac
				if [ $IGNORE -eq 0 ]; then
					[ -n "$ADDON" ] && ADDON="$ADDON,"
					ADDON="$ADDON"'{"'$F1'":"'$F2''$UNIT'"}'
				fi
			fi
			if echo "$T1" | grep -q ","; then
				T2="${T2},"
			fi
			T1=$(echo "$T1" | sed 's/^'$T2'//')
		done
	fi

	T=$(echo "$O" | awk -F[,] '/^\$QCAI/{print $7}')
	if [ -n "$T" ]; then
		case $T in
			*"Band:1") MODE="LTE B1 (2100 MHz)";;
			*"Band:3") MODE="LTE B3 (1800 MHz)";;
			*"Band:7") MODE="LTE B7 (2600 MHz)";;
			*"Band:8") MODE="LTE B8 (900 MHz)";;
			*"Band:20") MODE="LTE B20 (800 MHz)";;
			*) MODE=${T:-$MODE};;
		esac
	fi

	T=$(echo "$O" | awk -F[,] '/CA:ADDED/{print $16}')
	if [ -n "$T" ]; then
		case $T in
			*"(S)Band:1") MODE="$MODE / B1 (2100 MHz)";;
			*"(S)Band:3") MODE="$MODE / B3 (1800 MHz)";;
			*"(S)Band:7") MODE="$MODE / B7 (2600 MHz)";;
			*"(S)Band:8") MODE="$MODE / B8 (900 MHz)";;
			*"(S)Band:20") MODE="$MODE / B20 (800 MHz)";;
			*) MODE="$MODE / $T";;
		esac
	fi

	T=$(echo "$O" | awk -F[,] '/^\$QCAI/{print $3}')
	if [ -n "$T" ]; then
		RSRP=${T##*:}" dBm"
		T=$(echo "$O" | awk -F[,] '/^\$QCAI/{print $12}')
		if [ -n "$T" ]; then
			RSRP="$RSRP / "${T##*:}" dBm"
		fi
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"RSRP":"'$RSRP'"}'
	fi
	T=$(echo "$O" | awk -F[,] '/^\$QCAI/{print $4}')
	if [ -n "$T" ]; then
		RSRQ=${T##*:}" dB"
		T=$(echo "$O" | awk -F[,] '/^\$QCAI/{print $13}')
		if [ -n "$T" ]; then
			RSRQ="$RSRQ / "${T##*:}" dB"
		fi
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"RSRQ":"'$RSRQ'"}'
	fi
	T=$(echo "$O" | awk -F[,] '/^\$QCAI/{print $5}')
	if [ -n "$T" ]; then
		RSSI=${T##*:}" dBm"
		T=$(echo "$O" | awk -F[,] '/^\$QCAI/{print $14}')
		if [ -n "$T" ]; then
			RSSI="$RSSI / "${T##*:}" dBm"
		fi
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"RSSI":"'$RSSI'"}'
	fi
	T=$(echo "$O" | awk -F[,] '/^\$QCAI/{print $6}')
	if [ -n "$T" ]; then
		SINR=${T##*:}" dB"
		T=$(echo "$O" | awk -F[,] '/^\$QCAI/{print $15}')
		if [ -n "$T" ]; then
			SINR="$SINR / "${T##*:}" dB"
		fi
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"SINR":"'$SINR'"}'
	fi
#	T=$(echo "$O" | awk -F[,] '/^\$QCAI/{print $8}')
#	if [ -n "$T" ]; then
#		BW=${T##*:}" MHz"
#		T=$(echo "$O" | awk -F[,] '/^\$QCAI/{print $17}')
#		if [ -n "$T" ]; then
#			BW="$BW / "${T##*:}" MHz"
#		fi
#		[ -n "$ADDON" ] && ADDON="$ADDON,"
#		ADDON="$ADDON"'{"BW":"'$BW'"}'
#	fi

	T=$(echo "$O" | awk -F[:] '/^\+CCPUTEMP/ {print $2}' | xargs)
	if [ -n "$T" ]; then
		[ -n "$ADDON" ] && ADDON="$ADDON,"
		ADDON="$ADDON"'{"Temperatura":"'$T' &deg;C"}'
	fi

	T=$(echo "$O" | awk -F[,] '/^\+CGNWS/ {print $9}' | xargs)
	if [ -n "$T" ]; then
		COPS="$T"
	fi
fi

cat <<EOF
{
"csq":"$CSQ",
"signal":"$CSQ_PER",
"operator_name":"$COPS",
"operator_mcc":"$COPS_MCC",
"operator_mnc":"$COPS_MNC",
"mode":"$MODE",
"registration":"$REG",
"lac_dec":"$LAC_DEC",
"lac_hex":"$LAC_HEX",
"cid_dec":"$CID_DEC",
"cid_hex":"$CID_HEX",
"addon":[$ADDON]
}
EOF
exit 0
