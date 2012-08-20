#!/usr/bin/haserl
<?
	echo "Content-Type: text/plain"
	echo ""

	ip="$REMOTE_ADDR"
	result="no_msg"
	msgfile=$(uci -q get gargoyle.system.msgfile)
	if [ -z "$msgfile" ]; then
		msgfile="/www/msg.txt"
	fi
	if [ -e "$msgfile" ]; then
		result=$(awk '/'$ip'/ {for (i=2; i<=NF; i++) printf("%s ",$i) }' "$msgfile")
		[ -z "$result" ] && result="no_msg"
	fi

	echo "$result"
?>
