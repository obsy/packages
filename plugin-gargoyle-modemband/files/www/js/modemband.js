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
		document.getElementById('modemband1').style.display = 'none';
		document.getElementById('modemband2').style.display = 'none';
		document.getElementById('modemerror').style.display = 'none';
		document.getElementById('default_button').disabled = true;
		document.getElementById('save_button').disabled = true;
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
				document.getElementById('modemband1').style.display = 'none';
				document.getElementById('modemband2').style.display = 'none';
				document.getElementById('default_button').disabled = true;
				document.getElementById('save_button').disabled = true;
				return;
			}

			document.getElementById('modemerror').style.display = 'none';
			document.getElementById('modemband1').style.display = 'block';
			document.getElementById('modemband2').style.display = 'block';

			setChildText("modem", tmp['modem']);

			var html = '';
			var bands = sortJSON(tmp['supported'], 'band', 'asc');
			for (var idx = 0; idx < bands.length; idx++) {
				html += '<span class="col-xs-12" style="margin-bottom:5px;"><input type="checkbox" name="band" data-band="' + bands[idx].band + '" id="band' + bands[idx].band + '">';
				html += '<label class="short-left-pad" for="band' + bands[idx].band + ' id="band' + bands[idx].band + '_label" style="margin-left:5px;vertical-align:middle">B' + bands[idx].band + ' (' + bands[idx].txt + ')</label>';
				html += '</span>';
			}
			document.getElementById('modembandlte').innerHTML = html;

			var enabled = tmp['enabled'];
			if (enabled.length == 0) {
				document.getElementById('modemerror').style.display = 'block';
				document.getElementById('default_button').disabled = true;
				document.getElementById('save_button').disabled = true;
			} else {
				document.getElementById('modemerror').style.display = 'none';
				document.getElementById('default_button').disabled = false;
				document.getElementById('save_button').disabled = false;
				enabled.forEach(e => {
					document.getElementById('band' + e).checked = true;
				});
			}
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function saveChanges()
{
	var bands = document.getElementsByName('band');
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

function defaultData()
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
