/*
 * This program is copyright © 2016 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
 * version 2.0 with a special clarification/exception that permits adapting the program to
 * configure proprietary "back end" software provided that all modifications to the web interface
 * itself remain covered by the GPL.
 * See http://gargoyle-router.com/faq.html#qfoss for more information
 */

tginfoS = new Object();

var pkg = "3ginfo";

function sortJSON(data, key, way) {
	return data.sort(function(a, b) {
		var x = a[key]; var y = b[key];
		if (way === 'asc' ) { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
		if (way === 'desc') { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
	});
}

function parameter(key, value) {
	return '<div><li class="list-group-item"><span class="list-group-item-title">' + key + '</span><span>' + value + '</span></li></div>';
}

function modeminfo(device)
{
	firstrun = false;
	setControlsEnabled(false, true, tginfoS.DldingData);
	var param = getParameterDefinition("commands", 'comgt -d ' + device + ' -s /usr/lib/gargoyle/3ginfo-extended/vendorproduct.gcom\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var tmp = req.responseText.replace(/Success/,"").split('\n');
			for (var idx = 0; idx < tmp.length; idx++) {
				if ((tmp[idx]).search(/CGMI[ ]*:/) > 0) {
					console.log(tmp[idx]);
					setChildText("vendor", tmp[idx].replace(/.*CGMI[ ]*:[ ]*/, ""));
				} 
				if ((tmp[idx]).search(/CGMM[ ]*:/) > 0) {
					console.log(tmp[idx]);
					setChildText("product", tmp[idx].replace(/.*CGMM[ ]*:[ ]*/, ""));
				} 
				if ((tmp[idx]).search(/CGMR[ ]*:/) > 0) {
					console.log(tmp[idx]);
					setChildText("revision", tmp[idx].replace(/.*CGMR[ ]*:[ ]*/, ""));
				} 
				if ((tmp[idx]).search(/CGSN[ ]*:/) > 0) {
					console.log(tmp[idx]);
					setChildText("imei", tmp[idx].replace(/.*CGSN[ ]*:[ ]*/, ""));
				} 
				if ((tmp[idx]).search(/CCID[ ]*:/) > 0) {
					console.log(tmp[idx]);
					setChildText("iccid", tmp[idx].replace(/.*CCID[ ]*:[ ]*/, ""));
				} 
			}			

//			T=$(echo "$O" | awk '/CGMI:/{gsub(/.*CGMI[ ]*:[ ]*/,"");gsub(/"/,"");print $0}')
			//[ -n "$T" ] && VENDOR="$T"
//			T=$(echo "$O" | awk '/CGMM:/{gsub(/.*CGMM[ ]*:[ ]*/,"");gsub(/"/,"");print $0}')
//			[ -n "$T" ] && PRODUCT="$T"
//			T=$(echo "$O" | awk '/CGMR:/{gsub(/.*CGMR[ ]*:[ ]*/,"");gsub(/"/,"");print $0}')
//			[ -n "$T" ] && REVISION="$T"
			//T=$(echo "$O" | awk '/CGSN:/{gsub(/.*CGSN[ ]*:[ ]*/,"");gsub(/"/,"");print $0}')
//			[ -n "$T" ] && IMEI="$T"
			//T=$(echo "$O" | awk '/CCID:/{gsub(/.*CCID[ ]*:[ ]*/,"");gsub(/"/,"");print $0}')
			//[ -n "$T" ] && ICCID="$T"
//		fi
	

//			setValue('modem_vendor', data.modem.vendor == '' ? '-' : data.modem.vendor);
//			setValue('modem_model', data.modem.product == '' ? '-' : data.modem.product);
//			setValue('modem_revision', data.modem.revision == '' ? '-' : data.modem.revision);
//			setValue('modem_imei', data.modem.imei == '' ? '-' : data.modem.imei);
//			setValue('modem_iccid', data.modem.iccid == '' ? '-' : data.modem.iccid);

			setControlsEnabled(true);
		}
	}
	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}

function resetData()
{
	var sec = uciOriginal.getAllSectionsOfType(pkg, "3ginfo");

	var device = uciOriginal.get(pkg, sec[0], 'device')
	setSelectedValue('list_device', device);

	if (device == "")
	{
		document.getElementById("tgdata1").style.display="none";
		document.getElementById("tgdata2").style.display="none";
		document.getElementById("tgdata3").style.display="none";
		return;
	}

	document.getElementById("tgdata1").style.display="block";
	document.getElementById("tgdata2").style.display="block";
	document.getElementById("tgdata3").style.display="block";
	setControlsEnabled(false, true, tginfoS.DldingData);
	var param = getParameterDefinition("commands", '/usr/lib/gargoyle/3ginfo-extended/info.sh\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var tmp = eval ("(" + req.responseText.replace(/Success/,"") + ")");
			if (!tmp["error"]) {
				var arrmodem = [];
				if (tmp.registration == '1' || tmp.registration == '5') {
					switch(tmp.registration) {
					case "0":
						arrmodem.push({'idx':1, 'key': 'Status karty SIM', 'value': 'Brak sieci'});
						break;
					case "1":
						arrmodem.push({'idx':1, 'key': 'Status karty SIM', 'value': 'Zalogowana do sieci macierzystej'});
						break;
					case "2":
						arrmodem.push({'idx':1, 'key': 'Status karty SIM', 'value': 'Wyszukiwanie operatora'});
						break;
					case "3":
						arrmodem.push({'idx':1, 'key': 'Status karty SIM', 'value': 'Odmowa dostępu'});
						break;
					case "5":
						arrmodem.push({'idx':1, 'key': 'Status karty SIM', 'value': 'Zalogowana do sieci w roamingu'});
						break;
					default:
						arrmodem.push({'idx':1, 'key': 'Status karty SIM', 'value': tmp.registration == '' ? '-' : tmp.registration});
					}

					if (tmp.signal) {
						setGraph(tmp.signal);
						setChildText("operator", tmp.operator_name);
						setChildText("mode", (tmp.mode).split(" ")[0]);
					} else {
						setGraph(0);
						setChildText("operator", "-");
						setChildText("mode", "-");
					}
 
					if (tmp.operator_mcc && tmp.operator_mcc != '' && tmp.operator_mnc && tmp.operator_mnc != '') {
						arrmodem.push({'idx':19, 'key':'MCC MNC', 'value':tmp.operator_mcc + ' ' + tmp.operator_mnc});
					}
					if (tmp.lac_dec && tmp.lac_dec > 0) {
						arrmodem.push({'idx':22, 'key':'LAC', 'value':tmp.lac_dec + ' (' + tmp.lac_hex + ')'});
					}
					if (tmp.cid_dec && tmp.cid_dec > 0) {
						arrmodem.push({'idx':21, 'key':'Cell ID', 'value':tmp.cid_dec + ' (' + tmp.cid_hex + ')'});
					}

					if (tmp.cid_dec && tmp.cid_dec > 0 && tmp.operator_mcc == 260) {
						arrmodem.push({'idx':20, 'key':'Lokalizacja stacji bazowej', 'value': "<a href='http://www.btsearch.pl/szukaj.php?search=" + tmp.cid_dec + "&siec=-1&mode=std' target='_blank'>link</a>"});
					}
				} else {
					setGraph(0);
					setChildText("operator", "-");
					setChildText("mode", "-");
					setChildText("signal", "-");
				}

				if (tmp.addon) {
					arrmodem = arrmodem.concat(tmp.addon);
				}

				var html = '';
				var sorted = sortJSON(arrmodem, 'idx', 'asc');
				sorted.forEach(function(e) {
					html += parameter(e.key, e.value);
				});
				document.getElementById('tgdataparameters').innerHTML = html;
			}
			setControlsEnabled(true);
			if (firstrun) {
				modeminfo(device);
			}
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
