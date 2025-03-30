#!/bin/sh

MAC=$2
HEX=$3

f_set() {
[ ${#HEX} -eq 48 ] || exit 0
OUT=$(echo $HEX | awk '{gsub(/.{2}/,"& ")}1')
HOUR=0
for T in $OUT; do
	D=""
	T="0x$T"
	T1=$((T&64))
	[ "x$T1" = "x64" ] && D="${D}mon "
	T1=$((T&32))
	[ "x$T1" = "x32" ] && D="${D}tue "
	T1=$((T&16))
	[ "x$T1" = "x16" ] && D="${D}wed "
	T1=$((T&8))
	[ "x$T1" = "x8" ] && D="${D}thu "
	T1=$((T&4))
	[ "x$T1" = "x4" ] && D="${D}fri "
	T1=$((T&2))
	[ "x$T1" = "x2" ] && D="${D}sat "
	T1=$((T&1))
	[ "x$T1" = "x1" ] && D="${D}sun "
	if [ -n "$D" ]; then
		D=${D%?}
		uci set firewall.m${MAC//:/}_${HOUR}=rule
		uci set firewall.m${MAC//:/}_${HOUR}.src=lan
		uci set firewall.m${MAC//:/}_${HOUR}.dest=wan
		uci set firewall.m${MAC//:/}_${HOUR}.src_mac="$MAC"
		uci set firewall.m${MAC//:/}_${HOUR}.weekdays="$D"
		uci set firewall.m${MAC//:/}_${HOUR}.target=REJECT
		uci set firewall.m${MAC//:/}_${HOUR}.proto=all
		uci set firewall.m${MAC//:/}_${HOUR}.start_time="$HOUR:00:00"
		uci set firewall.m${MAC//:/}_${HOUR}.stop_time="$HOUR:59:59"
	fi
	HOUR=$((HOUR+1))
done
}

f_get() {
G0=00
G1=00
G2=00
G3=00
G4=00
G5=00
G6=00
G7=00
G8=00
G9=00
G10=00
G11=00
G12=00
G13=00
G14=00
G15=00
G16=00
G17=00
G18=00
G19=00
G20=00
G21=00
G22=00
G23=00
RULES=$(uci show firewall | awk -F[.=] '/.*\.m'${MAC//:/}'_.*=rule/{print $2}')
for T in $RULES; do
	START=$(uci -q get firewall.$T.start_time | cut -f1 -d:)
	WEEKDAYS=$(uci -q get firewall.$T.weekdays)
	SUM=0
	for D in $WEEKDAYS; do
		[ "x$D" = "xmon" ] && SUM=$((SUM+64))
		[ "x$D" = "xtue" ] && SUM=$((SUM+32))
		[ "x$D" = "xwed" ] && SUM=$((SUM+16))
		[ "x$D" = "xthu" ] && SUM=$((SUM+8))
		[ "x$D" = "xfri" ] && SUM=$((SUM+4))
		[ "x$D" = "xsat" ] && SUM=$((SUM+2))
		[ "x$D" = "xsun" ] && SUM=$((SUM+1))
	done
	HEX=$(printf "%02X" $SUM)
	case $START in
	0) G0=$HEX;;
	1) G1=$HEX;;
	2) G2=$HEX;;
	3) G3=$HEX;;
	4) G4=$HEX;;
	5) G5=$HEX;;
	6) G6=$HEX;;
	7) G7=$HEX;;
	8) G8=$HEX;;
	9) G9=$HEX;;
	10) G10=$HEX;;
	11) G11=$HEX;;
	12) G12=$HEX;;
	13) G13=$HEX;;
	14) G14=$HEX;;
	15) G15=$HEX;;
	16) G16=$HEX;;
	17) G17=$HEX;;
	18) G18=$HEX;;
	19) G19=$HEX;;
	20) G20=$HEX;;
	21) G21=$HEX;;
	22) G22=$HEX;;
	23) G23=$HEX;;
	esac
done
echo ${G0}${G1}${G2}${G3}${G4}${G5}${G6}${G7}${G8}${G9}${G10}${G11}${G12}${G13}${G14}${G15}${G16}${G17}${G18}${G19}${G20}${G21}${G22}${G23}
}

[ "x$1" = "xset" ] && f_set
[ "x$1" = "xget" ] && f_get

exit 0
