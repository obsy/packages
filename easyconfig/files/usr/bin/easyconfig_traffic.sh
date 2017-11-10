#!/bin/sh

IFACE=$(ifstatus wan | jsonfilter -e '@.l3_device' 2>/dev/null)
[ -z "$IFACE" ] && exit 0

TT=/tmp/easyconfig_traffic.tmp
[ -e $TT ] || echo "0 0 0" > $TT
CDB=/usr/lib/easyconfig/easyconfig_traffic.txt.gz
if [ ! -e $CDB ]; then
	mkdir -p /usr/lib/easyconfig/
	touch /usr/lib/easyconfig/easyconfig_traffic.txt
	gzip /usr/lib/easyconfig/easyconfig_traffic.txt
fi
TDB=/tmp/easyconfig_traffic.txt
[ -e $TDB ] || zcat $CDB > $TDB

D=$(date +%Y-%m-%d)

NEWRX=$(awk '/'$IFACE':/{print $2}' /proc/net/dev)
NEWTX=$(awk '/'$IFACE':/{print $10}' /proc/net/dev)
OLDRX=$(awk '{print $1}' $TT)
OLDTX=$(awk '{print $2}' $TT)
CNT=$(awk '{print $3}' $TT)
CNT=$((CNT+1))
echo "$NEWRX $NEWTX $CNT" > $TT

RX=$((NEWRX - OLDRX))
TX=$((NEWTX - OLDTX))
[ $RX -lt 0 ] && RX=$NEWRX
[ $TX -lt 0 ] && TX=$NEWTX

OLDT=$(awk '/'$D'/{print $2}' $TDB)
sed -i '/'$D'/d' $TDB
T=$((OLDT+RX+TX))
echo "$D $T" >> $TDB

PERIOD=$(uci -q get easyconfig.traffic.period)
[ -z "$PERIOD" ] && PERIOD=10
if [ $CNT -ge $PERIOD ]; then

	OLDRX=$(awk '{print $1}' $TT)
	OLDTX=$(awk '{print $2}' $TT)
	echo "$OLDRX $OLDTX 0" > $TT

	gzip -c $TDB > $TDB.gz
	mv $TDB.gz $CDB
	sync
fi

exit 0
