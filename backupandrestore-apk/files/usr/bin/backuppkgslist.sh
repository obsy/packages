#!/bin/sh

# eko.one.pl services
# backup user installed packages

BACKUPDIR=/etc/backup
PKGSLIST=list-user-installed-packages.txt
mkdir -p $BACKUPDIR
if [ -e /rom/etc/apk/world ]; then
	grep -Fxv -f /rom/etc/apk/world /etc/apk/world > $BACKUPDIR/$PKGSLIST
else
	cat /etc/apk/world  > $BACKUPDIR/$PKGSLIST
fi
if ! grep -q $BACKUPDIR/$PKGSLIST /etc/sysupgrade.conf; then
	echo $BACKUPDIR/$PKGSLIST >> /etc/sysupgrade.conf
fi

if [ -n "$1" ]; then
	echo ""
	echo "Wykonano archiwum listy pakietów"
fi

exit 0
