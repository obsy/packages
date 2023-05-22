#!/usr/bin/haserl
<%
	# This program is copyright © 2012-2023 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
	# version 2.0 with a special clarification/exception that permits adapting the program to 
	# configure proprietary "back end" software provided that all modifications to the web interface
	# itself remain covered by the GPL.
	# See http://gargoyle-router.com/faq.html#qfoss for more information
	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "system" -p "smsbox" -j "table.js smsbox.js" -z "smsbox.js" smsbox gargoyle
%>
<script>
var uci = uciOriginal.clone();
var smscnt=0;
</script>

<h1 class="page-header"><%~ smsbox.Sms %></h1>

<div class="row">

<div class="col-lg-6">
	<div class="panel panel-default">
	<div class="panel-heading">
		<h3 class="panel-title"><%~ Config %></h3>
	</div>
	<div class="panel-body">

	<div class="row form-group">
		<label class="col-xs-5" for="device" id="device_label"><%~ Device %>:</label>
		<span class="col-xs-7">
			<select style="display:none;float:left;max-width:180px" class="form-control" id="list_device" onchange="setDevice(this.value)"></select>
			<input style="float:left;" type="text" class="form-control" id="device" size="20" oninput="proofreadLengthRange(this,1,999)"/>
			<button style="float:left;" class="btn btn-default" id="scan_button" onclick="scan3GDevice('list_device')"><%~ Scan %></button>
		</span>
	</div>

	<div class="row form-group">
		<label class='col-xs-5' id='memory_label' for='memory'><%~ Memory %>:</label>
		<span class='col-xs-7'>
			<select class='form-control' id='memory'>
			<option value='ME'><%~ internal %></option>
			<option value='SM'><%~ simcard %></option>
			<option value='MT'><%~ internalsimcard %></option>
			</select>
		<span>
	</div>

	<div class="row form-group">
		<span class="col-xs-12">
			<input type="checkbox" id="rawinput">
			<label class="short-left-pad" for="rawinput" id="rawinput_label"><%~ RawInput %></label>
		</span>
	</div>

	<div class="row form-group">
		<span class="col-xs-12">
			<input type="checkbox" id="rawoutput">
			<label class="short-left-pad" for="rawoutput" id="rawoutput_label"><%~ RawOutput %></label>
		</span>
	</div>

	<div class="row">
		<span class="col-xs-12">
			<button id="save_serrings_button" class="btn btn-default" onclick="saveSettings()">Zapisz</button>
		</span>
	</div>

	</div>
	</div>
</div>

<div class="col-lg-6">
	<div class="panel panel-default">
	<div class="panel-heading">
		<h3 class="panel-title"><%~ USSD %></h3>
	</div>
	<div class="panel-body">

	<div class="row form-group">
		<label id="ussd_label" class="col-xs-5" for="ussd"><%~ Code %>:</label>
		<span class="col-xs-7">
			<input id="ussd" class="form-control" type="text" size='45'/>
		</span>
	</div>

	<div class="row">
		<span class="col-xs-12">
			<button class="btn btn-default" onclick="sendUSSD()"><%~ Send %></button>
		</span>
	</div>

	</div>
	</div>
</div>

<div class="col-lg-12">
	<div class="panel panel-default">
	<div class="panel-heading">
		<h3 class="panel-title"><%~ SendSMS %></h3>
	</div>
	<div class="panel-body">

	<div class="row form-group">
		<label id="phonenumber_label" class="col-xs-5" for="phonenumber"><%~ Number %>:</label>
		<span class="col-xs-7">
			<input id="phonenumber" class="form-control" type="text" size='45'/>
		</span>
	</div>

	<div class="row form-group">
		<label id="smstext_label" class="col-xs-5" for="smstext"><%~ Message %>:</label>
		<span class="col-xs-12">
			<textarea style="width:100%" rows=5 id='smstext' class="form-control"></textarea>
		</span>
	</div>

	<div class="row">
		<span class="col-xs-12">
			<button class="btn btn-default" onclick="sendSMS()"><%~ Send %></button>
		</span>
	</div>

	</div>
	</div>
</div>

<div class="col-lg-12">
	<div class="panel panel-default">
	<div class="panel-heading">
		<h3 class="panel-title"><%~ RecvBox %></h3>
	</div>
	<div class="panel-body">

	<div class="row">
		<span class='col-xs-12'><%~ SMSCnt %>:&nbsp;<span id="sms_cnt"></span></span>
	</div>

	<div id="inbox_table_container"></div>

	<div class="row">
		<span class="col-xs-12">
			<button class="btn btn-default" onclick="resetData()"><%~ Refresh %></button>
		</span>
	</div>

	</div>
	</div>
</div>

</div>

<script>
<!--
	resetData();
//-->
</script>

<%
	gargoyle_header_footer -f -s "system" -p "smsbox"
%>
