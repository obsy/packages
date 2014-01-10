#!/bin/sh

# v 20140105
#
# T, token = unikalny identyfikator systemu na podstawie mac adresu
# U, uptime = uptime systemu
# M, model = model routera
# W, wan proto = typ polaczenia na wan
# V, version = numer wersji oprogramowania

grep -q br-lan /proc/net/dev && IF=br-lan || IF=eth0
T=$(md5sum /sys/class/net/$IF/address | cut -f1 -d" ")
U=$(awk '{printf "%d", $1}' /proc/uptime)
M="Unknown"
[ -e /tmp/sysinfo/model ] && M=$(cat /tmp/sysinfo/model)
[ -z "$M" ] && M=$(awk -F: '/Hardware/ {print $2}' /proc/cpuinfo)
[ -z "$M" ] && M=$(awk -F: '/machine/ {print $2}' /proc/cpuinfo)
[ -z "$M" ] && M=$(awk -F: '/system type/ {print $2}' /proc/cpuinfo)
W=$(uci -q get network.wan.proto)
if [ -e /rom/etc/openwrt_release ]; then
	. /rom/etc/openwrt_release
	V="$DISTRIB_DESCRIPTION $DISTRIB_REVISION"
fi
if [ -e /etc/config/gargoyle ]; then
	V="Gargoyle "$(uci -q get gargoyle.global.version)
fi
URL=$(echo "t=$T&u=$U&m=$M&w=$W&v=$V" | sed 's/ /%20/g')
wget -q -O /dev/null "http://ecco.selfip.net/cgi-bin/s.cgi?$URL"

exit 0
