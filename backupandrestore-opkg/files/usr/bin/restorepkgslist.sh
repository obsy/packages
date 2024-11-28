#!/bin/sh

# eko.one.pl services
# restore user installed packages from list

BACKUPDIR=/etc/backup
PKGSLIST=list-user-installed-packages.txt
if [ ! -s $BACKUPDIR/$PKGSLIST ]; then
	[ -n "$1" ] && echo "Brak listy pakietów do zainstalowania"
	exit 0
fi

RET=0
opkg update
while read -r pkg; do
	if [ -n "$pkg" ]; then
		opkg install $pkg
		T=$?
		[ "x$T" != "x0" ] && RET=$T
	fi
done < $BACKUPDIR/$PKGSLIST

if [ -n "$1" ]; then
	echo ""
	echo "Zainstalowano pakiety użytkownika"
fi

exit $RET
