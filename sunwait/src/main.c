/* copyright 2000,2004 Daniel Risacher */
/* minor changes courtesy Dr. David M. MacMillan */
/* Licensed under the Gnu General Public License */
#include <stdio.h>
#include <stdlib.h> 
#include <math.h>
#include <time.h>
#include <string.h>
#include <unistd.h>

#include "sunriset.h"

#define MODE_USAGE  0x0

#define MODE_SUN    0x1
#define MODE_CIVIL  0x2
#define MODE_NAUT   0x3
#define MODE_ASTR   0x4
#define MODE_PRINT  0x5

#define MODE_MASK   0x7

#define EVENT_RISE   0x10
#define EVENT_SET    0x20

#define EVENT_MASK   0x30

#define LAT_SET 0x1
#define LON_SET 0x2


typedef struct _map {
  char * label;
  int mask;
  int value;
} map;

map options[] = {
  { "sun",   MODE_MASK, MODE_SUN },
  { "civ",   MODE_MASK, MODE_CIVIL },
  { "naut",  MODE_MASK, MODE_NAUT },
  { "astr",  MODE_MASK, MODE_ASTR },

  { "rise",  EVENT_MASK, EVENT_RISE },
  { "up",    EVENT_MASK, EVENT_RISE },
  { "begin", EVENT_MASK, EVENT_RISE },
  { "start", EVENT_MASK, EVENT_RISE },
  { "set",   EVENT_MASK, EVENT_SET },
  { "down",  EVENT_MASK, EVENT_SET },
  { "stop",  EVENT_MASK, EVENT_SET },
  { "end",  EVENT_MASK, EVENT_SET },
  { NULL, 0, 0 }
};

void print_usage() 
{
  FILE* f = stdout;
  fprintf(f, "usage: sunwait [options] [sun|civ|naut|astr] [up|down] [+/-offset] [latitude] [longitude]\n\n");
  fprintf(f, "latitude/longigude are expressed in floating-point degrees, with [NESW] appended\n");
  fprintf(f, "\nexample: sunwait sun up -0:15:10 38.794433N 77.069450W\n");
  fprintf(f, "This example will wait until 15 minutes and 10 seconds before the sun rises in Alexandria, VA\n");

  fprintf(f, "\nThe offset is expressed as MM, or HH:MM, or HH:MM:SS,\n");
  fprintf(f, "and indicates the additional amount of time to wait after \n");
  fprintf(f, "(or before, if negative) the specified event.\n\n");
  fprintf(f, "options: -p prints a summary of relevant times\n");
  fprintf(f, "         -z changes the printout to Universal Coordinated Time (UTC)\n");
  fprintf(f, "         -V prints the version number\n");
  fprintf(f, "         -v increases verbosity\n");
  fprintf(f, "\nThese options are useful mainly when used with the '-p' option\n");
  fprintf(f, "         -y YYYY sets the year to calculate for\n");
  fprintf(f, "         -m MM sets the month to calculate for\n");
  fprintf(f, "         -d DD sets the day-of-month to calculate for\n\n");
  fprintf(f, "         -h prints this help\n");
}

const char* timezone_name;
long int timezone_offset;
 
int main(int argc, char *argv[])
{
  int i, j;
  int year,month,day;
  /* My old house */
  double lon = -77.06945;
  double lat = 38.794433;
  int coords_set = 0;
  double temp;
  int local = 1;
  char hemisphere[3];
  int mode = MODE_USAGE;
  int offset_hour = 0; 
  int offset_min = 0;
  int offset_sec = 0;
  int verbose = 0;

  time_t tt;
  struct tm *tm;

  tt = time(NULL);
  ctime(&tt);
  tm = localtime(&tt);

  year = 1900 + tm->tm_year;
  month = 1+ tm->tm_mon;
  day =  1+ tm->tm_mday;
  timezone_name = tm->tm_zone;
  timezone_offset = tm->tm_gmtoff;

  for (i=1; i< argc; i++) {
    if (!strcmp("-V", argv[i])) {
      printf("sunwait version 0.1\n");
      exit(0);
    }
    if (!strcmp("-z", argv[i])) {
      local = 0;
    }
    if (!strcmp("-h", argv[i])) {
      print_usage();
      exit(0); 
    }
    if (!strcmp("-v", argv[i])) {
      verbose++;
    }
    if (!strcmp("-p", argv[i])) {
      mode = MODE_PRINT;
    }

    if (!strcmp("-y", argv[i])) {
      i++;
      year = atoi(argv[i]);
    }
    if (!strcmp("-m", argv[i])) {
      i++;
      month = atoi(argv[i]);
    }
    if (!strcmp("-d", argv[i])) {
      i++;
      day = 1 + atoi(argv[i]);
    }

    if (2 == sscanf(argv[i], "%lf%1[Nn]", &temp, hemisphere)) {
      lat = temp; 
      coords_set |= LAT_SET;
    }
    if (2 == sscanf(argv[i], "%lf%1[Ss]", &temp, hemisphere)) {
      lat = -temp;
      coords_set |= LAT_SET;
    }
    if (2 == sscanf(argv[i], "%lf%1[Ww]", &temp, hemisphere)) {
      lon = -temp;
      coords_set |= LON_SET;
    }

    /* this looks different from the others because 77E 
       parses as scientific notation */

    if (1 == sscanf(argv[i], "%lf", &temp)
	&& (argv[i][strlen(argv[i])-1] == 'E' ||
	    argv[i][strlen(argv[i])-1] == 'e')) {
      lon = temp;
      coords_set |= LON_SET;
    }

    for (j=0; options[j].label; j++) {
      if (strstr(argv[i], options[j].label)) {
	mode = (mode &~ options[j].mask) | options[j].value;
      }
    }

    if (('+' == argv[i][0] || '-' == argv[i][0]) &&
	('0' <= argv[i][1] && '9' >= argv[i][1])) {
      /* perl would be nice here */
      char* temp;
      temp = 1+argv[i];
      offset_min = strtol(temp, &temp, 10);
      if (':' == *temp) {
	offset_hour = offset_min;
	offset_min = strtol(temp+1, &temp, 10);
      }
      if (':' == *temp) {
	offset_sec = strtol(temp+1, &temp, 10);
      }
      if ('-' == argv[i][0]) {
	offset_hour *= -1;
	offset_min *= -1;
	offset_sec *= -1;
      }
    }
  }

  if (coords_set != (LAT_SET | LON_SET)) {
      fprintf(stderr, "warning: latitude or longitude not set\n\tdefault coords of Alexandria, Virgina, USA used\n");
  }

  if (verbose > 1) 
    printf("Mode = 0x%x\n", mode);
  if (verbose > 0)
    printf("Offset = %s%d:%.2d:%.2d\n", 
	   offset_hour<0 || offset_min<0|| offset_sec<0?"-":"",
	   ABS(offset_hour), ABS(offset_min), ABS(offset_sec));

  if ((mode & MODE_MASK) && (mode & EVENT_MASK)) {
    int sit;
    double up, down, now, interval, offset;
    switch (mode & MODE_MASK) {
    case MODE_USAGE:
      print_usage();
      exit(0);
      break;
    case MODE_SUN:
      sit   = sun_rise_set         ( year, month, day, lon, lat,
				    &up, &down );
      break;
    case MODE_CIVIL:
      sit  = civil_twilight       ( year, month, day, lon, lat,
				    &up, &down );
      break;
    case MODE_NAUT:
      sit = nautical_twilight    ( year, month, day, lon, lat,
				    &up, &down );
      break;
    case MODE_ASTR:
      sit = astronomical_twilight( year, month, day, lon, lat,
				    &up, &down );
      break;
    }
    
    if (0 != sit) {
      fprintf(stderr, "Event does not occur today\n");
      exit(1);
    }

    up = TMOD(up+timezone_offset/3600);
    down = TMOD(down+timezone_offset/3600);
    now = tm->tm_hour/1.0 + tm->tm_min/60.0 + tm->tm_sec/3600.0; 
    offset = offset_hour/1.0 + offset_min/60.0 + offset_sec/3600.0; 

    if (EVENT_RISE == (mode & EVENT_MASK)) {
      interval = up - now + offset;
    } else { /* mode is EVENT_SET */
      interval = down - now + offset;
    }

    if (0 > interval) {
      if (0 < verbose) {
	fprintf(stderr, "Warning: event already passed for today, waiting till tomorrow.\n");
      }
      interval += 24.0;
    }

    if (1 < verbose) {
      fprintf(stderr, "Up %f\n", up);
      fprintf(stderr, "Down %f\n", down);
      fprintf(stderr, "Now %f\n", now);
      fprintf(stderr, "Offset %f\n", offset);
    }

    if (0 < verbose) {
      fprintf(stdout, "%f seconds in the interval\n", 3600*interval);
    }
    
    sleep((unsigned int)(interval*3600.0));
  } /* normal wait mode */
  
  if (MODE_PRINT == (MODE_MASK & mode))
    print_everything(year, month, day, lat, lon, tm, local);


  if (MODE_USAGE == (MODE_MASK & mode))
    print_usage();

  exit(0);
}



