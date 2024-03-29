#!/usr/bin/haserl
<%
	# This webpage is copyright © 2013 by BashfulBladder 
	# There is not much to this page, so this is public domain 
	#
	# 2014-2023 Cezary Jackiewicz <cezary@eko.one.pl> - ugly/primitive adaptation to usbrelay
	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "status" -p "usbrelay" -j "usbrelay_schedule.js" -z "usbrelay_schedule.js" -i usbrelay
%>

<script>
<!--
<%
	echo "var cron_data = new Array();"
	if [ -e /etc/crontabs/root ] ; then
		awk '{gsub(/"/, "\\\""); print "cron_data.push(\""$0"\");" }' /etc/crontabs/root
	fi
	echo "var weekly_time=\"`date \"+%w-%H-%M\"`\";"

	echo "var usbrelay_status = new Array();"
	[ "x$FORM_port" != "x" ] && PORT="$FORM_port" || PORT=1
	echo "var usbrelay_port=$PORT;"
	/usr/lib/gargoyle/usbrelay.sh status | awk -F':' '/'$PORT':o/ {print "usbrelay_status.push(\""$2"\");" }'
%>

var raw_cron_data = new Array();
for (tab_idx in cron_data) {
	raw_cron_data.push(cron_data[tab_idx]);
}

//-->
</script>

<style type="text/css">
	.tabField.hidden { display: none; }
	.tabField.blank { }
</style>

<h1 class="page-header"><%~ usbrelay_schedule.Wisch %></h1>
<div id="wifi_schedule" class="row">
	<div class="col-lg-12">
		<div class="panel panel-default">
			<div class="panel-body">

	<div id="usbrelay_id_dev" class="row form-group">
		<label class="col-xs-5"><%~ Number %></label>
		<span class="col-xs-7" id="usbrelay_port"></span>
	</div>
	<div id="usbrelay_name_dev" class="row form-group">
		<label class="col-xs-5"><%~ Name %></label>
		<span class="col-xs-7">
			<input class="form-control" type="text" id="usbrelay_name" value=""/>
		</span>
	</div>
	<div id="wlan_stat" class="row form-group">
		<label class="col-xs-5"><%~ Rstat %>:</label>
		<span class="col-xs-7" id="wlan_status"></span>
	</div>

	<div id="wifi_action" class="row form-group">
		<label class="col-xs-5"><%~ StStR %></label>
		<span class="col-xs-7">
			<button class="btn btn-primary" id="wifi_up_button" onclick='GetWifiUpdate1("on")'><%~ RadOn %></button>
			<button class="btn btn-danger" id="wifi_down_button" onclick='GetWifiUpdate1("off")'><%~ RadOf %></button>
		</span>
	</div>

	<div class="internal_divider"></div>

	<div class="row form-group">
		<label class="col-xs-5" for="timer_mode"><%~ TPer %>:</label>
		<span class="col-xs-7">
			<select id="timer_mode" class="form-control" onchange="SetTimerMode(this.value)">
				<option selected="" value="0"><%~ NoTm %></option>
				<option value="1"><%~ Dly %></option>
				<option value="3"><%~ Wkd %></option>
				<option value="7"><%~ Wkly %></option>
			</select>
		</span>

		<div id="div_timer_increment" class="form-group" style="display:none;">
			<label class="col-xs-5" for="timer_increment"><%~ TInc %>:</label>
			<span class="col-xs-7">
			    <select id="timer_increment" class="form-control" onchange="SetTimerIncrement(this)">
				<option value="5">5 <%~ minutes %></option>
				<option value="10">10 <%~ minutes %></option>
				<option selected="" value="15">15 <%~ minutes %></option>
				<option value="30">30 <%~ minutes %></option>
				<option value="60">60 <%~ minutes %></option>
			    </select>
			</span>
		</div>
	</div>

	<div class="form-group" id="tabs">
		<ul class="nav nav-tabs" id="tab_ulist">
			<li id="tab_li_1" style="display:none;"></li>
			<li id="tab_li_2" style="display:none;"></li>
			<li id="tab_li_3" style="display:none;"></li>
			<li id="tab_li_4" style="display:none;"></li>
			<li id="tab_li_5" style="display:none;"></li>
			<li id="tab_li_6" style="display:none;"></li>
			<li id="tab_li_7" style="display:none;"></li>
		</ul>
	</div>

	<div class="tabField" id="tab_1">
		<table id="tab1_timeTable" class="table-responsive" style="width:100%; height:100%; text-align: center;"></table>
	</div>

	<div class="tabField" id="tab_2">
		<table id="tab2_timeTable" class="table-responsive" style="width:100%; height:100%; text-align: center;"></table>
	</div>

	<div class="tabField" id="tab_3">
		<table id="tab3_timeTable" class="table-responsive" style="width:100%; height:100%; text-align: center;"></table>
	</div>

	<div class="tabField" id="tab_4">
		<table id="tab4_timeTable" class="table-responsive" style="width:100%; height:100%; text-align: center;"></table>
	</div>

	<div class="tabField" id="tab_5">
		<table id="tab5_timeTable" class="table-responsive" style="width:100%; height:100%; text-align: center;"></table>
	</div>

	<div class="tabField" id="tab_6">
		<table id="tab6_timeTable" class="table-responsive" style="width:100%; height:100%; text-align: center;"></table>
	</div>

	<div class="tabField" id="tab_7">
		<table id="tab7_timeTable" class="table-responsive" style="width:100%; height:100%; text-align: center;"></table>
	</div>

	<br/><br/>

	<div id="summary_container">
		<span id='summary_txt'></span>
	</div>


	<div class="tabField" id="tab_1">
		<table id="tab1_timeTable" style="width:100%; height:100%; text-align: center;"></table>
	</div>
	<div class="tabField" id="tab_2">
		<table id="tab2_timeTable" style="width:100%; height:100%; text-align: center;"></table>
	</div>
	<div class="tabField" id="tab_3">
		<table id="tab3_timeTable" style="width:100%; height:100%; text-align: center;"></table>
	</div>
	<div class="tabField" id="tab_4">
		<table id="tab4_timeTable" style="width:100%; height:100%; text-align: center;"></table>
	</div>
	<div class="tabField" id="tab_5">
		<table id="tab5_timeTable" style="width:100%; height:100%; text-align: center;"></table>
	</div>
	<div class="tabField" id="tab_6">
		<table id="tab6_timeTable" style="width:100%; height:100%; text-align: center;"></table>
	</div>
	<div class="tabField" id="tab_7">
		<table id="tab7_timeTable" style="width:100%; height:100%; text-align: center;"></table>
	</div>

	<br/><br/>

	<div  id="summary_container">
		<span id='summary_txt'></span>
	</div>

			</div>
		</div>
	</div>
</div>

<div id="bottom_button_container" class="panel panel-default">
	<button id="save_button" class="btn btn-primary btn-lg" onclick="saveChanges()"><%~ SaveChanges %></button>
	<button id="reset_button" class="btn btn-warning btn-lg" onclick="SetTimerMode(0)"><%~ Reset %></button>
</div>


<script>
<!--
	LoadCrontabs();
//-->
</script>

<%
	gargoyle_header_footer -f -s "status" -p "usbrelay"
%>
