#!/usr/bin/haserl

<div id="management" class="row">
	<div class="col-lg-4">
		<div class="panel panel-info">

		<div class="panel-heading">
			<h3 class="panel-title">Zarządzanie</h3>
		</div>

		<div class="panel-body">

		<button id="reboot_button" class="btn btn-default" onclick='reboot()'>Uruchom ponownie</button>
		<div class="internal_divider"></div>
		<button id="reconnect_button" class="btn btn-default" onclick='reconnect()'>Restart WAN</button>

		</div>

		</div>
	</div>
</div>

<iframe id="reboot_test" onload="reloadPage()" style="display:none" ></iframe>
