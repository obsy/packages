#!/bin/sh

hr() {
	if [ $1 -gt 0 ]; then
		printf "$(awk -v n=$1 'BEGIN{for(i=split("B KB MB GB TB PB",suffix);s<1;i--)s=n/(2**(10*i));printf (int(s)==s)?"%.0f%s":"%.1f%s",s,suffix[i+2]}' 2>/dev/null)"
	else
		printf "0B"
	fi
}

MACH=""
[ -e /tmp/sysinfo/model ] && MACH=$(cat /tmp/sysinfo/model)
[ -z "$MACH" ] && MACH=$(awk -F: '/Hardware/ {print $2}' /proc/cpuinfo)
[ -z "$MACH" ] && MACH=$(awk -F: '/machine/ {print $2}' /proc/cpuinfo)
[ -z "$MACH" ] && MACH=$(awk -F: '/system type/ {print $2}' /proc/cpuinfo)

U=$(cut -d. -f1 /proc/uptime)
D=$(expr $U / 60 / 60 / 24)
H=$(expr $U / 60 / 60 % 24)
M=$(expr $U / 60 % 60)
S=$(expr $U % 60)
U=$(printf "%dd, %02d:%02d:%02d" $D $H $M $S)

L=$(awk '{ print $1" "$2" "$3}' /proc/loadavg)

RFS=$(df /overlay | awk '/overlay/ {printf "%s:%s:%s", $4*1024, $2*1024, $5}')
a1=$(echo $RFS | cut -f1 -d:)
a2=$(echo $RFS | cut -f2 -d:)
a3=$(echo $RFS | cut -f3 -d:)
RFS="total: "$(hr $a2)", free: "$(hr $a1)", used: "$a3

total_mem="$(awk '/^MemTotal:/ {print $2*1024}' /proc/meminfo)"
buffers_mem="$(awk '/^Buffers:/ {print $2*1024}' /proc/meminfo)"
cached_mem="$(awk '/^Cached:/ {print $2*1024}' /proc/meminfo)"
free_mem="$(awk '/^MemFree:/ {print $2*1024}' /proc/meminfo)"
free_mem="$(( ${free_mem} + ${buffers_mem} + ${cached_mem} ))"
MEM=$(echo "total: "$(hr $total_mem)", free: "$(hr $free_mem)", used: "$(( (total_mem - free_mem) * 100 / total_mem))"%")

LAN=$(uci -q get network.lan.ipaddr)
WAN=$(uci -q -P /var/state get network.wan.ipaddr)
[ -z "$WAN" ] && WAN=$(ifstatus wan | awk -F\" '/"address"/ {print $4}')
[ -n "$WAN" ] && WAN="$WAN, proto: "$(uci -q get network.wan.proto)

printf " | %-60s |\n" "Machine: $MACH"
printf " | %-60s |\n" "Uptime: $U"
printf " | %-60s |\n" "Load: $L"
printf " | %-60s |\n" "Flash: $RFS"
printf " | %-60s |\n" "Memory: $MEM"
printf " | %-60s |\n" "WAN: $WAN"
printf " | %-60s |\n" "LAN: $LAN"

OFF=$(uci -q get wireless.radio0.disabled)
if [ "x$OFF" != "x1" ]; then
	IFACES=$(uci -q show wireless | grep device=radio | cut -f2 -d.)
	for i in $IFACES; do
		SSID=$(uci -q get wireless.$i.ssid)
		DEV=$(uci -q get wireless.$i.device)
		OFF=$(uci -q get wireless.$DEV.disabled)
		OFF2=$(uci -q get wireless.$i.disabled)
		if [ -n "$SSID" ] && [ "x$OFF" != "x1" ] && [ "x$OFF2" != "x1" ]; then
			MODE=$(uci -q -P /var/state get wireless.$i.mode)
			RIFACE=$(uci -q -P /var/state get wireless.$i.ifname)
			[ -n "$RIFACE" ] && CNT=$(iw dev $RIFACE station dump | grep Station | wc -l)
			CHANNEL=$(uci -q get wireless.$DEV.channel)
			printf " | %-60s |\n" "WLAN: mode: $MODE, ssid: $SSID, channel: $CHANNEL, conn: $CNT"
		fi
	done
fi

echo " ----------------------------------------------------------------"

exit 0
