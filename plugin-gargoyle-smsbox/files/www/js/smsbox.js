var pkg = "smsbox";

function resetData()
{
	var smsbox = uciOriginal.getAllSectionsOfType(pkg, "smsbox");

	var device = uciOriginal.get(pkg, smsbox[0], "device");
	var memory = uciOriginal.get(pkg, smsbox[0], "memory");

	document.getElementById("device").value = device;
	document.getElementById("memory").value = memory;

	var Commands = [];

	Commands.push("/www/utility/sms.sh " + device + " " + memory + " l");

	setControlsEnabled(false, true, "Odczyt wiadomości...");

	var param = getParameterDefinition("commands", Commands.join("\n")) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{

			var smsTableData = new Array();

			var smss = []
			smss = (req.responseText).replace(/Success/,'').split('-sta-');

			for (idx=1; idx < smss.length; idx++)
			{
				var sms = smss[idx].split('-sep-');
				var removeButton = createInput("button");
				removeButton.value = "Usuń";
				removeButton.className="default_button";
				removeButton.onclick = findAndDeleteSMS;
				removeButton.id = sms[0];

				var span2 = document.createElement("span");
				span2.appendChild(document.createTextNode(""+sms[2]));
				if (sms[1] == '(unread)') { span2.style.color = 'green'; }

				var span3 = document.createElement("span");
				span3.appendChild(document.createTextNode(""+sms[3]));
				if (sms[1] == '(unread)') { span3.style.color = 'green'; }

				var span4 = document.createElement("span");
				span4.appendChild(document.createTextNode(""+sms[4]));
				if (sms[1] == '(unread)') { span4.style.color = 'green'; }

				smsTableData.push([ parseDate(sms[2]), span3, span4, removeButton, span2 ]);
			}

			if(smsTableData.length > 0)
			{
				smsTableData.sort(function(a, b) { return a[0] > b[0]?1:-1; });
				smsTableData.reverse();
				for (idx=0; idx < smsTableData.length; idx++)
				{
					smsTableData[idx][0] = smsTableData[idx][4];
					smsTableData[idx].splice(4, 1);
				}
			}

			setChildText("sms_cnt", smsTableData.length.toString());

			var columnNames = ['Data', 'Od', 'Treść'];
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

function findAndDeleteSMS()
{
	row = this.parentNode.parentNode;
	index = row.childNodes[3].firstChild.id;
	removeThisCellsRow(this);
	deleteSMS(index);
}

function parseDate(date)
{
	var d = date.replace(/[ :]/g,'/').split('/');
	//var dt = new Date(d[2],d[1]-1,d[0],d[3],d[4],d[5]);
	return d[2]+'.'+d[1]+'.'+d[0]+'.'+d[3]+'.'+d[4]+'.'+d[5];
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
	var smsbox = uciOriginal.getAllSectionsOfType(pkg, "smsbox");

	var device = uciOriginal.get(pkg, smsbox[0], "device");

	var number = (document.getElementById("phonenumber").value).replace(/[^0-9+]/g,"");
	var txt = utf2ascii(document.getElementById("smstext").value);

	if(number == "")
	{
		alert("Brak podanego numeru!");
		return;
	}

	if(txt == "")
	{
		alert("Brak treści wiadomości!");
		return;
	}

	var Commands = [];

	Commands.push("/www/utility/sms.sh " + device + " XX s " + number + " \"" + txt.replace(/"/g, "\\\"") + "\"");

	setControlsEnabled(false, true, 'Trwa wysyłanie wiadomości...');

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
	var smsbox = uciOriginal.getAllSectionsOfType(pkg, "smsbox");

	var device = uciOriginal.get(pkg, smsbox[0], "device");

	var ussd = document.getElementById("ussd").value

	if(ussd == "")
	{
		alert("Brak kodu USSD!");
		return;
	}

	var Commands = [];

	Commands.push("/www/utility/sms.sh " + device + " XX u \"" + ussd + "\"");

	setControlsEnabled(false, true, 'Trwa wysyłanie wiadomości...');

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
	var smsbox = uciOriginal.getAllSectionsOfType(pkg, "smsbox");

	var device = uciOriginal.get(pkg, smsbox[0], "device");
	var memory = uciOriginal.get(pkg, smsbox[0], "memory");

	var Commands = [];

	Commands.push("/www/utility/sms.sh " + device + " " + memory + " d " + index);

	setControlsEnabled(false, true, 'Usuwanie wiadomości...');

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

	var device = document.getElementById("device").value;
	var memory = document.getElementById("memory").value;

	Commands.push("uci set " + pkg + ".@smsbox[0].device=" + device);
	Commands.push("uci set " + pkg + ".@smsbox[0].memory=" + memory);
	Commands.push("uci commit " + pkg);

	var smsbox = uci.getAllSectionsOfType(pkg, "smsbox");
	uci.set(pkg, smsbox[0], "device", device);
	uci.set(pkg, smsbox[0], "memory", memory);

	setControlsEnabled(false, true, 'Proszę czekać na wprowadzenie zmian');

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

function scan3GDevice(field)
{
	setControlsEnabled(false, true, "Poszukiwanie urządzeń mobilnych");
	var param = getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));

	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var scannedDevices = [];
			scannedDevices = req.responseText.split(/\n/);
			scannedDevices.pop();
			if(scannedDevices.length > 0)
			{
				setAllowableSelections(field, scannedDevices, scannedDevices);
				document.getElementById("device").style.display = "none";
				document.getElementById("list_device").style.display = "block";
				set3GDevice(getSelectedValue("list_device"));
			}
			else
			{
				alert("Nie znaleziono urządzeń!");
			}
			setControlsEnabled(true);
		}
	}
	runAjax("POST", "utility/scan_3gdevices.sh", param, stateChangeFunction);
}

function set3GDevice(device)
{
	document.getElementById("device").value = device;
}
