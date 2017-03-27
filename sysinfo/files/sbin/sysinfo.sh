#!/bin/sh

# obsy, http://eko.one.pl

LINE1=$(wc -L /etc/banner | awk '{print $1}')
LINE=$((LINE1-5))

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
[ -z "$MACH" ] && MACH=$(awk -F: '/system type/ {print $2}' /proc/cpuinfo)
[ -z "$MACH" ] && MACH=$(awk -F: '/machine/ {print $2}' /proc/cpuinfo)
[ -z "$MACH" ] && MACH=$(awk -F: '/model name/ {print $2}' /proc/cpuinfo)

U=$(cut -d. -f1 /proc/uptime)
D=$(expr $U / 60 / 60 / 24)
H=$(expr $U / 60 / 60 % 24)
M=$(expr $U / 60 % 60)
S=$(expr $U % 60)
U=$(printf "%dd, %02d:%02d:%02d" $D $H $M $S)

L=$(awk '{ print $1" "$2" "$3}' /proc/loadavg)

RFS=$(df /overlay 2>/dev/null | awk '/overlay/ {printf "%.0f:%.0f:%s", $4*1024, $2*1024, $5}')
[ -z "$RFS" ] && RFS=$(df / 2>/dev/null | awk '/dev\/root/ {printf "%.0f:%.0f:%s", $4*1024, $2*1024, $5}')
if [ -n "$RFS" ]; then
	a1=$(echo $RFS | cut -f1 -d:)
	a2=$(echo $RFS | cut -f2 -d:)
	a3=$(echo $RFS | cut -f3 -d:)
	RFS="total: "$(hr $a2)", free: "$(hr $a1)", used: "$a3
fi

total_mem="$(awk '/^MemTotal:/ {print $2*1024}' /proc/meminfo)"
buffers_mem="$(awk '/^Buffers:/ {print $2*1024}' /proc/meminfo)"
cached_mem="$(awk '/^Cached:/ {print $2*1024}' /proc/meminfo)"
free_mem="$(awk '/^MemFree:/ {print $2*1024}' /proc/meminfo)"
free_mem="$(( ${free_mem} + ${buffers_mem} + ${cached_mem} ))"
MEM=$(echo "total: "$(hr $total_mem)", free: "$(hr $free_mem)", used: "$(( (total_mem - free_mem) * 100 / total_mem))"%")

LAN=$(uci -q get network.lan.ipaddr)
[ -e /tmp/dhcp.leases ] && LAN="$LAN, leases: "$(awk 'END {print NR}' /tmp/dhcp.leases)

PROTO=$(uci -q get network.wan.proto)
case $PROTO in
qmi|ncm)
	SEC=wan_4
	;;
*)
	SEC=wan
	;;
esac
WAN=$(ifstatus $SEC | grep -A 2 "ipv4-address" | awk -F\" '/"address"/ {print $4}')
[ -z "$WAN" ] && WAN=$(uci -q -P /var/state get network.$SEC.ipaddr)
[ -n "$WAN" ] && WAN="$WAN, proto: "$PROTO

printf " | %-"$LINE"s |\n" "Machine: $MACH"
printf " | %-"$LINE"s |\n" "Uptime: $U"
printf " | %-"$LINE"s |\n" "Load: $L"
printf " | %-"$LINE"s |\n" "Flash: $RFS"
printf " | %-"$LINE"s |\n" "Memory: $MEM"
printf " | %-"$LINE"s |\n" "WAN: $WAN"
printf " | %-"$LINE"s |\n" "LAN: $LAN"

IFACES=$(uci -q show wireless | grep "device='radio" | cut -f2 -d. | sort)
for i in $IFACES; do
	SSID=$(uci -q get wireless.$i.ssid)
	DEV=$(uci -q get wireless.$i.device)
	OFF=$(uci -q get wireless.$DEV.disabled)
	OFF2=$(uci -q get wireless.$i.disabled)
	if [ -n "$SSID" ] && [ "x$OFF" != "x1" ] && [ "x$OFF2" != "x1" ]; then
		MODE=$(uci -q -P /var/state get wireless.$i.mode)
		CHANNEL=$(uci -q get wireless.$DEV.channel)
		SEC1=$(echo $i | sed 's/\[/\\[/g;s/\]/\\]/g')
		IFNAME=$(wifi status $DEV | grep -A 1 $SEC1 | awk '/ifname/ {gsub(/[",]/,"");print $2}')
		[ -n "$IFNAME" ] && CNT=$(iw dev $IFNAME station dump | grep Station | wc -l)
		printf " | %-"$LINE"s |\n" "$DEV: mode: $MODE, ssid: $SSID, channel: $CHANNEL, conn: ${CNT:-0}"
	fi
done

echo " "$(for i in $(seq 2 $LINE1); do printf "-"; done)

ADDON=""
for i in $(ls /etc/sysinfo.d/* 2>/dev/null); do
	T=$($i)
	if [ -n "$T" ]; then
		printf " | %-"$LINE"s |\n" "$T"
		ADDON="1"
	fi
done

if [ -n "$ADDON" ]; then
	echo " "$(for i in $(seq 2 $LINE1); do printf "-"; done)
fi

exit 0
