#!/bin/sh
[ -e /usr/bin/sunwait ] || exit 0

T=$(pidof sunwait)
if [ -n "$T" ]; then
	kill -9 "$T"
fi

LAT=$(uci -q get easyconfig.global.latitude)
[ -z "$LAT" ] && exit 0
T=$(echo ${LAT:0:1})
[ "x$T" = "x-" ] && LAT=${LAT:0:1}"S" || LAT="${LAT}N"

LON=$(uci -q get easyconfig.global.longitude)
[ -z "$LON" ] && exit 0
T=$(echo ${LON:0:1})
[ "x$T" = "x-" ] && LON=${LON:0:1}"W" || LON="${LON}.E"

T=$(sunwait -p $LAT $LON)

SUNRISE=$(echo "$T" | awk '/Sun rises/{print $3}')
SUNSET=$(echo "$T" | awk '/Sun rises/{print $6}')
CURR=$(date +%H%M)

SCRUP=0
SCRDOWN=0
[ "$CURR" \< "$SUNRISE" ] && SCRUP=1
[ "$CURR" \< "$SUNSET" ] && SCRDOWN=1

if [ $SCRUP -eq 1 ]; then
(sunwait sun up $LAT $LON && {
		rm /tmp/led_off 2>/dev/null
		/etc/init.d/led start
		. /etc/diag.sh
		set_state done
		}) &
fi
if [ $SCRDOWN -eq 1 ]; then
(sunwait sun down $LAT $LON && {
		for i in /sys/class/leds/*:*:*; do
		echo none > $i/trigger
		echo 0 > $i/brightness
		done
		touch /tmp/led_off
		}) &
fi

exit 0
