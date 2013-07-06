/*
 * This program is copyright © 2013 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
 * version 2.0 with a special clarification/exception that permits adapting the program to
 * configure proprietary "back end" software provided that all modifications to the web interface
 * itself remain covered by the GPL.
 * See http://gargoyle-router.com/faq.html#qfoss for more information
 */

var pkg = "minidlna";

function resetData()
{

	if(storageDrives.length == 0)
	{
		document.getElementById("no_disks").style.display = "block";
		document.getElementById("dlna").style.display = "none";
		document.getElementById("save_button").style.display = "none";
		document.getElementById("reset_button").style.display = "none";
		return;
	}

	var enabled = uciOriginal.get(pkg, "config", "enabled");
	document.getElementById("dlna_enable").checked = enabled == 1;
	updateStatus(enabled);

	var name = uciOriginal.get(pkg, "config", "friendly_name");
	document.getElementById('dlna_name').value = name;

	var strict = uciOriginal.get(pkg, "config", "strict_dlna");
	document.getElementById("dlna_strict").checked = strict == 1;

	var rootDriveDisplay = [];
	var rootDriveValues  = [];
	var driveIndex;
	for(driveIndex=0;driveIndex < storageDrives.length; driveIndex++)
	{
		rootDriveDisplay.push( storageDrives[driveIndex][0] + " (" + parseBytes(storageDrives[driveIndex][4]) + ", w tym " + parseBytes(storageDrives[driveIndex][5]) + " wolne)" )
		rootDriveValues.push( storageDrives[driveIndex][1] )
	}
	setAllowableSelections("drive_select", rootDriveValues, rootDriveDisplay, document);
	document.getElementById("media_dir").value = "/";

	var columnNames = ['Folder'];
	var mediaTableData = [];
	var mediaDir = [];
	mediaDir = uciOriginal.get(pkg, "config", "media_dir");
	for (idx=0; idx < mediaDir.length; idx++)
	{
		mediaTableData.push([mediaDir[idx]]);
	}
	var mediaTable = createTable(columnNames, mediaTableData, "media_table", true, false, removeCallback);
	var tableContainer = document.getElementById('media_table_container');
	if(tableContainer.firstChild != null)
	{
		tableContainer.removeChild(tableContainer.firstChild);
	}
	tableContainer.appendChild(mediaTable);
}

function removeCallback()
{
}

function addNewMediaDir()
{
	var drive = getSelectedValue("drive_select");
	var dir = document.getElementById('media_dir').value;
	if (dir == "/" || dir == "")
	{
		dir = "";
	}
	else
	{
		dir = "/" + dir;
	}
	var folder = drive + dir;
	folder = folder.replace("//", "/");

	var errors = [];
	var mediaTable = document.getElementById("media_table");
	if(mediaTable != null)
	{
		var found = 0;
		var mediaData = getTableDataArray(mediaTable, true, false);
		var idx;
		for(idx=0; idx < mediaData.length && found == 0; idx++)
		{
			found = mediaData[idx][0] == folder ? 1 : found;
		}
		if(found)
		{
			errors.push("Ten folder jest już dodany")
		}
	}
	if(errors.length > 0)
	{
		alert( errors.join("\n") + "\n\nNie można dodać folderu." );
	}
	else
	{
		if(mediaTable == null)
		{
			var tableContainer = document.getElementById("media_table_container");
			mediaTable = createTable(["Folder"], [], "media_table", true, false, removeCallback);
			setSingleChild(tableContainer, mediaTable);
		}
		addTableRow(mediaTable, [ folder ], true, false, removeCallback)
		document.getElementById("media_dir").value = "/"
	}
}

function saveChanges()
{
	var Commands = [];
	var enabled = document.getElementById("dlna_enable").checked ? "1":"0";
	var name = document.getElementById('dlna_name').value;

	if(name == "")
	{
		alert("Nazwa serwera DLNA nie może być pusta");
		return;
	}

	var strict = document.getElementById("dlna_strict").checked ? "1":"0";

	var uci = uciOriginal.clone()

	uci.set(pkg, "config", "enabled", enabled);
	uci.set(pkg, "config", "friendly_name", name);
	uci.set(pkg, "config", "strict_dlna", strict);

	uci.remove(pkg, "config", "media_dir");
	var mediaTable = document.getElementById("media_table");
	if(mediaTable != null)
	{
		var mediaData = getTableDataArray(mediaTable, true, false);
		var idx;
		var media = [];

		for(idx=0; idx < mediaData.length; idx++)
		{
			media.push(mediaData[idx][0]);
		}
		if(media.length > 0)
		{
			uci.set(pkg, "config", "db_dir", media[0] + "/_minidlna");
			uci.set(pkg, "config", "log_dir", media[0] + "/_minidlna");
			uci.createListOption(pkg, "config", "media_dir", true);
			uci.set(pkg, "config", "media_dir", media, false)
		}
	}

	Commands.push("/etc/init.d/minidlna stop");
	Commands.push("kill $(pidof minidlnad)");
	if(enabled==1)
	{
		Commands.push("sleep 2");
		Commands.push("/etc/init.d/minidlna enable");
		Commands.push("/etc/init.d/minidlna start");
	}
	else
	{
		Commands.push("/etc/init.d/minidlna disable");
	}
	var commands = uci.getScriptCommands(uciOriginal) + "\n" + Commands.join("\n");

	setControlsEnabled(false, true, 'Proszę czekać na wprowadzenie zmian');
	var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			uciOriginal = uci.clone();
			updateStatus(enabled);
			setControlsEnabled(true);
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function updateStatus(enabled)
{
	setElementEnabled(document.getElementById("rescan_button"), enabled == 1);
	setElementEnabled(document.getElementById("status_button"), enabled == 1);
}

function statusDlna()
{
	window.location.href="http://" + currentLanIp + ":" + uciOriginal.get(pkg, "config", "port");
}

function rescanMedia()
{
	var Commands = [];
	Commands.push("/etc/init.d/minidlna stop");
	Commands.push("kill -9 $(pidof minidlnad)");
	Commands.push("rm -f $(uci show minidlna.config.db_dir)/files.db");
	Commands.push("/etc/init.d/minidlna start");

	setControlsEnabled(false, true, 'Proszę czekać na wprowadzenie zmian');
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
