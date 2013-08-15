#!/usr/bin/haserl
<?
	# This program is copyright © 2008-2013 Eric Bishop and is distributed under the terms of the GNU GPL
	# version 2.0 with a special clarification/exception that permits adapting the program to
	# configure proprietary "back end" software provided that all modifications to the web interface
	# itself remain covered by the GPL.
	# See http://gargoyle-router.com/faq.html#qfoss for more information

	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "status" -p "3ginfo" -c "internal.css" -j "3ginfo.js" -i 3ginfo
?>

<fieldset id="nodevice">
	<legend class="sectionheader">Modem 3G/LTE</legend>
	<em><span class='nocolumn'>Brak wybranego urządzenia dla 3ginfo!</span></em>
</fieldset>

<fieldset id="3ginfo" style="display:none;">
	<legend class="sectionheader">Modem 3G/LTE</legend>

	<div>
		<span class='leftcolumn'>Status połączenia:</span><span id="status" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>Czas połączenia:</span><span id="conn_time" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>Pobrano danych:</span><span id="rx" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>Wysłano danych:</span><span id="tx" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>Operator:</span><span id="cops" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>Siła sygnału:</span><span id="csq_per" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>Tryb pracy:</span><span id="mode" class='rightcolumn'>-</span>
	</div>

	<div class="internal_divider"></div>

	<div>
		<span class='leftcolumn'>MCC:</span><span id="cops_mcc" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>MNC:</span><span id="cops_mnc" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>CSQ:</span><span id="csq" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>RSSI:</span><span id="csq_rssi" class='rightcolumn'>-</span>
	</div>
	<div id="qos_container">
		<span class='leftcolumn'>Profil UMTS QoS:</span><span id="qos" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>LAC:</span><span id="lac" class='rightcolumn'>-</span>
	</div>
	<div id="lcid_container">
		<span class='leftcolumn'>LCID:</span><span id="lcid" class='rightcolumn'>-</span>
	</div>
	<div id="rnc_container">
		<span class='leftcolumn'>RNC:</span><span id="rnc" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>CID:</span><span id="cid" class='rightcolumn'>-</span>
	</div>
	<div>
		<span class='leftcolumn'>Typ modemu:</span><span id="device" class='rightcolumn'>-</span>
	</div>

</fieldset>

<script>
<!--
	resetData();
	setInterval("resetData()", 30000);
//-->
</script>

<?
	gargoyle_header_footer -f -s "status" -p "3ginfo"
?>
