#!/usr/bin/haserl
<%
	# This program is copyright © 2016 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
	# version 2.0 with a special clarification/exception that permits adapting the program to
	# configure proprietary "back end" software provided that all modifications to the web interface
	# itself remain covered by the GPL.
	# See http://gargoyle-router.com/faq.html#qfoss for more information

	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "status" -p "3ginfo" -c "internal.css" -j "3ginfo.js" -z "3ginfo.js" -i 3ginfo
%>

<fieldset>
	<legend class="sectionheader"><%~ 3ginfo.Modem3g %></legend>

	<div>
		<label id="list_device_label" class="leftcolumn" for="list_device"><%~ Device %>:</label>
		<span class='rightcolumn'>
			<select id="list_device" onchange='setDevice(this.value)' >
			<option value=''><%~ None %></option>
			<%
				devices=$(ls -1 /dev/tty[A\|U][C\|S]* 2>/dev/null)
				for d in $devices; do
					echo "<option value='$d'>$d</option>"
				done

				cdcif=$(egrep -Hi "(cdc ethernet control|rndis communications control)" /sys/class/net/*/device/interface 2>/dev/null | cut -f5 -d/)
				[ -z "$cdcif" ] && cdcif=$(ls -l /sys/class/net/*/device/driver | grep cdc_ether | sed 's!.*/sys/class/net/\(.*\)/device/.*!\1!')
				if [ -n "$cdcif" ]; then
					if [ "x"$(uci -q get network.wan.proto) = "xdhcp" ]; then
						. /lib/functions/network.sh
						network_get_gateway GATEWAY wan
						if [ -n "$GATEWAY" ]; then
							echo "<option value='$GATEWAY'>HiLink</option>"
						fi
					fi
				fi

			%>
			</select>
		</span>
	</div>

	<div id="tgdata" style="display:none;">

	<div>
		<span class='leftcolumn'><%~ CntsStatus %>:</span><span id="status" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'><%~ CntsTime %>:</span><span id="conn_time" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'><%~ DlnData %>:</span><span id="rx" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'><%~ UplData %>:</span><span id="tx" class='rightcolumn'>-</span>
	</div>

	<div class="internal_divider"></div>

	<center>
		<table border=0>
		<tr>
			<td height="50" style="text-align:left;">
				<span id="cops" style="font-size:2em;">-</span>
			</td>
			<td rowspan="3">
				<img id="s0p" src="img/signal0.png" style="display: block;">
				<img id="s10p" src="img/signal10.png" style="display: none;">
				<img id="s20p" src="img/signal20.png" style="display: none;">
				<img id="s30p" src="img/signal30.png" style="display: none;">
				<img id="s40p" src="img/signal40.png" style="display: none;">
				<img id="s50p" src="img/signal50.png" style="display: none;">
				<img id="s60p" src="img/signal60.png" style="display: none;">
				<img id="s70p" src="img/signal70.png" style="display: none;">
				<img id="s80p" src="img/signal80.png" style="display: none;">
				<img id="s90p" src="img/signal90.png" style="display: none;">
				<img id="s100p" src="img/signal100.png" style="display: none;">
			</td>
		</tr>
		<tr>
			<td style="text-align:left;">
				<span id="mode" style="font-size:1.5em;">-</span>
			</td>
		</tr>
		<tr>
			<td style="text-align:left;">
				<span id="csq_per" style="font-size:1.5em;">-</span>
			</td>
		</tr>
		</table>
	</center>

	<div class="internal_divider"></div>

	<div>
		<span class='leftcolumn'>MCC MNC:</span><span class='rightcolumn'><span id="cops_mcc" >-</span>&nbsp<span id="cops_mnc" >-</span></span>
	</div>
	<div>
		<span class='leftcolumn'>CSQ:</span><span id="csq" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>RSSI:</span><span id="csq_rssi" class='rightcolumn'>-</span>
	</div>
	<div id="rscp_container" style="display:none;">
		<span class='leftcolumn'>RSCP:</span><span id="rscp" class='rightcolumn'>-</span>
	</div>
	<div id="ecio_container" style="display:none;">
		<span class='leftcolumn'>Ec/IO:</span><span id="ecio" class='rightcolumn'>-</span>
	</div>
	<div id="rsrp_container" style="display:none;">
		<span class='leftcolumn'>RSRP:</span><span id="rsrp" class='rightcolumn'>-</span>
	</div>
	<div id="rsrq_container" style="display:none;">
		<span class='leftcolumn'>RSRQ:</span><span id="rsrq" class='rightcolumn'>-</span>
	</div>
	<div id="lac_container" style="display:none;">
		<span class='leftcolumn'>LAC:</span><span id="lac" class='rightcolumn'>-</span>
	</div>
	<div id="cid_container" style="display:none;">
		<span class='leftcolumn'>CID:</span><span id="cid" class='rightcolumn'>-</span>
	</div>
	<div id="lcid_container" style="display:none;">
		<span class='leftcolumn'>LCID:</span><span id="lcid" class='rightcolumn'>-</span>
	</div>
	<div id="tac_container" style="display:none;">
		<span class='leftcolumn'>TAC:</span><span id="tac" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'><%~ MdmType %>:</span><span id="device" class='rightcolumn'>-</span>
	</div>

	</div>

</fieldset>

<script>
<!--
	resetData();
	setInterval("resetData()", 30000);
//-->
</script>

<%
	gargoyle_header_footer -f -s "status" -p "3ginfo"
%>
