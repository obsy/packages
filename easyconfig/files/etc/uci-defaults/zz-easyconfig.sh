#!/bin/sh
[ ! -e /www/index.html ] && ln -s /www/easyconfig.html /www/index.html
[ -e /etc/crontabs/root ] && sed -i "/easyconfig_logs/d;/easyconfig_statistics/d" /etc/crontabs/root
echo "*/1 * * * * /usr/bin/easyconfig_logs.sh" >> /etc/crontabs/root
echo "*/1 * * * * /usr/bin/easyconfig_statistics.sh" >> /etc/crontabs/root

if [ -e /etc/rc.button/rfkill ] && [ ! -e /usr/share/easyconfig/rc.button/rfkill ]; then
	cp /etc/rc.button/rfkill /usr/share/easyconfig/rc.button/rfkill
fi

if [ -e /etc/rc.button/wps ] && [ ! -e /usr/share/easyconfig/rc.button/wps ]; then
	cp /etc/rc.button/wps /usr/share/easyconfig/rc.button/wps
fi

exit 0
