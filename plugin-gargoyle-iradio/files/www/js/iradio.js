/*
 *     Copyright (c) 2014 Cezary Jackiewicz <cezary@eko.one.pl>
 *
 *     This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation; either version 2 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program; if not, write to the Free Software
 *     Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 *     MA 02110-1301, USA.
 */
var iradio=new Object(); //part of i18n

function createPlayButton()
{
	var playButton = createInput("button");
	playButton.value = iradio.Play;
	playButton.className="default_button";
	playButton.onclick = playRadio;
	return playButton;
}

function playRadio()
{
	var name = this.parentNode.parentNode.firstChild.firstChild.data;

	var commands = [];
	commands.push("kill -9 $(pidof madplay) > /dev/null 2>&1");

	var radio = uciOriginal.getAllSectionsOfType("iradio", "radio")
	var idx;
	for(idx=0; idx < radio.length; idx++)
	{
		if (name == uciOriginal.get("iradio", radio[idx], "name"))
		{
			commands.push("wget -qO - " + uciOriginal.get("iradio", radio[idx], "url") + " | madplay -Q - &");
			break;
		}
	}

	setControlsEnabled(false, true, UI.Wait);
	var param = getParameterDefinition("commands", commands.join("\n")) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));

	var stateChangeFunction = function(req)
	{
		setControlsEnabled(true);
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction)
//	execute(commands)
}

function createRemoveButton()
{
	var removeButton = createInput("button");
	removeButton.value = iradio.Delete;
	removeButton.className="default_button";
	removeButton.onclick = removeRadio;
	return removeButton;
}

function removeRadio()
{
	var name = this.parentNode.parentNode.firstChild.firstChild.data;

	var commands = [];

	var radio = uciOriginal.getAllSectionsOfType("iradio", "radio")
	var idx;
	for(idx=0; idx < radio.length; idx++)
	{
		if (name == uciOriginal.get("iradio", radio[idx], "name"))
		{
			commands.push("uci delete iradio.@radio[" + idx + "]");
			commands.push("uci commit iradio");
			break;
		}
	}

	execute(commands)
}

function resetData()
{
	var TableData = []
	var radio = uciOriginal.getAllSectionsOfType("iradio", "radio")
	var idx;
	for(idx=0; idx < radio.length; idx++)
	{
		var rowData = []
		var name = uciOriginal.get("iradio", radio[idx], "name");
		var url = uciOriginal.get("iradio", radio[idx], "url");

		rowData.push(name + "\n" + url);
		rowData.push(createRemoveButton());
		rowData.push(createPlayButton());

		TableData.push(rowData)
	}

	var Table = createTable([ iradio.Radio, ""], TableData, "iradio_table", false, false)
	var tableContainer = document.getElementById("iradio_table_container");
	while(tableContainer.firstChild != null)
	{
		tableContainer.removeChild(tableContainer.firstChild);
	}
	tableContainer.appendChild(Table);
}

function stopMusic()
{
	var commands = [];
	var commands = [];
	commands.push("kill -9 $(pidof madplay) > /dev/null 2>&1");
	execute(commands)
}

function addSource()
{
	var srcName = document.getElementById("add_source_name").value
	var srcUrl  = document.getElementById("add_source_url").value

	var errors = []
	if(srcName.length == 0)
	{
		errors.push(iradio.SNamErr)
	}
	if(srcUrl.length == 0)
	{
		errors.push(iradio.SURLErr)
	}
	if(errors.length > 0)
	{
		alert( errors.join("\n") + "\n\n"+iradio.AddPSErr);
	}
	else
	{
		document.getElementById("add_source_name").value = ""
		document.getElementById("add_source_url").value = ""

		var commands = [];
		commands.push("uci add iradio radio");
		commands.push("uci set iradio.@radio[-1].name='" + srcName + "'");
		commands.push("uci set iradio.@radio[-1].url='" + srcUrl + "'");
		commands.push("uci commit iradio");

		execute(commands)
	}
}
