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
		printf "%-30s%-30s%-20s\n" "$value" "$param" "$enabled"
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
		lines=$(echo "$value" | wc -l)
		config_get param "$config" param
		case "$type" in
			"get" | "post")
				[ -z "$DATA" ] || DATA="${DATA}&"
				if [ $lines -le 1 ]; then
					DATA="${DATA}${param}=${value}"
				else
					DATA="${DATA}${param}="$(echo "$value" | tr '\n' '|' | sed 's/|$//')
				fi
				;;
			"mqtt")
				if [ -z "$DATA" ]; then
					json_init
				else
					json_load "$(echo "$DATA")"
				fi
				if [ $lines -le 1 ]; then
					json_add_string "${param}" "${value}"
				else
					json_add_array "${param}"
					for line in $value; do
						json_add_string "" "${line}"
					done
					json_close_array
				fi
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
		printf "%-30s%-30s%-20s\n" "Description" "Parameter" "Enabled"
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
			$DEBUG mosquitto_pub ${options} -h "${host}" -t "${topic}" -m "${DATA}"
	esac
}

config_load telemetry
config_foreach parse_globals telemetry $1

exit 0
