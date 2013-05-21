#!/usr/bin/haserl
<?
	# This program is copyright © 2012 Cezary Jackiewicz and is distributed under the terms of the GNU GPL 
	# version 2.0 with a special clarification/exception that permits adapting the program to 
	# configure proprietary "back end" software provided that all modifications to the web interface
	# itself remain covered by the GPL.
	# See http://gargoyle-router.com/faq.html#qfoss for more information
	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "system" -p "smsbox" -c "internal.css" -j "table.js smsbox.js" smsbox
?>
<script>
var uci = uciOriginal.clone();
var smscnt=0;
</script>
<fieldset>
	<legend class="sectionheader">Konfiguracja</legend>

	<div>
		<label id="device_label" class="leftcolumn" for="device">Urządzenie:</label>
		<span class='rightcolumn'>
			<select style="display:none;float:left;width:180px;max-width:180px" id="list_device" onchange='set3GDevice(this.value)' ></select>
			<input style="float:left;" id="device" class="rightcolumn" type="text" size='40'/>
			<input style="float:left;" type='button' class="default_button" id='scan_button' value='Skanuj' onclick='scan3GDevice("list_device")' />
		</span>
	</div>

	<div>
		<label class='leftcolumn' id='memory_label' for='memory'>Typ pamięci:</label>
		<select class='rightcolumn' id='memory' >
		<option value='ME'>wewnętrzna</option>
		<option value='SM'>karta SIM</option>
		<option value='MT'>wewnętrzna i karta SIM</option>
		</select>
	</div>

	<div id="settings_button_container">
		<input type='button' class='default_button' value='Zapisz' id="save_settings_button"  onclick='saveSettings()' />
	</div>
</fieldset>
<?

if [ -e /usr/bin/ussd159 ]; then
echo '
<fieldset>
	<legend class="sectionheader">Wyślij USSD</legend>

	<div>
		<label id="ussd_label" class="leftcolumn" for="USSD">Kod:</label>
		<input id="ussd" class="rightcolumn" type="text" size='45'/>
	</div>

	<div id="ussd_button_container">
		<input type="button" class="default_button" value="Wyślij" id="ussd_button"  onclick="sendUSSD()" />
	</div>
</fieldset>
'
fi

?>

<fieldset>
	<legend class="sectionheader">Wyślij SMS</legend>

	<div>
		<label id="phonenumber_label" class="leftcolumn" for="phonenumber">Numer telefonu:</label>
		<input id="phonenumber" class="rightcolumn" type="text" size='45'/>
	</div>

	<div>
		<label id="smstext_label" class="leftcolumn" for="smstext">Tekst wiadomości:</label>
		<textarea style="width:100%" rows=5 id='smstext'></textarea>
	</div>

	<div id="send_button_container">
		<input type='button' class='default_button' value='Wyślij' id="send_button"  onclick='sendSMS()' />
	</div>
</fieldset>

<fieldset>
	<legend class="sectionheader">Skrzynka odbiorcza</legend>

	<div>
		<span class='leftcolumn'>Liczba wiadomości:</span><span id="sms_cnt" class='rightcolumn'></span>
	</div>

	<br />

	<div id="inbox_table_container"></div>

	<div id="refresh_button_container">
		<input type='button' class='default_button' value='Odśwież' id="refresh_button"  onclick='resetData()' />
	</div>
</fieldset>

<script>
<!--
	resetData();
//-->
</script>

<?
	gargoyle_header_footer -f -s "system" -p "smsbox"
?>
