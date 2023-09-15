/*
 * This program is copyright © 2023 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
 * version 2.0 with a special clarification/exception that permits adapting the program to
 * configure proprietary "back end" software provided that all modifications to the web interface
 * itself remain covered by the GPL.
 * See http://gargoyle-router.com/faq.html#qfoss for more information
 */

var modemband = new Object();

var pkg = "3ginfo";

function sortJSON(data, key, way) {
	return data.sort(function(a, b) {
		var x = a[key]; var y = b[key];
		if (way === 'asc' ) { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
		if (way === 'desc') { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
	});
}

function resetData()
{
	var sec = uciOriginal.getAllSectionsOfType(pkg, "3ginfo");

	var device = uciOriginal.get(pkg, sec[0], 'device')
	setSelectedValue('list_device', device);

	if (device == '')
	{
		document.getElementById('modemerror').style.display = 'none';
		document.getElementById('div_modembandinfo').style.display = 'none';
		document.getElementById('div_modemband4g').style.display = 'none';
		document.getElementById('div_modemband5gnsa').style.display = 'none';
		document.getElementById('div_modemband5gsa').style.display = 'none';
		return;
	}

	setControlsEnabled(false, true);
	var param = getParameterDefinition("commands", '/usr/bin/modemband.sh json\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			var tmp = {};
			try {
				tmp = eval ('(' + req.responseText.replace(/Success/, '') + ')');
			} catch (error) {
				tmp['error'] = 'error';
			}
			if (tmp['error']) {
				document.getElementById('modemerror').style.display = 'block';
				document.getElementById('div_modembandinfo').style.display = 'none';
				document.getElementById('div_modemband4g').style.display = 'none';
				document.getElementById('div_modemband5gnsa').style.display = 'none';
				document.getElementById('div_modemband5gsa').style.display = 'none';
				return;
			}

			document.getElementById('modemerror').style.display = 'none';
			document.getElementById('div_modembandinfo').style.display = 'block';
			setChildText("modem", tmp['modem']);

			if (tmp['supported']) {
				document.getElementById('div_modemband4g').style.display = 'block';
				var html = '';
				var bands = sortJSON(tmp['supported'], 'band', 'asc');
				for (var idx = 0; idx < bands.length; idx++) {
					html += '<span class="col-xs-12" style="margin-bottom:5px;"><input type="checkbox" name="band4g" data-band="' + bands[idx].band + '" id="band4g' + bands[idx].band + '">';
					html += '<label class="short-left-pad" for="band4g' + bands[idx].band + '" id="band4g' + bands[idx].band + '_label" style="margin-left:5px;vertical-align:middle">B' + bands[idx].band + ' (' + bands[idx].txt + ')</label>';
					html += '</span>';
				}
				document.getElementById('modemband4g').innerHTML = html;

				var enabled = tmp['enabled'];
				if (enabled.length == 0) {
					document.getElementById('modemerror').style.display = 'block';
					document.getElementById('default_button_4g').disabled = true;
					document.getElementById('save_button_4g').disabled = true;
				} else {
					document.getElementById('modemerror').style.display = 'none';
					document.getElementById('default_button_4g').disabled = false;
					document.getElementById('save_button_4g').disabled = false;
					enabled.forEach(e => {
						document.getElementById('band4g' + e).checked = true;
					});
				}
			} else {
				document.getElementById('div_modemband4g').style.display = 'none';
			}

			if (tmp['supported5gnsa']) {
				document.getElementById('div_modemband5gnsa').style.display = 'block';
				var html = '';
				var bands = sortJSON(tmp['supported5gnsa'], 'band', 'asc');
				for (var idx = 0; idx < bands.length; idx++) {
					html += '<span class="col-xs-12" style="margin-bottom:5px;"><input type="checkbox" name="band5gnsa" data-band="' + bands[idx].band + '" id="band5gnsa' + bands[idx].band + '">';
					html += '<label class="short-left-pad" for="band5gnsa' + bands[idx].band + '" id="band5gnsa' + bands[idx].band + '_label" style="margin-left:5px;vertical-align:middle">n' + bands[idx].band + ' (' + bands[idx].txt + ')</label>';
					html += '</span>';
				}
				document.getElementById('modemband5gnsa').innerHTML = html;

				var enabled = tmp['enabled5gnsa'];
				if (enabled.length == 0) {
					document.getElementById('modemerror').style.display = 'block';
					document.getElementById('default_button_5gnsa').disabled = true;
					document.getElementById('save_button_5gnsa').disabled = true;
				} else {
					document.getElementById('modemerror').style.display = 'none';
					document.getElementById('default_button_5gnsa').disabled = false;
					document.getElementById('save_button_5gnsa').disabled = false;
					enabled.forEach(e => {
						document.getElementById('band5gnsa' + e).checked = true;
					});
				}
			} else {
				document.getElementById('div_modemband5gnsa').style.display = 'none';
			}

			if (tmp['supported5gsa']) {
				document.getElementById('div_modemband5gsa').style.display = 'block';
				var html = '';
				var bands = sortJSON(tmp['supported5gsa'], 'band', 'asc');
				for (var idx = 0; idx < bands.length; idx++) {
					html += '<span class="col-xs-12" style="margin-bottom:5px;"><input type="checkbox" name="band5gsa" data-band="' + bands[idx].band + '" id="band5gsa' + bands[idx].band + '">';
					html += '<label class="short-left-pad" for="band5gsa' + bands[idx].band + '" id="band5gsa' + bands[idx].band + '_label" style="margin-left:5px;vertical-align:middle">n' + bands[idx].band + ' (' + bands[idx].txt + ')</label>';
					html += '</span>';
				}
				document.getElementById('modemband5gsa').innerHTML = html;

				var enabled = tmp['enabled5gsa'];
				if (enabled.length == 0) {
					document.getElementById('modemerror').style.display = 'block';
					document.getElementById('default_button_5gsa').disabled = true;
					document.getElementById('save_button_5gsa').disabled = true;
				} else {
					document.getElementById('modemerror').style.display = 'none';
					document.getElementById('default_button_5gsa').disabled = false;
					document.getElementById('save_button_5gsa').disabled = false;
					enabled.forEach(e => {
						document.getElementById('band5gsa' + e).checked = true;
					});
				}
			} else {
				document.getElementById('div_modemband5gsa').style.display = 'none';
			}


		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function saveChanges4g()
{
	var bands = document.getElementsByName('band4g');
	var cmd = '';
	for (var idx = 0; idx < bands.length; idx++) {
		if (bands[idx].checked) {
			cmd += bands[idx].getAttribute('data-band') + ' ';
		}
	}
	if (cmd == '') {
		return;
	}

	setControlsEnabled(false, true);
	var param = getParameterDefinition("commands", '/usr/bin/modemband.sh setbands "' + cmd + '"\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			resetData();
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function defaultData4g()
{
	setControlsEnabled(false, true);
	var param = getParameterDefinition("commands", '/usr/bin/modemband.sh setbands default\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			resetData();
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function saveChanges5gnsa()
{
	var bands = document.getElementsByName('band5gnsa');
	var cmd = '';
	for (var idx = 0; idx < bands.length; idx++) {
		if (bands[idx].checked) {
			cmd += bands[idx].getAttribute('data-band') + ' ';
		}
	}
	if (cmd == '') {
		return;
	}

	setControlsEnabled(false, true);
	var param = getParameterDefinition("commands", '/usr/bin/modemband.sh setbands5gnsa "' + cmd + '"\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			resetData();
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function defaultData5gnsa()
{
	setControlsEnabled(false, true);
	var param = getParameterDefinition("commands", '/usr/bin/modemband.sh setbands5gnsa default\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			resetData();
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function saveChanges5gsa()
{
	var bands = document.getElementsByName('band5gsa');
	var cmd = '';
	for (var idx = 0; idx < bands.length; idx++) {
		if (bands[idx].checked) {
			cmd += bands[idx].getAttribute('data-band') + ' ';
		}
	}
	if (cmd == '') {
		return;
	}

	setControlsEnabled(false, true);
	var param = getParameterDefinition("commands", '/usr/bin/modemband.sh setbands5gsa "' + cmd + '"\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			resetData();
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function defaultData5gsa()
{
	setControlsEnabled(false, true);
	var param = getParameterDefinition("commands", '/usr/bin/modemband.sh setbands5gsa default\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			resetData();
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function restartConn()
{
	setControlsEnabled(false, true);
	var param = getParameterDefinition("commands", 'ifdown wan\nsleep 3\nifup wan\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			resetData();
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function setDevice(device)
{
	setControlsEnabled(false, true);
	var param = getParameterDefinition("commands", 'uci set ' + pkg + '.@3ginfo[0].device=' + device + '\nuci commit ' + pkg + '\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var sec = uciOriginal.getAllSectionsOfType(pkg, "3ginfo");
			uciOriginal.set(pkg, sec[0], "device", device);
			setControlsEnabled(true);
			resetData();
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}
