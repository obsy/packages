#!/bin/sh

#
# (c) 2019-2024 Cezary Jackiewicz <cezary@eko.one.pl>
#

[ -e /usr/bin/sunwait ] || exit 0

T=$(pidof sunwait)
[ -n "$T" ] && kill -9 "$T"

LAT=$(uci -q get easyconfig.global.latitude)
[ -z "$LAT" ] && exit 0

LON=$(uci -q get easyconfig.global.longitude)
[ -z "$LON" ] && exit 0

CURR=$(date +%H%M)
OFF=0
[ "${LAT:0:1}" = "-" ] && LAT="${LAT:1}S" || LAT="${LAT}N"

if sunwait 2>&1 | grep -q "options: -p"; then
	[ "${LON:0:1}" = "-" ] && LON="${LON:1}W" || LON="${LON}.E"

	T=$(sunwait -p $LAT $LON)
	SUNRISE=$(echo "$T" | awk '/Sun rises/{print $3}')
	SUNSET=$(echo "$T" | awk '/Sun rises/{print $6}')

	if [ "$CURR" \< "$SUNRISE" ]; then
		OFF=1
		(sunwait sun up $LAT $LON && ubus call easyconfig leds '{"action":"on"}') &
	fi

	if [ "$CURR" \< "$SUNSET" ]; then
		(sunwait sun down $LAT $LON && ubus call easyconfig leds '{"action":"off"}') &
	else
		OFF=1
	fi
else
	[ "${LON:0:1}" = "-" ] && LON="${LON:1}W" || LON="${LON}E"

	T=$(sunwait list $LAT $LON)
	SUNRISE=$(echo "$T" | awk '{gsub(/[:,]/,"");print $1}')
	SUNSET=$(echo "$T" | awk '{gsub(/[:,]/,"");print $2}')

	if [ "$CURR" \< "$SUNRISE" ]; then
		OFF=1
		(sunwait wait rise $LAT $LON && ubus call easyconfig leds '{"action":"on"}') &
	fi

	if [ "$CURR" \< "$SUNSET" ]; then
		(sunwait wait set $LAT $LON && ubus call easyconfig leds '{"action":"off"}') &
	else
		OFF=1
	fi
fi

[ $OFF -eq 1 ] && ubus call easyconfig leds '{"action":"off"}' > /dev/null

exit 0
