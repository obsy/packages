#!/bin/sh

[ -e /etc/config/luci ] || exit 0

uci add luci command
uci set luci.@command[-1].name='Instalacja pakietów użytkownka'
uci set luci.@command[-1].command='/usr/bin/restorepkgslist.sh verbose'
uci add luci command
uci set luci.@command[-1].name='Archiwizacja listy pakietów użytkownika'
uci set luci.@command[-1].command='/usr/bin/backuppkgslist.sh verbose'
uci commit

exit 0
