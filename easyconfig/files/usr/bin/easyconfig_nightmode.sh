#!/bin/sh
[ -e /usr/bin/sunwait ] || exit 0

T=$(pidof sunwait)
if [ -n "$T" ]; then
	kill -9 "$T"
fi

LAT=$(uci -q get easyconfig.global.latitude)
[ -z "$LAT" ] && exit 0
[ "x${LAT:0:1}" = "x-" ] && LAT="${LAT:1}S" || LAT="${LAT}N"

LON=$(uci -q get easyconfig.global.longitude)
[ -z "$LON" ] && exit 0
[ "x${LON:0:1}" = "x-" ] && LON="${LON:1}W" || LON="${LON}.E"

T=$(sunwait -p $LAT $LON)

SUNRISE=$(echo "$T" | awk '/Sun rises/{print $3}')
SUNSET=$(echo "$T" | awk '/Sun rises/{print $6}')
CURR=$(date +%H%M)

SCRUP=0
SCRDOWN=0
[ "$CURR" \< "$SUNRISE" ] && SCRUP=1
[ "$CURR" \< "$SUNSET" ] && SCRDOWN=1

if [ $SCRUP -eq 1 ]; then
(sunwait sun up $LAT $LON && ubus call easyconfig leds '{"action":"on"}') &
fi
if [ $SCRDOWN -eq 1 ]; then
(sunwait sun down $LAT $LON && ubus call easyconfig leds '{"action":"off"}') &
fi

exit 0
