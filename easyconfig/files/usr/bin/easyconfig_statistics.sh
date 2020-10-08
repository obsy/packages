#!/bin/sh

DB=/tmp/easyconfig_statistics.json
SDB=/usr/lib/easyconfig/easyconfig_statistics.json.gz

[ -e "$DB.lock" ] && exit 0

FIRSTRUN=0
if [ ! -e $DB ]; then
	if [ -e "$SDB" ]; then
		zcat "$SDB" > "$DB"
		FIRSTRUN=1
	else
		mkdir -p $(dirname "$SDB")
		echo "{}" > "$DB"
	fi
fi

. /usr/share/libubox/jshn.sh

TS=$(date "+%Y%m%d%H%M")
DATE=$(date "+%Y%m%d")

json_init
json_load_file "$DB"

if [ "x$FIRSTRUN" = "x1" ]; then
	_json_no_warning=1
	json_select "wan" && {
		json_get_keys IFNAMES
		for I in $IFNAMES; do
			if json_is_a "$I" object; then
				json_select "$I" && {
					json_add_int "last_tx" 0
					json_add_int "last_rx" 0
					json_select ..
				}
			fi
		done
		json_select ..
	}
fi

update_entry() {
	MAC=$1
	IFNAME=$2
	TX=$3
	RX=$4
	CONNECTED=$5
	DHCPNAME="$6"

	local _json_no_warning=1
	NEW_MAC=0
	json_select "$MAC" || {
		NEW_MAC=1
		json_add_object "$MAC"
		json_add_string "first_seen" "$TS"
	}
	[ -n "$DHCPNAME" ] && json_add_string "dhcpname" "$DHCPNAME"

	NEW_IFNAME=0
	json_select "$IFNAME" || {
		NEW_IFNAME=1
		json_add_object "$IFNAME"
		json_add_int "last_tx" 0
		json_add_int "last_rx" 0
		json_add_string "first_seen" "$TS"
	}
	json_get_vars last_tx last_rx

	NEW_DATE=0
	json_select "$DATE" || {
		NEW_DATE=1
		json_add_object "$DATE"
		json_add_int "total_tx" 0
		json_add_int "total_rx" 0
	}
	json_get_vars total_tx total_rx

	dtx=$((TX - last_tx))
	[ $dtx -lt 0 ] && dtx=$TX
	drx=$((RX - last_rx))
	[ $drx -lt 0 ] && drx=$RX
	if [ $CONNECTED -le 60 ]; then
		dtx=$TX
		drx=$RX
	fi

	json_add_int "total_tx" $((total_tx + dtx))
	json_add_int "total_rx" $((total_rx + drx))
	if [ "$NEW_DATE" = "1" ]; then
		json_close_object
	else
		json_select ..
	fi

	json_add_int "last_tx" "$TX"
	json_add_int "last_rx" "$RX"
	json_add_string "last_seen" "$TS"
	if [ "$NEW_IFNAME" = "1" ]; then
		json_close_object
	else
		json_select ..
	fi

	json_add_string "last_seen" "$TS"
	if [ "$NEW_MAC" = "1" ]; then
		json_close_object
	else
		json_select ..
	fi
}

IFNAMES=$(ubus call network.wireless status | jsonfilter -q -e '@.*.interfaces[@.config.network[*]="lan"].ifname')
for I in $IFNAMES; do
	STATIONS=$(iw dev "$I" station dump | awk -v IFNAME="$I" '{if($1 == "Station") {MAC=$2;station[MAC]=1} if($0 ~ /rx bytes:/) {rx[MAC]=$3} if($0 ~ /tx bytes:/) {tx[MAC]=$3} if($0 ~ /connected time:/) {connected[MAC]=$3}} END {for (w in station) {printf "%s;%s;%s;%s;%s\n", w, IFNAME, tx[w], rx[w], connected[w]}}')
	for S in $STATIONS; do
		DHCPNAME=$(awk '/'$(echo "$S" | cut -f1 -d";")'/{if ($4 != "*") {print $4}}' /tmp/dhcp.leases)
		update_entry $(echo "$S" | cut -f1 -d";") $(echo "$S" | cut -f2 -d";") $(echo "$S" | cut -f3 -d";") $(echo "$S" | cut -f4 -d";") $(echo "$S" | cut -f5 -d";") "$DHCPNAME"
	done
done

IFNAME=$(ifstatus wan | jsonfilter -q -e '@.l3_device')
if [ -n "$IFNAME" ]; then
	update_entry "wan" "$IFNAME" $(cat /sys/class/net/$IFNAME/statistics/tx_bytes) $(cat /sys/class/net/$IFNAME/statistics/rx_bytes) 999 ""
fi

json_dump > $DB

PERIOD=$(uci -q get easyconfig.global.datarec_period)
[ -z "$PERIOD" ] && PERIOD=15
NOW=$(date +%s)
if [ -e "$SDB" ]; then
	DBTS=$(date +%s -r "$SDB")
	WRITETS=$((DBTS + (PERIOD * 60)))
else
	WRITETS=$((NOW - 1))
fi
if [ $WRITETS -le $NOW ]; then
	gzip -c "$DB" > "$DB.gz"
	mv "$DB.gz" "$SDB"
fi

exit 0
