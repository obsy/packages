#!/bin/sh

[ -e /etc/config/luci ] || exit 0

if uci show luci | grep -q resize-root.sh; then
	true
else
	uci add luci command
	uci set luci.@command[-1].name='Rozszerzanie partycji głównej na cały nośnik'
	uci set luci.@command[-1].command='/root/resize-root.sh'
	uci commit luci
fi

exit 0
