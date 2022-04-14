#!/bin/sh
[ ! -e /www/index.html ] && ln -s /www/easyconfig.html /www/index.html
uci set dhcp.@dnsmasq[0].logqueries='1'
uci commit dhcp
[ -e /etc/crontabs/root ] && sed -i "/easyconfig_wlanlogs/d;/easyconfig_logs/d;/easyconfig_statistics/d" /etc/crontabs/root
echo "*/1 * * * * /usr/bin/easyconfig_logs.sh" >> /etc/crontabs/root
echo "*/1 * * * * /usr/bin/easyconfig_statistics.sh" >> /etc/crontabs/root
exit 0
