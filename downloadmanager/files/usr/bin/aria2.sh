#!/bin/sh

DIR=$1
[ "x$1" = "x" ] && exit 0

CONF=$1/.aria2

mkdir -p "$CONF"
touch "$CONF"/session

aria2c \
	--conf-path=/etc/aria2.conf \
	--dir="$DIR" \
	--log="$CONF"/aria2.log \
	--input-file="$CONF"/session \
	--save-session="$CONF"/session \
	--dht-file-path="$CONF"/dht.dat

exit 0
