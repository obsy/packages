#!/bin/sh

IFACE=$(ifstatus wan | jsonfilter -q -e '@.l3_device')
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

D=$(date "+%Y%m%d")

NEWRX=$(awk '/^[ ]*'$IFACE':/{print $2}' /proc/net/dev)
NEWTX=$(awk '/^[ ]*'$IFACE':/{print $10}' /proc/net/dev)
OLDRX=$(awk '{print $1}' $TT)
OLDTX=$(awk '{print $2}' $TT)
CNT=$(awk '{print $3}' $TT)
CNT=$((CNT+1))
echo "$NEWRX $NEWTX $CNT" > $TT

RX=$((NEWRX - OLDRX))
TX=$((NEWTX - OLDTX))
[ $RX -lt 0 ] && RX=$NEWRX
[ $TX -lt 0 ] && TX=$NEWTX

OLDRX=$(awk '/'$D'/{print $2}' $TDB)
OLDTX=$(awk '/'$D'/{print $3}' $TDB)
sed -i '/'$D'/d' $TDB
TRX=$((OLDRX+RX))
TTX=$((OLDTX+TX))
echo "$D $TRX $TTX" >> $TDB

PERIOD=$(uci -q get easyconfig.global.datarec_period)
[ -z "$PERIOD" ] && PERIOD=15
if [ $CNT -ge $PERIOD ]; then

	OLDRX=$(awk '{print $1}' $TT)
	OLDTX=$(awk '{print $2}' $TT)
	echo "$OLDRX $OLDTX 0" > $TT

	gzip -c $TDB > $TDB.gz
	mv $TDB.gz $CDB
	sync
fi

exit 0
