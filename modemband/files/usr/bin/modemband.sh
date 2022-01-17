#!/bin/sh

#
# (c) 2022 Cezary Jackiewicz <cezary@eko.one.pl>
#

_DEVICE=""
_DEFAULT_LTE_BANDS=""

# default templates

# modem name/type
getinfo() {
	echo "Unsupported"
}

# get supported band
getsupportedbands() {
	echo "Unsupported"
}

# get current configured bands
getbands() {
	echo "Unsupported"
}

# set bands
setbands() {
	echo "Unsupported"
}

RES="/usr/share/modemband"

_DEVS=$(awk '{gsub("="," ");
if ($0 ~ /Bus.*Lev.*Prnt.*Port.*/) {T=$0}
if ($0 ~ /Vendor.*ProdID/) {idvendor[T]=$3; idproduct[T]=$5}
if ($0 ~ /Product/) {product[T]=$3}}
END {for (idx in idvendor) {printf "%s%s\n%s%s%s\n", idvendor[idx], idproduct[idx], idvendor[idx], idproduct[idx], product[idx]}}' /sys/kernel/debug/usb/devices)
for _DEV in $_DEVS; do
	if [ -e "$RES/$_DEV" ]; then
		. "$RES/$_DEV"
		break
	fi
done

if [ -z "$_DEVICE" ]; then
	echo "No supported modem was found, quitting..."
	exit 0
fi
if [ ! -e "$_DEVICE" ]; then
	echo "Port not found, quitting..."
	exit 0
fi

case $1 in
	"getinfo")
		getinfo
		;;
	"getsupportedbands")
		getsupportedbands
		;;
	"getbands")
		getbands
		;;
	"setbands")
		setbands "$2"
		;;
	*)
		echo ""
		echo -n "Modem: "
		getinfo
		echo -n "Supported LTE bands: "
		getsupportedbands
		echo -n "LTE bands: "
		getbands
		;;
esac

exit 0
