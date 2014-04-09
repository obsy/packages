#!/bin/sh

# v 20140409
#
# T, token = unikalny identyfikator systemu na podstawie mac adresu
# U, uptime = uptime systemu
# M, model = model routera
# W, wan proto = typ polaczenia na wan
# V, version = numer wersji oprogramowania

grep -q br-lan /proc/net/dev && IF=br-lan || IF=eth0
T=$(md5sum /sys/class/net/$IF/address | cut -f1 -d" ")
U=$(awk '{printf "%d", $1}' /proc/uptime)
M=""
[ -e /tmp/sysinfo/model ] && M=$(cat /tmp/sysinfo/model)
[ -z "$M" ] && M=$(awk -F: '/Hardware/ {print $2}' /proc/cpuinfo)
[ -z "$M" ] && M=$(awk -F: '/machine/ {print $2}' /proc/cpuinfo)
[ -z "$M" ] && M=$(awk -F: '/system type/ {print $2}' /proc/cpuinfo)
[ -z "$M" ] && M="Unknown"
W=$(uci -q get network.wan.proto)
if [ -e /rom/etc/openwrt_release ]; then
	. /rom/etc/openwrt_release
	V="$DISTRIB_DESCRIPTION $DISTRIB_REVISION"
fi
if [ -e /etc/config/gargoyle ]; then
	V="Gargoyle "$(uci -q get gargoyle.global.version)
fi
URL=$(echo "t=$T&u=$U&m=$M&w=$W&v=$V" | sed 's/ /%20/g')
wget -q -O /dev/null "http://dl.eko.one.pl/cgi-bin/s.cgi?$URL"
RET=$?
if [ $RET -eq 0 ]; then
	dateformat=$(uci get gargoyle.global.dateformat 2>/dev/null)
	if [ "$dateformat" == "iso" ]; then
		current_time=$(date "+%Y/%m/%d %H:%M %Z")
	elif [ "$dateformat" == "iso8601" ]; then
		current_time=$(date "+%Y-%m-%d %H:%M %Z")
	elif [ "$dateformat" == "australia" ]; then
		current_time=$(date "+%d/%m/%y %H:%M %Z")
	elif [ "$dateformat" == "russia" ]; then
		current_time=$(date "+%d.%m.%Y %H:%M %Z")
	elif [ "$dateformat" == "argentina" ]; then
		current_time=$(date "+%d/%m/%Y %H:%M %Z")
	else
		current_time=$(date "+%D %H:%M %Z")
	fi
	timezone_is_utc=$(uci get system.@system[0].timezone | grep "^UTC" | sed 's/UTC//g')
	if [ -n "$timezone_is_utc" ] ; then
		current_time=$(echo $current_time | sed "s/UTC/UTC-$timezone_is_utc/g" | sed 's/\-\-/+/g')
	fi
	echo "$current_time" > /tmp/stat_time.txt
fi

exit 0
