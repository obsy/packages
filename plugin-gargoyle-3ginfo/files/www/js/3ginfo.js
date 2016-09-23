/*
 * This program is copyright © 2016 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
 * version 2.0 with a special clarification/exception that permits adapting the program to
 * configure proprietary "back end" software provided that all modifications to the web interface
 * itself remain covered by the GPL.
 * See http://gargoyle-router.com/faq.html#qfoss for more information
 */

tginfoS = new Object();

var pkg = "3ginfo";

function resetData()
{
	var sec = uciOriginal.getAllSectionsOfType(pkg, "3ginfo");

	setSelectedValue('list_device', uciOriginal.get(pkg, sec[0], 'device'));

	if (uciOriginal.get(pkg, sec[0], 'device') == "")
	{
		document.getElementById("tgdata").style.display="none";
		return;
	}

	document.getElementById("tgdata").style.display="block";
	setControlsEnabled(false, true, tginfoS.DldingData);
	var param = getParameterDefinition("commands", '3ginfo json\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			setChildText("status", "-");
			setChildText("conn_time", "-");
			setChildText("rx", "-");
			setChildText("tx", "-");
			setChildText("mode", "-");
			setChildText("operator", "-");
			setChildText("operator_mcc", "-");
			setChildText("operator_mnc", "-");
			setChildText("signal", "-");
			setChildText("csq", "-");
			setChildText("rssi", "-");
			setChildText("lac", "-");
			setChildText("cid", "-");
			setChildText("tac", "-");
			setChildText("rscp", "-");
			setChildText("ecio", "-");
			setChildText("rsrp", "-");
			setChildText("rsrq", "-");
			setChildText("device", "-");

			var tmp = eval ("(" + req.responseText.replace(/Success/,"") + ")");

			if (tmp["status"] == "CONNECTED" ) { setChildText("status", tginfoS.Conn); }
			if (tmp["status"] == "DISCONNECTED" ) { setChildText("status", tginfoS.DisConn); }
			if (tmp["status"] == "NOINFO" ) { setChildText("status", tginfoS.NoInfo); }
			setChildText("conn_time", tmp["conn_time"]);
			setChildText("rx", tmp["iface_rx"]);
			setChildText("tx", tmp["iface_tx"]);
			setChildText("mode", tmp["mode"]);
			setChildText("operator", tmp["operator_name"]);
			setChildText("operator_mcc", tmp["operator_mcc"]);
			setChildText("operator_mnc", tmp["operator_mnc"]);
			setChildText("csq", tmp["csq"]);
			setChildText("rssi", tmp["rssi"] + "dBm");

			document.getElementById("lac_container").style.display = tmp["lac_hex"]=="-"?"none":"block";
			setChildText("lac", tmp["lac_hex"] + " (" + tmp["lac_dec"] + ")");

			document.getElementById("cid_container").style.display = tmp["cid_hex"]=="-"?"none":"block";
			setChildText("cid", tmp["cid_hex"] + " (" + tmp["cid_dec"] + ")");

			document.getElementById("tac_container").style.display = tmp["tac_hex"]=="-"?"none":"block";
			setChildText("tac", tmp["tac_hex"] + " (" + tmp["tac_dec"] + ")");

			document.getElementById("rscp_container").style.display = tmp["rscp"]=="-"?"none":"block";
			setChildText("rscp", tmp["rscp"] + "dBm");

			document.getElementById("ecio_container").style.display = tmp["ecio"]=="-"?"none":"block";
			setChildText("ecio", tmp["ecio"] + "dB");

			document.getElementById("rsrp_container").style.display = tmp["rsrp"]=="-"?"none":"block";
			setChildText("rsrp", tmp["rsrp"] + "dBm");

			document.getElementById("rsrq_container").style.display = tmp["rsrq"]=="-"?"none":"block";
			setChildText("rsrq", tmp["rsrq"] + "dB");

			setChildText("device", tmp["device"]);

			setGraph(tmp["signal"]);
			setControlsEnabled(true);
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function setGraph(signal)
{
	if (signal > 0) { setChildText("signal", signal + "%"); }
	document.getElementById("s100p").style.display = signal > 90?"block":"none";
	document.getElementById("s90p").style.display = signal > 80 && signal <= 90?"block":"none";
	document.getElementById("s80p").style.display = signal > 70 && signal <= 80?"block":"none";
	document.getElementById("s70p").style.display = signal > 60 && signal <= 70?"block":"none";
	document.getElementById("s60p").style.display = signal > 50 && signal <= 60?"block":"none";
	document.getElementById("s50p").style.display = signal > 40 && signal <= 50?"block":"none";
	document.getElementById("s40p").style.display = signal > 30 && signal <= 40?"block":"none";
	document.getElementById("s30p").style.display = signal > 20 && signal <= 30?"block":"none";
	document.getElementById("s20p").style.display = signal > 10 && signal <= 20?"block":"none";
	document.getElementById("s10p").style.display = signal >  0 && signal <= 10?"block":"none";
	document.getElementById("s0p").style.display = signal == 0?"block":"none";
}

function setDevice(device)
{
	setControlsEnabled(false, true, UI.Wait);
	var param = getParameterDefinition("commands", 'uci set 3ginfo.@3ginfo[0].device='+device+'\nuci commit 3ginfo\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
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
