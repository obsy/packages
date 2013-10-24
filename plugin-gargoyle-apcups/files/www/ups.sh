#!/usr/bin/haserl
<%
	# This program is copyright © 2013 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
	# version 2.0 with a special clarification/exception that permits adapting the program to
	# configure proprietary "back end" software provided that all modifications to the web interface
	# itself remain covered by the GPL.
	# See http://gargoyle-router.com/faq.html#qfoss for more information

	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "status" -p "ups" -c "internal.css" -j "ups.js" -z "ups.js" -i ups
%>

<fieldset>
	<legend class="sectionheader"><%~ ups.UPS %></legend>

	<div>
		<span class='leftcolumn'><%~ MODEL %>:</span><span id="model" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'><%~ STATUS %>:</span><span id="status" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'><%~ BCHARGE %>:</span><span id="bcharge" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'><%~ LINEV %>:</span><span id="linev" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'><%~ LOADPCT %>:</span><span id="loadpct" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'><%~ TIMELEFT %>:</span><span id="timeleft" class='rightcolumn'>-</span>
	</div>

</fieldset>

<script>
<!--
	resetData();
	setInterval("resetData()", 30000);
//-->
</script>

<%
	gargoyle_header_footer -f -s "status" -p "ups"
%>
