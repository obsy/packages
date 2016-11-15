#!/bin/sh

[ -e /etc/crontabs/root ] || touch /etc/crontabs/root

STAT=$(uci -q get system.@system[0].stat)
if [ "x$STAT" != "x1" ]; then
	if grep -q "stat.sh" /etc/crontabs/root; then
		grep -v "/sbin/stat.sh" /etc/crontabs/root > /tmp/new_cron
		mv /tmp/new_cron /etc/crontabs/root
		/etc/init.d/cron restart
	fi
	exit 0
fi

if ! grep -q "stat.sh" /etc/crontabs/root; then
	M=$(tr -cd 0-9 </dev/urandom | head -c 3 | awk '{print $1 % 60}')
	H=$(tr -cd 0-9 </dev/urandom | head -c 3 | awk '{print $1 % 24}')
	echo "$M $H * * * /sbin/stat.sh" >> /etc/crontabs/root
	/etc/init.d/cron restart
	/sbin/stat.sh
fi

exit 0
