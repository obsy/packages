#!/bin/sh

[ -n "$INCLUDE_ONLY" ] || {
	. /lib/functions.sh
	. ../netifd-proto.sh
	init_proto "$@"
}

proto_hso_init_config() {
	no_device=1
	available=1
	proto_config_add_string "device"
	proto_config_add_string "maxwait"
	proto_config_add_string "apn"
	proto_config_add_string "pincode"
	proto_config_add_string "username"
	proto_config_add_string "password"
}

proto_hso_setup() {
	local interface="$1"
	local chat="/etc/chatscripts/hso.chat"

	json_get_var device device
	json_get_var maxwait maxwait
	maxwait=${maxwait:-20}
	while [ ! -e "$device" -a $maxwait -gt 0 ]; do # wait for driver loading to catch up
		maxwait=$(($maxwait - 1))
		sleep 1
	done

	[ -n "$device" ] || {
		echo "$interface (hso): No control device specified"
		proto_notify_error "$interface" NO_DEVICE
		proto_set_available "$interface" 0
		return 1
	}
	[ -e "$device" ] || {
		echo "$interface (hso): Control device not valid"
		proto_set_available "$interface" 0
		return 1
	}

	json_get_var apn apn
	json_get_var pincode pincode
	json_get_var service service
	json_get_var username username
	json_get_var password password

	[ -n "$apn" ] || {
		echo "$interface (hso): No APN specified"
		proto_notify_error "$interface" NO_APN
		return 1
	}


	devname="$(basename "$device")"
	devpath="$(readlink -f /sys/class/tty/$devname/device)"
	ifname="$( ls "$devpath"/../*/net )"
	[ -n "$ifname" ] || {
		echo "$interface (hso): The interface could not be found."
		proto_notify_error "$interface" NO_IFACE
		proto_set_available "$interface" 0
		return 1
	}

	# set pin if configured
	if [ ! -z "$pincode" ]; then
		PINCODE="$pincode" gcom -d "$device" -s /etc/gcom/setpin.gcom || {
			echo "$interface (hso): Failed to set the PIN code."
			proto_notify_error "$interface" PIN_FAILED
			proto_block_restart "$interface"
			return 1
		}
	fi

	# set username and password if configured
	if [ -n "$username" -a -n "$password" ]; then
		USER="$username" PASS="$password" gcom -d "$device" -s /etc/gcom/setuser.gcom || {
			echo "$interface (hso): Failed to set username and password."
			proto_notify_error "$interface" AUTH_FAILED
			return 1
		}
	fi

	case "$service" in
		umts_only) service_mode=1;;
		gprs_only) service_mode=0;;
		*) service_mode=3;;
	esac

	local pip connwait
	local outputfile="/tmp/hsoout.$$"

	connwait=15
	while [ -z "$pip" -a $connwait -gt 0 ]; do
		sleep 2
		rm -f $outputfile
		( USE_APN=$apn MODE=$service_mode /usr/sbin/chat -E -v -V -f $chat <$device > $device ) 2> $outputfile
		iserror=$(grep '^ERROR' $outputfile)
		if [ -z "$iserror" ]; then
			pip=$(grep '^_OWANDATA' $outputfile | cut -d, -f2)
			gw=$(grep '^_OWANDATA' $outputfile | cut -d, -f3)
			ns1=$(grep '^_OWANDATA' $outputfile | cut -d, -f4)
			ns2=$(grep '^_OWANDATA' $outputfile | cut -d, -f5)
		fi

		connwait=$(($connwait - 1))
	done

	rm -f $outputfile

	if [ -z $pip ]; then
		echo "$interface (hso): Failed to connect and obtain IP address."
		proto_notify_error "$interface" CONNECT_FAILED
		return 1
	fi

	proto_init_update $ifname 1
	proto_set_keep 1
	proto_add_ipv4_address "$pip" 32
	proto_add_dns_server "$ns1"
	proto_add_dns_server "$ns2"
	proto_add_ipv4_route "0.0.0.0" 0 $gw
	proto_add_data
	json_add_string "ppp-type" "hso"
	proto_close_data
	proto_send_update "$interface"
}

proto_hso_teardown() {
	local config="$1"
	local chat="/etc/chatscripts/hsohup.chat"

	json_get_var device device
	/usr/sbin/chat -v -f $chat <$device > $device
}

[ -n "$INCLUDE_ONLY" ] || {
	add_protocol hso
}
