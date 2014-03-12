#!/usr/bin/haserl
<%
	# Copyright © 2014 Cezary Jackiewicz <cezary@eko.one.pl>
	# and is distributed under the terms of the GNU GPL
	# version 2.0 with a special clarification/exception that permits adapting the program to
	# configure proprietary "back end" software provided that all modifications to the web interface
	# itself remain covered by the GPL.
	# See http://gargoyle-router.com/faq.html#qfoss for more information
	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "status" -p "iradio" -c "internal.css" -j "table.js iradio.js" -z "iradio.js" iradio
%>
<script>

</script>
<form>

	<fieldset id="iradio_options">
		<legend class="sectionheader"><%~ iradio.Radio %></legend>

		<div id="iradio_table_container" style="margin-left:5px;" ></div>
		<div class="indent">
			<span class="leftcolumn"><input type="button" class="default_button" id="stop_music_button" value="<%~ StopMusic %>" onclick="stopMusic()" /></span>
		</div>
		<div class="indent">
			<div>
				<label class="narrowleftcolumn" for="add_source_name"><%~ Anam %>:</label>
				<input type="text" class="widerightcolumn" id="add_source_name" style="width:325px;"/>
			</div>
			<div>
				<label class="narrowleftcolumn" for="add_source_url"><%~ Aurl %>:</label>
				<input type="text" class="widerightcolumn" id="add_source_url" style="width:325px;"/>
			</div>

			<span class="leftcolumn"><input type="button" class="default_button" id="add_source_button" value="<%~ ASrc %>" onclick="addSource()" /></span>

		</div>
	</fieldset>

</form>

<script>
	resetData();

</script>

<%
	gargoyle_header_footer -f -s "status" -p "iradio"
%>
