#!/bin/sh

#
# (c) 2024-2025 Cezary Jackiewicz <cezary@eko.one.pl>
#

. /usr/share/libubox/jshn.sh

json_init
json_load "$(ubus call easyconfig modem)"
json_get_vars csq signal operator_name operator_mcc operator_mnc country mode registration lac_dec lac_hex cid_dec cid_hex

if [ -z "$operator_name" ] && [ -z "$operator_mcc" ] && [ -z "$operator_mnc" ]; then
	echo "Missing modem information"
	exit 0
fi

echo "Signal: ${signal} %"
echo "Mode: ${mode}"
echo "Operator: ${operator_name} (${operator_mcc} ${operator_mnc})"
[ -n "$country" ] && echo "Country: ${country}"
case $registration in
	0) REG="not registered";;
	1) REG="registered, home network";;
	2) REG="not registered, searching";;
	3) REG="registration denied";;
	5) REG="registered, roaming";;
	6) REG="registered for SMS only, home network";;
	7) REG="registered for SMS only, roaming";;
	*) REG="$registration";;
esac
echo "Registration: ${REG}"
echo ""
T="21;CellID: ${cid_dec} (${cid_hex})"
T="${T}\n22;LAC: ${lac_dec} (${lac_hex})"
if json_is_a addon array; then
	json_get_keys addon addon
	json_select addon
	for i in $addon; do
		json_select "$i"
		json_get_vars idx key value
		json_select ..
		if [ "$idx" = "10" ]; then
			T="${T}\n${idx};${key}: ${value/&deg;/°}"
		else
			T="${T}\n${idx};${key}: ${value}"
		fi
	done
fi
echo -e "$T" | sort | awk -F[\;] '{print $2}'

exit 0
