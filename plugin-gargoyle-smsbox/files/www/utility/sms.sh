#!/bin/sh

# $1	/dev/ttyUSB0
# $2	mem	mem	mem	mem	XX
# $3	s	d	l	r	u
# $4	numer	index			"ussd"
# $5	"tresc"

[ -e $1 ] || exit 0

echo -e "[global]\nmodel = AT\nport = $1\nconnection = serial" > /tmp/gnokiirc
case $3 in
	"s")
		echo "$5" | gnokii --config /tmp/gnokiirc --sendsms $4 > /tmp/gnokii.log 2>&1
		R=$?
		if [ $R -eq 0 ]; then
			echo "Wysłano wiadomość do $4!"
		else
			echo "Wystąpił problem z wysłaniem wiadomości!"
		fi
	;;
	"d")
		gnokii --config /tmp/gnokiirc --deletesms $2 $4
	;;
	"l")
		gnokii --config /tmp/gnokiirc --getsms $2 0 end 2>/dev/null | \
			sed -e 's/\(^[0-9]*\)\. Inbox Message /-sta-\1-sep-/g;s/Date\/time: /-sep-/g;s/Text:/-sep-/g;s/Sender: /-sep-/g;s/Msg Center:.*$//g;s/ +[0-9].*//g' | \
			tr -d '\n' | tr -d '\r'
	;;
	"r")
		gnokii --config /tmp/gnokiirc --getsms $2 0 end 2>/dev/null
	;;
	"u")
		ussd159 -p $1 -u "$4"
	;;
	*)
		echo "Nic tu nie ma. Idz sobie."
	;;
esac

rm /tmp/gnokiirc
exit 0
