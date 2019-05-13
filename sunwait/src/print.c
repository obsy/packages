#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <time.h>

#include "sunriset.h"

char* months[] = {
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
} ;

int print_situation ( int sit, char local, 
		      char* up_string, double up,
		      char* down_string, double down,
		      char* always_up, char* always_down ) 
{
  switch( sit )
    {
    case 0:
      if (!local)
	printf( "%s %2.2d%2.2d %sUTC, %s %2.2d%2.2d %sUTC\n",
		up_string,
		TMOD(HOURS(up)), MINUTES(up), DAYSOFF(up),
		down_string,
		TMOD(HOURS(down)), MINUTES(down), DAYSOFF(down) );
      up = TMOD(up+timezone_offset/3600);
      down = TMOD(down+timezone_offset/3600);

      if (local)
	printf( "%s %2.2d%2.2d %s, %s %2.2d%2.2d %s\n",
		up_string,
		HOURS(up), MINUTES(up), timezone_name,
		down_string,
		HOURS(down), MINUTES(down), timezone_name );
      break;
    case +1:
      printf( "%s\n", always_up );
      break;
    case -1:
      printf( "%s\n", always_down );
      break;
    }
  return sit;
} 


void print_everything(int year, int month, int day, 
		     double lat, double lon,
		     struct tm* tm, int local)
{
  double daylen, civlen, nautlen, astrlen;
  double rise, set, civ_start, civ_end, naut_start, naut_end,
    astr_start, astr_end;
  int    rs, civ, naut, astr;

  daylen  = day_length(year,month,day,lon,lat);
  civlen  = day_civil_twilight_length(year,month,day,lon,lat);
  nautlen = day_nautical_twilight_length(year,month,day,lon,lat);
  astrlen = day_astronomical_twilight_length(year,month,day,
					     lon,lat);

  printf( "Using location:             %f%s, %f%s\n", 
	  fabs(lat), lat>0?"N":"S", 
	  fabs(lon), lon>0?"E":"W");
  
  printf(   "Date:                       %2d %s %4d \n", day-1, months[month-1], year);
  if (local)
    printf( "Local time:                 %2d:%2.2d \n", tm->tm_hour, tm->tm_min);
  else
    printf( "Zulu time (UTC):            %2ld:%2.2d %s\n", 
	    TMOD(tm->tm_hour - (timezone_offset/3600)), 
	    tm->tm_min, 
	    DAYSOFF(tm->tm_hour - (timezone_offset/3600)));
  
  printf( "Day length:                 %2d:%2.2d hours\n", HOURS(daylen), MINUTES(daylen)  );
  printf( "With civil twilight         %2d:%2.2d hours\n", HOURS(civlen), MINUTES(civlen)  );
  printf( "With nautical twilight      %2d:%2.2d hours\n", HOURS(nautlen), MINUTES(nautlen)  );
  printf( "With astronomical twilight  %2d:%2.2d hours\n", HOURS(astrlen), MINUTES(astrlen)  );
  printf( "Length of twilight:  civil  %2d:%2.2d hours\n",
	  HOURS((civlen-daylen)/2.0), MINUTES((civlen-daylen)/2.0));
  printf( "                  nautical  %2d:%2.2d hours\n",
	  HOURS((nautlen-daylen)/2.0), MINUTES((nautlen-daylen)/2.0));
  printf( "              astronomical  %2d:%2.2d hours\n",
	  HOURS((astrlen-daylen)/2.0), MINUTES((astrlen-daylen)/2.0));
  
  rs   = sun_rise_set         ( year, month, day, lon, lat,
				&rise, &set );
  civ  = civil_twilight       ( year, month, day, lon, lat,
				&civ_start, &civ_end );
  naut = nautical_twilight    ( year, month, day, lon, lat,
				&naut_start, &naut_end );
  astr = astronomical_twilight( year, month, day, lon, lat,
				&astr_start, &astr_end );
  
  printf( "Current specified time zone: %s (%ld from UTC) \n", timezone_name, +timezone_offset/3600 );

  if (local)
    printf( "Sun transits meridian %2.2ld%2.2d %s\n", 
	    TMOD(HOURS((rise+set)/2.0) + timezone_offset/3600),
	    MINUTES((rise+set)/2.0),
	    timezone_name);
  else
    printf( "Sun transits meridian %2.2d%2.2d UTC\n", HOURS((rise+set)/2.0), MINUTES((rise+set)/2.0) );

  print_situation ( rs, local,
		    "                   Sun rises", rise,
		    "sets", set,
		    "Sun above horizon",
		    "Sun below horizon" ) ;
  print_situation ( civ, local,
		    "       Civil twilight starts", civ_start,
		    "ends", civ_end,
		    "Never darker than civil twilight",
		    "Never as bright as civil twilight");
  print_situation ( naut, local, 
		    "    Nautical twilight starts", naut_start,
		    "ends", naut_end,
		    "Never darker than nautical twilight",
		    "Never as bright as nautical twilight");
  
  print_situation ( astr, local,
		    "Astronomical twilight starts", astr_start,
		    "ends", astr_end,
		    "Never darker than astronomical twilight",
		    "Never as bright as astronomical twilight");
  
}
