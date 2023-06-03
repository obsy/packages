#!/usr/bin/haserl
<%
	# This program is copyright © 2016-2023 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
	# version 2.0 with a special clarification/exception that permits adapting the program to
	# configure proprietary "back end" software provided that all modifications to the web interface
	# itself remain covered by the GPL.
	# See http://gargoyle-router.com/faq.html#qfoss for more information

	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "status" -p "3ginfo-extended" -j "3ginfo-extended.js" -z "3ginfo-extended.js" -i 3ginfo
%>
<style>
progress {
	width: 150px;
	height: 12px;
	border-radius: 20px;
}
progress::-webkit-progress-bar {
	width: 150px;
	height: 12px;
	border-radius: 20px;
	background-color: #eee;
}
progress::-webkit-progress-value {
	width: 150px;
	height: 12px;
	border-radius: 20px;
}
progress::-moz-progress-bar {
	width: 150px;
	height: 12px;
	border-radius: 20px;
}
.progress-green::-webkit-progress-value {
	background: #6acc5b;
}
.progress-yellow::-webkit-progress-value {
	background: #fbfb0f;
}
.progress-orange::-webkit-progress-value {
	background: #f7ba0a;
}
.progress-red::-webkit-progress-value {
	background: #ed090a;
}
.progress-green::-moz-progress-bar {
	background: #6acc5b;
}
.progress-yellow::-moz-progress-bar {
	background: #fbfb0f;
}
.progress-orange::-moz-progress-bar {
	background: #f7ba0a;
}
.progress-red::-moz-progress-bar {
	background: #ed090a;
}
</style>
<script>
	var firstrun = true;
</script>
<h1 class="page-header"><%~ 3ginfo-extended.Modem3g %></h1>

<div class="row">

<div class="col-lg-6">
	<div class="panel panel-default">
		<div class="panel-heading">
			<h3 class="panel-title"><%~ Device %></h3>
		</div>
	<div class="panel-body">

		<div class="row form-group" >
			<label id="list_device_label" for="list_device" class="col-xs-5" ><%~ Device %>:</label>
			<span class="col-xs-7">
			<select id="list_device" class="form-control" onchange='setDevice(this.value)' >
			<option value=''><%~ None %></option>
			<%
				devices=$(ls -1 /dev/tty[A\|U][C\|S]* 2>/dev/null)
				for d in $devices; do
					echo "<option value='$d'>$d</option>"
				done
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
<div class="panel-heading">
	<h3 class="panel-title"><%~ Information %></h3>
</div>
<div class="panel-body">

	<center>
		<table border=0>
		<tr>
			<td height="50" style="text-align:left;">
				<span id="operator" style="font-size:2em;">-</span>
			</td>
			<td rowspan="3">
				<img id="s0p" src="img/3ginfo-extended/signal0.png" style="display: block;">
				<img id="s10p" src="img/3ginfo-extended/signal10.png" style="display: none;">
				<img id="s20p" src="img/3ginfo-extended/signal20.png" style="display: none;">
				<img id="s30p" src="img/3ginfo-extended/signal30.png" style="display: none;">
				<img id="s40p" src="img/3ginfo-extended/signal40.png" style="display: none;">
				<img id="s50p" src="img/3ginfo-extended/signal50.png" style="display: none;">
				<img id="s60p" src="img/3ginfo-extended/signal60.png" style="display: none;">
				<img id="s70p" src="img/3ginfo-extended/signal70.png" style="display: none;">
				<img id="s80p" src="img/3ginfo-extended/signal80.png" style="display: none;">
				<img id="s90p" src="img/3ginfo-extended/signal90.png" style="display: none;">
				<img id="s100p" src="img/3ginfo-extended/signal100.png" style="display: none;">
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

<div id="tgdata2" style="display:none;">
<div class="col-lg-6">
<div class="panel panel-default">
<div class="panel-heading">
	<h3 class="panel-title"><%~ SignalParam %></h3>
</div>
<div class="panel-body">
	<ul class="list-group">
	<div id="tgdataparameters">
	</div>
	</ul>
</div>
</div>
</div>
</div>

<div id="tgdata3" style="display:none;">
<div class="col-lg-6">
<div class="panel panel-default">
<div class="panel-heading">
	<h3 class="panel-title"><%~ Modem %></h3>
</div>
<div class="panel-body">
	<ul class="list-group">
	<div>
		<li class="list-group-item"><span class="list-group-item-title"><%~ Vendor %>:</span><span id="vendor">-</span></li>
	</div>
	<div>
		<li class="list-group-item"><span class="list-group-item-title"><%~ Product %>:</span><span id="product">-</span></li>
	</div>
	<div>
		<li class="list-group-item"><span class="list-group-item-title"><%~ Revision %>:</span><span id="revision">-</span></li>
	</div>
	<div>
		<li class="list-group-item"><span class="list-group-item-title"><%~ IMEI %>:</span><span id="imei">-</span></li>
	</div>
	<div>
		<li class="list-group-item"><span class="list-group-item-title"><%~ ICCID %>:</span><span id="iccid">-</span></li>
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
	gargoyle_header_footer -f -s "status" -p "3ginfo-extended"
%>
