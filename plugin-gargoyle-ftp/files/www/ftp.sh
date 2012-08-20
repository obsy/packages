#!/usr/bin/haserl
<?
	# This program is copyright © 2010-2012 Cezary Jackiewicz and is distributed under the terms of the GNU GPL 
	# version 2.0 with a special clarification/exception that permits adapting the program to 
	# configure proprietary "back end" software provided that all modifications to the web interface
	# itself remain covered by the GPL.
	# See http://gargoyle-router.com/faq.html#qfoss for more information
	eval $( gargoyle_session_validator -c "$COOKIE_hash" -e "$COOKIE_exp" -a "$HTTP_USER_AGENT" -i "$REMOTE_ADDR" -r "login.sh" -t $(uci get gargoyle.global.session_timeout) -b "$COOKIE_browser_time"  )
	gargoyle_header_footer -h -s "system" -p "ftp" -c "internal.css" -j "table.js ftp.js" vsftpd

?>

<script>
<!--
<?
	if [ -h /etc/rc.d/S??vsftpd ] ; then
		echo "var ftpEnabled = true;"
	else
		echo "var ftpEnabled = false;"
	fi

	if [ "x"$(uci -q get firewall.ftp_wan) = "xrule" ] ; then
		echo "var ftpEnabledFromWan = true;"
	else
		echo "var ftpEnabledFromWan = false;"
	fi
?>
	var uci = uciOriginal.clone();
//-->
</script>

<fieldset id="ftp">
	<legend class="sectionheader">Serwer FTP</legend>

	<div id='ftp_enabled_container'>
		<input type='checkbox' id='ftp_enabled' onclick="setFtpEnabled(this.checked)" />
		<label id='ftp_enabled_label' for='ftp_enabled'>Włącz FTP</label>
	</div>

	<div class="indent" id='ftp_enabled_from_wan_container'>
		<input type='checkbox' id='ftp_enabled_from_wan' />
		<label id='ftp_enabled_from_wan_label' for='ftp_enabled_from_wan'>Zdalny dostęp przez WAN</label>
	</div>

	<div class='internal_divider'></div>

	<div><strong>Użytkownik anonimowy</strong></div>

	<div class="indent" >
		<div>
			<input class="rightcolumn" type='checkbox' id='ftp_anonymous' onclick="updateVisibility()" />
			<label class="leftcolumn" id='ftp_anonymous_label' for='ftp_anonymous'>Dostęp dla użytkownika anonimowego</label>
		</div>

		<div>
			<input class="rightcolumn" type='checkbox' id='ftp_anonymous_write' />
			<label class="leftcolumn" id='ftp_anonymous_write_label' for='ftp_anonymous_write'>Zezwalaj na zapis</label>
		</div>

		<div>
			<label id="ftp_anonymous_root_label" class="leftcolumn" for="ftp_anonymous_root">Katalog główny:</label>
			<input id="ftp_anonymous_root" class="rightcolumn" type="text" size='45'/>
		</div>
	</div>

	<div class='internal_divider'></div>

	<div><strong>Użytkownicy systemowi</strong></div>

	<div class="indent" >
		<? cat templates/ftp_edit_user_template ?>

		<div id="add_class_container">
			<input type="button" id="add_class_button" class="default_button" value="Dodaj nowego użytkownika" onclick="addNewUser()" />
		</div>
	</div>

	<div class='internal_divider'></div>

	<div id="users_table_container"></div>
	<em>
		<ul>
		<li>Podane katalogi muszą istnieć w systemie plików.
		<li>Upewnij się, że w/w użytkownicy mają prawa dostępu do wybranych katalogów.
		<li>Jeżeli została zaznaczona opcja "Zapis", użytkownik musi posiadać także prawa do zapisu w danym katalogu.
		</ul>
	</em>
</fieldset>

<div id="bottom_button_container">
	<input type='button' value='Zapisz zmiany' id="save_button" class="bottom_button" onclick='saveChanges()' />
	<input type='button' value='Anuluj' id="reset_button" class="bottom_button" onclick='resetData()'/>
</div>

<script>
<!--
	resetData();
//-->
</script>

<?
	gargoyle_header_footer -f -s "system" -p "ftp"
?>
