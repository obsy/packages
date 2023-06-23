#!/usr/bin/haserl
<%
	# This program is copyright © 2023 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
	# version 2.0 with a special clarification/exception that permits adapting the program to 
	# configure proprietary "back end" software provided that all modifications to the web interface
	# itself remain covered by the GPL.
	# See http://gargoyle-router.com/faq.html#qfoss for more information
	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "system" -p "atcmd" -j "table.js atcmd.js" -z "atcmd.js" 3ginfo
%>

<h1 class="page-header"><%~ atcmd.AT %></h1>

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
			<select id="device" class="form-control" onchange='setDevice(this.value)' >
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

<div class="col-lg-12">
	<div class="panel panel-default">
	<div class="panel-heading">
		<h3 class="panel-title"><%~ AT %></h3>
	</div>
	<div class="panel-body">

	<div class="row form-group">
		<span class='col-xs-offset-5 col-xs-7'>
			<select id="atcmd_list" class='form-control' style="width:100%;" onchange='setATcmd(this.value);'></select>
		<span>
	</div>

	<div class="row form-group">
		<label id="atcmd_label" class="col-xs-5" for="atcmd"><%~ Code %>:</label>
		<span class="col-xs-7">
			<input id="atcmd" class="form-control" type="text" style="width:100%;"/>
		</span>
	</div>

	<div class="row">
		<span class="col-xs-12">
			<button class="btn btn-default" onclick="sendATcmd()"><%~ Send %></button>
			<button class="btn btn-default" onclick="ATmngmt()"><%~ Mngmt %></button>
		</span>
	</div>

	<div class="row form-group">
		<div class="text-left col-xs-12"><code><pre style="height:200px;"><span id="atcmd_output"></span></pre></code></div>
	</div>

	</div>
	</div>
</div>

</div>

<div class="modal fade" tabindex="-1" role="dialog" id="atcmd_modal" aria-hidden="true" aria-labelledby="atcmd_modal_title">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h3 id="atcmd_modal_title" class="panel-title"><%~ AddAT %></h3>
			</div>
			<div class="modal-body">
				<div id="description_container" class="row form-group">
					<label class="col-xs-5" id="description_label" for="new_description"><%~ Description %>:</label>
					<span class="col-xs-7"><input id="new_description" class="form-control" type="text"/></span>
				</div>

				<div id="code_container" class="row form-group">
					<label class="col-xs-5" id="atcmd_label" for="new_atcmd"><%~ Code %>:</label>
					<span class="col-xs-7"><input id="new_atcmd" class="form-control" type="text"/></span>
				</div>
				<button class="btn btn-default btn-add" onclick="addATcmd();"><%~ Add %></button>
				<hr>
				<div id="atcmd_table_container" class="table-responsive"></div>
			</div>
			<div id="atcmd_modal_button_container" class="modal-footer" ></div>
		</div>
	</div>
</div>

<script>
<!--
	resetData();
//-->
</script>

<%
	gargoyle_header_footer -f -s "system" -p "atcmd"
%>
