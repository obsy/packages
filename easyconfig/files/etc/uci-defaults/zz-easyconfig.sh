#!/bin/sh
[ ! -e /www/index.html ] && ln -s /www/easyconfig.html /www/index.html
uci set dhcp.@dnsmasq[0].logqueries='1'
uci commit dhcp
echo "*/1 * * * * /usr/bin/easyconfig_wlanlogs.sh" >> /etc/crontabs/root
exit 0
