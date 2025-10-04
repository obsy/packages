#!/bin/sh

TYPE=$(mount | awk '/dev\/root/ {print $5}')

if [ "x$TYPE" = "xext4" ]; then
	BOOT="$(sed -n -e "/\s\/boot\s.*$/{s///p;q}" /etc/mtab)"
	DISK="${BOOT%[0-9]*}"
	PART="$((${BOOT##*[^0-9]}+1))"
	ROOT="${DISK}${PART}"
	T=$(echo "$DISK" | sed 's/.*\(.\)$/\1/')
	[ "x$T" = "xp" ] && DISK="${DISK::-1}"
	parted -f -s -a opt $DISK "resizepart 2 100%"

	LOOP="$(losetup -f)"
	losetup ${LOOP} ${ROOT}
	fsck.ext4 -y -f ${LOOP}
	resize2fs ${LOOP}
	reboot
fi

if [ "x$TYPE" = "xsquashfs" ]; then
	BOOT="$(sed -n -e "/\s\/boot\s.*$/{s///p;q}" /etc/mtab)"
	DISK="${BOOT%[0-9]*}"
	PART="$((${BOOT##*[^0-9]}+1))"
	ROOT="${DISK}${PART}"
	T=$(echo "$DISK" | sed 's/.*\(.\)$/\1/')
	[ "x$T" = "xp" ] && DISK="${DISK::-1}"
	parted -f -s -a opt $DISK "resizepart 2 100%"

	LOOP="$(losetup -n -O NAME | sort | sed -n -e "1p")"
	OFFS="$(losetup -n -O OFFSET ${LOOP})"
	LOOP="$(losetup -f)"
	losetup -o ${OFFS} ${LOOP} ${ROOT}

	T=$(mount | awk '/\/dev\/loop.*on \/overlay/ {print $5}')
	if [ "x$T" = "xext4" ]; then
		fsck.ext4 -y -f ${LOOP}
		resize2fs ${LOOP}
	fi
	if [ "x$T" = "xf2fs" ]; then
		fsck.f2fs -y -f ${LOOP}
		mount ${LOOP} /mnt
		umount ${LOOP}
		resize.f2fs ${LOOP}
	fi
	reboot
fi

exit 0
