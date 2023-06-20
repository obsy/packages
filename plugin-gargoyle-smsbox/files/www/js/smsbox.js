/*
 * This program is copyright © 2012-2023 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
 * version 2.0 with a special clarification/exception that permits adapting the program to
 * configure proprietary "back end" software provided that all modifications to the web interface
 * itself remain covered by the GPL.
 * See http://gargoyle-router.com/faq.html#qfoss for more information
 */

var smsbox = new Object();

var pkg = "smsbox";

function resetData()
{
	var sec = uciOriginal.getAllSectionsOfType(pkg, "smsbox");
	var device = uciOriginal.get(pkg, sec[0], "device");
	var memory = uciOriginal.get(pkg, sec[0], "memory");
	var rawinput = uciOriginal.get(pkg, sec[0], "rawinput");
	var rawoutput = uciOriginal.get(pkg, sec[0], "rawoutput");

	document.getElementById("list_device").value = device;
	document.getElementById("memory").value = memory;
	document.getElementById("rawinput").checked = (rawinput == "1");
	document.getElementById("rawoutput").checked = (rawoutput == "1");

	var Commands = [];

	Commands.push("sms_tool -d " + device + " -f \"%s\" -j -s " + memory + " recv");

	setControlsEnabled(false, true, smsbox.ReadMsg);

	var param = getParameterDefinition("commands", Commands.join("\n")) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var smsTableData = new Array();

			var systemDateFormat = uciOriginal.get("gargoyle",  "global", "dateformat");
			var smss = {};
			try {
				smss = JSON.parse((req.responseText).replace(/Success/,''));
			} catch (error) {
				smss.msg = [];
			}
			for (idx = 0; idx < (smss.msg).length; idx++)
			{
				var sms = smss.msg[idx];
				var removeButton = createInput("button");
				removeButton.textContent = UI.Remove;
				removeButton.className="btn btn-default btn-select";
				removeButton.onclick = findAndDeleteSMS;
				removeButton.id = sms.index;

				var span2 = document.createElement("span");
				span2.appendChild(document.createTextNode("" + sms.timestamp));

				var span3 = document.createElement("span");
				span3.appendChild(document.createTextNode("" + sms.sender));

				var span4 = document.createElement("span");
				span4.appendChild(document.createTextNode("" + sms.content));

				smsTableData.push([ parseTimestamp(sms.timestamp, systemDateFormat), span3, span4, removeButton, span2 ]);
			}


			if(smsTableData.length > 0)
			{
				smsTableData.sort(function(a, b) { return a[4] > b[4] ? 1 : -1; });
				for (idx=0; idx < smsTableData.length; idx++)
				{
					smsTableData[idx].splice(4, 1);
				}
			}

			setSMSCnt(smsTableData.length);

			var columnNames = [smsbox.Timestamp, smsbox.From, smsbox.Content];
			var smsTable = createTable(columnNames, smsTableData, "inbox_table", false, false);
			var tableContainer = document.getElementById('inbox_table_container');
			if(tableContainer.firstChild != null)
			{
				tableContainer.removeChild(tableContainer.firstChild);
			}
			tableContainer.appendChild(smsTable);

			setControlsEnabled(true);
		}
	}

	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function setSMSCnt(count)
{
	smscnt = count;
	setChildText("sms_cnt", count.toString());
}

function findAndDeleteSMS()
{
	row = this.parentNode.parentNode;
	index = row.childNodes[3].firstChild.id;
	removeThisCellsRow(this);
	deleteSMS(index);
	smscnt--;
	setSMSCnt(smscnt);
}

function parseTimestamp(timestamp, systemDateFormat)
{
	var formated = '';
	var date = new Date(timestamp * 1000);

	var year = date.getFullYear();
	var yearH = date.getYear();
	var month = date.getMonth() + 1; if (month < 10) { month = '0' + month; }
	var day = date.getDate(); if (day < 10) { day = '0' + day; }

	switch(systemDateFormat) {
		case "argentina":
			formated = day + '/' + month + '/' + year;
			break;
		case "australia":
			formated = day + '/' + month + '/' + yearH;
			break;
		case "hungary":
			formated = year + '.' + month + '.' + day;
			break;
		case "iso":
			formated = year + '/' + month + '/' + day;
			break;
		case "iso8601":
			formated = year + '-' + month + '-' + day;
			break;
		case "russia":
			formated = day + '.' + month + '.' + year;
			break;
		case "usa":
			formated = month + '/' + day + '.' + year;
			break;
	}
	var hour = date.getHours(); if (hour < 10) { hour = '0' + hour; }
	var minute = date.getMinutes(); if (minute < 10) { minute = '0' + minute; }
	var second = date.getSeconds(); if (second < 10) { second = '0' + second; }
	return formated + ' ' + (cnv24hToLocal(hour + ':' + minute)).replace(" ", ":" + second + " ");
}

function utf2ascii(string)
{
	return string.replace(/ą/g, 'a').replace(/Ą/g, 'A')
		.replace(/ć/g, 'c').replace(/Ć/g, 'C')
		.replace(/ę/g, 'e').replace(/Ę/g, 'E')
		.replace(/ł/g, 'l').replace(/Ł/g, 'L')
		.replace(/ń/g, 'n').replace(/Ń/g, 'N')
		.replace(/ó/g, 'o').replace(/Ó/g, 'O')
		.replace(/ś/g, 's').replace(/Ś/g, 'S')
		.replace(/ż/g, 'z').replace(/Ż/g, 'Z')
		.replace(/ź/g, 'z').replace(/Ź/g, 'Z');
}

function sendSMS()
{
	var sec = uciOriginal.getAllSectionsOfType(pkg, "smsbox");
	var device = uciOriginal.get(pkg, sec[0], "device");
	if(device == "") {
		alert(smsbox.NoDevice);
		return;
	}

	var number = (document.getElementById("phonenumber").value).replace(/[^0-9+]/g,"");
	var txt = utf2ascii(document.getElementById("smstext").value);

	if(number == "")
	{
		alert(smsbox.NoNumber);
		return;
	}

	if(txt == "")
	{
		alert(smsbox.NoMsg);
		return;
	}

	var Commands = [];

	Commands.push("sms_tool -d " + device + " send " + number + " \"" + txt.replace(/"/g, "\\\"") + "\"");

	setControlsEnabled(false, true, smsbox.SendingMsg);

	var param = getParameterDefinition("commands", Commands.join("\n")) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			alert(req.responseText.replace(/Success/, ''));
		}
	}

	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function sendUSSD()
{
	var sec = uciOriginal.getAllSectionsOfType(pkg, "smsbox");
	var device = uciOriginal.get(pkg, sec[0], "device");
	if (device == "") {
		alert(smsbox.NoDevice);
		return;
	}

	var rawinput = uciOriginal.get(pkg, sec[0], "rawinput");
	var rawoutput = uciOriginal.get(pkg, sec[0], "rawoutput");

	var ussd = document.getElementById("ussd").value

	if(ussd == "")
	{
		alert(smsbox.NoCode);
		return;
	}

	var Commands = [];

	Commands.push("sms_tool -d " + device + (rawinput == "1" ? " -R" : "") + (rawoutput == "1" ? " -r" : "") + " ussd \"" + ussd + "\"");

	setControlsEnabled(false, true, smsbox.Sending);

	var param = getParameterDefinition("commands", Commands.join("\n")) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
			alert(req.responseText.replace(/Success/, ''));
		}
	}

	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function deleteSMS(index)
{
	var sec = uciOriginal.getAllSectionsOfType(pkg, "smsbox");
	var device = uciOriginal.get(pkg, sec[0], "device");
	var memory = uciOriginal.get(pkg, sec[0], "memory");

	var Commands = [];

	Commands.push("sms_tool -d " + device + " -s " + memory + " delete " + index);

	setControlsEnabled(false, true, smsbox.DeleteMsg);

	var param = getParameterDefinition("commands", Commands.join("\n")) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setControlsEnabled(true);
		}
	}

	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function saveSettings()
{
	var Commands = [];

	var device = document.getElementById("list_device").value;
	var memory = document.getElementById("memory").value;
	var rawinput = document.getElementById("rawinput").checked;
	var rawoutput = document.getElementById("rawoutput").checked;

	Commands.push("uci set " + pkg + ".@smsbox[0].device=" + device);
	Commands.push("uci set " + pkg + ".@smsbox[0].memory=" + memory);
	Commands.push("uci set " + pkg + ".@smsbox[0].rawinput=" + (rawinput ? "1" : "0"));
	Commands.push("uci set " + pkg + ".@smsbox[0].rawoutput=" + (rawoutput ? "1" : "0"));
	Commands.push("uci commit " + pkg);

	var sec = uci.getAllSectionsOfType(pkg, "smsbox");
	uci.set(pkg, sec[0], "device", device);
	uci.set(pkg, sec[0], "memory", memory);
	uci.set(pkg, sec[0], "rawinput", (rawinput ? "1" : "0"));
	uci.set(pkg, sec[0], "rawoutput", (rawoutput ? "1" : "0"));

	setControlsEnabled(false, true, UI.WaitSettings);

	var param = getParameterDefinition("commands", Commands.join("\n")) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));

	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			uciOriginal = uci.clone();
			setControlsEnabled(true);
			resetData();
		}
	}

	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function setDevice(device)
{
	setControlsEnabled(false, true);
	var param = getParameterDefinition("commands", 'uci set ' + pkg + '.@smsbox[0].device=' + device + '\nuci commit ' + pkg + '\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var sec = uciOriginal.getAllSectionsOfType(pkg, "smsbox");
			uciOriginal.set(pkg, sec[0], "device", device);
			setControlsEnabled(true);
			resetData();
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}
