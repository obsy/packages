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

<h1 class="page-header"><%~ 3ginfo.Modem3g %></h1>

<div class="row">

<div class="col-lg-6">
	<div class="panel panel-default">
	<div class="panel-body">

		<div class="row form-group" >
		    <label id="list_device_label" for="ist_device" class="col-xs-5" ><%~ Device %>:</label>
		    <span class="col-xs-7">
			<select id="list_device" class="form-control" onchange='setDevice(this.value)' >
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

	</div>
	</div>
</div>

<div id="tgdata1" style="display:none;">
<div class="col-lg-6">
	<div class="panel panel-default">
	<div class="panel-body">

	<ul class="list-group">
		<li class="list-group-item"><span class="list-group-item-title"><%~ CntsStatus %>:</span><span id="status"></span></li>
		<li class="list-group-item"><span class="list-group-item-title"><%~ CntsTime %>:</span><span id="conn_time"></span></li>
		<li class="list-group-item"><span class="list-group-item-title"><%~ DlnData %>:</span><span id="rx"></span></li>
		<li class="list-group-item"><span class="list-group-item-title"><%~ UplData %>:</span><span id="tx"></span></li>
	</ul>

	</div>
	</div>
</div>
</div>

<div id="tgdata2" style="display:none;">
<div class="col-lg-6">
<div class="panel panel-default">
<div class="panel-body">

	<center>
		<table border=0>
		<tr>
			<td height="50" style="text-align:left;">
				<span id="operator" style="font-size:2em;">-</span>
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
				<span id="signal" style="font-size:1.5em;">-</span>
			</td>
		</tr>
		</table>
	</center>

</div>
</div>
</div>
</div>

<div id="tgdata3" style="display:none;">
<div class="col-lg-6">
<div class="panel panel-default">
<div class="panel-body">

	<ul class="list-group">

	<div>
		<li class="list-group-item"><span class="list-group-item-title">MCC MNC:</span><span><span id="operator_mcc" >-</span>&nbsp<span id="operator_mnc" >-</span></span></li>
	</div>
	<div>
		<li class="list-group-item"><span class="list-group-item-title">CSQ:</span><span id="csq"'>-</span></li>
	</div>
	<div>
		<li class="list-group-item"><span class="list-group-item-title">RSSI:</span><span id="rssi">-</span></li>
	</div>
	<div id="rscp_container" style="display:none;">
		<li class="list-group-item"><span class="list-group-item-title">RSCP:</span><span id="rscp">-</span></li>
	</div>
	<div id="ecio_container" style="display:none;">
		<li class="list-group-item"><span class="list-group-item-title">Ec/IO:</span><span id="ecio">-</span></li>
	</div>
	<div id="rsrp_container" style="display:none;">
		<li class="list-group-item"><span class="list-group-item-title">RSRP:</span><span id="rsrp">-</span></li>
	</div>
	<div id="sinr_container" style="display:none;">
		<li class="list-group-item"><span class="list-group-item-title">SINR:</span><span id="sinr">-</span></li>
	</div>
	<div id="rsrq_container" style="display:none;">
		<li class="list-group-item"><span class="list-group-item-title">RSRQ:</span><span id="rsrq">-</span></li>
	</div>
	<div id="lac_container" style="display:none;">
		<li class="list-group-item"><span class="list-group-item-title">LAC:</span><span id="lac">-</span></li>
	</div>
	<div id="cid_container" style="display:none;">
		<li class="list-group-item"><span class="list-group-item-title">CID:</span><span id="cid">-</span></li>
	</div>
	<div id="tac_container" style="display:none;">
		<li class="list-group-item"><span class="list-group-item-title">TAC:</span><span id="tac">-</span></li>
	</div>
	<div>
		<li class="list-group-item"><span class="list-group-item-title"><%~ MdmType %>:</span><span id="device">-</span></li>
	</div>

	</ul>

</div>
</div>
</div>
</div>

</div>

<script>
<!--
	resetData();
	setInterval("resetData()", 30000);
//-->
</script>

<%
	gargoyle_header_footer -f -s "status" -p "3ginfo"
%>
