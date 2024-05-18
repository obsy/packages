#!/bin/sh

# eko.one.pl services
# restore user installed packages from list

BACKUPDIR=/etc/backup
PKGSLIST=list-user-installed-packages.txt
if [ ! -s $BACKUPDIR/$PKGSLIST ]; then
	[ -n "$1" ] && echo "Brak listy pakietów do zainstalowania"
	exit 0
fi

while read -r pkg; do
	[ -n "$pkg" ] && apk add $pkg
done < $BACKUPDIR/$PKGSLIST

/usr/bin/backuppkgslist.sh

if [ -n "$1" ]; then
	echo ""
	echo "Zainstalowano pakiety użytkownika"
fi

exit 0
