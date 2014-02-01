/*
 * This program is copyright © 2014 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
 * version 2.0 with a special clarification/exception that permits adapting the program to
 * configure proprietary "back end" software provided that all modifications to the web interface
 * itself remain covered by the GPL.
 * See http://gargoyle-router.com/faq.html#qfoss for more information
 */

usbrelayS = new Object();

function resetData()
{
	var columnNames = usbrelayS.Columns;
	var usbrelayTableData = new Array();

	if (ports.length == 0)
	{
		document.getElementById("no_usbrelay").style.display = "block";
		return;
	}

	for (idx=0; idx<ports.length; idx++)
	{
		var tmp = "";
		var img = document.createElement("img");
		img.style.cssText= "margin-top:5px;";
		if (ports[idx][1] == "on")
		{
			img.src = "img/green-power-button.png";
			img.onclick = function(){offRelay(this);}
		} else {
			img.src = "img/red-power-button.png";
			img.onclick = function(){onRelay(this);}
		}

		for (j=0; j<desc.length; j++)
		{
			if (desc[j][0] == ports[idx][0]) 
			{
				tmp = desc[j][1];
				break;
			}
		}

		usbrelayTableData.push([ports[idx][0], tmp, img]);
	}

	var usbrelayTable = createTable(columnNames, usbrelayTableData, "usbrelay_table", false, false);
	var tableContainer = document.getElementById('usbrelay_table_container');
	if (tableContainer.firstChild != null)
	{
		tableContainer.removeChild(tableContainer.firstChild);
	}
	tableContainer.appendChild(usbrelayTable);
}
function onRelay(node)
{
	onoffRelay(node.parentNode.parentNode, "on");
}

function offRelay(node)
{
	onoffRelay(node.parentNode.parentNode, "off");
}

function onoffRelay(row, action)
{
	var port = row.firstChild.firstChild.data;
	var cmds = [ "/usr/lib/gargoyle/usbrelay.sh " + action + " " + port, "/usr/lib/gargoyle/usbrelay.sh status" ];
	var param = getParameterDefinition("commands", cmds.join("\n")) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));

	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var lines = req.responseText.split(/[\r\n]+/);
			ports.length = 0;
			for (idx=0; idx < lines.length; idx++)
			{
				if (lines[idx].match(/:o/))
				{
					stat=lines[idx].split(":");
					ports.push([ stat[0], stat[1] ]);
				}
			}
			resetData();
			setControlsEnabled(true);
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}
