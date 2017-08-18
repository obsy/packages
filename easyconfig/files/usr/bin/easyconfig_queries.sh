#!/bin/sh
echo "["
T=$(logread -e "query\[A\]" | awk '$10 ~ /query\[A\]/ && $13 !~ /127.0.0.1/ {printf "{\"time\":\"%s-%02d-%02d %s\",\"query\":\"%s\",\"host\":\"%s\"},\n", $5, (match("JanFebMarAprMayJunJulAugSepOctNovDec",$2)+2)/3, $3, $4, $11, $13}END{print "{\"time\":\"\",\"query\":\"\",\"host\":\"\"}"}')
IPS=$(echo "$T" | sed 's/.*"host":"\(.*\)".*/\1/g' | sort | uniq)

for IP in $IPS; do
	MAC=$(awk '/'$IP'/{print $2}' /tmp/dhcp.leases)
	if [ -n "$MAC" ]; then
		NAME1=$(awk '/'$IP'/{print $4}' /tmp/dhcp.leases)
	else
		NAME1=""
		MAC=$(awk '/'$IP'/{print $4}' /proc/net/arp)
	fi
	if [ -n "$MAC" ]; then
		NMAC=$(echo $MAC | sed 's/://g')
		NAME2=$(uci -q get dhcp.m$NMAC.networkid)
		if [ -n "$NAME2" ]; then
			NAME="$NAME2"
		else
			NAME="$NAME1"
		fi
		if [ -n "$NAME" ]; then
			T=$(echo "$T" | sed "s/\"host\":\"$IP\"/\"host\":\"$NAME\"/g")
		fi
	fi
done

echo "$T"
echo "]"

exit 0
