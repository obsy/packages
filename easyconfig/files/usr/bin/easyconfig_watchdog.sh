#!/bin/sh

# $1 delay time
# $2 ping count
# $3 host
# $4 action reboot|wan

T=$(uci -q get network.wan.proto)
[ -z "$T" ] && exit 0
[ "x$T" = "xnone" ] && exit 0

UPTIME=$(awk '{printf "%d", $1}' /proc/uptime)
[ $UPTIME -le $1 ] && exit 0

PR=$(ping -q -c $2 $3 2>/dev/null | awk '/packets received/ {print $4}')
[ -z "$PR" ] && PR=0
if [ "$PR" = "0" ]; then
	case "$4" in
		"reboot")
			logger -t $0 "Reboot"
			reboot
			;;
		"wan")
			logger -t $0 "WAN Restart"
			(ifdown wan; sleep 5; ifup wan) &
			;;
		*)
			logger -t $0 "Run custom script"
			($4) &
			;;
	esac
fi

exit 0
