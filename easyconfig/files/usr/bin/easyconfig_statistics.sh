#!/bin/sh

#
# (c) 2023-2024 Cezary Jackiewicz <cezary@eko.one.pl>
#

TIMEISVALID=""
grep -q "time is valid" /tmp/state/dnsmasqsec 2>/dev/null && TIMEISVALID="yes"
[ -e /dev/rtc0 ] && TIMEISVALID="yes"
[ -z "$TIMEISVALID" ] && exit 0

DB=/tmp/easyconfig_statistics.json
SDB=/usr/lib/easyconfig/easyconfig_statistics.json.gz

LOCK=/var/lock/easyconfig_statistics.lock

lock $LOCK

if [ ! -e $DB ]; then
	if [ -e "$SDB" ]; then
		zcat "$SDB" > "$DB"
		easyconfig_statistics.uc "init" "init" 0 0 0 "" 0 ""
	else
		mkdir -p $(dirname "$SDB")
		echo "{}" > "$DB"
	fi
fi

NETWORKS=$(uci show network | awk -F. '/\.proto='\''static'\''/{print $2}')
for SEC in $NETWORKS; do
	[ "$SEC" = "loopback" ] && continue
	[ "$SEC" = "wan" ] && continue
	[ "$SEC" = "wan6" ] && continue
	if [ "$SEC" = "lan" ]; then
		NETWORK="Sieć lokalna"
	else
		NETWORK=$(uci -q get network.$SEC.description)
		[ -z "$NETWORK" ] && NETWORK=$SEC
	fi
	BRIDGE=$(ubus call network.interface.$SEC status | jsonfilter -q -e @.l3_device)
	if [ -e /sys/class/net/$BRIDGE/bridge ]; then
		T=$(brctl showmacs $BRIDGE 2>/dev/null)
		for I in /sys/class/net/$BRIDGE/lower_*; do
			IFNAME=${I##*lower_}
			if [ -e $I/phy80211 ]; then
				STATIONS=$(iw dev "$IFNAME" station dump | awk -v IFNAME="$IFNAME" '{if($1 == "Station") {MAC=$2;station[MAC]=1} if($0 ~ /rx bytes:/) {rx[MAC]=$3} if($0 ~ /tx bytes:/) {tx[MAC]=$3} if($0 ~ /connected time:/) {connected[MAC]=$3}} END {for (w in station) {printf "%s;%s;%s;%s;%s\n", w, IFNAME, tx[w], rx[w], connected[w]}}')
				for S in $STATIONS; do
					DHCPNAME=$(awk '/'$(echo "$S" | cut -f1 -d";")'/{if ($4 != "*") {print $4}}' /tmp/dhcp.leases)
					easyconfig_statistics.uc ${S//;/ } "$DHCPNAME" 2 "$NETWORK"
				done
			else
				PORTID=$(printf "%d" $(cat /sys/class/net/$BRIDGE/brif/$IFNAME/port_no))
				STATIONS=$(echo "$T" | awk '/^\s*'$PORTID'\s.*no/{print $2}')
				for S in $STATIONS; do
					DHCPNAME=$(awk '/'$S'/{if ($4 != "*") {print $4}}' /tmp/dhcp.leases)
					easyconfig_statistics.uc "$S" "$IFNAME" 0 0 999 "$DHCPNAME" 1 "$NETWORK"
				done
			fi
		done
	fi
done

# wan
IFNAME=$(ubus call network.interface.wan status | jsonfilter -q -e @.l3_device)
[ -n "$IFNAME" ] && easyconfig_statistics.uc "wan" "$IFNAME" $(cat /sys/class/net/$IFNAME/statistics/tx_bytes) $(cat /sys/class/net/$IFNAME/statistics/rx_bytes) 999 "" 0 ""

PERIOD=$(uci -q get easyconfig.global.datarec_period)
[ -z "$PERIOD" ] && PERIOD=0
if [ "$PERIOD" = "0" ]; then
	lock -u $LOCK
	exit 0
fi
NOW=$(date +%s)
if [ -e "$SDB" ]; then
	DBTS=$(date +%s -r "$SDB")
	WRITETS=$((DBTS + (PERIOD * 60)))
else
	WRITETS=$((NOW - 1))
fi
if [ $WRITETS -le $NOW ]; then
	gzip -k "$DB"
	mv "$DB.gz" "$SDB"
	sync
fi

lock -u $LOCK

exit 0
