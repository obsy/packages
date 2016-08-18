#!/bin/sh

# v 20150706
#
# T, token = unikalny identyfikator systemu na podstawie mac adresu
# U, uptime = uptime systemu
# M, model = model routera
# W, wan proto = typ polaczenia na wan
# V, version = numer wersji oprogramowania

[ "x$1" = "xdebug" ] && DEBUG=echo || DEBUG=""

grep -q br-lan /proc/net/dev && IF=br-lan || IF=eth0
T=$(md5sum /sys/class/net/$IF/address | cut -f1 -d" ")
if [ "x$1" = "xtoken" ]; then
	echo $T
	exit 0
fi
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
else
	if [ -e /etc/openwrt_release ]; then
		. /etc/openwrt_release
		V="$DISTRIB_DESCRIPTION $DISTRIB_REVISION"
	fi
fi
if [ -e /etc/config/gargoyle ]; then
	V="Gargoyle "$(uci -q get gargoyle.global.version)
fi
URL=$(echo "http://dl.eko.one.pl/cgi-bin/s.cgi?t=$T&u=$U&m=$M&w=$W&v=$V" | sed 's/ /%20/g')
$DEBUG wget -q -O /dev/null "$URL"
RET=$?
if [ $RET -eq 0 ]; then
	if [ -e /usr/lib/gargoyle/current_time.sh ]; then
		/usr/lib/gargoyle/current_time.sh | awk -F\" '{print $2}' > /tmp/stat_time.txt
	else
		date > /tmp/stat_time.txt
	fi
fi

exit 0
