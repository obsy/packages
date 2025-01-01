#!/bin/sh

#
# (c) 2025 Cezary Jackiewicz <cezary@eko.one.pl>
#

ACTION=$2
HEX=$3

getday() {
	T=""
	case $1 in
		64) T="Mon";;
		32) T="Tue";;
		16) T="Wed";;
		8) T="Thu";;
		4) T="Fri";;
		2) T="Sat";;
		1) T="Sun";;
	esac
	echo "$T"
}

f_set() {
[ ${#HEX} -eq 48 ] || exit 0

TCRONFILE=$(mktemp)
[ -e /etc/crontabs/root ] && sed '/wifi/d' /etc/crontabs/root >> $TCRONFILE

OUT=$(echo $HEX | awk '{gsub(/.{2}/,"& ")}1')
CMD=""
CMDM0=""
for D in 64 32 16 8 4 2 1; do
	HOUR=0
	DAY=$(getday $D)
	for T in $OUT; do
		T="0x$T"
		T1=$((T & ${D}))
		if [ "x$T1" = "x$D" ]; then
			if [ -z "$CMD" ]; then
				CMD="down"
				CMDM0=$CMD
			else
				if [ "$CMD" = "up" ]; then
					CMD="down"
					echo "0 $HOUR * * $DAY wifi $CMD" >> $TCRONFILE
				fi
			fi
		else
			if [ -z "$CMD" ]; then
				CMD="up"
				CMDM0=$CMD
			else
				if [ "$CMD" = "down" ]; then
					CMD="up"
					echo "0 $HOUR * * $DAY wifi $CMD" >> $TCRONFILE
				fi
			fi
		fi
		HOUR=$((HOUR+1))
	done
done
if [ "$CMD" != "$CMDM0" ]; then
	echo "0 0 * * Mon wifi $CMDM0" >> $TCRONFILE
fi

rm /etc/crontabs/root
mv $TCRONFILE /etc/crontabs/root
/etc/init.d/cron restart
}

f_get() {
G0=0
G1=0
G2=0
G3=0
G4=0
G5=0
G6=0
G7=0
G8=0
G9=0
G10=0
G11=0
G12=0
G13=0
G14=0
G15=0
G16=0
G17=0
G18=0
G19=0
G20=0
G21=0
G22=0
G23=0

LOOPS="1 2"
DOWN=0
STOP=0
CRON=$(grep wifi /etc/crontabs/root 2>/dev/null)
[ -z "$CRON" ] && LOOPS=""
for L in $LOOPS; do
	for D in 64 32 16 8 4 2 1; do
		[ "$STOP" = "1" ] && break
		DAY=$(getday $D)
		for H in $(seq 0 23); do
			T=$(echo "$CRON" | awk '/0 '$H' \* \* '$DAY' wifi/{print $7}')
			if [ "x$T" = "xdown" ]; then
				DOWN=1
				if [ "$L" = "2" ]; then
					STOP=1
					break
				fi
			fi
			if [ "x$T" = "xup" ]; then
				DOWN=0
				if [ "$L" = "2" ]; then
					STOP=1
					break
				fi
			fi
			if [ "$DOWN" = "1" ]; then
				case $H in
				0) G0=$((G0 | D));;
				1) G1=$((G1 | D));;
				2) G2=$((G2 | D));;
				3) G3=$((G3 | D));;
				4) G4=$((G4 | D));;
				5) G5=$((G5 | D));;
				6) G6=$((G6 | D));;
				7) G7=$((G7 | D));;
				8) G8=$((G8 | D));;
				9) G9=$((G9 | D));;
				10) G10=$((G10 | D));;
				11) G11=$((G11 | D));;
				12) G12=$((G12 | D));;
				13) G13=$((G13 | D));;
				14) G14=$((G14 | D));;
				15) G15=$((G15 | D));;
				16) G16=$((G16 | D));;
				17) G17=$((G17 | D));;
				18) G18=$((G18 | D));;
				19) G19=$((G19 | D));;
				20) G20=$((G20 | D));;
				21) G21=$((G21 | D));;
				22) G22=$((G22 | D));;
				23) G23=$((G23 | D));;
				esac
			fi
		done
	done
done

printf "%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X\n" $G0 $G1 $G2 $G3 $G4 $G5 $G6 $G7 $G8 $G9 $G10 $G11 $G12 $G13 $G14 $G15 $G16 $G17 $G18 $G19 $G20 $G21 $G22 $G23
}

[ "x$1" = "xset" ] && f_set
[ "x$1" = "xget" ] && f_get

exit 0
