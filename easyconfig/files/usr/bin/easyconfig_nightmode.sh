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
OFF=0

if [ "$CURR" \< "$SUNRISE" ]; then
	OFF=1
(sunwait sun up $LAT $LON && ubus call easyconfig leds '{"action":"on"}') &
fi

if [ "$CURR" \< "$SUNSET" ]; then
(sunwait sun down $LAT $LON && ubus call easyconfig leds '{"action":"off"}') &
else
	OFF=1
fi

[ $OFF -eq 1 ] && ubus call easyconfig leds '{"action":"off"}'

exit 0
