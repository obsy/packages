#!/bin/sh

# eko.one.pl services
# backup user installed packages

BACKUPDIR=/etc/backup
PKGSLIST=list-user-installed-packages.txt
mkdir -p $BACKUPDIR
TIME=$(opkg status base-files | awk '/Installed-Time: /{print $2}')
awk -v time=$TIME '{if($0 ~ /^Package: /) {PKG = $2}if($0 ~ /^Installed-Time: /) {if(time < $2) {print PKG}}}' /usr/lib/opkg/status > $BACKUPDIR/$PKGSLIST
if ! grep -q $BACKUPDIR/$PKGSLIST /etc/sysupgrade.conf; then
	echo $BACKUPDIR/$PKGSLIST >> /etc/sysupgrade.conf
fi

if [ -n "$1" ]; then
	echo ""
	echo "Wykonano archiwum listy pakietów"
fi

exit 0
