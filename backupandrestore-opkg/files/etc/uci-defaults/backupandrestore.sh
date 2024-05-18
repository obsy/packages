#!/bin/sh

[ -e /etc/config/luci ] || exit 0

if uci show luci | grep -q restorepkgslist.sh; then
	true
else
	uci add luci command
	uci set luci.@command[-1].name='Instalacja pakietów użytkownika'
	uci set luci.@command[-1].command='/usr/bin/restorepkgslist.sh verbose'
fi

if uci show luci | grep -q backuppkgslist.sh; then
	true
else
	uci add luci command
	uci set luci.@command[-1].name='Archiwizacja listy pakietów użytkownika'
	uci set luci.@command[-1].command='/usr/bin/backuppkgslist.sh verbose'
fi
uci commit luci

exit 0
