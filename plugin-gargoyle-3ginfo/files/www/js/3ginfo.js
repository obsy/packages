/*
 * This program is copyright © 2013 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
 * version 2.0 with a special clarification/exception that permits adapting the program to
 * configure proprietary "back end" software provided that all modifications to the web interface
 * itself remain covered by the GPL.
 * See http://gargoyle-router.com/faq.html#qfoss for more information
 */

var pkg = "3ginfo";

function resetData()
{
	var sec = uciOriginal.getAllSectionsOfType(pkg, "3ginfo");
	if (uciOriginal.get(pkg, sec[0], 'device') == "")
	{
		document.getElementById("nodevice").style.display = "block";
		document.getElementById("3ginfo").style.display = "none";
		return;
	}

	document.getElementById("nodevice").style.display = "none";
	document.getElementById("3ginfo").style.display = "block";

	setControlsEnabled(false, true, "Pobieranie danych");
	var param = getParameterDefinition("commands", 'uci set 3ginfo.@3ginfo[0].language=automat; /usr/share/3ginfo/cgi-bin/3ginfo.sh; uci revert 3ginfo\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var lines = req.responseText.split(/[\n\r]+/);

			setChildText("status", "-");
			setChildText("conn_time", "-");
			setChildText("rx", "-");
			setChildText("tx", "-");
			setChildText("mode", "-");
			setChildText("cops", "-");
			setChildText("cops_mcc", "-");
			setChildText("cops_mnc", "-");
			setChildText("csq_per", "-");
			setChildText("csq", "-");
			setChildText("csq_rssi", "-");
			setChildText("qos", "-");
			setChildText("lac", "-");
			setChildText("lcid", "-");
			setChildText("rnc", "-");
			setChildText("cid", "-");
			setChildText("device", "-");

			document.getElementById("qos_container").style.display = uciOriginal.get(pkg, sec[0], 'qos') == 1?"block":"none";

			for (var idx=0; idx<lines.length; idx++)
			{
				var arr = lines[idx].replace(/<.*?>/g, "").split(":");
				if (arr[0].match(/^status/))	{ setChildText("status", arr[1]); }
				if (arr[0].match(/^conn_time/))	{ setChildText("conn_time", arr[1]+":"+arr[2]+":"+arr[3]); }
				if (arr[0].match(/^rx/))	{ setChildText("rx", arr[1]); }
				if (arr[0].match(/^tx/))	{ setChildText("tx", arr[1]); }
				if (arr[0].match(/^mode/))	{ setChildText("mode", arr[1]); }
				if (arr[0].match(/^cops$/))	{ setChildText("cops", arr[1]); }
				if (arr[0].match(/^cops_mcc/))	{ setChildText("cops_mcc", arr[1]); }
				if (arr[0].match(/^cops_mnc/))	{ setChildText("cops_mnc", arr[1]); }
				if (arr[0].match(/^csq_per/))	{ setChildText("csq_per", arr[1]+"%"); }
				if (arr[0].match(/^csq$/))	{ setChildText("csq", arr[1]); }
				if (arr[0].match(/^csq_rssi/))	{ setChildText("csq_rssi", arr[1]+"dBm"); }
				if (arr[0].match(/^qos/))	{ setChildText("qos", arr[1]); }
				if (arr[0].match(/^lac/))	{ setChildText("lac", arr[1]); }
				if (arr[0].match(/^lcid/))
				{
					document.getElementById("lcid_container").style.display = arr[1].match(/- (-)/)?"block":"none";
					setChildText("lcid", arr[1]);
				}
				if (arr[0].match(/^rnc/))
				{
					document.getElementById("rnc_container").style.display = arr[1].match(/- (-)/)?"block":"none";
					setChildText("rnc", arr[1]);
				}
				if (arr[0].match(/^cid/))	{ setChildText("cid", arr[1]); }
				if (arr[0].match(/^device/))	{ setChildText("device", arr[1]); }
			}

			setControlsEnabled(true);
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}
