sunwait-for-openwrt [![Build Status](https://travis-ci.org/probonopd/sunwait-for-openwrt.svg)](https://travis-ci.org/probonopd/sunwait-for-openwrt)
===================
Calculate sunrise and sunset, as well as civil, nautical, and astronomical twilights. Has features that make it useful for home automation tasks.
	
GitHub clone based on http://www.risacher.org/sunwait/

Downloading
--
Precompiled binaries for common architectures can be found on https://github.com/probonopd/sunwait-for-openwrt/releases - check the ```.travis.yml``` file to see how this is compiled on http://travis-ci.org automatically. Please file an issue if you need addional architectures and/or OpenWrt versions.

Building
--
To build, pull this repository into the ```package/``` subdirectory in the OpenWrt SDK with ```git clone https://github.com/probonopd/sunwait-for-openwrt.git```, then ```make V=s```. This will create ./bin/ar71xx/packages/base/sunwait_1.0-1_ar71xx.ipk (depending on your architecture).

Using
--

The feature that makes this program slightly unique is that it can be set to wait specific event (such as 5 minutes before sunrise), then exit. This makes it useful for 'cron' jobs or 'scheduled tasks' when you want something to happen relative to sunrise, sunset, or some other astronomical event.

For example, consider this line from my crontab:
```
01 00 * * * sunwait civ start 38.794433N, 77.069450W ; br b6 off
```

This line executes at at one minute after midnight, waits until the start of civil twilight, then runs the command br ```b6 off``` (which turns off my carriage light).

```
usage: sunwait [options] [sun|civ|naut|astr] [up|down] [+/-offset] [latitude] [longitude]

latitude/longigude are expressed in floating-point degrees, with [NESW] appended

example: sunwait sun up -0:15:10 38.794433N 77.069450W
This example will wait until 15 minutes and 10 seconds before the sun rises in Alexandria, VA

The offset is expressed as MM, or HH:MM, or HH:MM:SS,
and indicates the additional amount of time to wait after 
(or before, if negative) the specified event.

options: -p prints a summary of relevant times
         -z changes the printout to Universal Coordinated Time (UTC)
         -V prints the version number
         -v increases verbosity

These options are useful mainly when used with the '-p' option
         -y YYYY sets the year to calculate for
         -m MM sets the month to calculate for
         -d DD sets the day-of-month to calculate for

         -h prints this help
```
Source: http://www.risacher.org/sunwait/
