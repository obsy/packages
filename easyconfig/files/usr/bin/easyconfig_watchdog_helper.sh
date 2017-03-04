#!/bin/sh

w_enabled=$1
w_dest=$2
w_period=$3
w_delay=$4
w_action=$5

F=$(mktemp)
touch /etc/crontabs/root
grep -v easyconfig_watchdog /etc/crontabs/root > $F
if [ "x$w_enabled" = "xtrue" ]; then
	w_delay=$((w_delay*60))
	echo "*/$w_period * * * * /usr/bin/easyconfig_watchdog.sh $w_delay 3 $w_dest $w_action" >> $F
fi
mv $F /etc/crontabs/root
rm -f $F
/etc/init.d/cron restart

exit 0
