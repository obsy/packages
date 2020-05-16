#!/bin/sh
[ ! -e /www/index.html ] && ln -s /www/easyconfig.html /www/index.html
uci set dhcp.@dnsmasq[0].logqueries='1'
uci commit dhcp
[ -e /etc/crontabs/root ] && sed -i "/easyconfig_wlanlogs/d" /etc/crontabs/root
echo "*/1 * * * * /usr/bin/easyconfig_wlanlogs.sh" >> /etc/crontabs/root
[ -e /etc/crontabs/root ] && sed -i "/easyconfig_statistics/d" /etc/crontabs/root
echo "*/1 * * * * /usr/bin/easyconfig_statistics.sh" >> /etc/crontabs/root
exit 0
