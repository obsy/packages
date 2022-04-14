#!/bin/sh

LOGS=/tmp/easyconfig_logs.txt
T=$(mktemp)

logread -t -e "AP-STA-.*CONNECTED\|DHCPACK(" | cut -c 27-40,42- >> $T
if [ -s "$T" ]; then
	touch $LOGS.gz
	zcat $LOGS.gz >> $T 2>/dev/null
	sort -u $T > $LOGS
	gzip -f $LOGS
fi
rm $T

exit 0
