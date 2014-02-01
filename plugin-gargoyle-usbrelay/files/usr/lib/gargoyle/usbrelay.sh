#!/bin/sh

# usbrelay.sh polecenie [numer_portu]

# polecenie, pierwszy argument:
# off - wylacza przekaznik
#   usbrelay.sh off 0
# on - wlacza przekaznik
#   usbrelay.sh on 0
# status - podaje status wszystkich przekazników w postaci numer_przekaznika:on lub numer_portu:off, kazdy w osobnej linii
#   usbrelay.sh status
#   0:on
#   1:on
#   2:off
#   3:off
#   4:off
#   5:off
#   6:off
#   7:off

# numer_portu, drugi argument

case "$1" in
	off)
		powerSwitch off $2
		;;
	on)
		powerSwitch on $2
		;;
	status)
		powerSwitch status 2>/dev/null | awk '/port/ {printf "%s%s\n", $2, $3}'
		;;
esac

exit 0
