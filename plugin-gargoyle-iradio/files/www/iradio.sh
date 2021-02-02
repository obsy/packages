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
var controls = new Array();
<%
amixer | awk '{if($0 ~ /Simple mixer control/){gsub(/Simple mixer control '\''/,""); gsub(/'\','0/,""); T=$0; min[T]=-1; max[T]=-1; curr[T]=-1; mute[T]=""} if($0 ~ /Limits: Playback/){min[T]=$3; max[T]=$5} if($0 ~ /Front Left: Playback/){curr[T]=$4,mute[T]=$7} if($0 ~ /Mono: Playback/){curr[T]=$3;mute[T]=$6}} END for(i in min) {if(min[i] > -1){printf "controls.push({\"name\":\"%s\",\"min\":%d,\"max\":%d,\"current\":%d,\"sound\":\"%s\"});\n", i, min[i], max[i], curr[i], mute[i]}}'
%>
</script>

<h1 class="page-header"><%~ iradio.Radio %></h1>
<div class="row">
	<div class="col-lg-12">
		<div class="panel panel-default">
			<div class="panel-body">
				<div class="row form-group">
					<span class="col-xs-12"><div id="iradio_table_container"></div></span>
				</div>
			</div>
		</div>
	</div>

	<div class="col-lg-12">
		<div class="panel panel-default">
			<div class="panel-body">
				<div class="row form-group">
					<span class="col-xs-12"><div><button class="btn btn-default" id="stop_music_button" onclick="stopMusic()" /><%~ StopMusic %></button></div><p></p></span>
					<span class="col-xs-12"><div id="iradio_controls_container" style="margin-left:5px;" ></div></span>
				</div>
			</div>
		</div>
	</div>

	<div class="col-lg-12">
		<div class="panel panel-default">
			<div class="panel-body">
				<div class="row form-group">
					<label class="col-xs-5" for="add_source_name"><%~ Anam %>:</label>
					<span class="col-xs-7"><input type="text" id="add_source_name" class="form-control" /></span>
				</div>

				<div class="row form-group">
					<label class="col-xs-5" for="add_source_url"><%~ Aurl %>:</label>
					<span class="col-xs-7"><input type="text" id="add_source_url" class="form-control" /></span>
				</div>

				<button id="add_source_button" class="btn btn-default btn-add" onclick="addSource()"><%~ ASrc %></button>
			</div>
		</div>
	</div>
</div>

<script>
	resetData();
</script>

<%
	gargoyle_header_footer -f -s "status" -p "iradio"
%>
