#!/bin/sh

LOGS=/tmp/easyconfig_wlanlogs.txt
T=$(mktemp)

logread -e "DHCPACK(" >> $T
logread -e "AP-STA-DISCONNECTED" >> $T
if [ -s "$T" ]; then
	touch $LOGS.gz
	zcat $LOGS.gz >> $T 2>/dev/null
	sort $T | uniq > $LOGS
	gzip -f $LOGS
fi
rm $T

exit 0
