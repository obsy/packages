#!/usr/bin/haserl
<%
	# This program is copyright © 2013-2023 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
	# version 2.0 with a special clarification/exception that permits adapting the program to
	# configure proprietary "back end" software provided that all modifications to the web interface
	# itself remain covered by the GPL.
	# See http://gargoyle-router.com/faq.html#qfoss for more information

	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "status" -p "ups" -j "ups.js" -z "ups.js" -i ups
%>

<h1 class="page-header"><%~ ups.UPS %></h1>
<div class="row">
	<div class="col-lg-6">
		<div class="panel panel-default">
			<div class="panel-body">
				<ul class="list-group">
				<li class="list-group-item"><span class="list-group-item-title"><%~ MODEL %>:</span><span id="model">-</span></li>
				<li class="list-group-item"><span class="list-group-item-title"><%~ STATUS %>:</span><span id="status">-</span></li>
				<li class="list-group-item"><span class="list-group-item-title"><%~ BCHARGE %>:</span><span id="bcharge">-</span></li>
				<li class="list-group-item"><span class="list-group-item-title"><%~ LINEV %>:</span><span id="linev">-</span></li>
				<li class="list-group-item"><span class="list-group-item-title"><%~ LOADPCT %>:</span><span id="loadpct">-</span></li>
				<li class="list-group-item"><span class="list-group-item-title"><%~ TIMELEFT %>:</span><span id="timeleft">-</span></li>
				</ul>
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
	gargoyle_header_footer -f -s "status" -p "ups"
%>
