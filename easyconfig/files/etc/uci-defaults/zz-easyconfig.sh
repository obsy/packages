#!/bin/sh
[ ! -e /www/index.html ] && ln -s /www/easyconfig.html /www/index.html
uci set dhcp.@dnsmasq[0].logqueries='1'
uci commit dhcp
exit 0
