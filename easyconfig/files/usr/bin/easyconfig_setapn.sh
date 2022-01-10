#!/bin/sh
MODEM=$1
[ -z "$MODEM" ] && MODEM=$(cat /tmp/modem 2>/dev/null)
[ -e "$MODEM" ] || exit 0
[ -z $(command -v chat) ] && exit 0
APN=$(uci -q get network.wan.apn)
[ -z "$APN" ] && exit 0

T=$(uci -q get network.wan.pdptype | awk '{print tolower($0)}')
case "$T" in
	"ipv4v6") PDPTYPE="IPV4V6";;
	"ipv6") PDPTYPE="IPV6";;
	*) PDPTYPE="IP";;
esac

chat -t 3 -e '' 'AT+CGDCONT=1,"'$PDPTYPE'","'$APN'"' OK >> $MODEM < $MODEM

exit 0
