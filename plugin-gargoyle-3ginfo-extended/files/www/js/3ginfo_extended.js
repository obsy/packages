/*
 * This program is copyright © 2016-2025 Cezary Jackiewicz and is distributed under the terms of the GNU GPL
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
	return '<div><li class="list-group-item"><span class="list-group-item-title">' + key + ':</span><span>' + value + '</span></li></div>';
}

function progress(param, value) {
	var min = 0;
	var max = 100;
	switch(param) {
		case 'rssi':
			min = -113;
			max = -51;
			break;
		case 'rsrp':
			min = -140;
			max = -44;
			break;
		case 'rsrq':
			min = -19;
			max = -3;
			break;
		case 'sinr':
			min = -20;
			max = 30;
			break;
		default:
			return '';
	}

	var pvalue = parseInt(value.split(' ')[0]);
	if (pvalue < min) { pvalue = min; }
	if (pvalue > max) { pvalue = max; }

	var style = ' class="progress-';
	var title = param.toUpperCase() + ' ' + value + ', ';
	switch(param) {
		case 'rssi':
			if (pvalue > -70) { style += 'green"'; title += tginfoS.SignalExcellent; }
			if (pvalue >= -85 && pvalue <= -70 ) { style += 'yellow"'; title += tginfoS.SignalGood; }
			if (pvalue >= -100 && pvalue <= -86 ) { style += 'orange"'; title += tginfoS.SignalFair; }
			if (pvalue < -100  ) { style += 'red"'; title += tginfoS.SignalPoor; }
			break;
		case 'rsrp':
			if (pvalue >= -80) { style += 'green"'; title += tginfoS.SignalExcellent; }
			if (pvalue >= -90 && pvalue < -80 ) { style += 'yellow"'; title += tginfoS.SignalGood; }
			if (pvalue >= -100 && pvalue < -90 ) { style += 'orange"'; title += tginfoS.SignalFair; }
			if (pvalue < -100  ) { style += 'red"'; title += tginfoS.SignalPoor; }
			break;
		case 'rsrq':
			if (pvalue >= -10) { style += 'green"'; title += tginfoS.SignalExcellent; }
			if (pvalue >= -15 && pvalue < -10 ) { style += 'yellow"'; title += tginfoS.SignalGood; }
			if (pvalue >= -20 && pvalue < -15 ) { style += 'orange"'; title += tginfoS.SignalFair; }
			if (pvalue < -20  ) { style += 'red"'; title += tginfoS.SignalPoor; }
			break;
		case 'sinr':
			if (pvalue >= 20) { style += 'green"'; title += tginfoS.SignalExcellent; }
			if (pvalue >= 13 && pvalue < 20 ) { style += 'yellow"'; title += tginfoS.SignalGood; }
			if (pvalue >= 0 && pvalue < 13 ) { style += 'orange"'; title += tginfoS.SignalFair; }
			if (pvalue < 0  ) { style += 'red"'; title += tginfoS.SignalPoor; }
			break;
	}

	pvalue -= min;
	var pmax = max - min;
	return '&nbsp;<progress' + style + ' title="' + title + '" value="' + pvalue + '" max="' + pmax + '">' + value + '</progress>';
}

function modeminfo(device)
{
	firstrun = false;
	setControlsEnabled(false, true, tginfoS.DldingData);
	var param = getParameterDefinition("commands", 'comgt -d ' + device + ' -s /usr/lib/gargoyle/3ginfo_extended/vendorproduct.gcom\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var tmp = req.responseText.replace(/Success/,"").split('\n');
			for (var idx = 0; idx < tmp.length; idx++) {
				if ((tmp[idx]).search(/CGMI[ ]*:/) > -1) {
					setChildText("vendor", tmp[idx].replace(/.*CGMI[ ]*:[ ]*/, ''));
				}
				if ((tmp[idx]).search(/CGMM[ ]*:/) > -1) {
					setChildText("product", tmp[idx].replace(/.*CGMM[ ]*:[ ]*/, ''));
				}
				if ((tmp[idx]).search(/CGMR[ ]*:/) > -1) {
					setChildText("revision", tmp[idx].replace(/.*CGMR[ ]*:[ ]*/, ''));
				}
				if ((tmp[idx]).search(/CGSN[ ]*:/) > -1) {
					setChildText("imei", tmp[idx].replace(/.*CGSN[ ]*:[ ]*/, ''));
				}
				if ((tmp[idx]).search(/CCID[ ]*:/) > -1) {
					setChildText("iccid", tmp[idx].replace(/.*CCID[ ]*:[ ]*/, ''));
				}
				if ((tmp[idx]).search(/CIMI[ ]*:/) > -1) {
					setChildText("imsi", tmp[idx].replace(/.*CIMI[ ]*:[ ]*/, ''));
				}
			}
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

	if (device == '')
	{
		document.getElementById("tgdata1").style.display = "none";
		document.getElementById("tgdata2").style.display = "none";
		document.getElementById("tgdata3").style.display = "none";
		return;
	}

	document.getElementById("tgdata1").style.display = "block";
	document.getElementById("tgdata2").style.display = "block";
	document.getElementById("tgdata3").style.display = "block";
	setControlsEnabled(false, true, tginfoS.DldingData);
	var param = getParameterDefinition("commands", '/usr/lib/gargoyle/3ginfo_extended/info.sh\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			var tmp = eval ("(" + req.responseText.replace(/Success/,"") + ")");
			if (!tmp["error"]) {
				var arrmodem = [];
				var mode = '';
				if (tmp.registration == '1' || tmp.registration == '5') {
					switch(tmp.registration) {
					case "0":
						arrmodem.push({'idx':1, 'key': tginfoS.SIMStatus, 'value': tginfoS.NoNetwork});
						break;
					case "1":
						arrmodem.push({'idx':1, 'key': tginfoS.SIMStatus, 'value': tginfoS.HomeNetwork});
						break;
					case "2":
						arrmodem.push({'idx':1, 'key': tginfoS.SIMStatus, 'value': tginfoS.Searching});
						break;
					case "3":
						arrmodem.push({'idx':1, 'key': tginfoS.SIMStatus, 'value': tginfoS.AccessDenied});
						break;
					case "5":
						arrmodem.push({'idx':1, 'key': tginfoS.SIMStatus, 'value': tginfoS.Roaming});
						break;
					case "6":
						arrmodem.push({'idx':1, 'key': tginfoS.SIMStatus, 'value': tginfoS.SMSHomeNetwork});
						break;
					case "7":
						arrmodem.push({'idx':1, 'key': tginfoS.SIMStatus, 'value': tginfoS.SMSRoaming});
						break;
					default:
						arrmodem.push({'idx':1, 'key': tginfoS.SIMStatus, 'value': tmp.registration == '' ? '-' : tmp.registration});
					}

					if (tmp.signal) {
						setGraph(tmp.signal);
						setChildText("operator", tmp.operator_name);
						var mode = tmp.mode;
						if (mode.toLowerCase().includes('lte') || mode.toLowerCase().includes('5g')) {
							if (mode.toLowerCase().includes('lte')) {
								mode = (tmp.mode).split(' ')[0];
							}
							if (mode.toLowerCase().includes('5g')) {
								mode = (tmp.mode).split(' ')[0] + ' ' + (tmp.mode).split(' ')[1];
							}
							var count = ((tmp.mode).match(/\//g) || []).length;
							if (count > 0) {
								mode += ' (' + (count + 1) + 'CA)';
							}
						}
						setChildText("mode", mode);
					} else {
						setGraph(0);
						setChildText("operator", "-");
						setChildText("mode", "-");
					}
 
					if (tmp.country) {
						arrmodem.push({'idx':18, 'key':'Country', 'value':tmp.country});
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
						arrmodem.push({'idx':20, 'key': tginfoS.BTSLoc, 'value': "<a href='http://www.btsearch.pl/szukaj.php?search=" + tmp.cid_dec + "&siec=-1&mode=std' target='_blank'>BTSeach</a>"});
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
					if (e.key == 'Temperature') {
						e.key = tginfoS.Temperature;
					}
					if (e.key == 'Country') {
						e.key = tginfoS.Country;
					}
					if (mode.search(/^LTE/) > -1) {
						if ((e.key).search(/RSSI/) > -1) {
							e.value += progress('rssi', e.value);
						}
						if (e.key.search(/RSRP/) > -1) {
							e.value += progress('rsrp', e.value);
						}
						if (e.key.search(/RSRQ/) > -1) {
							e.value += progress('rsrq', e.value);
						}
						if (e.key.search(/SINR/) > -1) {
							e.value += progress('sinr', e.value);
						}
					}
					html += parameter(e.key, e.value);
				});
				if (html == '') {
					html = '<em><span>' + tginfoS.NoInfo + '</spna></em>';
				}
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
	var param = getParameterDefinition("commands", 'uci set ' + pkg + '.@3ginfo[0].device=' + device + '\nuci commit ' + pkg + '\n') + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
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
