#!/bin/sh

findinterfaces() {
	O=""
	DIR="$1"
	DESC="$2"
	VID=$(cat ${DIR}/idVendor 2>/dev/null)
	PID=$(cat ${DIR}/idProduct 2>/dev/null)
	MAN=$(cat ${DIR}/manufacturer 2>/dev/null)
	PRO=$(cat ${DIR}/product 2>/dev/null)
	[ -e "${DIR}" ] && O=$(find "${DIR}" \( -name tty[UA]* -o -name cdc-wdm* -o -name wwan* \) -maxdepth 3 -exec basename {} \; | sort -u | tr '\n' ' ')
	[ -n "$O" ] && echo "${DESC}${VID:--}:${PID:--} (${MAN:--} ${PRO:--}) -> ${O}"
}

case "$(cat /tmp/sysinfo/board_name)" in
alfa-network,quad-e4g)
	for i in "m2      :usb2/2-1" "minipci0:usb1/1-2/1-2.4" "minipci1:usb1/1-2/1-2.3" "minipci2:usb1/1-2/1-2.2" "usb     :usb1/1-2/1-2.1"; do
		T1=$(echo "$i" | cut -f1 -d:)
		T2=$(echo "$i" | cut -f2 -d:)
		findinterfaces "/sys/devices/platform/1e1c0000.xhci/$T2" "$T1 "
	done
	;;
*)
	DEVICES=$(find /sys/devices/platform -name idProduct)
	for DEVICE in $DEVICES; do
		findinterfaces "$(dirname ${DEVICE})"
	done
	;;
esac

exit 0
