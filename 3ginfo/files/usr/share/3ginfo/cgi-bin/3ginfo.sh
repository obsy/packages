#!/bin/sh

#
# (c) 2010-2012 Cezary Jackiewicz <cezary@eko.one.pl>
#

getpath() {
	DEV=$1
	O=$(ls -al /sys/class/tty/$DEV 2>/dev/null)
	O1=$(echo "$O" | awk -F">" '/'$DEV'/ {print $2}' | sed -e 's/\/'$DEV'\/tty\/'$DEV'//g')
	P=${O1%%[0-9]}
}

if [ "`basename $0`" = "3ginfo" ]; then
	TOTXT=1
else
	TOTXT=0
fi

# odpytanie urzadzenia
DEVICE=$(uci -q get 3ginfo.@3ginfo[0].device)
if [ ! -e $DEVICE ]; then
	if [ $TOTXT -eq 0 ]; then
		echo -e "Content-type: text/html\n\n"
		echo "<h3 style='color:red;' class=\"c\">Brak urządzenia $DEVICE!</h3>"
	else
		echo "Brak urzadzenia $DEVICE!"
	fi
	exit 0
fi

# znajdz odpowiednia sekcje w konfiguracji
getpath ${DEVICE##/*/}
PORIG=$P
for DEV in /sys/class/tty/${DEVICE##/*/}/device/driver/tty*; do
	getpath ${DEV##/*/}
	if [ "x$PORIG" = "x$P" ]; then
		SEC=$(uci show network | grep "/dev/"${DEV##/*/} | cut -f2 -d.)
		if [ ! -z $SEC ]; then
			break
		fi
	fi
done
if [ -z $SEC ]; then
	SEC=$(uci show network | grep ${DEVICE%%[0-9]} | cut -f2 -d.)
fi

# daj pin jak jest taka potrzeba
if [ ! -f /tmp/pincode_was_given ]; then
	# tylko za pierwszym razem
	if [ ! -z $SEC ]; then
		PINCODE=$(uci -q get network.$SEC.pincode)
	fi
	if [ -z "$PINCODE" ]; then
		PINCODE=$(uci -q get 3ginfo.@3ginfo[0].pincode)
	fi
	if [ ! -z $PINCODE ]; then
		PINCODE="$PINCODE" gcom -d "$DEVICE" -s /etc/gcom/setpin.gcom > /dev/null || {
			if [ $TOTXT -eq 0 ]; then
				echo "<h3 style='color:red;' class=\"c\">Błąd kodu PIN!</h3>"
			else
				echo "Blad kodu PIN!"
				exit 0
			fi
		}
	fi
	touch /tmp/pincode_was_given
fi

O=$(gcom -d $DEVICE -s /usr/share/3ginfo/scripts/3ginfo.gcom 2>/dev/null)

# CSQ
CSQ=$(echo "$O" | awk -F[,\ ] '/^\+CSQ/ {print $2}')

[ "x$CSQ" = "x" ] && CSQ=-1
if [ $CSQ -ge 0 -a $CSQ -le 31 ]; then
	CSQ_PER=$(($CSQ * 100/31))
	CSQ_COL="red"
	[ $CSQ -ge 10 ] && CSQ_COL="orange"
	[ $CSQ -ge 15 ] && CSQ_COL="yellow"
	[ $CSQ -ge 20 ] && CSQ_COL="green"
	CSQ_RSSI=$((2 * CSQ - 113))
	[ $CSQ -eq 0 ] && CSQ_RSSI="<= "$CSQ_RSSI
	[ $CSQ -eq 31 ] && CSQ_RSSI=">= "$CSQ_RSSI
else
	CSQ="-"
	CSQ_PER="0"
	CSQ_COL="black"
	CSQ_RSSI="-"
fi

# COPS
COPS_NUM=$(echo "$O" | awk -F[\"] '/^\+COPS: 0,2/ {print $2}')
if [ "x$COPS_NUM" = "x" ]; then
	COPS_NUM="-"
	COPS_MCC="-"
	COPS_MNC="-"
else
	COPS_MCC=${COPS_NUM:0:3}
	COPS_MNC=${COPS_NUM:3:2}
	COPS=$(awk -F[\;] '/'$COPS_NUM'/ {print $2}' /usr/share/3ginfo/mccmnc.txt)
	[ "x$COPS" = "x" ] && COPS="-"
fi

# dla modemów Option i ZTE
if [ "$COPS_NUM" = "-" ]; then
	COPS=$(echo "$O" | awk -F[\"] '/^\+COPS: 0,0/ {print $2}')
	[ "x$COPS" = "x" ] && COPS="---"

	COPS=$(awk -F[\;] '/'"$COPS"'/ {print $2}' /usr/share/3ginfo/mccmnc.txt)
	if [ "x$COPS" != "x" ]; then
		COPS_NUM=$(awk -F[\;] '/'"$COPS"'/ {print $1}' /usr/share/3ginfo/mccmnc.txt)
		COPS_MCC=${COPS_NUM:0:3}
		COPS_MNC=${COPS_NUM:3:2}
	else
		COPS="-"
	fi
fi

# Technologia
MODE="-"

# Nowe Huawei
TECH=$(echo "$O" | awk -F[,] '/^\^SYSINFOEX/ {print $9}' | sed 's/"//g')
if [ "x$TECH" != "x" ]; then
	MODE="$TECH"
fi

# Starsze modele Huawei i inne pozostale
if [ "x$MODE" = "x-" ]; then
	TECH=$(echo "$O" | awk -F[,\ ] '/^\^SYSINFO/ {print $7}')
	case $TECH in
		17*) MODE="HSPA+ (64QAM)";;
		18*) MODE="HSPA+ (MIMO)";;
		1*) MODE="GSM";;
		2*) MODE="GPRS";;
		3*) MODE="EDGE";;
		4*) MODE="UMTS";;
		5*) MODE="HSDPA";;
		6*) MODE="HSUPA";;
		7*) MODE="HSPA";;
		9*) MODE="HSPA+";;
		 *) MODE="-";;
	esac
fi

# ZTE
if [ "x$MODE" = "x-" ]; then
	TECH=$(echo "$O" | awk -F[,\ ] '/^\+ZPAS/ {print $2}' | sed 's/"//g')
	if [ "x$TECH" != "x" -a "x$TECH" != "xNo" ]; then
		MODE="$TECH"
	fi
fi

# OPTION
if [ "x$MODE" = "x-" ]; then
	TECH=$(echo "$O" | awk -F, '/^\+COPS: 0/ {print $4}')
	MODE="-"
	if [ "$TECH" = 0 ]; then
		TECH1=$(echo "$O" | awk '/^_OCTI/ {print $2}' | cut -f1 -d,)
		case $TECH1 in
			1*) MODE="GSM";;
			2*) MODE="GPRS";;
			3*) MODE="EDGE";;
			 *) MODE="-";;
		esac
	elif [ "$TECH" = 2 ]; then
		TECH1=$(echo "$O" | awk '/^_OWCTI/ {print $2}')
		case $TECH1 in
			1*) MODE="UMTS";;
			2*) MODE="HSDPA";;
			3*) MODE="HSUPA";;
			4*) MODE="HSPA";;
			 *) MODE="-";;
		esac
	fi
fi

# Sierra
if [ "x$MODE" = "x-" ]; then
	TECH=$(echo "$O" | awk -F[,\ ] '/^\*CNTI/ {print $3}' | sed 's|/|,|g')
	if [ "x$TECH" != "x" ]; then
		MODE="$TECH"
	fi
fi

# Novatel
if [ "x$MODE" = "x-" ]; then
	TECH=$(echo "$O" | awk -F[,\ ] '/^\$CNTI/ {print $4}' | sed 's|/|,|g')
	if [ "x$TECH" != "x" ]; then
		MODE="$TECH"
	fi
fi

# Vodafone - icera
if [ "x$MODE" = "x-" ]; then
	TECH=$(echo "$O" | awk -F[,\ ] '/^\%NWSTATE/ {print $4}' | sed 's|/|,|g')
	if [ "x$TECH" != "x" ]; then
		MODE="$TECH"
	fi
fi

# CREG
CREG="+CREG"
LAC=$(echo "$O" | awk -F[,] '/\'$CREG'/ {printf "%s", toupper($3)}' | sed 's/[^A-F0-9]//g')
if [ "x$LAC" = "x" ]; then
    CREG="+CGREG"
    LAC=$(echo "$O" | awk -F[,] '/\'$CREG'/ {printf "%s", toupper($3)}' | sed 's/[^A-F0-9]//g')
fi

if [ "x$LAC" != "x" ]; then
	LAC_NUM=$(printf %d 0x$LAC)
else
	LAC="-"
	LAC_NUM="-"
fi

GDZIE=""
CID=$(echo "$O" | awk -F[,] '/\'$CREG'/ {printf "%s", toupper($4)}' | sed 's/[^A-F0-9]//g')
if [ "x$CID" != "x" ]; then
	if [ ${#CID} -le 4 ]; then
		LCID="-"
		LCID_NUM="-"
		RNC="-"
		RNC_NUM="-"
		LCID_SHOW="none"
	else
		LCID=$CID
		LCID_NUM=$(printf %d 0x$LCID)
		RNC=$(echo "$LCID" | awk '{print substr($1,1,length($1)-4)}')
		RNC_NUM=$(printf %d 0x$RNC)
		CID=$(echo "$LCID" | awk '{print substr($1,length(substr($1,1,length($1)-4))+1)}')
		LCID_SHOW="block"
	fi

	CID_NUM=$(printf %d 0x$CID)
	if [ $TOTXT -eq 0 ]; then
		case $COPS_NUM in
			26001*) CID="<a href=\"http://btsearch.pl/szukaj.php?search="$CID"h\&amp;siec=3\&amp;mode=adv\">$CID</a>";;
			26002*) CID="<a href=\"http://btsearch.pl/szukaj.php?search="$CID"h\&amp;siec=1\&amp;mode=adv\">$CID</a>";;
			26003*) CID="<a href=\"http://btsearch.pl/szukaj.php?search="$CID"h\&amp;siec=2\&amp;mode=adv\">$CID</a>";;
			26006*) CID="<a href=\"http://btsearch.pl/szukaj.php?search="$CID"h\&amp;siec=4\&amp;mode=adv\">$CID</a>";;
			26016*) CID="<a href=\"http://btsearch.pl/szukaj.php?search="$CID"h\&amp;siec=7\&amp;mode=adv\">$CID</a>";;
			26017*) CID="<a href=\"http://btsearch.pl/szukaj.php?search="$CID"h\&amp;siec=8\&amp;mode=adv\">$CID</a>";;
		esac
	fi

	CLF=$(uci -q get 3ginfo.@3ginfo[0].clf)
	if [ -e "$CLF" ]; then
		PAT="^$COPS_NUM;0X"$(printf %04X $CID_NUM)";0X"$(printf %04X $LAC_NUM)";"
		GDZIE="<a href=\"http://maps.google.pl/?t=k\&z=17\&q="$(awk -F";" '/'$PAT'/ {printf $5","$6}' "$CLF")"\">"$(awk -F";" '/'$PAT'/ {print $8}' "$CLF")"</a>"
	fi
else
	LCID="-"
	LCID_NUM="-"
	RNC="-"
	RNC_NUM="-"
	LCID_SHOW="none"
	CID="-"
	CID_NUM="-"
fi

# CGEQNEG
QOS_SHOW="none"
DOWN="-"
UP="-"

QOS=$(uci -q get 3ginfo.@3ginfo[0].qos)
if [ "x$QOS" = "x1" ]; then
	DOWN=$(echo "$O" | awk -F[,] '/\+CGEQNEG/ {printf "%s", $4}')
	if [ "x$DOWN" != "x" ]; then
		UP=$(echo "$O" | awk -F[,] '/\+CGEQNEG/ {printf "%s", $3}')
		QOS_SHOW="block"
	fi
fi

# SMS
if [ -e /usr/bin/gnokii ]; then
	SMS_SHOW="block"
else
	SMS_SHOW="none"
fi

# USSD
if [ -e /usr/bin/ussd159 ]; then
	USSD_SHOW="block"
else
	USSD_SHOW="none"
fi


# Stan limitu
LIMIT_SHOW="none"
LIMIT=$(uci -q get 3ginfo.@3ginfo[0].script)
if [ "x$LIMIT" != "x" ]; then
	LIMIT_SHOW="block"
fi

# Status polaczenia
PROTO=$(uci -q get network.$SEC.proto)
if [ "${DEVICE%%[0-9]}" = "/dev/ttyHS" ] && [ "x$PROTO" = "xhso" ]; then
	IFACE="hso0"
else
	IFACE="3g-"$SEC
fi

CONN_TIME="-"
RX="-"
TX="-"

if [ "$IFACE" = "3g-" ]; then
	STATUS="(brak informacji)"
	STATUS_TRE="-"
	STATUS_SHOW="none"
else
	if ifconfig $IFACE 2>/dev/null | grep -q inet; then
		if [ $TOTXT -eq 0 ]; then
			STATUS="<font color=green>Połączony</font>"
		else
			STATUS="Polaczony"
		fi
		STATUS_TRE="Rozłącz"

		UP=$(cut -d. -f1 /proc/uptime)
		CT=$(uci -q get -P /var/state/ network.$SEC.connect_time)
		if [ ! -z $CT ]; then
			CT=$((UP-CT))
			D=$(expr $CT / 60 / 60 / 24)
			H=$(expr $CT / 60 / 60 % 24)
			M=$(expr $CT / 60 % 60)
			S=$(expr $CT % 60)
			CONN_TIME=$(printf "%d dni, %02d:%02d:%02d" $D $H $M $S)
		fi
		RX=$(ifconfig $IFACE | awk -F[\(\)] '/bytes/ {printf "%s",$2}')
		TX=$(ifconfig $IFACE | awk -F[\(\)] '/bytes/ {printf "%s",$4}')
	else
		if [ $TOTXT -eq 0 ]; then
			STATUS="<font color=red>Rozłączony</font>"
		else
			STATUS="Rozlaczony"
		fi
		STATUS_TRE="Połącz"
	fi
	STATUS_SHOW="block"
fi

# Informacja o urzadzeniu
DEVICE=$(echo "$O" | awk -F[:] '/DEVICE/ { print $2}')
if [ "x$DEVICE" = "x" ]; then
	DEVICE="-"
fi

# podmiana w szablonie
if [ $TOTXT -eq 0 ]; then
	EXT="html"
else
	EXT="txt"
fi

LANG=$(uci -q get 3ginfo.@3ginfo[0].language)
[ "x$LANG" = "x" ] && LANG="pl"
TEMPLATE="/usr/share/3ginfo/status."$EXT"."$LANG
[ ! -e $TEMPLATE ] && TEMPLATE="/usr/share/3ginfo/status."$EXT".en"

[ $TOTXT -eq 0 ] && echo -e "Content-type: text/html\n\n"

sed -e "s/{CSQ}/$CSQ/; \
	s/{CSQ_PER}/$CSQ_PER/; \
	s/{CSQ_RSSI}/$CSQ_RSSI/; \
	s/{CSQ_COL}/$CSQ_COL/; \
	s!{COPS}!$COPS!; \
	s/{COPS_NUM}/$COPS_NUM/; \
	s!{COPS_MCC}!$COPS_MCC!; \
	s!{COPS_MNC}!$COPS_MNC!; \
	s!{LAC}!$LAC!; \
	s!{LAC_NUM}!$LAC_NUM!; \
	s!{LCID}!$LCID!; \
	s!{LCID_NUM}!$LCID_NUM!; \
	s!{RNC}!$RNC!; \
	s!{RNC_NUM}!$RNC_NUM!; \
	s!{LCID_SHOW}!$LCID_SHOW!g; \
	s!{CID}!$CID!; \
	s!{CID_NUM}!$CID_NUM!; \
	s!{GDZIE}!$GDZIE!; \
	s/{DOWN}/$DOWN/; \
	s/{UP}/$UP/; \
	s/{QOS_SHOW}/$QOS_SHOW/g; \
	s/{SMS_SHOW}/$SMS_SHOW/; \
	s/{USSD_SHOW}/$USSD_SHOW/; \
	s/{LIMIT_SHOW}/$LIMIT_SHOW/; \
	s!{STATUS}!$STATUS!g; \
	s!{CONN_TIME}!$CONN_TIME!g; \
	s!{RX}!$RX!g; \
	s!{TX}!$TX!g; \
	s!{STATUS_TRE}!$STATUS_TRE!; \
	s!{STATUS_SHOW}!$STATUS_SHOW!g; \
	s!{DEVICE}!$DEVICE!; \
	s/{MODE}/$MODE/" $TEMPLATE

exit 0
