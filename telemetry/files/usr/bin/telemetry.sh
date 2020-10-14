#!/bin/sh

. /lib/functions.sh
. /usr/share/libubox/jshn.sh

DATA=""
RES=/usr/lib/telemetry

info() {
	local config="$1"

	config_get enabled "$config" enabled 1
	config_get script "$config" script
	if [ -e "$RES/$script" ]; then
		value=$("$RES/$script" info)
		config_get param "$config" param
		printf "%-30s%-30s%-20s\n" "$value" "parameter: $param" "enabled: $enabled"
	fi

}

handle_script() {
	local config="$1"
	local type="$2"

	config_get enabled "$config" enabled 1
	[ "$enabled" -eq 1 ] || return

	config_get script "$config" script
	if [ -e "$RES/$script" ]; then
		value=$("$RES/$script")
		config_get param "$config" param
		case "$type" in
			"get" | "post")
				[ "x$DATA" = "x" ] || DATA="${DATA}&"
				DATA="${DATA}${param}=${value}"
				;;
			"mqtt")
				if [ "x$DATA" = "x" ]; then
					json_init
				else
					json_load "$(echo "$DATA")"
				fi
				json_add_string "${param}" "${value}"
				DATA=$(json_dump)
				;;
		esac
	fi
}

parse_globals() {
	local section="$1"
	config_get_bool enabled "$section" enabled 1
	[ "$enabled" -eq 1 ] || exit 0
	config_get type "$section" type ""
	if [ "x$2" = "xinfo" ]; then
		config_foreach info script
		exit 0
	else
		config_foreach handle_script script "$type"
	fi
	[ "x$2" = "xdebug" ] && DEBUG="echo " || DEBUG=""
	case "$type" in
		"get")
			config_get url "$section" url ""
			$DEBUG wget -q -O /dev/null "${url}?${DATA}"
			;;
		"post")
			config_get url "$section" url ""
			$DEBUG curl -o /dev/null -d "${DATA}" -X POST "${url}"
			;;
		"mqtt")
			config_get options "$section" options
			config_get host "$section" host
			config_get topic "$section" topic
			$DEBUG mosquitto_pub "${options}" -h "${host}" -t "${topic}" -m "${DATA}"
	esac
}

config_load telemetry
config_foreach parse_globals telemetry $1

exit 0
