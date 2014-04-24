#!/usr/bin/haserl
<?
	echo "Content-type: text/plain"
	echo ""

	if [ -n "$FORM_commands" ] ; then

		tmp_file="/tmp/tmp.sh"
		printf "%s" "$FORM_commands" | tr -d "\r" > $tmp_file
		sh $tmp_file

		if [ -e $tmp_file ] ; then
			rm $tmp_file
		fi
	fi
	echo "Success"
?>
