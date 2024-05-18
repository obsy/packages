#!/bin/sh

# eko.one.pl services
# backup user installed packages

BACKUPDIR=/etc/backup
PKGSLIST=list-user-installed-packages.txt
mkdir -p $BACKUPDIR
awk -F'>' '/^.*><.*=/{print $1}' /etc/apk/world  > $BACKUPDIR/$PKGSLIST
if ! grep -q $BACKUPDIR/$PKGSLIST /etc/sysupgrade.conf; then
	echo $BACKUPDIR/$PKGSLIST >> /etc/sysupgrade.conf
fi

if [ -n "$1" ]; then
	echo ""
	echo "Wykonano archiwum listy pakietów"
fi

exit 0
