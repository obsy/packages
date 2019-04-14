#!/bin/sh

LOGS=/tmp/easyconfig_wlanlogs.txt
T=$(mktemp)

logread -e "DHCPACK(" >> $T
logread -e "AP-STA-.*CONNECTED" >> $T
if [ -s "$T" ]; then
	touch $LOGS.gz
	zcat $LOGS.gz >> $T 2>/dev/null
	sed 's/daemon.notice/daemon.1/g;s/daemon.info/daemon.2/g' $T | sort | uniq > $LOGS
	gzip -f $LOGS
fi
rm $T

exit 0
