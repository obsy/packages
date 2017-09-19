#!/bin/sh
echo '['
for IFACE in /sys/class/net/wlan[0-9]; do
IFACE1=$(basename $IFACE)
iw dev $IFACE1 scan 2>/dev/null | awk '{gsub("(on","");if($1 == "BSS") {MAC = $2; wifi_enc[MAC] = ""; wifi_chan[MAC] = "?"; wifi_mode1[MAC] = ""; wifi_mode2[MAC] = ""}
if($1 == "SSID:") {t="";for(i=2;i<=NF-1;++i){t=t$i" "};if(NF<2){t=""}else{t=t$NF}; wifi_ssid[MAC]=t}
if($1 == "signal:") {wifi_sig[MAC] = $2}
if($1 == "freq:") {wifi_freq[MAC] = $2; if($2<5000){wifi_mode1[MAC] = "g"}else{wifi_mode1[MAC] = "a"}}
if($0 ~ /primary channel:/) {wifi_chan[MAC] = $4}
if($0 ~ /secondary channel offset: no secondary/) {wifi_mode1[MAC] = "n"; wifi_mode2[MAC] = "HT20"}
if($0 ~ /secondary channel offset: above/) {wifi_mode1[MAC] = "n"; wifi_mode2[MAC] = "HT40+"}
if($0 ~ /secondary channel offset: below/) {wifi_mode1[MAC] = "n"; wifi_mode2[MAC] = "HT40-"}
if($0 ~ /VHT operation:/) {wifi_mode1[MAC] = "ac"; wifi_mode2[MAC] = "VHT20"}
if($0 ~ /center freq segment 1:/) {if($6>0){wifi_mode2[MAC] = "VHT40"}}
if($0 ~ /channel width: 1 (80 MHz)/) {wifi_mode2[MAC] = "VHT80"}
if($0 ~ /Group cipher: CCMP/) {wifi_enc[MAC] = "WPA"}
if($0 ~ /Group cipher: TKIP/) {wifi_enc[MAC] = "WPA"}
if($0 ~ /Authentication suites: PSK/) {wifi_enc[MAC] = "WPA Personal"}
if($0 ~ /Authentication suites: IEEE 802.1X/) {wifi_enc[MAC] = "WPA Enterprise"}
} END {
for (w in wifi_enc) {
    printf "{\"mac\":\"%s\",\"ssid\":\"%s\",\"freq\":\"%s\",\"signal\":\"%s\",\"channel\":\"%s\",\"encryption\":\"%s\",\"mode1\":\"%s\",\"mode2\":\"%s\"},\n", w, wifi_ssid[w], wifi_freq[w], wifi_sig[w], wifi_chan[w], wifi_enc[w], wifi_mode1[w], wifi_mode2[w]
}
}'
done
echo '{"mac":"","ssid":"","freq":"","signal":"","channel":"","encryption":"","mode1":"","mode2":""}'
echo ']'
exit 0
