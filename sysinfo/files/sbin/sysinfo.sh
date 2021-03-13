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
[ -z "$MACH" ] && MACH=$(awk -F: '/model name/ {print $2}' /proc/cpuinfo | head -1)

U=$(cut -d. -f1 /proc/uptime)
D=$(expr $U / 60 / 60 / 24)
H=$(expr $U / 60 / 60 % 24)
M=$(expr $U / 60 % 60)
S=$(expr $U % 60)
U=$(printf "%dd, %02d:%02d:%02d" "$D" "$H" "$M" "$S")

L=$(awk '{ print $1" "$2" "$3}' /proc/loadavg)

RFS=$(df /overlay 2>/dev/null | awk '/overlay/ {printf "%.0f:%.0f:%s", $4*1024, $2*1024, $5}')
[ -z "$RFS" ] && RFS=$(df / 2>/dev/null | awk '/dev\/root/ {printf "%.0f:%.0f:%s", $4*1024, $2*1024, $5}')
if [ -n "$RFS" ]; then
	a1=$(echo "$RFS" | cut -f1 -d:)
	a2=$(echo "$RFS" | cut -f2 -d:)
	a3=$(echo "$RFS" | cut -f3 -d:)
	RFS="total: "$(hr $a2)", free: "$(hr $a1)", used: "$a3
fi

total_mem="$(awk '/^MemTotal:/ {print $2*1024}' /proc/meminfo)"
buffers_mem="$(awk '/^Buffers:/ {print $2*1024}' /proc/meminfo)"
cached_mem="$(awk '/^Cached:/ {print $2*1024}' /proc/meminfo)"
free_mem="$(awk '/^MemFree:/ {print $2*1024}' /proc/meminfo)"
free_mem="$((free_mem + buffers_mem + cached_mem))"
MEM=$(echo "total: "$(hr $total_mem)", free: "$(hr $free_mem)", used: "$(( (total_mem - free_mem) * 100 / total_mem))"%")

printf " | %-""$LINE""s |\n" "Machine: $MACH"
printf " | %-""$LINE""s |\n" "Uptime: $U"
printf " | %-""$LINE""s |\n" "Load: $L"
printf " | %-""$LINE""s |\n" "Flash: $RFS"
printf " | %-""$LINE""s |\n" "Memory: $MEM"

if [ -e /tmp/dhcp.leases ]; then
	printf " | %-""$LINE""s |\n" "Leases: "$(awk 'END {print NR}' /tmp/dhcp.leases)
fi

SEC=$(uci show network | awk -F[\.=] '/=interface/{print $2}')
for i in $SEC; do
	[ "x$i" = "xloopback" ] && continue
	S=$i
	[ -n "$(ubus list network.interface."$S"_4 2>/dev/null)" ] && S=$i"_4"
	PROTO=$(uci -q get network."$i".proto)
	IP=$(ubus call network.interface status '{"interface":"'$S'"}' 2>/dev/null | jsonfilter -q -e "@['ipv4-address'][0].address")
	[ -z "$IP" ] && IP=$(uci -q -P /var/state get network."$S".ipaddr)
	printf " | %-""$LINE""s |\n" "$i: $PROTO, ${IP:-"?"}"
done

SEC=$(uci -q show wireless | grep "device='radio" | cut -f2 -d. | sort)
for i in $SEC; do
	SSID=$(uci -q get wireless."$i".ssid)
	DEV=$(uci -q get wireless."$i".device)
	OFF=$(uci -q get wireless."$DEV".disabled)
	OFF2=$(uci -q get wireless."$i".disabled)
	STATUS=$(ubus call network.wireless status '{"device":"'"$DEV"'"}' 2>/dev/null)
	UP=$(echo "$STATUS" | jsonfilter -q -e @.*.up)
	if [ -n "$SSID" ] && [ "x$OFF" != "x1" ] && [ "x$OFF2" != "x1" ] && [ "x$UP" = "xtrue" ]; then
		MODE=$(uci -q -P /var/state get wireless."$i".mode)
		CHANNEL=$(uci -q get wireless."$DEV".channel)
		NET=$(echo "$STATUS" | jsonfilter -e '@.*.interfaces[@.section="'"$i"'"].config.network[*]')
		IFNAMES=$(echo "$STATUS" | jsonfilter -e '@.*.interfaces[@.section="'"$i"'"].ifname')
		for j in $IFNAMES; do
			CNT=$(iw dev $j station dump 2>/dev/null | grep -c Station)
			printf " | %-""$LINE""s |\n" "$DEV: $NET, mode: $MODE, ssid: $SSID, channel: $CHANNEL, conn: ${CNT:-0}"
		done
	fi
done

echo " "$(for i in $(seq 2 "$LINE1"); do printf "-"; done)

ADDON=""
for i in $(ls /etc/sysinfo.d/* 2>/dev/null); do
	T=$($i)
	if [ -n "$T" ]; then
		printf " | %-""$LINE""s |\n" "$T"
		ADDON="1"
	fi
done

if [ -n "$ADDON" ]; then
	echo " "$(for i in $(seq 2 "$LINE1"); do printf "-"; done)
fi

exit 0
