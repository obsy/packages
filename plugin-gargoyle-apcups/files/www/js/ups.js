/*
 * This program is copyright © 2013 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
 * version 2.0 with a special clarification/exception that permits adapting the program to
 * configure proprietary "back end" software provided that all modifications to the web interface
 * itself remain covered by the GPL.
 * See http://gargoyle-router.com/faq.html#qfoss for more information
 */

upsS = new Object();

function resetData()
{
	setControlsEnabled(false, true, upsS.DldingData);
	var param = getParameterDefinition("commands", 'apcaccess\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var lines = req.responseText.split(/[\n\r]+/);

			setChildText("model", "-");
			setChildText("status", "-");
			setChildText("bcharge", "-");
			setChildText("linev", "-");
			setChildText("loadpct", "-");
			setChildText("timeleft", "-");

			for (var idx=0; idx<lines.length; idx++)
			{
				var arr = lines[idx].split(":");
				if (arr[0].match(/^MODEL/)) 	{ setChildText("model",		arr[1]); }
				if (arr[0].match(/^STATUS/))	{ setChildText("status",	arr[1], arr[1] == ' ONLINE '?'green':'red'); }
				if (arr[0].match(/^BCHARGE/))	{ setChildText("bcharge",	arr[1].replace(/Percent/, upsS.Percent)); }
				if (arr[0].match(/^LINEV/))	{ setChildText("linev",		arr[1].replace(/Volts/, upsS.Volts)); }
				if (arr[0].match(/^LOADPCT/))	{ setChildText("loadpct",	arr[1].replace(/Percent Load Capacity/, upsS.Percent).replace(/Percent/, upsS.Percent)); }
				if (arr[0].match(/^TIMELEFT/))	{ setChildText("timeleft",	arr[1].replace(/Minutes/, UI.minutes)); }
			}

			setControlsEnabled(true);
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}
