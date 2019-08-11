#!/bin/sh

# $1 delay time
# $2 ping count
# $3 host
# $4 period count
# $5 action reboot|wan

T=$(uci -q get network.wan.proto)
[ -z "$T" ] && exit 0
[ "x$T" = "xnone" ] && exit 0

UPTIME=$(awk '{printf "%d", $1}' /proc/uptime)
[ $UPTIME -le $1 ] && exit 0

ping -q -c $2 $3 > /tmp/easyconfig_watchdog 2>/dev/null

PR=$(awk '/packets received/ {print $4}' /tmp/easyconfig_watchdog)
[ -z "$PR" ] && PR=0
if [ "$PR" = "0" ]; then
	echo 0 >> /tmp/easyconfig_watchdog_cnt
else
	echo 1 > /tmp/easyconfig_watchdog_cnt
	exit 0
fi
CNT=$(wc -l < /tmp/easyconfig_watchdog_cnt)
CNT=$((CNT-1))

if [ $CNT -ge $4 ]; then
	case "$5" in
		"reboot")
			logger -t $0 "Reboot"
			ubus call easyconfig reboot
			;;
		"wan")
			logger -t $0 "WAN Restart"
			(ifdown wan; sleep 5; ifup wan) &
			;;
	esac
fi

exit 0
