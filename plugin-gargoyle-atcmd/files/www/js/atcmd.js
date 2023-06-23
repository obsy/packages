/*
 * This program is copyright © 2023 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
 * version 2.0 with a special clarification/exception that permits adapting the program to
 * configure proprietary "back end" software provided that all modifications to the web interface
 * itself remain covered by the GPL.
 * See http://gargoyle-router.com/faq.html#qfoss for more information
 */

var atcmd = new Object();

var pkg = "3ginfo";
var atcmdcode = [];

function populateatcmd()
{
	removeAllOptionsFromSelectElement(document.getElementById("atcmd_list"));
	addOptionToSelectElement("atcmd_list", atcmd.SlctCd, '');
	for (var idx = 0; idx < atcmdcode.length; idx++) {
		addOptionToSelectElement("atcmd_list", atcmdcode[idx][0] + ' (' + atcmdcode[idx][1] + ')', atcmdcode[idx][1]);
	}
}

function resetData()
{
	atcmdcode = [];
	var sec = uciOriginal.getAllSectionsOfType(pkg, "atcmd");
	for (var idx = 0; idx < sec.length; idx++) {
		atcmdcode.push([ uciOriginal.get(pkg, sec[idx], "description"), uciOriginal.get(pkg, sec[idx], "code") ]);
	}
	populateatcmd();

	var sec = uciOriginal.getAllSectionsOfType(pkg, "3ginfo");
	var device = uciOriginal.get(pkg, sec[0], "device");

	document.getElementById("device").value = device;
}

function sendATcmd()
{
	var sec = uciOriginal.getAllSectionsOfType(pkg, "3ginfo");
	var device = uciOriginal.get(pkg, sec[0], "device");
	if (device == "") {
		alert(atcmd.NoDevice);
		return;
	}

	var txt = document.getElementById("atcmd").value;
	if (txt == "") {
		alert(atcmd.NoCode);
		return;
	}

	var cmd = [];
	cmd.push("sms_tool -D -d " + device + " at \"" + txt.replace(/"/g, "\\\"") + "\" 2>&1");

	setControlsEnabled(false, true, atcmd.SendingMsg);
	var param = getParameterDefinition("commands", cmd.join("\n")) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			var txt = document.getElementById("atcmd_output").innerHTML;
			document.getElementById("atcmd_output").innerHTML = req.responseText.replace(/Success/, '') + txt;
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
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function setATcmd(cmd)
{
	if (cmd == "") {
		return;
	}
	document.getElementById("atcmd").value = cmd;
}

function ATmngmt()
{
	var columnNames = [atcmd.Description, atcmd.Code];
	var table = createTable(columnNames, atcmdcode, "atcmd_table", true, true);
	var tableContainer = document.getElementById('atcmd_table_container');
	if(tableContainer.firstChild != null)
	{
		tableContainer.removeChild(tableContainer.firstChild);
	}
	tableContainer.appendChild(table);

	modalButtons = [
		{"title" : UI.CApplyChanges, "classes" : "btn btn-primary", "function" : saveATcmd},
		"defaultDiscard"
	];

	modalElements = [
		{"id" : "new_description", "value" : '', "disable" : false},
		{"id" : "new_code", "value" : ''},
	];
	modalPrepare('atcmd_modal', atcmd.AT, modalElements, modalButtons);
	openModalWindow('atcmd_modal');
}

function addATcmd() 
{
	var errors = [];

	var description = document.getElementById("new_description").value;
	if (description == "") {
		errors.push(atcmd.ATDescErr);
	}
	var code = document.getElementById("new_atcmd").value;
	if (code == "") {
		errors.push(atcmd.ATCodeErr);
	}
	if (errors.length > 0) {
		alert(errors.join("\n"));
	} else {
		addTableRow(document.getElementById('atcmd_table'), [description, code], true, true);
	}
}

function saveATcmd()
{
	var cmd = [];

	cmd.push("SEC=$(uci show " + pkg + " | awk -F= '/=atcmd$/{a[i++]=$1} END {while(i--) print a[i]}')");
	cmd.push("for S in $SEC; do");
	cmd.push("uci delete $S");
	cmd.push("done");

	atcmdcode = [];
	var data = getTableDataArray(document.getElementById("atcmd_table"));
	while (data.length > 0) {
		var t = data.shift();
		cmd.push("uci add " + pkg + " atcmd");
		cmd.push("uci set " + pkg + ".@atcmd[-1].description=\"" + t[0].replace(/"/g,'\\\"') + "\"");	
		cmd.push("uci set " + pkg + ".@atcmd[-1].code=\"" + t[1].replace(/"/g,'\\\"') + "\"");
		atcmdcode.push([ t[0], t[1] ])
	}
	cmd.push("uci commit " + pkg);

	closeModalWindow('atcmd_modal');

	setControlsEnabled(false, true);
	var param = getParameterDefinition("commands", cmd.join("\n")) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if (req.readyState == 4) 
		{
			setControlsEnabled(true);
			populateatcmd();
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}
