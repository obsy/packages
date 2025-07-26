#!/bin/sh

DEVICE=$(/usr/share/easyconfig/modem/detect.sh)
[ -z "$DEVICE" ] && exit 0

CMD=$1
PIN=$2
NEWPIN=$3

# status
O=$(sms_tool -d $DEVICE at "AT+CLCK=\"SC\",2")
STATUS=$(echo "$O" | awk '/^\+CLCK:/{print $2}')

case ${CMD} in
	"enable")
		if [ "x$STATUS" = "x0" ]; then
			sms_tool -D -d $DEVICE at "AT+CLCK=\"SC\",1,\""${PIN}"\"" 
			sms_tool -d $DEVICE at "AT+CFUN=1,1"
		fi
		;;
	"change")
		sms_tool -d $DEVICE at "AT+CPWD=\"SC\",\""${PIN}"\",\""${NEWPIN}"\""
		;;
	"disable")
		if [ "x$STATUS" = "x1" ]; then
			sms_tool -D -d $DEVICE at "AT+CLCK=\"SC\",0,\""${PIN}"\""
			sms_tool -d $DEVICE at "AT+CFUN=1,1"
		fi
		;;
	"status")
		;;
esac

# status
if [ -n "$CMD" ]; then
	O=$(sms_tool -d $DEVICE at "AT+CLCK=\"SC\",2")
	STATUS=$(echo "$O" | awk '/^\+CLCK:/{print $2}')
fi

case "${STATUS}" in
	"0"*)
		echo "SIM pincode OFF"
		;;
	*)
		echo "SIM pincode ON"
		;;
esac

if [ -z "$CMD" ]; then
	echo ""
	echo "$0: status"
	echo "$0: enable <PIN>"
	echo "$0: change <OLDPIN> <NEWPIN>"
	echo "$0: disable <PIN>"
fi

exit 0
