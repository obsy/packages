#!/bin/sh

DEVICE=$(uci -q get 3ginfo.@3ginfo[0].device)

for DEV in /sys/class/tty/${DEVICE##/*/}/device/driver/tty*; do
	SEC=$(uci show network | grep "/dev/"${DEV##/*/} | cut -f2 -d.)
	if [ ! -z $SEC ]; then
		break
	fi
done
if [ -z $SEC ]; then
	SEC=$(uci show network | grep ${DEVICE%%[0-9]} | cut -f2 -d.)
fi

if [ ${DEVICE%%[0-9]} = "/dev/ttyHS" ]; then
	IFACE="hso0"
else
	IFACE="3g-"$SEC
fi

if ifconfig $IFACE 2>/dev/null | grep -q inet; then
	ifdown $SEC > /dev/null 2>&1
else
	ifup $SEC > /dev/null 2>&1
	sleep 2
fi

sleep 3
exit 0
