#!/bin/sh

iw dev wlan0 scan 2>/dev/null | awk '{gsub("(on","");if($1 == "BSS") {MAC = $2; wifi_enc[MAC] = "brak"; wifi_chan[MAC] = "?"}
if($1 == "SSID:") {t="";for(i=2;i<=NF-1;++i){t=t$i" "};t=t$NF; wifi_ssid[MAC]=t}
if($1 == "freq:") {wifi_freq[MAC] = $2}
if($1 == "signal:") {wifi_sig[MAC] = $2}
if($0 ~ /primary channel:/) {wifi_chan[MAC] = $4}
if($0 ~ /Group cipher: CCMP/) {wifi_enc[MAC] = "WPA"}
if($0 ~ /Group cipher: TKIP/) {wifi_enc[MAC] = "WPA"}
} END {
print "{"
for (w in wifi_enc) {
    printf "\"%s\": {\"ssid\":\"%s\",\"freq\":\"%s\",\"signal\":\"%s\",\"channel\":\"%s\",\"encryption\":\"%s\"},\n", w, wifi_ssid[w], wifi_freq[w], wifi_sig[w], wifi_chan[w], wifi_enc[w]
}
printf "\"00:00:00:00:00:00\": {\"ssid\":\"\",\"freq\":\"\",\"signal\":\"\",\"channel\":\"\",\"encryption\":\"\"}\n"
print "}"
}'
exit 0
