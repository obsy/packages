#!/bin/sh

IP=$1
[ -z "$IP" ] && exit 0

getvaluen() {
	echo $(awk -F[\<\>] '/<'$2'>/ {print $3}' /tmp/$1 | sed 's/[^0-9]//g')
}

getvalue() {
	echo $(awk -F[\<\>] '/<'$2'>/ {print $3}' /tmp/$1)
}

cookie=$(mktemp)
wget -t 25 -O /tmp/webserver-token "http://$IP/api/webserver/token" >/dev/null 2>&1
token=$(getvaluen webserver-token token)
if [ -z "$token" ]; then
	wget -q -O /dev/null --keep-session-cookies --save-cookies $cookie "http://$IP/html/home.html"
fi

files="device/signal monitoring/status net/current-plmn net/signal-para device/information"
for f in $files; do
	nf=$(echo $f | sed 's!/!-!g')
	if [ -n "$token" ]; then
		wget -t 3 -O /tmp/$nf "http://$IP/api/$f" --header "__RequestVerificationToken: $token" >/dev/null 2>&1
	else
		wget -t 3 -O /tmp/$nf "http://$IP/api/$f" --load-cookies=$cookie >/dev/null 2>&1
	fi
done

rssi=$(getvaluen device-signal rssi)
if [ -n "$rssi" ]; then
	CSQ=$(((-1*rssi + 113)/2))
	echo "+CSQ: $CSQ,99"
fi

MODEN=$(getvaluen monitoring-status CurrentNetworkType)
case $MODEN in
	0)  MODE="brak uslugi";;
	1)  MODE="GSM";;
	2)  MODE="GPRS";;
	3)  MODE="EDGE";;
	4)  MODE="WCDMA";;
	5)  MODE="HSDPA";;
	6)  MODE="HSUPA";;
	7)  MODE="HSPA";;
	8)  MODE="TDSCDMA";;
	9)  MODE="HSPA+";;
	10) MODE="EVDO rev. 0";;
	11) MODE="EVDO rev. A";;
	12) MODE="EVDO rev. B";;
	13) MODE="1xRTT";;
	14) MODE="UMB";;
	15) MODE="1xEVDV";;
	16) MODE="3xRTT";;
	17) MODE="HSPA+64QAM";;
	18) MODE="HSPA+MIMO";;
	19) MODE="LTE";;
	21) MODE="IS95A";;
	22) MODE="IS95B";;
	23) MODE="CDMA1x";;
	24) MODE="EVDO rev. 0";;
	25) MODE="EVDO rev. A";;
	26) MODE="EVDO rev. B";;
	27) MODE="Hybrydowa CDMA1x";;
	28) MODE="Hybrydowa EVDO rev. 0";;
	29) MODE="Hybrydowa EVDO rev. A";;
	30) MODE="Hybrydowa EVDO rev. B";;
	31) MODE="EHRPD rev. 0";;
	32) MODE="EHRPD rev. A";;
	33) MODE="EHRPD rev. B";;
	34) MODE="Hybrydowa EHRPD rev. 0";;
	35) MODE="Hybrydowa EHRPD rev. A";;
	36) MODE="Hybrydowa EHRPD rev. B";;
	41) MODE="WCDMA (UMTS)";;
	42) MODE="HSDPA";;
	43) MODE="HSUPA";;
	44) MODE="HSPA";;
	45) MODE="HSPA+";;
	46) MODE="DC-HSPA+";;
	61) MODE="TD SCDMA";;
	62) MODE="TD HSDPA";;
	63) MODE="TD HSUPA";;
	64) MODE="TD HSPA";;
	65) MODE="TD HSPA+";;
	81) MODE="802.16E";;
	101) MODE="LTE";;
	*)  MODE="-";;
esac
echo "^SYSINFOEX:x,x,x,x,,x,\"$MODE\",$MODEN,\"$MODE\""

numeric=$(getvaluen net-current-plmn Numeric)
echo "+COPS: 0,2,\"$numeric\",x"

lac=$(getvalue net-signal-para Lac)
cid=$(getvalue net-signal-para CellID)
if [ -z "$cid" ]; then
	cell_id=$(getvalue device-signal cell_id)
	cid=""
	[ -n "$cell_id" ] && cid=$(printf %0X $cell_id)
fi
echo "+CREG: 2,1,\"$lac\",\"$cid\""

rsrp=$(getvaluen device-signal rsrp)
rsrq=$(getvaluen device-signal rsrq)
echo "^LTERSRP:-$rsrp,-$rsrq"

rscp=$(getvaluen net-signal-para Rscp)
ecio=$(getvaluen net-signal-para Ecio)
echo "^CSNR: -$rscp,-$ecio"

device=$(getvalue device-information DeviceName)
[ -n "$device" ] && echo "DEVICE:huawei $device HiLink"

if [ "x$2" != "xdebug" ]; then
	for f in $files webserver/token; do
		nf=$(echo $f | sed 's!/!-!g')
		rm /tmp/$nf
	done
fi
rm $cookie

exit 0

#