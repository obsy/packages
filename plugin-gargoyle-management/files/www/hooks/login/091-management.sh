#!/usr/bin/haserl

<fieldset id="management">
	<legend class="sectionheader">Zarządzanie</legend>
	<center><input type='button' value='Uruchom ponowne' id="reboot_button" class="big_button" onclick='reboot()' /></center>
	<div class="internal_divider"></div>
	<center><input type='button' value='Restart WAN' id="reconnect_button" class="big_button" onclick='reconnect()' /></center>
</fieldset>

<iframe id="reboot_test" onload="reloadPage()" style="display:none" ></iframe>
