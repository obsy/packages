#!/bin/sh
MODEM=$1
[ -z "$MODEM" ] && MODEM=$(/usr/share/easyconfig/modem/detect.sh)
[ -z "$MODEM" ] && exit 0
[ -e "$MODEM" ] || exit 0
[ -z $(command -v chat) ] && exit 0

PROFILE=$(uci -q get network.wan.profile)
[ -z "$PROFILE" ] && PROFILE=1

T=$(uci -q get network.wan.pdptype | awk '{print tolower($0)}')
case "$T" in
	"ipv4v6") PDPTYPE="IPV4V6";;
	"ipv6") PDPTYPE="IPV6";;
	*) PDPTYPE="IP";;
esac

APN=$(uci -q get network.wan.apn)
[ -z "$APN" ] && exit 0

chat -t 3 -e '' 'AT+CGDCONT='$PROFILE',"'$PDPTYPE'","'$APN'"' OK >> $MODEM < $MODEM

exit 0
