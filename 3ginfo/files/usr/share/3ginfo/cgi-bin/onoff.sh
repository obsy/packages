#!/bin/sh

SEC=$(uci -q get 3ginfo.@3ginfo[0].network)
[ -z "$SEC" ] && exit 0

UP=$(ifstatus wan | grep "\"up\": true")
if [ -n "$UP" ]; then
	ifdown $SEC > /dev/null 2>&1
else
	ifup $SEC > /dev/null 2>&1
fi

sleep 3
exit 0
