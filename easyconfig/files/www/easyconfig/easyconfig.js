/*****************************************************************************/

function setCookie(cname, cvalue) {
	var d = new Date();
	d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
	document.cookie = cname + "=" + cvalue + ";" + "expires="+d.toUTCString() + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function darkmode() {
	var e = document.body;
	e.classList.toggle('darkmode');
	setCookie('easyconfig_darkmode', e.classList.contains('darkmode') ? '1' : '0');
}

function showicon() {
	feather.replace({'width':18, 'height':18});
}

function easyconfig_onload() {
	showicon();
	if (getCookie('easyconfig_darkmode') == '1') { darkmode(); }
}

function string2color(str) {
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	var color = '#';
	for (var i = 0; i < 3; i++) {
		var value = (hash >> (i * 8)) & 0xFF;
		color += ('00' + value.toString(16)).substr(-2);
	}
	return color;
}

function rgb2hex(rgb) {
	if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	function hex(x) {
		return ("0" + parseInt(x).toString(16)).slice(-2);
	}
	return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function escapeShell(value) {
	value = value.replace(/\\/g, '\\\\\\\\');
	value = value.replace(/\$/g, '\\\\$');
	value = value.replace(/"/g, '\\\\\\"');
	return value;
}

function formatDateTime(s) {
	if (s.length == 14) {
		return s.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1-$2-$3 $4:$5:$6");
	} else if (s.length == 12) {
		return s.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1-$2-$3 $4:$5");
	} else if (s.length == 8) {
		return s.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
	} else if (s.length == 6) {
		return s.replace(/(\d{4})(\d{2})/, "$1-$2");
	}
	return s;
}

/*****************************************************************************/

function proofreadHost(input) {
	proofreadText(input, validateHost, 0);
}

function proofreadIp(input) {
	proofreadText(input, validateIP, 0);
}

function proofreadText(input, proofFunction, validReturnCode) {
	if (input.disabled != true) {
		var e = input.closest('div');
		if (proofFunction(input.value) == validReturnCode) {
			input.style.color = null;
			removeClasses(e, ['has-error']);
		} else {
			input.style.color = 'red';
			addClasses(e, ['has-error']);
		}
	}
}

function proofreadLengthRange(input, min, max) {
	proofreadText(input, function(text){return validateLengthRange(text,min,max)}, 0);
}

function proofreadNumericRange(input, min, max) {
	proofreadText(input, function(text){return validateNumericRange(text,min,max)}, 0);
}

function proofreadNumeric(input) {
	proofreadText(input, function(text){return validateNumeric(text)}, 0);
}

function proofreadFloat(input) {
	proofreadText(input, function(text){return validateFloat(text)}, 0);
}

function proofreadussd(input) {
	proofreadText(input, validateussd, 0);
}

function validateHost(name) {
	var errorCode = 0;

	if (name == "") {
		errorCode = 1;
	} else if (name.match(/[^a-zA-Z0-9.\-]/) !== null) {
		errorCode = 2;
	}
	return errorCode;
}

function validateIP(address) {
	var errorCode = 0;
	if ((address == "0.0.0.0") || (address == "255.255.255.255")) {
		errorCode = 1;
	} else {
		var ipFields = address.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
		if (ipFields == null) {
			errorCode = 1;
		} else {
			for (field=1; field <= 4; field++) {
				if ((ipFields[field] > 255) || (ipFields[field] == 255 && field==4)) {
					errorCode = 1;
				}
			}
		}
	}
	return errorCode;
}

function validateLengthRange(text, min, max) {
	var errorcode = 0;
	if(text.length < min) {
		errorcode = 1;
	}
	if(text.length > max) {
		errorcode = 2;
	}
	return errorcode;
}

function validateNumericRange(num, min, max) {
	var errorCode = num.match(/^[\d]+$/) == null ? 1 : 0;
	if (errorCode == 0) {
		errorCode = num < min ? 2 : 0;
	}
	if (errorCode == 0) {
		errorCode = num > max ? 3 : 0;
	}
	return errorCode;
}

function validateNumeric(num) {
	return num.match(/^[\d]+$/) == null ? 1 : 0;
}

function validateFloat(num) {
	var floatRegex = /^-?\d+(?:[.]\d*?)?$/;
	if (!floatRegex.test(num))
		return 1;

	var val = parseFloat(num);
	if (isNaN(val))
		return 1;
	return 0;
}

function validateussd(name) {
	var errorCode = 0;

	if (name == "") {
		errorCode = 1;
	} else if (name.match(/[^0-9\*#]/) !== null) {
		errorCode = 2;
	}
	return errorCode;
}

function getLabelText(element) {
	labels = document.getElementsByTagName('LABEL');
	for (var i = 0; i < labels.length; i++) {
		if (labels[i].htmlFor != '') {
			if (labels[i].htmlFor == element)
				return labels[i].innerText;
		}
	}
	return "???";
}

function checkField(element, proofFunction) {
	if (proofFunction(getValue(element)) != 0) {
		showMsg("Błąd w polu " + getLabelText(element), true);
		return true;
	}
	return false;
}

function checkFieldAllowEmpty(element, proofFunction) {
	var val = getValue(element);
	if (proofFunction(val) != 0) {
		if (val != "") {
			showMsg("Błąd w polu " + getLabelText(element), true);
			return true;
		}
	}
	return false;
}

function createRowForModal(key, value) {
	return '<div class="row"><label class="col-xs-5 col-sm-6 text-right">' + key + '</label><div class="col-xs-7 col-sm-6 text-left"><p>' + value + '</p></div></div>';
}

function createRow4ColForModal(key, value1, value2, value3) {
	return '<div class="row">' +
		'<label class="col-xs-3 text-right">' + key + '</label>' +
		'<div class="col-xs-3 text-left"><p>' + value1 + '</p></div>' +
		'<div class="col-xs-3 text-left"><p>' + value2 + '</p></div>' +
		'<div class="col-xs-3 text-left"><p>' + value3 + '</p></div>' +
		'</div>';
}

/*****************************************************************************/

var modal;

function showPassword(element) {
	var e = document.getElementById(element);
	e.type = (e.type=='password') ? 'text' : 'password';
}

function removeOptions(element) {
	var e = document.getElementById(element);
	for (var idx = e.options.length - 1 ; idx >= 0 ; idx--) {
		e.remove(idx);
	}
}

function cleanField(element) {
	document.getElementById(element).value = "";
}

function setValue(element, value) {
	var e = document.getElementById(element);
	if (e.tagName == "SELECT") {
		for (var i = 0; i < e.options.length; i++) {
			if (e.options[i].value == value) {
				e.selectedIndex = i;
				break;
			}
		}
	} else if (e.tagName == "P") {
		e.innerHTML = value;
	} else if (e.tagName == "H3") {
		e.innerHTML = value;
	} else if (e.tagName == "SPAN") {
		e.innerHTML = value;
	} else if (e.tagName == "DIV") {
		e.innerHTML = value;
	} else if (e.type === 'checkbox') {
		e.checked = value;
	} else if (e.type === 'radio') {
		e.checked = value;
	} else {
		e.value = value;
	}
}

function getValue(element) {
	var e = document.getElementById(element);
	if (e.tagName == "SELECT") {
		return e.options[e.selectedIndex].value;
	} else if (e.tagName == "SPAN") {
		return e.innerHTML;
	} else if (e.type === 'checkbox') {
		return e.checked;
	} else if (e.type === 'radio') {
		return e.checked;
	} else {
		return e.value;
	}
}

function setDisplay(element, show) {
	document.getElementById(element).style.display = (show?"block":"none");
}

function addClasses(element, classes) {
	for (var i = 0; i < classes.length; i++) {
		if (!element.className.match(new RegExp('(?:^|\\s)' + classes[i] + '(?!\\S)', 'g')))
			element.className += " " + classes[i];
	}
}

function removeClasses(element, classes) {
	for (var i = 0; i < classes.length; i++) {
		element.className = element.className.replace(new RegExp('(?:^|\\s)' + classes[i] + '(?!\\S)', 'g'), '');
	}
}

/*****************************************************************************/

function enableDns(value) {
	setElementEnabled("wan_dns1", (value === "custom"), false);
	setElementEnabled("wan_dns2", (value === "custom"), false);

	var e1 = document.getElementById("wan_dns");
	var url = e1.options[e1.selectedIndex].getAttribute("data-url")
	document.getElementById("wan_dns_url").setAttribute("href", url);
	setElementEnabled("wan_dns_url", (url!=""), false);
}

function okdetectwan() {
	var data = JSON.parse(getValue('dialog_val'));

	var cmd = [];
	cmd.push('uci -q del network.wan');
	cmd.push('uci set network.wan=interface');

	if (data.proto == '3g' || data.proto == 'qmi' || data.proto == 'ncm') {
		cmd.push('uci set network.wan.proto=' + data.proto);
		cmd.push('uci set network.wan.device=\\\"' + data.device + '\\\"');
		cmd.push('uci set network.wan.apn=\\\"' + data.apn + '\\\"');
		cmd.push('uci set network.wan.pincode=' + data.pincode);
	}
	if (data.proto == 'dhcp_hilink' || data.proto == 'dhcp') {
		cmd.push('uci set network.wan.proto=dhcp');
		cmd.push('uci set network.wan.ifname=' + data.ifname);
	}

	cmd.push('uci commit network');
	cmd.push('ifup wan');

	execute(cmd, showsettings);
}

function canceldetectwan_pin() {
	setDisplay('div_detectwan_pin', false);
}

function okdetectwan_pin() {
	canceldetectwan_pin();

	if (validateNumeric(getValue('detectwan_pin')) != 0) {
		showMsg("Podany PIN nie jest odpowiednią wartością");
	} else {
		var pin = getValue('detectwan_pin');
		ubus_call('"easyconfig", "pincode", {"proto":"' + getValue('detectwan_proto') + '","device":"' + getValue('detectwan_device') + '","pincode":"' + pin + '"}', function(data) {
			detectwan(pin);
		});
	}
}

function detectwan(pin) {
	ubus_call('"easyconfig", "detect_wan", {}', function(data) {
		if (data.action) {
			if (data.action == 'pinrequired') {
				setValue('detectwan_proto', data.proto);
				setValue('detectwan_device', data.device);
				setDisplay('div_detectwan_pin', true);
				document.getElementById('detectwan_pin').focus();
			}
		} else {
			data.pincode = pin;
			if (data.proto == 'none') {
				showMsg('Nie wykryto żadnego dostępnego połączenia z internetem');
				return;
			}
			msg = '';
			msg += '<div class="row space"><div class="col-xs-12 text-center">Proponowane ustawienia<hr></div></div>';
			msg += '<div class="row space">';
			msg += '<div class="col-xs-6 text-right">Typ połączenia</div>';
			if (data.proto == 'dhcp' || data.proto == 'dhcp_hilink') {
				msg += '<div class="col-xs-6 text-left">' + wan[data.proto] +  '</div>';
			}
			if (data.proto == '3g' || data.proto == 'qmi' || data.proto == 'ncm') {
				msg += '<div class="col-xs-6 text-left">' + wan[data.proto] +  '</div>';
				msg += '</div>';
				msg += '<div class="row space">';
				msg += '<div class="col-xs-6 text-right">Urządzenie</div>';
				msg += '<div class="col-xs-6 text-left">' + data.device + '</div>';
				msg += '</div>';
				msg += '<div class="row space">';
				msg += '<div class="col-xs-6 text-right">APN</div>';
				msg += '<div class="col-xs-6 text-left">' + data.apn + '</div>';
			}
			msg += '</div>';
			msg += '<div class="row"><div class="col-xs-12 text-center"><hr>Zapisać zmiany?</div></div>';
			setValue('dialog_val', JSON.stringify(data));
			showDialog(msg, 'Nie', 'Tak', okdetectwan);
		}
	});
}

function enableWan(proto) {

	if (proto == "detect") {
		var proto = document.getElementById('wan_proto').getAttribute("data-prev");
		setValue('wan_proto', proto);
		detectwan('');
		return;
	}

	var fields = [];
	if (proto == "static") {
		fields = ["wan_ipaddr","wan_netmask","wan_gateway","wan_dns1","wan_dns2"];
	}
	if ((proto == "3g") || (proto == "qmi") || (proto == "ncm")) {
		fields=["wan_apn","wan_device","wan_pincode","wan_modem_mode"];

		removeOptions('wan_modem_mode');
		var t;
		if (proto == '3g') {
			t = {"":"Wg ustawień modemu","umts":"Wybór automatyczny 3G/2G","umts_only":"Tylko 3G (HSPA/UMTS)","gprs_only":"Tylko 2G (EDGE/GSM)"};
		}
		if (proto == 'qmi') {
			t = {"":"Wg ustawień modemu","all":"Wybór automatyczny 4G/3G/2G","lte":"Tylko 4G (LTE A/LTE)","umts":"Tylko 3G (HSPA/UMTS)","gsm":"Tylko 2G (EDGE/GSM)"};
		}
		if (proto == 'ncm') {
			t = {"":"Wg ustawień modemu","auto":"Wybór automatyczny 4G/3G/2G","lte":"Tylko 4G (LTE)","umts":"Tylko 3G (HSPA/UMTS)","gsm":"Tylko 2G (EDGE/GSM)"};
		}
		e = document.getElementById('wan_modem_mode');
		for (key in t) {
			var opt = document.createElement('option');
			opt.value = key;
			opt.innerHTML = t[key];
			e.appendChild(opt);
		}
	}
	if (proto != "static" && proto != "dhcp" && config.wan_ifname_default !== "") {
		fields.push("wan_wanport");
	}

	var all = ["wan_ipaddr","wan_netmask","wan_gateway","wan_dns","wan_dns_url","wan_dns1","wan_dns2","wan_pincode","wan_device","wan_apn","wan_dashboard_url","wan_modem_mode","wan_wanport"];
	for (var idx = 0; idx < all.length; idx++) {
		setElementEnabled(all[idx], false, false);
	}
	for (var idx = 0; idx < fields.length; idx++) {
		setElementEnabled(fields[idx], true, false);
	}
	if (proto != 'static' && proto != 'none') {
		var t = ([config.wan_dns1,config.wan_dns2]).sort().filter(function (val) {return val;}).join(',');

		if (config.wan_dns_source == 'stubby') {
			setValue('wan_dns', 'stubby');
		} else if (t == '' || config.wan_dns_source == 'dhcp') {
			setValue('wan_dns', 'isp');
		} else {
			setValue('wan_dns', 'custom');
			for (var idx = 0; idx < dns.length; idx++) {
				var ip = (dns[idx].ip).sort();
				if (ip == t) {
					setValue('wan_dns', t);
					break;
				}
			}
		}
		setElementEnabled('wan_dns', true, false);
		enableDns(getValue('wan_dns'));
	}

	setElementEnabled("firewall_dmz", (proto != "none"), false);

	setDisplay("div_status_wan", (proto != "none"));
	setCookie("easyconfig_status_wan", (proto != "none"?"1":"0"));
	document.getElementById("wan_proto").setAttribute("data-prev", getValue("wan_proto"));

	if (proto == "dhcp_hilink" && config.wan_ifname == config.wan_ifname_hilink && config.wan_dashboard_url) {
		document.getElementById("wan_dashboard_url").setAttribute("href", config.wan_dashboard_url);
		setElementEnabled("wan_dashboard_url", true, false);
	}
}

function enableWlanEncryption(encryption, idx) {
	setElementEnabled('wlan_key' + idx, (encryption != 'none' && encryption != ''), false);
}

function enableWlanTXPower(channel, idx) {
	setDisplay('div_wlan_txpower' + idx, (channel != 0));
}

/*****************************************************************************/

function setElementEnabled(element, show, disabled) {
	var e = document.getElementById(element);
	if (show) {
		e.disabled = disabled;
		e.readonly = disabled;
	} else {
		e.disabled = true;
	}
	setDisplay('div_' + element, show);
}

function showMsg(msg, error) {
	closeMsg();

	if (!msg || 0 === msg.length) { msg = 'Proszę czekać...'; }
	var e = document.getElementById('msgtxt');
	e.innerHTML = msg;

	if (error) {
		e.style.color = 'red';
		addClasses(e, ['has-error']);
	} else {
		e.style.color = null;
		removeClasses(e, ['has-error']);
	}

	modal = document.getElementById('div_msg');
	modal.style.display = 'block';

	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = 'none';
		}
	}
}

function closeMsg() {
	if (modal) { modal.style.display = 'none'; }
}

function showDialog(msg, default_value, primary_value, primary_callback) {
	setValue('dialog_msg', msg);
	var e = document.getElementById('dialog_btn_default');
	e.value = default_value;
	e.onclick = function(){ setDisplay('div_dialog', false); }
	e = document.getElementById('dialog_btn_primary');
	e.value = primary_value;
	e.onclick = function(){ setDisplay('div_dialog', false); primary_callback(); }
	setDisplay('div_dialog', true);
}

var config;
var counter = 0;
var token = "00000000000000000000000000000000";
var expires;
var timeout;

var ubus = function(param, successHandler, errorHandler, showWait) {
//console.log(param);

	if (showWait) {
		showMsg();
	}
	counter++;
	param='{ "jsonrpc": "2.0", "id": '+counter+', "method": "call", "params": [ "'+token+'", '+param+' ] }';

	var xhr = typeof XMLHttpRequest != 'undefined'
		? new XMLHttpRequest()
		: new ActiveXObject('Microsoft.XMLHTTP');
	var responseTypeAware = 'responseType' in xhr;
	xhr.open('post', window.location.origin + '/ubus', true);
	xhr.setRequestHeader("Content-Type", "application/json");

	if (responseTypeAware) {
		try {
			xhr.responseType = 'json';
		} catch(error) {
			responseTypeAware = false;
		}
	}
	xhr.onreadystatechange = function() {
		var status = xhr.status;
		if (xhr.readyState == 4) {
			if (showWait) {
				closeMsg();
			}
			if (status == 200) {
				successHandler && successHandler(
					responseTypeAware
					? xhr.response
					: JSON.parse(xhr.responseText)
				);
			} else {
				errorHandler && errorHandler(status);
			}
		}
	}
	xhr.send(param);
}

function ubus_error(error) {
	closeMsg();
	if (error == -32002) {
		document.getElementById("system_password").focus();
		location.reload();
	} else {
		showMsg("Błąd pobierania danych!", true);
	}
}

function ubus_call(param, callback)
{
	ubus(param, function(data) {
//console.log(JSON.stringify(data, null, 4));
		if (data.error) {
			ubus_error(data.error.code);
		} else {
			if (data.result[0] === 0) {

				if (expires) {
					clearTimeout(expires);
					expires = setTimeout(function(){ document.getElementById("system_password").focus(); location.reload(); }, timeout * 1000);
				}

				callback(data.result[1]);
			} else {
				showMsg("Błąd pobierania danych!", true);
			}
		}
	}, function(status) {
		showMsg("Błąd pobierania danych!", true);
	}, true);
}

function ubus_call_noerror(param, callback) {
	ubus(param, function(data) {
		if (data.error) {
			ubus_error(data.error.code);
		} else {
			if (data.result[0] === 0) {

				if (expires) {
					clearTimeout(expires);
					expires = setTimeout(function(){ document.getElementById("system_password").focus(); location.reload(); }, timeout * 1000);
				}

				callback(data.result[1]);
			} else {
				showMsg("Błąd pobierania danych!", true);
			}
		}
	}, function(status) {
		var data = {killed:1};
		callback(data);
	}, true);
}

function ubus_call_nomsg(param, callback) {
	ubus(param, function(data) {
		if (data.error) {
		} else {
			if (data.result[0] === 0) {

				if (expires) {
					clearTimeout(expires);
					expires = setTimeout(function(){ document.getElementById("system_password").focus(); location.reload(); }, timeout * 1000);
				}

				callback(data.result[1]);
			}
		}
	}, null, false);
}

function execute(cmd, callback) {
	cmd.unshift('#!/bin/sh');
	cmd.push('rm -- \\\"$0\\\"');
	cmd.push('exit 0');
	cmd.push('');

	var filename = '/tmp/' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 9);
	ubus_call('"file", "write", {"path":"' + filename + '","data":"' + cmd.join('\n') + '"}', function(data) {
		ubus_call('"file", "exec", {"command":"sh", "params":["' + filename + '"]}', function(data1) {
			callback();
		});
	});
}

/*****************************************************************************/

function login()
{
	var system_user = getValue('system_login');
	var system_pass = getValue('system_password');

	ubus('"session", "login", { "username": "' + system_user + '", "password": "' + (system_pass).replace(/\\/g, '\\\\').replace(/"/g,'\\\"') + '" }', function(data) {
		if (data.error) {
			ubus_error(data.error.code);
		} else {
			if (data.result[0] === 0) {
				token = data.result[1].ubus_rpc_session;

				if (expires) {clearTimeout(expires);}
				expires = setTimeout(function(){ location.reload(); }, data.result[1].expires * 1000);
				timeout = data.result[1].timeout;

				setDisplay('div_login', false);
				setDisplay('div_content', true);
				setDisplay('div_security', (system_pass == '12345678'));

				if (getCookie('easyconfig_status_wan') === '1') {
					setDisplay('div_status_wan', true);
				}
				if (getCookie('easyconfig_status_modem') === '1') {
					setDisplay('div_status_modem', true);
					setDisplay('div_system_modem', true);
				}

				showsettings();
				showstatus();
			} else {
				showMsg('Błąd logowania!', true);
				setTimeout(function(){ closeMsg(); }, 3000);
			}
		}
	}, function(status) {
		showMsg('Błąd logowania!', true);
		setTimeout(function(){ closeMsg(); }, 3000);
	}, true);
}

/*****************************************************************************/

function findClosestChannel(findmin, channel, wlan_channels) {
	if (wlan_channels.hasOwnProperty(channel)) {
		return channel;
	}
	var closestValue = 0;
	for (var t in wlan_channels) {
		if (findmin) {
			if (t > channel) {
				closestValue = t;
				break;
			}
		} else {
			if (t < channel) {
				closestValue = t;
			} else {
				break;
			}
		}
	}
	return closestValue;
}

function showsettings() {
	ubus_call('"easyconfig", "config", {}', showcallback);
}

var wan = [];
wan['none'] = 'Brak';
wan['dhcp'] = 'Port WAN (DHCP)';
wan['static'] = 'Port WAN (Statyczny IP)';
wan['3g'] = 'Modem USB (RAS)';
wan['qmi'] = 'Modem USB (QMI)';
wan['ncm'] = 'Modem USB (NCM)';
wan['dhcp_hilink'] = 'Modem USB (HiLink lub RNDIS)';
wan['-'] = " ";
wan['detect'] = 'Wykryj...';

function showcallback(data) {
	config = data;

//console.log(config);

	// wan
	removeOptions('wan_proto');
	var e = document.getElementById('wan_proto');
	var arr = config.wan_protos;
	arr.push('-');
	arr.push('detect');
	for (var idx = 0; idx<arr.length; idx++) {
		var opt = document.createElement('option');
		opt.value = arr[idx];
		opt.innerHTML = wan[arr[idx]];
		if (arr[idx] == '-') { opt.disabled = true; }
		e.appendChild(opt);
	}

	removeOptions('wan_device');
	e = document.getElementById('wan_device');
	var arr = config.wan_devices;
	for (var idx = 0; idx<arr.length; idx++) {
		var opt = document.createElement('option');
		opt.value = arr[idx];
		opt.innerHTML = arr[idx];
		e.appendChild(opt);
	}

	removeOptions('wan_dns');
	var sorteddns = [];
	sorteddns = sortJSON(dns, 'name', 'asc');
	sorteddns = [{"ip":["isp"],"name":"Otrzymane od dostawcy","url":""},{"ip":["custom"],"name":"Inne","url":""}].concat(sorteddns);
	if (config.services.stubby) {
		sorteddns = [{"ip":["stubby"],"name":"DNS over TLS","url":""}].concat(sorteddns);
	}
	e = document.getElementById('wan_dns');
	for (var idx = 0; idx < sorteddns.length; idx++) {
		var opt = document.createElement('option');
		opt.value = (sorteddns[idx].ip).sort();
		opt.innerHTML = sorteddns[idx].name;
		opt.setAttribute('data-url', sorteddns[idx].url);
		e.appendChild(opt);
	}

	setValue('wan_ipaddr', config.wan_ipaddr);
	setValue('wan_netmask', config.wan_netmask);
	setValue('wan_gateway', config.wan_gateway);
	setValue('wan_apn', config.wan_apn);
	setValue('wan_device', config.wan_device);
	setValue('wan_pincode', config.wan_pincode);
	setValue('wan_dns1', config.wan_dns1);
	setValue('wan_dns2', config.wan_dns2);
	setValue('wan_proto', config.wan_proto);
	setValue('wan_wanport', (config.wan_wanport == 'bridge'));
	if (config.wan_proto == 'dhcp') {
		if (config.wan_ifname == config.wan_ifname_hilink) {
			setValue('wan_proto', 'dhcp_hilink');
		}
	}
	enableWan(getValue('wan_proto'));
	setValue('wan_modem_mode', config.wan_modem_mode);

	// lan
	setValue('lan_ipaddr', config.lan_ipaddr);
	setValue('lan_dhcp_enabled', config.lan_dhcp_enabled);
	setValue('lan_forcedns', config.lan_forcedns);
	setValue('dhcp_logqueries', config.dhcp_logqueries);
	setDisplay('menu_queries', config.dhcp_logqueries);

	// wlan
	var t = '';
	for (var idx = 0; idx < (config.wlan_current_channels).length; idx++) {
		var o = config.wlan_current_channels[idx];
		for (var idx1 = 0; idx1 < (config.wlan_devices).length; idx1++) {
			var wlan_channels = config[config.wlan_devices[idx1]].wlan_channels;
			if (wlan_channels.hasOwnProperty(o.channel)) {
				o.min = findClosestChannel(true, o.min, wlan_channels);
				o.max = findClosestChannel(false, o.max, wlan_channels);
				break;
			}
		}
		if (t != '') { t += ', '; }
		t += o.channel + ' (' + o.min + ' - ' + o.max + ')';
	}
	setValue('wlan_current_channels', t == '' ? '-' : t);
	var is_radio2 = false;
	var is_radio5 = false;
	var enc = [];
	enc['none'] = 'Brak';
	enc['psk'] = 'WPA Personal';
	enc['psk2'] = 'WPA2 Personal';
	if (config.services.sae) {
		enc['sae-mixed'] = 'WPA2/WPA3 Personal';
		enc['sae'] = 'WPA3 Personal';
	}
	var radios = (config.wlan_devices).slice(0,2);
	for (var i = 0; i < radios.length; i++) {
		is_radio2 = false;
		is_radio5 = false;
		removeOptions('wlan_channel' + i);
		select = document.getElementById('wlan_channel' + i);
		obj = config[radios[i]].wlan_channels;
		var opt = document.createElement('option');
		opt.value = '0';
		opt.innerHTML = 'automatycznie';
		select.appendChild(opt);
		for (var propt in obj) {
			var opt = document.createElement('option');
			opt.value = propt;
			opt.innerHTML = propt + ' (' + obj[propt][1] + ' dBm)' + (obj[propt][2] ? ' DFS' : '');
			select.appendChild(opt);
			if (propt > 14) {
				is_radio5 = true;
			} else {
				is_radio2 = true;
			}
		}

		if (is_radio2) {setValue('radio' + i, 'Wi-Fi 2.4 GHz');}
		if (is_radio5) {setValue('radio' + i, 'Wi-Fi 5 GHz');}
		if (is_radio2 && is_radio5) {setValue('radio' + i, 'Wi-Fi 2.4/5 GHz');}

		setValue('wlan_enabled' + i, (config[radios[i]].wlan_disabled != 1));
		setValue('wlan_channel' + i, config[radios[i]].wlan_channel);
		enableWlanTXPower(config[radios[i]].wlan_channel, i);
		var txpower;
		if (config[radios[i]].wlan_txpower == '' || config[radios[i]].wlan_channel == 0) {
			txpower = 100;
		} else {
			var maxtxpower = config[radios[i]].wlan_channels[config[radios[i]].wlan_channel][1];
			var curtxpower = config[radios[i]].wlan_txpower * 100 / maxtxpower;
			txpower = 20;
			if (curtxpower > 20) { txpower = 40; }
			if (curtxpower > 40) { txpower = 60; }
			if (curtxpower > 60) { txpower = 80; }
			if (curtxpower > 80) { txpower = 100; }
		}
		setValue('wlan_txpower' + i, txpower);
		setValue('wlan_ssid' + i, config[radios[i]].wlan_ssid);

		removeOptions('wlan_encryption' + i);
		var select = document.getElementById('wlan_encryption' + i);
		for (var propt in enc) {
			var opt = document.createElement('option');
			opt.value = propt;
			opt.innerHTML = enc[propt];
			select.appendChild(opt);
		}
		setValue('wlan_encryption' + i, config[radios[i]].wlan_encryption);

		setValue('wlan_key' + i, config[radios[i]].wlan_key);
		enableWlanEncryption(config[radios[i]].wlan_encryption, i)
		setValue('wlan_isolate' + i, config[radios[i]].wlan_isolate == 1);
		setDisplay('div_radio' + i, true);
	}

	if (!is_radio2 && !is_radio5) {
		setDisplay('menu_wlan', false);
		setDisplay('div_status_wlan', false);
		setDisplay('div_nightmode_wlan', false);
	}

	// system
	setValue('system_hostname_label', config.system_hostname);
	setValue('system_hostname', config.system_hostname);
	document.title = config.system_hostname;

	// firewall
	setValue('firewall_dmz', config.firewall_dmz);

	// stat
	setDisplay('div_stat', (config.services.statistics.enabled != -1));
	if (config.services.statistics.enabled != -1) {
		setValue('stat_enabled', (config.services.statistics.enabled == 1));
	}

	// pptp
	setDisplay('menu_pptp', config.services.pptp);

	// adblock
	setDisplay('menu_adblock', config.services.adblock);

	// nightmode / sunwait
	setDisplay('div_nightmode_led_auto', config.services.sunwait);

	// button
	if (config.button.code != '') {
		removeOptions('system_button');
		select = document.getElementById('system_button');
		var opt = document.createElement('option');
		opt.value = 'none';
		opt.innerHTML = 'Brak akcji';
		select.appendChild(opt);
		var opt = document.createElement('option');
		opt.value = 'leds';
		opt.innerHTML = 'Włącz/wyłącz diody LED';
		select.appendChild(opt);
		if (is_radio2 || is_radio5) {
			var opt = document.createElement('option');
			opt.value = 'wifi';
			opt.innerHTML = 'Włącz/wyłącz Wi-Fi';
			select.appendChild(opt);
		}
		if (config.services.pptp) {
			var opt = document.createElement('option');
			opt.value = 'vpn';
			opt.innerHTML = 'Włącz/wyłącz VPN';
			select.appendChild(opt);
		}
		setValue('system_button_name', config.button.name);
		setValue('system_button', config.button.action);
	}
	setDisplay('div_button', config.button.code != '')

	setValue('datarec_period', config.datarec_period);

	showmodemsection();
}

function copywireless() {
	setValue('wlan_enabled1', getValue('wlan_enabled0'));
	setValue('wlan_ssid1', getValue('wlan_ssid0'));
	setValue('wlan_encryption1', getValue('wlan_encryption0'));
	setValue('wlan_key1', getValue('wlan_key0'));
	setValue('wlan_isolate1', getValue('wlan_isolate0'));
	enableWlanEncryption(getValue('wlan_encryption0'), 1)
}

function savesettings() {
	var cmd = [];

	// wan
	cmd.push('[ -e /tmp/modem ] && rm /tmp/modem');
	cmd.push('uci set network.wan=interface');
	cmd.push('uci -q del network.wan.ifname');
	cmd.push('uci -q del network.wan.ipaddr');
	cmd.push('uci -q del network.wan.netmask');
	cmd.push('uci -q del network.wan.gateway');
	cmd.push('uci -q del network.wan.apn');
	cmd.push('uci -q del network.wan.device');
	cmd.push('uci -q del network.wan.pincode');
	cmd.push('uci -q del network.wan.ifname');
	cmd.push('uci -q del network.wan.proto');
	cmd.push('uci -q del network.wan.service');
	cmd.push('uci -q del network.wan.modes');
	cmd.push('uci -q del network.wan.mode');

	var use_dns = getValue('wan_dns');
	var use_wanport = true;

	wan_type = getValue('wan_proto');
	if (wan_type == 'none') {
		use_dns = 'none';
	}
	if (wan_type == 'static') {
		if (checkField('wan_ipaddr', validateIP)) {return;}
		if (checkField('wan_gateway', validateIP)) {return;}

		cmd.push('uci set network.wan.ifname='+config.wan_ifname_default);
		cmd.push('uci set network.wan.ipaddr='+getValue('wan_ipaddr'));
		cmd.push('uci set network.wan.netmask='+getValue('wan_netmask'));
		cmd.push('uci set network.wan.gateway='+getValue('wan_gateway'));
		use_dns = 'custom';
		use_wanport = false;
	}
	if (wan_type == '3g' || wan_type == 'qmi' || wan_type == 'ncm') {
		cmd.push('uci set network.wan.apn=\\\"'+getValue('wan_apn')+'\\\"');
		cmd.push('uci set network.wan.device=\\\"'+getValue('wan_device')+'\\\"');
		cmd.push('uci set network.wan.pincode='+getValue('wan_pincode'));
	}
	if (wan_type == '3g') {
		cmd.push('uci set network.wan.service=\\\"'+getValue('wan_modem_mode')+'\\\"');
	}
	if (wan_type == 'qmi') {
		cmd.push('uci set network.wan.modes=\\\"'+getValue('wan_modem_mode')+'\\\"');
	}
	if (wan_type == 'ncm') {
		cmd.push('uci set network.wan.mode=\\\"'+getValue('wan_modem_mode')+'\\\"');
	}
	if (wan_type == 'dhcp') {
		cmd.push('uci set network.wan.ifname='+config.wan_ifname_default);
		use_wanport = false;
	}
	if (wan_type == 'dhcp_hilink') {
		cmd.push('uci set network.wan.ifname='+config.wan_ifname_hilink);
		wan_type='dhcp';
	}
	cmd.push('uci set network.wan.proto='+wan_type);
	config.wan_proto=wan_type;

	if (config.wan_ifname_default !== '') {
		cmd.push('T=$(uci -q get network.lan.ifname | sed \'s|' + config.wan_ifname_default + '||\' | xargs)');
		if (use_wanport && getValue('wan_wanport')) {
			cmd.push('uci set network.lan.ifname=\\\"$T ' + config.wan_ifname_default + '\\\"');
		} else {
			cmd.push('uci set network.lan.ifname=\\\"$T\\\"');
		}
	}

	if (wan_type == 'none') {
		cmd.push('uci -q del firewall.dmz');
	}

	// dns
	if (use_dns != 'none') {
		cmd.push('uci -q del dhcp.@dnsmasq[0].noresolv');
		cmd.push('uci -q del dhcp.@dnsmasq[0].server');
		var t = '';
		if (use_dns == 'stubby') {
			t = '127.0.0.1';
			cmd.push('IP=$(uci -q -d, get stubby.global.listen_address | awk -F, \'{for(i=1;i<=NF;i++)if($i~/.*\\\\..*\\\\..*\\\\..*@/){gsub(\\\"@\\\", \\\"#\\\"); print $i; break}}\')');
			cmd.push('if [ -n \\\"$IP\\\" ]; then');
			cmd.push(' uci add_list dhcp.@dnsmasq[0].server=\\\"$IP\\\"');
			cmd.push(' /etc/init.d/stubby enable');
			cmd.push(' /etc/init.d/stubby start');
			cmd.push(' uci set dhcp.@dnsmasq[0].noresolv=1');
			cmd.push('fi');
		} else if (use_dns == 'custom') {
			if (checkFieldAllowEmpty('wan_dns1', validateIP)) {return;}
			if (checkFieldAllowEmpty('wan_dns2', validateIP)) {return;}
			t = [getValue('wan_dns1'), getValue('wan_dns2')].filter(function (val) {return val;}).join(' ');
		} else if (use_dns == 'isp') {
			t = '';
		} else {
			t = use_dns.replace(",", " ");
		}
		if (t == '') {
			cmd.push('uci -q del network.wan.dns');
			cmd.push('uci -q del network.wan.peerdns');
		} else {
			cmd.push('uci set network.wan.dns=\\\"' + t + '\\\"');
			cmd.push('uci set network.wan.peerdns=0');
		}
	} else {
		cmd.push('uci -q del network.wan.dns');
		cmd.push('uci -q del network.wan.peerdns');
	}

	// firewall
	if (checkFieldAllowEmpty('firewall_dmz', validateIP)) {return;}

	var firewall_dmz = getValue('firewall_dmz');
	if (firewall_dmz == "") {
		cmd.push('uci -q del firewall.dmz');
	} else {
		cmd.push('uci set firewall.dmz=redirect');
		cmd.push('uci set firewall.dmz.name=DMZ');
		cmd.push('uci set firewall.dmz.src=wan');
		cmd.push('uci set firewall.dmz.proto=all');
		cmd.push('uci set firewall.dmz.dest_ip=' + firewall_dmz);
	}

	// lan
	if (checkField('lan_ipaddr', validateIP)) {return;}
	cmd.push('uci set network.lan.ipaddr=' + getValue('lan_ipaddr'));

	if (getValue("lan_dhcp_enabled")) {
		cmd.push('uci -q del dhcp.lan.ignore');
	} else {
		cmd.push('uci set dhcp.lan.ignore=1');
	}

	if (getValue('lan_forcedns')) {
		cmd.push('uci set firewall.adblock_dns_53=redirect');
		cmd.push('uci set firewall.adblock_dns_53.name=\\\"Adblock DNS, port 53\\\"');
		cmd.push('uci set firewall.adblock_dns_53.src=lan');
		cmd.push('uci set firewall.adblock_dns_53.proto=\\\"tcp udp\\\"');
		cmd.push('uci set firewall.adblock_dns_53.src_dport=53');
		cmd.push('uci set firewall.adblock_dns_53.dest_port=53');
		cmd.push('uci set firewall.adblock_dns_53.target=DNAT');
	} else {
		cmd.push('uci -q del firewall.adblock_dns_53');
	}

	if (getValue('dhcp_logqueries')) {
		cmd.push('uci set dhcp.@dnsmasq[0].logqueries=1');
		setDisplay('menu_queries', true);
	} else {
		cmd.push('uci -q del dhcp.@dnsmasq[0].logqueries');
		setDisplay('menu_queries', false);
	}

	// wlan
	var wlan_restart_required = false;

	var radios = (config.wlan_devices).slice(0,2);
	for (var i = 0; i < radios.length; i++) {
		var section = config[radios[i]].wlan_section;

		if (section == '') {
			wlan_restart_required = true;
			cmd.push('uci add wireless wifi-iface');
			section = '@wifi-iface[-1]';
			config[radios[i]].wlan_section = section;
			cmd.push('uci set wireless.' + section + '.device=' + radios[i]);
			if (!getValue('wlan_enabled' + i)) {
				cmd.push('uci set wireless.' + section + '.disabled=1');
			}
		}

		if (getValue('wlan_enabled' + i)) {
			if (config[radios[i]].wlan_disabled == 1) {
				wlan_restart_required = true;
				cmd.push('uci -q del wireless.' + radios[i] + '.disabled');
				cmd.push('uci -q del wireless.' + section + '.disabled');
			}
		} else {
			if (config[radios[i]].wlan_disabled != 1) {
				wlan_restart_required = true;
				cmd.push('uci set wireless.' + radios[i] + '.disabled=1');
				cmd.push('uci set wireless.' + section + '.disabled=1');
			}
		}

		wlan_channel = getValue('wlan_channel' + i);
		if (config[radios[i]].wlan_channel != wlan_channel) {
			wlan_restart_required = true;
			cmd.push('uci set wireless.' + radios[i] + '.channel=' + wlan_channel);
			if (wlan_channel > 0) {
				cmd.push('uci set wireless.' + radios[i] + '.hwmode=11' + ((wlan_channel > 14) ? 'a' : 'g'));
			}
		}
		if (wlan_channel > 0) {
			txpower = getValue('wlan_txpower' + i);
			var maxtxpower = config[radios[i]].wlan_channels[wlan_channel][1];
			var curtxpower = Math.round(txpower * maxtxpower / 100);
			if (config[radios[i]].wlan_txpower != curtxpower) {
				wlan_restart_required = true;
				cmd.push('uci set wireless.' + radios[i] + '.txpower=' + curtxpower);
			}
		} else {
			cmd.push('uci -q del wireless.' + radios[i] + '.txpower');
		}
		wlan_ssid = getValue('wlan_ssid' + i);
		if (config[radios[i]].wlan_ssid != wlan_ssid) {
			if (wlan_ssid == '') {
				showMsg('Błąd w polu ' + getLabelText('wlan_ssid' + i), true);
				return;
			}
			if (validateLengthRange(wlan_ssid, 1, 32) != 0) {
				showMsg('Błąd w polu ' + getLabelText('wlan_ssid' + i) + '<br /><br />Nazwa Wi-Fi nie może być dłuższa niż 32 znaki', true);
				return;
			}
			wlan_restart_required = true;
			cmd.push('uci set wireless.' + section + '.ssid=\\\"' + escapeShell(wlan_ssid) + '\\\"');
		}
		wlan_encryption = getValue('wlan_encryption' + i);
		if (config[radios[i]].wlan_encryption != wlan_encryption) {
			wlan_restart_required = true;
			cmd.push('uci set wireless.' + section + '.encryption=\\\"'+wlan_encryption+'\\\"');
		}
		wlan_key = getValue('wlan_key' + i);
		if (config[radios[i]].wlan_key != wlan_key) {
			if (wlan_encryption != 'none') {
				if (wlan_key.length < 8) {
					showMsg('Błąd w polu ' + getLabelText('wlan_key' + i) + '<br /><br />Hasło do Wi-Fi musi mieć co najmniej 8 znaków', true);
					return;
				}
			}
			wlan_restart_required = true;
			cmd.push('uci set wireless.' + section + '.key=\\\"' + escapeShell(wlan_key) + '\\\"');
		}

		if (getValue('wlan_isolate' + i)) {
			if (config[radios[i]].wlan_isolate == 0) {
				wlan_restart_required = true;
				cmd.push('uci set wireless.' + section + '.isolate=1');
			}
		} else {
			if (config[radios[i]].wlan_isolate != 0) {
				wlan_restart_required = true;
				cmd.push('uci -q del wireless.' + section + '.isolate');
			}
		}

		if (wlan_restart_required) {
			cmd.push('uci set wireless.' + section + '.mode=ap');
			cmd.push('uci set wireless.' + section + '.network=lan');
		}
	}

	// system
	system_hostname=getValue('system_hostname');
	if (checkField('system_hostname', validateHost)) {return;}

	cmd.push('uci set system.@system[0].hostname=\\\"'+system_hostname+'\\\"');
	setValue('system_hostname_label', system_hostname);
	document.title = system_hostname;

	// stat
	if (config.services.statistics.enabled != -1) {
		if (getValue('stat_enabled')) {
			if (config.services.statistics.enabled !== '1') {
				cmd.push('uci set system.@system[0].stat=1');
				cmd.push('/sbin/stat-cron.sh');
			}
		} else {
			if (config.services.statistics.enabled == '1') {
				cmd.push('uci set system.@system[0].stat=0');
				cmd.push('/sbin/stat-cron.sh');
			}
		}
	}

	if (config.button.code != '') {
		button = getValue('system_button');
		if (config.button.code != button) {
			cmd.push('rm /etc/rc.button/' + config.button.code + '>/dev/null');
			if (button == 'leds') {
				cmd.push('F=$(mktemp)');
				cmd.push('cat <<EOF > $F');
				cmd.push('#!/bin/sh');
				cmd.push('[ \\\"\\\\${ACTION}\\\" = \\\"released\\\" ] || exit 0');
				cmd.push('if [ -e /tmp/led_off ]; then')
				cmd.push(' ubus call easyconfig leds \'{\\\"action\\\":\\\"on\\\"}\'');
				cmd.push('else');
				cmd.push(' ubus call easyconfig leds \'{\\\"action\\\":\\\"off\\\"}\'');
				cmd.push('fi');
				cmd.push('exit 0');
				cmd.push('EOF');
				cmd.push('chmod 755 $F');
				cmd.push('mv $F /etc/rc.button/' + config.button.code);
			}
			if (button == 'wifi') {
				cmd.push('[ -e /rom/etc/rc.button/rfkill ] && ln -s /rom/etc/rc.button/rfkill /etc/rc.button/' + config.button.code);
			}
			if (button == 'vpn') {
				cmd.push('F=$(mktemp)');
				cmd.push('cat <<EOF > $F');
				cmd.push('#!/bin/sh');
				cmd.push('[ \\\"\\\\${ACTION}\\\" = \\\"released\\\" ] || exit 0');
				cmd.push('T=\\\\$(ifstatus vpn 2>/dev/null | jsonfilter -q -e @.up)');
				cmd.push('if [ \\\"x\\\\$T\\\" = \\\"xfalse\\\" ]; then')
				cmd.push(' ifup vpn');
				cmd.push('else');
				cmd.push(' ifdown vpn');
				cmd.push(' ifup wan');
				cmd.push('fi');
				cmd.push('exit 0');
				cmd.push('EOF');
				cmd.push('chmod 755 $F');
				cmd.push('mv $F /etc/rc.button/' + config.button.code);
			}
		}
	}

	cmd.push('uci set easyconfig.global.datarec_period=' + getValue('datarec_period'));

	// commit & restart services
	cmd.push('uci commit');
	cmd.push('reload_config');
	cmd.push('/etc/init.d/firewall restart');
	cmd.push('ifup wan');
	if (wlan_restart_required) {
		cmd.push('wifi');
	}

	// password
	var pass1 = getValue('password1');
	var pass2 = getValue('password2');
	if (pass1 != '') {
		if (pass1 != pass2) {
			showMsg('Hasła nie są takie same!', true);
			return;
		}
		cmd.push('(echo \\\"' + escapeShell(pass1) + '\\\"; sleep 1; echo \\\"' + escapeShell(pass1) + '\\\") | passwd root');
	}

//console.log(cmd);
	execute(cmd, function(){
		cleanField('password1');
		cleanField('password2');
		setDisplay('div_security', (pass1 == '12345678'));
		showsettings();
	});
}

function showstatistics() {
	var w = window.open('http://dl.eko.one.pl/cgi-bin/router.cgi?token=' + config.services.statistics.token, '_blank');
	w.focus();
}

/*****************************************************************************/

function showwanup(data) {
	var html = 'Wznowienia połączenia z internetem';
	var sorted = sortJSON(JSON.parse((data).replace(/\$/g,'"')), 'up', 'asc');
	if (sorted.length > 9)
		html += '<br>(ostatnie 10)';
	html += '<hr>';
	for (var idx = 0; idx < sorted.length; idx++) {
		if (sorted[idx].since == '') {
			html += '<div class="row"><div class="col-xs-12">' + formatDuration(sorted[idx].up, true) + ' temu</div></div>';
		} else {
			html += createRowForModal(formatDateTime(sorted[idx].since), formatDuration(sorted[idx].up, true) + ' temu');
		}
	}
	showMsg(html);
}

var bandwidthID;
var bandwidth_unit = false;

function convertToSpeed(val, fixedpow) {
	var sizes;
	if (bandwidth_unit) {
		sizes = ['B/s', 'KiB/s', 'MiB/s', 'GiB/s'];
	} else {
		sizes = ['bit/s', 'Kibit/s', 'Mibit/s', 'Gibit/s'];
		val *= 8;
	}
	if (val == 0) return '0';
	var i;
	if (fixedpow) {
		i = fixedpow;
	} else {
		i = parseInt(Math.floor(Math.log(val) / Math.log(1024)));
	}
	if (i < 0) return '0';
	var dm = 0;
	if (i > 1) {dm = 3;}
	return parseFloat((val / Math.pow(1024, i)).toFixed(dm)) + ' ' + sizes[i];
}

function bandwidthcallback(val) {
	bandwidth_unit = val;
	document.getElementById('bandwidth_bits').style.fontWeight = val ? 400 : 700;
	document.getElementById('bandwidth_bytes').style.fontWeight = val ? 700 : 400;
}

function showbandwidth() {
	var html = '';
	html += '<div class="row"><label class="col-xs-5 col-sm-6 text-right">Wysłano</label><div class="col-xs-7 col-sm-6 text-left"><p id="bandwidth_all_tx">-</p></div></div>';
	html += '<div class="row"><label class="col-xs-5 col-sm-6 text-right">Pobrano</label><div class="col-xs-7 col-sm-6 text-left"><p id="bandwidth_all_rx">-</p></div></div>';
	html += '<div class="row space"><label class="col-xs-5 col-sm-6 text-right">Jednostki</label><div class="col-xs-7 col-sm-6 text-left">';
	html += '<span class="click" onclick="bandwidthcallback(false);"><span id="bandwidth_bits"> bity </span></span>|';
	html += '<span class="click" onclick="bandwidthcallback(true);"><span id="bandwidth_bytes"> bajty </span></span>';
	html += '</div></div>';
	html += '<div class="row"><label class="col-xs-5 col-sm-6 text-right"></label><div class="col-xs-3 col-sm-3 text-left"><p>teraz</p></div><div class="col-xs-4 col-sm-3 text-left"><p>maks.</p></div></div>';
	html += '<div class="row"><label class="col-xs-5 col-sm-6 text-right" id="bandwidth_speed_label_tx">Szybkość wysyłania</label><div class="col-xs-3 col-sm-3 text-left"><p id="bandwidth_speed_tx">-</p></div><div class="col-xs-4 col-sm-3 text-left"><p id="bandwidth_speed_max_tx">-</p></div></div>';
	html += '<div class="row"><label class="col-xs-5 col-sm-6 text-right" id="bandwidth_speed_label_rx">Szybkość pobierania</label><div class="col-xs-3 col-sm-3 text-left"><p id="bandwidth_speed_rx">-</p></div><div class="col-xs-4 col-sm-3 text-left"><p id="bandwidth_speed_max_rx">-</p></div></div>';
	html += '<div class="row" id="div_bandwidth"><div class="col-xs-12"><canvas id="bandwidth" height="400"></canvas></div></div>';
	showMsg(html)
	var bandwidth_arr = []; bandwidth_arr[0] = []; bandwidth_arr[1] = [];
	var bandwidth_old = []; bandwidth_old['tx'] = -1;
	var bandwidth_max = []; bandwidth_max['tx'] = 0; bandwidth_max['rx'] = 0;
	var bandwidth_legend = [{color:'green',elements:['bandwidth_speed_label_tx','bandwidth_speed_tx','bandwidth_speed_max_tx']},{color:'blue',elements:['bandwidth_speed_label_rx','bandwidth_speed_rx','bandwidth_speed_max_rx']}];
	livegraph.draw({element: 'bandwidth', data: bandwidth_arr, legend: bandwidth_legend});
	if (config.wan_ifname != '') {
		bandwidthcallback(false);
		bandwidthID = setInterval(function() {
			var e = document.getElementById('bandwidth_all_tx');
			if (!e || e.offsetParent === null) {
				clearInterval(bandwidthID);
				setValue('wan_tx', '<span class="click" onclick="showbandwidth();">' + bytesToSize(bandwidth_old['tx']) + '</span>');
				setValue('wan_rx', '<span class="click" onclick="showbandwidth();">' + bytesToSize(bandwidth_old['rx']) + '</span>');
				return;
			}
			ubus_call_nomsg('"network.device", "status", {"name":"' + config.wan_ifname + '"}', function(data) {
				setValue('bandwidth_all_tx', bytesToSize(data.statistics.tx_bytes));
				setValue('bandwidth_all_rx', bytesToSize(data.statistics.rx_bytes));
				if (bandwidth_old['tx'] != -1) {
					var dtx = data.statistics.tx_bytes - bandwidth_old['tx'];
					var drx = data.statistics.rx_bytes - bandwidth_old['rx'];
					setValue('bandwidth_speed_tx', convertToSpeed(dtx));
					setValue('bandwidth_speed_rx', convertToSpeed(drx));
					if (dtx > bandwidth_max['tx']) { bandwidth_max['tx'] = dtx; }
					if (drx > bandwidth_max['rx']) { bandwidth_max['rx'] = drx; }
					setValue('bandwidth_speed_max_tx', convertToSpeed(bandwidth_max['tx']));
					setValue('bandwidth_speed_max_rx', convertToSpeed(bandwidth_max['rx']));
					var timestamp = (new Date()).getTime();
					bandwidth_arr[0].push([timestamp, dtx]);
					bandwidth_arr[1].push([timestamp, drx]);
					if ((bandwidth_arr[0]).length > 181) {
						bandwidth_arr[0].shift();
						bandwidth_arr[1].shift();
					}
					livegraph.draw({element: 'bandwidth', data: bandwidth_arr, legend: bandwidth_legend});
				}
				bandwidth_old['tx'] = data.statistics.tx_bytes;
				bandwidth_old['rx'] = data.statistics.rx_bytes;
			});
		}, 1000);
	}
}

function showstatus() {
	ubus_call('"easyconfig", "status", {}', function(data) {
		setValue('system_uptime', formatDuration(data.system_uptime, false));
		setValue('system_uptime_since', data.system_uptime_since == '' ? '' : ' (od ' + formatDateTime(data.system_uptime_since) + ')');
		setValue('system_load', data.system_load);
		setValue('system_time', data.system_time == '' ? '-' : formatDateTime(data.system_time));
		setValue('wlan_clients', data.wlan_clients + ' &rarr;');
		setValue('wan_rx', data.wan_rx == '' ? '-' : '<span class="click" onclick="showbandwidth();">' + bytesToSize(data.wan_rx) + '</span>');
		setValue('wan_tx', data.wan_tx == '' ? '-' : '<span class="click" onclick="showbandwidth();">' + bytesToSize(data.wan_tx) + '</span>');
		setValue('wan_uptime', formatDuration(data.wan_uptime, false));
		setValue('wan_uptime_since', data.wan_uptime_since == '' ? '' : ' (od ' + formatDateTime(data.wan_uptime_since) + ')');
		setValue('wan_up_cnt', (data.wan_up_cnt == '') ? '-' : '<span class="click" onclick="showwanup(\'' + (JSON.stringify(data.wan_up_since)).replace(/\"/g,"$") + '\');">' + data.wan_up_cnt + '</span>');
		setValue('wan_ipaddr_status', (data.wan_ipaddr == '') ? '-' : '<span class="click" onclick="showgeolocation();">' + data.wan_ipaddr + '</span>');
		setDisplay('div_vpn_up_status', data.vpn_up);
		if ((data.sensors).length > 0) {
			var html = '';
			for (var i in data.sensors) {
				for (var j in data.sensors[i]) {
					html += '<div class="row"><label class="col-xs-6 text-right">' + j + '</label>';
					html += '<div class="col-xs-6"><p>' + data.sensors[i][j] + '</p></div></div>';
				}
			}
			setValue('div_status_sensors_addon', html);
			setDisplay('div_status_sensors', true);
		} else {
			setDisplay('div_status_sensors', false);
		}
	});
}

function showsystem() {
	ubus_call('"easyconfig", "system", {}', function(data) {
		setValue('firmware_version', data.version);
		setValue('gui_version', data.gui_version);
		setValue('model', data.model);
		setValue('darkmode_enabled', getCookie('easyconfig_darkmode') == '1' ? true : false);
		setValue('modem_vendor', data.modem.vendor == '' ? '-' : data.modem.vendor);
		setValue('modem_model', data.modem.product == '' ? '-' : data.modem.product);
		setValue('modem_revision', data.modem.revision == '' ? '-' : data.modem.revision);
		setValue('modem_imei', data.modem.imei == '' ? '-' : data.modem.imei);
		setValue('modem_iccid', data.modem.iccid == '' ? '-' : data.modem.iccid);
	});
}

function modemat() {
	setDisplay('div_modemat', true);
	document.getElementById('modemat_cmd').focus();
}

function sendmodemat() {
	var atcmd = getValue('modemat_cmd');
	if (atcmd == '') {
		document.getElementById('modemat_cmd').focus();
		return;
	}
	atcmd = atcmd.replace(/\$/g, '\\\\\$');
	atcmd = atcmd.replace(/\^/g, '\\\\\^');
	atcmd = atcmd.replace(/"/g, '\\\\\\\"');

	var cmd = [];
	cmd.push('#!/bin/sh');
	cmd.push('MODEM=$(cat /tmp/modem)');
	cmd.push('ATLOCK=\\\"flock -x /tmp/at_cmd_lock\\\"');
	cmd.push('$ATLOCK chat -t 3 -e ABORT \\\"ERROR\\\" \'\' \\\"' + atcmd + '\\\" OK >> $MODEM < $MODEM');
	cmd.push('RET=$?');
	cmd.push('rm -- \\\"$0\\\"');
	cmd.push('exit $RET');
	cmd.push('');
	var filename = '/tmp/' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 9);
	ubus_call('"file", "write", {"path":"' + filename + '","data":"' + cmd.join('\n') + '"}', function(data) {
		ubus_call('"file", "exec", {"command":"sh", "params":["' + filename + '"]}', function(data1) {
			if (!data1.stderr) {
				if (data1.code == 3) {
					data1.stderr = 'Przekroczono czas oczekiwania na odpowiedź z modemu';
				} else {
					data1.stderr = 'Brak odpowiedzi z modemu';
				}
			}
			setValue('modemat_output' , (data1.stderr).replace(/\n/g,'<br>'));
			document.getElementById('modemat_cmd').focus();
		});
	});
}

function closemodemat() {
	setDisplay('div_modemat', false);
}

function showmodem() {
	ubus_call('"easyconfig", "modem", {}', function(data) {
		if (data.error)
			return;

		setValue('modem_signal', data.signal?data.signal + "%":"?");

		if (data.signal) {
			var e = document.getElementById("modem_signal_bars");
			removeClasses(e, ["lzero","lone","ltwo","lthree","lfour","lfive","one-bar","two-bars","three-bars","four-bars","five-bars"]);
			if (data.signal >= 80) {
				addClasses(e, ["lfive","five-bars"]);
			}
			if (data.signal < 80 && data.signal >= 60) {
				addClasses(e, ["lfour","four-bars"]);
			}
			if (data.signal < 60 && data.signal >= 40) {
				addClasses(e, ["lthree","three-bars"]);
			}
			if (data.signal < 40 && data.signal >= 20) {
				addClasses(e, ["ltwo","two-bars"]);
			}
			if (data.signal < 20 && data.signal > 0) {
				addClasses(e, ["lone","one-bar"]);
			}
			if (data.signal == 0) {
				addClasses(e, ["lzero","one-bar"]);
			}
		}

		setValue('modem_operator', data.operator_name);
		setValue('modem_mode', data.mode);
		switch(data.registration) {
		case "0":
			setValue('modem_registration', 'Brak sieci');
			break;
		case "1":
			setValue('modem_registration', 'Zalogowana do sieci macierzystej');
			break;
		case "2":
			setValue('modem_registration', 'Wyszukiwanie operatora');
			break;
		case "3":
			setValue('modem_registration', 'Odmowa dostępu');
			break;
		case "5":
			setValue('modem_registration', 'Zalogowana do sieci w roamingu');
			break;
		default:
			setValue('modem_registration', data.registration == '' ? '-' : data.registration);
		}

		if (data.addon) {
			var html = '';
			for (var i in data.addon) {
				for (var j in data.addon[i]) {
					html += '<div class="row"><label class="col-xs-6 text-right">' + j + '</label>';
					html += '<div class="col-xs-6"><p>' + data.addon[i][j] + '</p></div></div>';
				}
			}
			setValue('div_status_modem_addon', html);
			setDisplay('div_status_modem_addon', true);
		} else {
			setDisplay('div_status_modem_addon', false);
		}

		if (data.cid_dec && data.operator_mcc == 260) {
			document.getElementById("modem_btsearch").setAttribute("href", "http://www.btsearch.pl/szukaj.php?search=" + data.cid_dec + "&siec=-1&mode=std");
			setDisplay('div_modem_btsearch', true);
		} else {
			setDisplay('div_modem_btsearch', false);
		}

	});
}

function showmodemsection() {
	var wan_type = getValue('wan_proto');
	if (wan_type == '3g' || wan_type == 'qmi' || wan_type == 'ncm') {
		setDisplay('menu_ussdsms', config.services.ussdsms);
		setDisplay('div_status_modem', true);
		setDisplay('div_system_modem', true);
		setCookie('easyconfig_status_modem', '1');
		showmodem();
	} else {
		setDisplay('menu_ussdsms', false);
		setDisplay('div_status_modem', false);
		setDisplay('div_system_modem', false);
		setCookie('easyconfig_status_modem', '0');
	}
}

/*****************************************************************************/

function btn_system_reboot() {
	showDialog('Uruchomić urządzenie ponownie?', 'Nie', 'Tak', okreboot);
}

function okreboot() {
	ubus('"easyconfig", "reboot", {}', function(data) {
		showMsg("Trwa ponownie uruchomienie urządzenia, może to potrwać do trzech minut...", false);
	}, function(status) {
		showMsg("Błąd pobierania danych!", true);
	}, true);
}


/*****************************************************************************/

function showwatchdog() {
	setDisplay('watchdog_enabled_info', (config.wan_proto == 'none'));

	ubus_call('"easyconfig", "watchdog", {}', function(data) {
		setValue('watchdog_enabled', data.watchdog_enabled);
		setValue('watchdog_dest', data.watchdog_dest);
		setValue('watchdog_period', data.watchdog_period);
		setValue('watchdog_period_count', data.watchdog_period_count);
		setValue('watchdog_delay', data.watchdog_delay);
		setValue('watchdog_action', data.watchdog_action);
		if (data.watchdog_minavgmax != '') {
			setValue('watchdog_min', data.watchdog_minavgmax.split("/")[0] + ' ms');
			setValue('watchdog_avg', data.watchdog_minavgmax.split("/")[1] + ' ms');
			setValue('watchdog_max', data.watchdog_minavgmax.split("/")[2] + ' ms');
			setValue('watchdog_rundate', formatDateTime(data.watchdog_rundate));
		} else {
			setValue('watchdog_min', '-');
			setValue('watchdog_avg', '-');
			setValue('watchdog_max', '-');
			setValue('watchdog_rundate', '-');
		}
	});
}

function savewatchdog() {
	var watchdog_enabled = getValue('watchdog_enabled');
	if (checkField('watchdog_dest', validateHost)) {return;}
	var watchdog_dest = getValue('watchdog_dest');
	var watchdog_period = getValue('watchdog_period');
	if (validateNumericRange(watchdog_period, 1, 59) != 0) {
		showMsg('Błąd w polu ' + getLabelText('watchdog_period'), true);
		return;
	}
	var watchdog_period_count = getValue('watchdog_period_count');
	if (validateNumericRange(watchdog_period_count, 1, 59) != 0) {
		showMsg('Błąd w polu ' + getLabelText('watchdog_period_count'), true);
		return;
	}
	var watchdog_delay = getValue('watchdog_delay');
	if (validateNumericRange(watchdog_delay, 1, 59) != 0) {
		showMsg('Błąd w polu ' + getLabelText('watchdog_delay'), true);
		return;
	}
	var watchdog_action = getValue('watchdog_action');

	var cmd = [];
	cmd.push('touch /etc/crontabs/root');
	cmd.push('sed -i \\\"/easyconfig_watchdog/d\\\" /etc/crontabs/root');
	if (watchdog_enabled) {
		cmd.push('echo \\\"*/' + watchdog_period + ' * * * * /usr/bin/easyconfig_watchdog.sh ' + (watchdog_delay * 60) + ' 3 ' + watchdog_dest + ' ' + watchdog_period_count + ' ' + watchdog_action + '\\\" >> /etc/crontabs/root');
	}
	cmd.push('/etc/init.d/cron restart');
	cmd.push('uci set easyconfig.watchdog=service');
	cmd.push('uci set easyconfig.watchdog.period=' + watchdog_period);
	cmd.push('uci set easyconfig.watchdog.period_count=' + watchdog_period_count);
	cmd.push('uci set easyconfig.watchdog.delay=' + watchdog_delay);
	cmd.push('uci set easyconfig.watchdog.dest=' + watchdog_dest);
	cmd.push('uci set easyconfig.watchdog.action=' + watchdog_action);
	cmd.push('uci commit easyconfig');

	execute(cmd, showwatchdog);
}

/*****************************************************************************/

function sortJSON(data, key, way) {
	return data.sort(function(a, b) {
		var x = a[key]; var y = b[key];
		if (way === 'asc' ) { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
		if (way === 'desc') { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
	});
}

function formatDuration(s, showsec) {
	if (s === '-') {return '-';}
	if (s === '') {return '-';}
	var d = Math.floor(s/86400),
	    h = Math.floor(s/3600) % 24,
	    m = Math.floor(s/60)%60,
	    s = s % 60;
	var time = d > 0 ? d + 'd ' : '';
	if (time != '') {time += h + 'g '} else {time = h > 0 ? h + 'g ' : ''}
	if (time != '') {time += m + 'm '} else {time = m > 0 ? m + 'm ' : ''}
	if (showsec) {
		time += s + 's';
	} else {
		if (time == '') { time += m + 'm'; }
	}
	return time;
}

var wifiscanresults;

function showsitesurvey() {
	ubus_call('"easyconfig", "wifiscan", {}', function(data) {
		var arr = data.result;

		var wlan_devices = config.wlan_devices;

		var ts = Date.now()/1000;
		var l = arr.length;
		for (var idx1 = 0; idx1 < l; idx1++) {
			arr[idx1].timestamp = parseInt(ts).toString();

			if (arr[idx1].channel == "?") {
				for (var i = 0; i < wlan_devices.length; i++) {
					obj = config[wlan_devices[i]].wlan_channels;
					for (var propt in obj) {
						if (obj[propt][0] == arr[idx1].freq) {
							arr[idx1].channel = propt;
							break;
						}
					}
				}
			}

		}
		if (wifiscanresults) {
			for (var idx = wifiscanresults.length - 1; idx >= 0; idx--) {
				if ((ts - wifiscanresults[idx].timestamp) > 180) {
					wifiscanresults.splice(idx, 1);
				} else {
					for (var idx1 = 0; idx1 < l; idx1++) {
						if (wifiscanresults[idx].mac == arr[idx1].mac) {
							wifiscanresults.splice(idx, 1);
							break;
						}
					}
				}
			}
			wifiscanresults = wifiscanresults.concat(arr);
		} else {
			wifiscanresults = arr;
		}
		sitesurveycallback('');
	});
}

function sitesurveycallbackfilter(filterby) {
	var all = ['all', '2', '5'];
	for (var idx = 0; idx < all.length; idx++) {
		var e = document.getElementById('sitesurvey_filter_' + all[idx]);
		e.style.fontWeight = (filterby == all[idx]) ? 700 : 400;
	}
}

function sitesurveycallback(sortby) {

	var all;
	var filterby = 'all';
	all = ['all', '2', '5'];
	for (var idx = 0; idx < all.length; idx++) {
		var e = document.getElementById('sitesurvey_filter_' + all[idx]);
		if (e === null) {
			break;
		}
		if (e.style.fontWeight == 700) {
			filterby = all[idx];
			break;
		}
	}

	if (sortby == '') {
		sortby = 'ssid';
		all = ['ssid', 'mac', 'signal', 'freq', 'timestamp'];
		for (var idx = 0; idx < all.length; idx++) {
			var e = document.getElementById('sitesurvey_sortby_' + all[idx]);
			if (e === null) {
				break;
			}
			if (e.style.fontWeight == 700) {
				sortby = all[idx];
				break;
			}
		}
	}

	var html = '';
	if (wifiscanresults.length > 0) {
		html += '<div class="row space"><div class="col-xs-12 space">';
		html += '<span>Filtrowanie:</span>';
		html += '<span class="click" onclick="sitesurveycallbackfilter(\'all\');sitesurveycallback(\'\');"><span id="sitesurvey_filter_all"> wszystkie (0) </span></span>|';
		html += '<span class="click" onclick="sitesurveycallbackfilter(\'2\');sitesurveycallback(\'\');"><span id="sitesurvey_filter_2"> 2.4 GHz (0) </span></span>|';
		html += '<span class="click" onclick="sitesurveycallbackfilter(\'5\');sitesurveycallback(\'\');" ><span id="sitesurvey_filter_5"> 5 GHz (0) </span></span>';
		html += '</div><div class="col-xs-12">';
		html += '<span>Sortowanie po</span>';
		html += '<span class="click" onclick="sitesurveycallback(\'ssid\');"><span id="sitesurvey_sortby_ssid"> nazwie </span></span>|';
		html += '<span class="click" onclick="sitesurveycallback(\'mac\');"><span id="sitesurvey_sortby_mac"> adresie mac </span></span>|';
		html += '<span class="click" onclick="sitesurveycallback(\'signal\');"><span id="sitesurvey_sortby_signal"> sile sygnału </span></span>|';
		html += '<span class="click" onclick="sitesurveycallback(\'freq\');"><span id="sitesurvey_sortby_freq"> kanale </span></span>|';
		html += '<span class="click" onclick="sitesurveycallback(\'timestamp\');"><span id="sitesurvey_sortby_timestamp"> widoczności </span></span>';
		html += '</div></div>';

		var wlan_devices = config.wlan_devices;
		var ts = Date.now()/1000;
		var sorted = sortJSON(wifiscanresults, sortby, 'asc');
		var rogueap = false;
		var modes = ['b', 'g', 'n', 'ac', 'ax'];
		var counter_all = 0;
		var counter_2 = 0;
		var counter_5 = 0;
		for (var idx = 0; idx < sorted.length; idx++) {
			counter_all ++;
			if (sorted[idx].channel > 14) {
				counter_5 ++;
				if (filterby == '2') { continue; }
			} else {
				counter_2 ++;
				if (filterby == '5') { continue; }
			}

			rogueap = false;
			for (var i = 0; i < wlan_devices.length; i++) {
				if (config[wlan_devices[i]].wlan_ssid === sorted[idx].ssid) {
					rogueap = true;
					break;
				}
			}

			var ssid_new = (sorted[idx].ssid).replace(/(?:\\x[\da-fA-F]{2})+/g, function (val) {return decodeURIComponent(val.replace(/\\x/g, '%'))});

			html += '<hr><div class="row' + (rogueap ? ' text-danger' : '') +  '">';
			html += '<div class="col-xs-6">';
			html += '<h4><span class="wordbreak">' + ssid_new + '</span></h4>';
			html += sorted[idx].mac + '<br>';

			var key = (sorted[idx].mac).substring(0,8).toUpperCase();
			if (key in manuf) {html += manuf[key] + '<br>';}
			if (parseInt(ts - sorted[idx].timestamp) > 0) {html += 'widoczność ' + formatDuration(parseInt(ts - sorted[idx].timestamp), true) + ' temu';}
			if (rogueap) {html += '<br>Wrogi AP';}
			html += '</div>';
			html += '<div class="col-xs-6 text-right">';
			html += 'RSSI ' + sorted[idx].signal.replace(/\..*/,"") + ' dBm<br>';
			html += 'Kanał ' + sorted[idx].channel + ' (' + sorted[idx].freq/1000 + ' GHz)<br>';
			html += (sorted[idx].encryption?'<span class="hidden-vxs">Szyfrowanie </span>' + sorted[idx].encryption + '<br>':'');
			var t = modes.indexOf(sorted[idx].mode1);
			if (t > -1) {html += 'Wi-Fi ' + (t + 2) + ' ';}
			html += '(802.11' + sorted[idx].mode1 + (sorted[idx].mode2 != '' ? ', ' + sorted[idx].mode2 : '') + ')';
			html += '</div></div>';
		}
		html += '<hr>';
		html += '<div class="row" id="div_channels2" style="display:none">';
		html += '<div class="col-xs-12"><h3 class="section">Sieci 2.4 GHz</h3><canvas id="channels2" height="400"></canvas></div>';
		html += '</div>';
		html += '<div class="row" id="div_channels5" style="display:none">';
		html += '<div class="col-xs-12"><h3 class="section">Sieci 5 GHz</h3></div>';
		html += '<div class="col-xs-12" id="div_channels51"><canvas id="channels51" height="400"></canvas></div>';
		html += '<div class="col-xs-12" id="div_channels52"><canvas id="channels52" height="400"></canvas></div>';
		html += '<div class="col-xs-12" id="div_channels53"><canvas id="channels53" height="400"></canvas></div>';
		html += '</div>';
	} else {
		html += '<div class="alert alert-warning">Brak sieci bezprzewodowych lub Wi-Fi jest wyłączone</div>';
	}
	setValue('div_sitesurvey_content', html);

	if (wifiscanresults.length > 0) {
		var surveydata2 = [];
		var surveydata51 = [];
		var surveydata52 = [];
		var surveydata53 = [];
		for (var idx = 0; idx < wifiscanresults.length; idx++) {
			if (filterby == '2') { if (wifiscanresults[idx].channel > 14) { continue; } }
			if (filterby == '5') { if (wifiscanresults[idx].channel < 36) { continue; } }

			var a = {};
			a['mac'] = wifiscanresults[idx].mac;
			a['ssid'] = (wifiscanresults[idx].ssid).replace(/(?:\\x[\da-fA-F]{2})+/g, function (val) {return decodeURIComponent(val.replace(/\\x/g, '%'))});
			if (a['ssid'] == '') {a['ssid'] = '<bez nazwy>';}
			a['signal'] = parseInt(wifiscanresults[idx].signal);
			if (a['signal'] < -100) {continue;}
			a['channel'] = parseInt(wifiscanresults[idx].channel);
			a['vhtch1'] = parseInt(wifiscanresults[idx].vhtch1);
			a['vhtch2'] = parseInt(wifiscanresults[idx].vhtch2);
			a['width'] = wifiscanresults[idx].mode2;
			if (a['channel'] >= 149) {
				surveydata53.push(a);
			} else if (a['channel'] >= 100) {
				surveydata52.push(a);
			} else if (a['channel'] >= 36) {
				surveydata51.push(a);
			} else {
				surveydata2.push(a);
			}

			if (wifiscanresults[idx].mode2 == 'VHT80+80') {
				var a = {};
				a['mac'] = wifiscanresults[idx].mac;
				a['signal'] = parseInt(wifiscanresults[idx].signal);
				if (a['signal'] < -100) {continue;}
				a['channel'] = 0;
				a['vhtch1'] = parseInt(wifiscanresults[idx].vhtch2);
				a['width'] = wifiscanresults[idx].mode2;
				if (a['vhtch1'] >= 149) {
					surveydata53.push(a);
				} else if (a['vhtch1'] >= 100) {
					surveydata52.push(a);
				} else if (a['vhtch1'] >= 36) {
					surveydata51.push(a);
				}
			}

		}
		setDisplay('div_channels2', (surveydata2.length > 0));
		if (surveydata2.length > 0) {
			wifigraph.draw({band: 2, element: 'channels2', data: surveydata2});
		}

		setDisplay('div_channels5', (surveydata51.length > 0 || surveydata52.length > 0 || surveydata53.length > 0));
		if (surveydata51.length > 0 || surveydata52.length > 0 || surveydata53.length > 0) {
			wifigraph.draw({band: 51, element: 'channels51', data: surveydata51});
			wifigraph.draw({band: 52, element: 'channels52', data: surveydata52});
			wifigraph.draw({band: 53, element: 'channels53', data: surveydata53});
		}

		all = ['ssid', 'mac', 'signal', 'freq', 'timestamp'];
		for (var idx = 0; idx < all.length; idx++) {
			var e = document.getElementById('sitesurvey_sortby_' + all[idx]);
			e.style.fontWeight = (sortby == all[idx]) ? 700 : 400;
		}

		setValue('sitesurvey_filter_all', ' wszystkie (' + counter_all + ') ');
		setValue('sitesurvey_filter_2', ' 2.4 GHz (' + counter_2 + ') ');
		setValue('sitesurvey_filter_5', ' 5 GHz (' + counter_5 + ') ');
		sitesurveycallbackfilter(filterby);
	}
}

wifigraph = {
	axisTop: 10,
	axisRight: 5,
	axisBottom: 20,
	axisLeft: 40,
	ch2: [1,2,3,4,5,6,7,8,9,10,11,12,13],
	ch51: [36,40,44,48,52,56,60,64],
	ch52: [100,104,108,112,116,120,124,128,132,136,140,144],
	ch53: [149,153,157,161,165,169,173],

	getX: function (graph, channel) {
		switch (graph.band) {
			case 2:
				return ((channel + 1) * graph.width) / 16 + wifigraph.axisLeft;
				break;
			case 51:
				return ((channel - 34) * graph.width) / 32 + wifigraph.axisLeft;
				break;
			case 52:
				return ((channel - 98) * graph.width) / 48 + wifigraph.axisLeft;
				break;
			case 53:
				return ((channel - 147) * graph.width) / 28 + wifigraph.axisLeft;
				break;
		}
	},

	getY: function(graph, signal) {
		return ((((-1 * signal) - 30) * graph.height) / 70) + wifigraph.axisTop;
	},

	frame: function (graph) {
		var ctx = graph.context;
		var color = rgb2hex(window.getComputedStyle(document.body,null).getPropertyValue('color'));
		ctx.strokeStyle = '#c0c0c0';
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(wifigraph.axisLeft, wifigraph.axisTop);
		ctx.lineTo(wifigraph.axisLeft + graph.width, wifigraph.axisTop);
		ctx.lineTo(wifigraph.axisLeft + graph.width, wifigraph.axisTop + graph.height);
		ctx.lineTo(wifigraph.axisLeft, wifigraph.axisTop + graph.height);
		ctx.lineTo(wifigraph.axisLeft, wifigraph.axisTop);
		ctx.stroke();
		ctx.fillStyle = color;
		ctx.textAlign = 'right';
		for (var i = -30; i >= -100; i-=10) {
			var y = wifigraph.getY(graph, i);
			ctx.beginPath();
			ctx.moveTo(wifigraph.axisLeft, y);
			ctx.lineTo(wifigraph.axisLeft + graph.width, y);
			ctx.stroke();
			ctx.fillText(i, wifigraph.axisLeft - 5, y + 5, wifigraph.axisLeft);
		}

		var ch;
		switch (graph.band) {
			case 2:
				ch = wifigraph.ch2;
				break;
			case 51:
				ch = wifigraph.ch51;
				break;
			case 52:
				ch = wifigraph.ch52;
				break;
			case 53:
				ch = wifigraph.ch53;
				break;
		}
		var oldwidth = 0;
		ctx.textAlign = 'center';
		for (var i = 0; i < ch.length ; i++) {
			var x = wifigraph.getX(graph, ch[i]);
			ctx.beginPath();
			ctx.moveTo(x, wifigraph.axisTop);
			ctx.lineTo(x, wifigraph.axisTop + graph.height);
			ctx.stroke();
			if (oldwidth < x) {
				ctx.fillStyle = color;
				for (var idx = 0; idx < (config.wlan_current_channels).length; idx++) {
					if (ch[i] >= config.wlan_current_channels[idx].min && ch[i] <= config.wlan_current_channels[idx].max) {
						ctx.fillStyle = 'red';
						break;
					}
				}
				ctx.fillText(ch[i], x, wifigraph.axisTop + graph.height + 15);
				oldwidth = x + ctx.measureText(ch[i]).width;
			}
		}
	},

	plot: function (graph) {
		var ctx = graph.context
		var data = sortJSON(graph.data, 'signal', 'desc');

		ctx.textAlign = 'center';
		ctx.lineWidth = 1.5;
		for (var i = 0; i < data.length; i++) {

			var x1, x11, x2, x22;
			var width = data[i].width;

			if (width == 'HT40-') {
				x1 = wifigraph.getX(graph, data[i].channel - 6);
				x11 = wifigraph.getX(graph, data[i].channel - 5);
			} else 	if (width == 'VHT40') {
				x1 = wifigraph.getX(graph, data[i].vhtch1 - 4);
				x11 = wifigraph.getX(graph, data[i].vhtch1 - 3);
			} else if (width == 'VHT80' || width == 'VHT80+80') {
				x1 = wifigraph.getX(graph, data[i].vhtch1 - 8);
				x11 = wifigraph.getX(graph, data[i].vhtch1 - 7);
			} else if (width == 'VHT160') {
				x1 = wifigraph.getX(graph, data[i].vhtch2 - 16);
				x11 = wifigraph.getX(graph, data[i].vhtch2 - 15);
			} else {
				x1 = wifigraph.getX(graph, data[i].channel - 2);
				x11 = wifigraph.getX(graph, data[i].channel - 1);
			}

			if (width == 'HT40+') {
				x2 = wifigraph.getX(graph, data[i].channel + 6);
				x22 = wifigraph.getX(graph, data[i].channel + 5);
			} else if (width == 'VHT40') {
				x2 = wifigraph.getX(graph, data[i].vhtch1 + 4);
				x22 = wifigraph.getX(graph, data[i].vhtch1 + 3);
			} else if (width == 'VHT80' || width == 'VHT80+80') {
				x2 = wifigraph.getX(graph, data[i].vhtch1 + 8);
				x22 = wifigraph.getX(graph, data[i].vhtch1 + 7);
			} else if (width == 'VHT160') {
				x2 = wifigraph.getX(graph, data[i].vhtch2 + 16);
				x22 = wifigraph.getX(graph, data[i].vhtch2 + 15);
			} else {
				x2 = wifigraph.getX(graph, data[i].channel + 2);
				x22 = wifigraph.getX(graph, data[i].channel + 1);
			}

			var y = wifigraph.getY(graph, data[i].signal);

			ctx.fillStyle = string2color(data[i].mac);
			ctx.strokeStyle = ctx.fillStyle;
			ctx.globalAlpha = 0.2;
			ctx.beginPath();
			ctx.moveTo(x1, graph.height + wifigraph.axisTop);
			ctx.lineTo(x11, y);
			ctx.lineTo(x22, y);
			ctx.lineTo(x2, graph.height + wifigraph.axisTop);
			ctx.fill();

			ctx.globalAlpha = 1;
			ctx.stroke();

			if (data[i].channel > 0) {
				var x = wifigraph.getX(graph, data[i].channel);

				ctx.fillText(data[i].ssid, x, y - 15);

				ctx.beginPath();
				ctx.arc(x, y, 4, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.fill();
			}
		}
	},

	draw: function (graph) {
		var canvas = document.getElementById(graph.element);
		if (canvas == null) {
			return;
		}

		var ctx = canvas.getContext('2d');
		if (ctx == null) {
			return;
		}

		var positionInfo = document.getElementById('div_' + graph.element).getBoundingClientRect();
		canvas.width = positionInfo.width - 30;

		graph.width = canvas.width - wifigraph.axisRight - wifigraph.axisLeft;
		graph.height = canvas.height - wifigraph.axisTop - wifigraph.axisBottom;

		ctx.font = window.getComputedStyle(document.body,null).getPropertyValue('font-size') + ' ' + window.getComputedStyle(document.body,null).getPropertyValue('font-family');
		graph.context = ctx;

		wifigraph.frame(graph);
		wifigraph.plot(graph);
	}
};


/*****************************************************************************/

function bytesToSize(bytes) {
	var sizes = ['', 'KiB', 'MiB', 'GiB', 'TiB'];
	if (bytes == 0) return '0';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	var dm = 0;
	if (i == 2) {dm = 1;}
	if (i > 2) {dm = 3;}
	return parseFloat((bytes / Math.pow(1024, i)).toFixed(dm)) + ' ' + sizes[i];
}

var wlanclients;

function showwlanclients() {
	ubus_call('"easyconfig", "clients", {}', function(data) {
		wlanclients = data.result;
		wlanclientscallback('');
	});
}

function wlanclientscallbackfilter(filterby) {
	var all = ['active', 'all'];
	for (var idx = 0; idx < all.length; idx++) {
		var e = document.getElementById('wlanclients_filter_' + all[idx]);
		e.style.fontWeight = (filterby == all[idx]) ? 700 : 400;
	}
}

function wlanclientscallback(sortby) {

	var all;
	var filterby = 'active';
	all = ['active', 'all'];
	for (var idx = 0; idx < all.length; idx++) {
		var e = document.getElementById('wlanclients_filter_' + all[idx]);
		if (e === null) {
			break;
		}
		if (e.style.fontWeight == 700) {
			filterby = all[idx];
			break;
		}
	}

	if (sortby == '') {
		sortby = 'displayname';
		if (filterby == 'active') {
			all = ['displayname', 'tx', 'rx', 'percent'];
		} else {
			all = ['displayname', 'mac', 'last_seen'];
		}
		for (var idx = 0; idx < all.length; idx++) {
			var e = document.getElementById('wlanclients_sortby_' + all[idx]);
			if (e === null) {
				break;
			}
			if (e.style.fontWeight == 700) {
				sortby = all[idx];
				break;
			}
		}
	}

	var counter_active = 0;
	var counter_all = 0;

	var html = '';
	if (wlanclients.length > 0) {
		html += '<div class="row space"><div class="col-xs-12 space">';
		html += '<span>Filtrowanie:</span>';
		html += '<span class="click" onclick="wlanclientscallbackfilter(\'active\');wlanclientscallback(\'\');"><span id="wlanclients_filter_active"> aktywni (0) </span></span>|';
		html += '<span class="click" onclick="wlanclientscallbackfilter(\'all\');wlanclientscallback(\'\');"><span id="wlanclients_filter_all"> wszyscy (0) </span></span>';
		html += '</div><div class="col-xs-12">';
		html += '<span>Sortowanie po</span>';
		html += '<span class="click" onclick="wlanclientscallback(\'displayname\');"><span id="wlanclients_sortby_displayname"> nazwie </span></span>|';
		if (filterby == 'active') {
			html += '<span class="click" onclick="wlanclientscallback(\'tx\');"><span id="wlanclients_sortby_tx"> wysłano </span></span>|';
			html += '<span class="click" onclick="wlanclientscallback(\'rx\');"><span id="wlanclients_sortby_rx"> pobrano </span></span>|';
			html += '<span class="click" onclick="wlanclientscallback(\'percent\');"><span id="wlanclients_sortby_percent"> udziale w ruchu </span></span>';
		} else {
			html += '<span class="click" onclick="wlanclientscallback(\'mac\');"><span id="wlanclients_sortby_mac"> MAC </span></span>|';
			html += '<span class="click" onclick="wlanclientscallback(\'last_seen\');"><span id="wlanclients_sortby_last_seen"> ostatniej widoczności </span></span>';
		}
		html += '</div></div>';

		var total = 0;
		for (var idx = 0; idx < wlanclients.length; idx++) {
			if (!wlanclients[idx].active) {
				wlanclients[idx].active_id = -1;
				wlanclients[idx].ip = '';
				continue;
			} else {
				wlanclients[idx].first_seen = '-';
				wlanclients[idx].last_seen = '-';
			}
			total += wlanclients[idx].tx + wlanclients[idx].rx;
		}
		for (var idx = 0; idx < wlanclients.length; idx++) {
			wlanclients[idx].percent = parseInt((wlanclients[idx].tx + wlanclients[idx].rx) * 100 / total);
			if (wlanclients[idx].dhcpname == '*') { wlanclients[idx].dhcpname = ''; }
			wlanclients[idx].displayname = (wlanclients[idx].username != '' ? wlanclients[idx].username : (wlanclients[idx].dhcpname != '' ? wlanclients[idx].dhcpname : wlanclients[idx].mac ));
			wlanclients[idx].id = idx;
			if (wlanclients[idx].active) {
				counter_active ++;
				for (var idx1 = 0; idx1 < wlanclients.length; idx1++) {
					if (!wlanclients[idx1].active) {
						if (wlanclients[idx1].mac == wlanclients[idx].mac) {
							wlanclients[idx1].active_id = wlanclients[idx].id;
							wlanclients[idx1].ip = wlanclients[idx].ip;
							wlanclients[idx].first_seen = wlanclients[idx1].first_seen;
							wlanclients[idx].last_seen = wlanclients[idx1].last_seen;
							break;
						}
					}
				}
			} else {
				counter_all ++;
			}
		}
		var any_active = false;
		var any_all = false;
		var sorted = sortJSON(wlanclients, sortby, 'asc');
		for (var idx = 0; idx < sorted.length; idx++) {
			if (filterby == 'active') {
				if (!sorted[idx].active) { continue; }
				html += '<hr><div class="row">';
				html += '<div class="col-xs-9"><span class="click" onclick="hostnameedit(' + sorted[idx].id + ');">' + sorted[idx].displayname + '</span></div>';
				html += '<div class="col-xs-3 text-right"><span class="click" onclick="hostmenu(' + sorted[idx].id + ');"><i data-feather="more-vertical"></i></span></div>';
				html += '<div class="col-xs-12">Wysłano: ' + bytesToSize(sorted[idx].tx) + ', pobrano: ' + bytesToSize(sorted[idx].rx) + ', ' + sorted[idx].percent + '% udziału w ruchu' + '</div>';
				html += '</div>';
				any_active = true;
			} else {
				if (sorted[idx].active) { continue; }
				html += '<hr><div class="row">';
				html += '<div class="col-xs-9"><span class="click" onclick="hostnameedit(' + sorted[idx].id + ');">' + (sorted[idx].active_id > -1 ? '<span title="aktywny" style="color:green">&#9679;</span>&nbsp;' : '') + sorted[idx].displayname + '</span></div>';
				html += '<div class="col-xs-3 text-right"><span class="click" onclick="hostmenu(' + sorted[idx].id + ');"><i data-feather="more-vertical"></i></span></div>';
				html += '<div class="col-xs-12">MAC: ' + sorted[idx].mac + ', pierwszy raz: ' + formatDateTime(sorted[idx].first_seen) + ', ostatni raz: ' + formatDateTime(sorted[idx].last_seen) + (sorted[idx].active_id > -1 ? ', <span style="color:green">aktywny</span>' : '') + '</div>';
				html += '</div>';
				any_all = true;
			}
		}
	}
	if (filterby == 'active') {
		if (!any_active) {
			html += '<div class="alert alert-warning">Brak połączonych klientów Wi-Fi</div>';
		}
	} else {
		if (!any_all) {
			html += '<div class="alert alert-warning">Brak informacji o połączeniach klientów Wi-Fi</div>';
		}
	}
	setValue('div_wlanclients_content', html);

	if (wlanclients.length > 0) {
		all = ['displayname', 'tx', 'rx', 'percent', 'mac', 'last_seen'];
		for (var idx = 0; idx < all.length; idx++) {
			var e = document.getElementById('wlanclients_sortby_' + all[idx]);
			if (e === null) {
				continue;
			}
			e.style.fontWeight = (sortby == all[idx]) ? 700 : 400;
		}
		showicon();

		setValue('wlanclients_filter_active', ' aktywni (' + counter_active + ') ');
		setValue('wlanclients_filter_all', ' wszyscy (' + counter_all + ') ');
		wlanclientscallbackfilter(filterby);
	}
}

var logs;

function showclientslogs() {
	ubus_call('"easyconfig", "clientslogs", {}', function(data) {
		logs = sortJSON(data.result, 'id', 'desc');
		clientslogscallback(0, 9);
	});
}

function timestampToDate(ts) {
	function z(n){return (n<10?'0':'')+ +n;}
	var d = new Date(ts * 1000);
	return '' + d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds());
}

function clientslogscallback(first, last) {
	var html = '';
	if (logs.length > 0) {
		if (logs.length - 1 < last) { last = logs.length - 1; }
		for (var idx = first; idx <= last; idx++) {
			var title = '';
			if (logs[idx].desc !== '' && typeof logs[idx].desc.band !== 'undefined') {
				title = 'Pasmo: ' + (logs[idx].desc.band == 2 ? '2.4 GHz' : '5 GHz') + ', SSID: ' + logs[idx].desc.ssid;
			}
			html += '<div class="row space">';
			html += '<div class="col-xs-6 col-sm-3">' + formatDateTime(timestampToDate(logs[idx].id)) + '</div>';
			html += '<div class="col-xs-6 col-sm-3" title="' + title + '">' + (logs[idx].event == 'connect' ? 'połączenie' : 'rozłączenie') + '</div>';
			html += '<div class="col-xs-12 col-sm-6">' + (logs[idx].username != '' ? logs[idx].username : (logs[idx].dhcpname != '' ? logs[idx].dhcpname + ' / ' + logs[idx].mac : logs[idx].mac)) + '</div>';
			html += '</div>';
		}
		html += '<div class="row">';
		html += '<div class="col-xs-4 text-left"><p>' + (first + 1) + ' - ' + (last + 1) + ' z ' + logs.length + '</p></div>';
		html += '<div class="col-xs-8 text-right">';
		html += '<span class="btn btn-default" onclick="clientslogscallback(0,9);">|&larr;</span>';
		html += '<span class="btn btn-default" onclick="clientslogscallback(' + ((first - 10) < 0 ? '0,9' : (first - 10) + ',' + (first - 1)) + ');">&larr;</span>';
		html += '<span class="btn btn-default" onclick="clientslogscallback(' + ((last + 10) > (logs.length - 1) ? (logs.length - 10) + ',' + (logs.length - 1) : (last + 1) + ',' + (last + 10))  + ');">&rarr;</span>';
		html += '<span class="btn btn-default" onclick="clientslogscallback(' + (logs.length - 10) + ',' + (logs.length - 1) + ');">&rarr;|</span>';
		html += '</div>';
		html += '</div>';
	} else {
		html += '<div class="alert alert-warning">Brak historii połączeń</div>';
	}
	setValue('div_clientslogs_content', html);
}

function hostmenu(id) {
	var host;
	for (var i = 0; i < wlanclients.length; i++) {
		if (wlanclients[i].id == id) {
			host = wlanclients[i];
			break;
		}
	}
	var html = host.displayname + '<hr>';

	html += '<p><span class="click" onclick="closeMsg();hostinfo(' + (host.active_id > -1 ? host.active_id : host.id) + ');">informacje</span></p>';
	html += '<p><span class="click" onclick="closeMsg();hostnameedit(' + host.id + ');">zmiana nazwy</span>';
	html += '<p><span class="click" onclick="closeMsg();hostblock(' + host.id + ');">blokady</span></p>';
	if (config.services.nftqos) {
		html += '<p><span class="click" onclick="closeMsg();hostqos(' + host.id + ');">limity</span></p>';
	}
	html += '<p><span class="click" onclick="closeMsg();hostip(' + host.id + ');">statyczny adres IP</span></p>';
	html += '<p><span class="click" onclick="closeMsg();hoststatistics(' + host.id + ',\'d\',30);">transfer dzienny</span></p>';
	html += '<p><span class="click" onclick="closeMsg();hoststatistics(' + host.id + ',\'m\',0);">transfer miesięczny</span></p>';
	showMsg(html);
}

function calculatedistance(frequency, signal) {
	var dist = Math.pow(10.0, (27.55 - (20 * Math.log10(frequency)) + Math.abs(signal)) / 20.0);
	return dist.toFixed(0);
}

function hostinfo(id) {
	var html = '';
	var vendor = '';
	var host;
	for (var i = 0; i < wlanclients.length; i++) {
		if (wlanclients[i].id == id) {
			host = wlanclients[i];
			break;
		}
	}

	var key = (host.mac).substring(0,8).toUpperCase();
	if (key in manuf) {
		vendor = manuf[key];
	}
	html += createRowForModal('Nazwa', (host.username == '' ? '-' : host.username));
	html += createRowForModal('MAC', '<span>' + host.mac + '</span><br><small><span>' + vendor + '</span></small>');
	html += createRowForModal('Nazwa rzeczywista', (host.dhcpname == '' ? '-' : host.dhcpname));
	if (host.active) {
		html += createRowForModal('Wysłano', bytesToSize(host.tx));
		html += createRowForModal('Pobrano', bytesToSize(host.rx));
		html += createRowForModal('Poziom sygnału', (host.signal + ' dBm (~' + calculatedistance(host.band == 2 ? 2412 : 5180, host.signal) + ' m)'));
		html += createRowForModal('Pasmo', (host.band == 2 ? '2.4 GHz' : '5 GHz'));
		html += createRowForModal('Połączony', '<span>' + formatDuration(host.connected, false) + '</span><span class="visible-xs oneline"></span><small><span>' + (host.connected_since == '' ? '' : ' (od ' + formatDateTime(host.connected_since) + ')') + '</span></small>');
		html += createRowForModal('Adres IP', (host.ip == '' ? '-' : host.ip));
	} else {
		html += createRowForModal('Połączony', 'nie');
	}
	html += createRowForModal('Pierwszy raz widziany', formatDateTime(host.first_seen));
	html += createRowForModal('Ostatni raz widziany', formatDateTime(host.last_seen));
	showMsg(html, false);
}

function hostblock(id) {
	var host;
	for (var i = 0; i < wlanclients.length; i++) {
		if (wlanclients[i].id == id) {
			host = wlanclients[i];
			break;
		}
	}
	setValue('hostblock_mac', host.mac);
	setValue('hostblock_name', host.displayname);

	var days = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

	var html = '<table class="table"><tr><td>Dzień / Godzina</td><td>Po</td><td>Wt</td><td>Śr</td><td>Cz</td><td>Pi</td><td>So</td><td>Ni</td></tr>';
	for (var i = 0; i < 24; i++) {
		html += '<tr><td>' + i + '-' + (i + 1) + '</td>';
		for (var j = 0; j < 7; j++) {
			html += '<td id="t' + i + j + '" title="' + days[j] + ', ' + i + ':00 - ' + i + ':59"></td>';
		}
		html += '</tr>';
	}
	html += '</table>';

	setValue('div_hostblock_scheduler', html);
	for (var i = 0; i < 24; i++) {
		for (var j = 0; j < 7; j++) {
			document.getElementById('t' + i + j).addEventListener('click', hostblock_toggle);
		}
	}
	var bc = '#337ab7';
	document.getElementById('hostblock_off').style.backgroundColor = bc;

	if (host.block == 0) { setValue('hostblock_none', true); }
	if (host.block == 1) { setValue('hostblock_permanent', true); }
	if (host.block == 2) {
		setValue('hostblock_temporary', true);
		var code = [64,32,16,8,4,2,1]
		var hours = (host.blockdata).match(/.{1,2}/g);
		if (hours.length == 24) {
			for (var i = 0; i < 24; i++) {
				var t = parseInt(hours[i], 16);
				for (var j = 0; j < 7; j++) {
					if ((t & code[j]) == code[j]) {
						document.getElementById('t' + i + j).style.backgroundColor = bc;
					}
				}
			}
		}
	}

	setDisplay('div_hostblock', true);
}

function cancelhostblock() {
	setDisplay('div_hostblock', false);
}

function okhostblock() {
	cancelhostblock();
	var mac = getValue('hostblock_mac');
	var nmac = mac.replace(/:/g,'');
	var name = getValue('hostblock_name');
	var action;

	if (getValue('hostblock_none')) { action = 0; }
	if (getValue('hostblock_permanent')) { action = 1; }
	if (getValue('hostblock_temporary')) { action = 2; }

	var cmd = [];
	cmd.push('uci -q del firewall.m' + nmac);
	for (var i = 0; i < 24; i++) {
		cmd.push('uci -q del firewall.m' + nmac + '_' + i);
	}
	if (action == 1) {
		cmd.push('uci set firewall.m' + nmac + '=rule');
		cmd.push('uci set firewall.m' + nmac + '.src=lan');
		cmd.push('uci set firewall.m' + nmac + '.dest=wan');
		cmd.push('uci set firewall.m' + nmac + '.src_mac=' + mac);
		cmd.push('uci set firewall.m' + nmac + '.target=REJECT');
		cmd.push('uci set firewall.m' + nmac + '.proto=\\\"tcp udp\\\"');
		cmd.push('uci set firewall.m' + nmac + '.name=\\\"' + name + '\\\"');
	}
	if (action == 2) {
		var bc = document.getElementById('hostblock_off').style.backgroundColor;
		var code = [64,32,16,8,4,2,1]
		var hex = '';
		for (var i = 0; i < 24; i++) {
			var sum = 0;
			for (var j = 0; j < 7; j++) {
				if (document.getElementById('t' + i + j).style.backgroundColor == bc) {
					sum += code[j];
				}
			}
			hex += ('0' + (Number(sum).toString(16))).slice(-2).toUpperCase();
		}
		cmd.push('easyconfig_firewall_helper.sh set ' + mac + ' ' + hex);
	}
	cmd.push('uci commit firewall');
	cmd.push('/etc/init.d/firewall restart');
	cmd.push('sleep 1');

	execute(cmd, showwlanclients);
}

function hostblock_toggle(evt) {
	var e = evt.target;
	e.style.backgroundColor = (e.style.backgroundColor == document.getElementById('hostblock_off').style.backgroundColor) ? document.body.style.backgroundColor : '#337ab7';
}

function hostblock_checkall() {
	for (var i = 0; i < 24; i++) {
		for (var j = 0; j < 7; j++) {
			document.getElementById('t' + i + j).style.backgroundColor = '#337ab7';
		}
	}
}

function hostblock_uncheckall() {
	for (var i = 0; i < 24; i++) {
		for (var j = 0; j < 7; j++) {
			document.getElementById('t' + i + j).style.backgroundColor = document.body.style.backgroundColor;
		}
	}
}

function hostnameedit(id) {
	var host;
	for (var i = 0; i < wlanclients.length; i++) {
		if (wlanclients[i].id == id) {
			host = wlanclients[i];
			break;
		}
	}

	setValue('hostname_mac', host.mac);
	setValue('hostname_name', host.displayname);
	setValue('hostname_name1', host.displayname);
	setDisplay('div_hostname', true);
	document.getElementById('hostname_name').focus();
}

function cancelhostname() {
	setDisplay('div_hostname', false);
}

function savehostname() {
	cancelhostname();

	var mac = getValue('hostname_mac');
	var nmac = mac.replace(/:/g,'');
	var name = getValue('hostname_name');

	var cmd = [];
	cmd.push('uci -q del easyconfig.m' + nmac);
	cmd.push('uci set easyconfig.m' + nmac + '=mac');
	cmd.push('uci set easyconfig.m' + nmac + '.name=\\\"' + escapeShell(name) +'\\\"');
	cmd.push('uci commit easyconfig');

	execute(cmd, showwlanclients);
}

function hostip(id) {
	var host;
	for (var i = 0; i < wlanclients.length; i++) {
		if (wlanclients[i].id == id) {
			host = wlanclients[i];
			break;
		}
	}

	setValue('hostip_mac', host.mac);
	setValue('hostip_name', host.displayname);
	setValue('hostip_ip', (host.staticdhcp == '' ? host.ip : host.staticdhcp));
	var e = document.getElementById('hostip_ip');
	proofreadText(e, validateIP, 0);
	setValue('hostip_disconnect', false);

	setValue('hostip_ipaddr', (host.staticdhcp == '' ? 'brak' : host.staticdhcp));
	setDisplay('div_hostip', true);
	e.focus();
}

function cancelhostip() {
	setDisplay("div_hostip", false);
}

function removehostip() {
	cancelhostip();

	var mac = getValue('hostip_mac');
	var nmac = mac.replace(/:/g,'');

	var cmd = [];
	cmd.push('uci -q del dhcp.m' + nmac);
	cmd.push('uci commit dhcp');
	cmd.push('/etc/init.d/dnsmasq restart');

	if (config.services.nftqos) {
		cmd.push('uci -q del nft-qos.m' + nmac + 'up');
		cmd.push('uci -q del nft-qos.m' + nmac + 'down');
		cmd.push('uci commit nft-qos');
		cmd.push('/etc/init.d/nft-qos restart');
	}

	execute(cmd, showwlanclients);
}

function savehostip() {
	cancelhostip();

	if (checkField('hostip_ip', validateIP)) {return;}

	var mac = getValue('hostip_mac');
	var nmac = mac.replace(/:/g,'');
	var ip = getValue('hostip_ip');

	var cmd = [];
	cmd.push('uci set dhcp.m' + nmac + '=host');
	cmd.push('uci set dhcp.m' + nmac + '.mac=' + mac);
	cmd.push('uci set dhcp.m' + nmac + '.ip=' + ip);
	cmd.push('uci commit dhcp');
	cmd.push('/etc/init.d/dnsmasq restart');

	if (config.services.nftqos) {
		cmd.push('uci -q set nft-qos.m' + nmac + 'up.ipaddr=' + ip);
		cmd.push('uci -q set nft-qos.m' + nmac + 'down.ipaddr=' + ip);
		cmd.push('uci commit nft-qos');
		cmd.push('/etc/init.d/nft-qos restart');
	}

	if (getValue('hostip_disconnect')) {
		cmd.push('MAC=\\\"' + mac + '\\\"');
		cmd.push('T=$(ubus list hostapd.*)');
		cmd.push('for T1 in $T; do');
		cmd.push('	T2=$(ubus call $T1 get_clients | grep $MAC)');
		cmd.push('	if [ -n \\\"$T2\\\" ]; then');
		cmd.push('		ubus call $T1 del_client \\\"{\'addr\':\'$MAC\',\'reason\':5,\'deauth\':false,\'ban_time\':0}\\\"');
		cmd.push('		rm -- \\\"$0\\\"');
		cmd.push('		exit 0');
		cmd.push('	fi');
		cmd.push('done');
	}

	execute(cmd, showwlanclients);
}

function hostqos(id) {
	var host;
	for (var i = 0; i < wlanclients.length; i++) {
		if (wlanclients[i].id == id) {
			host = wlanclients[i];
			break;
		}
	}

	setValue('hostqos_mac', host.mac);
	setValue('hostqos_name', host.displayname);
	setValue('hostqos_ip', host.ip);

	// KB/s to Mb/s
	setValue('hostqos_upload', parseInt(host.qos.bwup * 8 / 1024));
	setValue('hostqos_download', parseInt(host.qos.bwdown * 8 / 1024));

	setDisplay('div_hostqos', true);
	document.getElementById('hostqos_upload').focus();
}

function removehostqos() {
	setDisplay('div_hostqos', false);

	var cmd = [];

	var mac = getValue('hostqos_mac');
	var nmac = mac.replace(/:/g,'');
	cmd.push('uci -q del nft-qos.m' + nmac + 'up');
	cmd.push('uci -q del nft-qos.m' + nmac + 'down');
	cmd.push('uci commit nft-qos');
	cmd.push('/etc/init.d/nft-qos restart');

	execute(cmd, showwlanclients);
}

function savehostqos() {
	setDisplay('div_hostqos', false);

	var cmd = [];

	var bwup = getValue('hostqos_upload');
	if (validateNumericRange(bwup, 0, 999) != 0) {
		showMsg('Błąd w polu ' + getLabelText('hostqos_upload'), true);
		return;
	}

	var bwdown = getValue('hostqos_download');
	if (validateNumericRange(bwdown, 0, 999) != 0) {
		showMsg('Błąd w polu ' + getLabelText('hostqos_download'), true);
		return;
	}

	var mac = getValue('hostqos_mac');
	var nmac = mac.replace(/:/g,'');
	var ip = getValue('hostqos_ip');

	if (bwup == 0) {
		cmd.push('uci -q del nft-qos.m' + nmac + 'up');
	} else {
		cmd.push('uci set nft-qos.m' + nmac + 'up=upload');
		cmd.push('uci set nft-qos.m' + nmac + 'up.unit=kbytes');
		cmd.push('uci set nft-qos.m' + nmac + 'up.ipaddr=' + ip);
		// Mb/s to KB/s
		cmd.push('uci set nft-qos.m' + nmac + 'up.rate=' + parseInt(bwup * 1024 / 8));
	}

	if (bwdown == 0) {
		cmd.push('uci -q del nft-qos.m' + nmac + 'down');
	} else {
		cmd.push('uci set nft-qos.m' + nmac + 'down=download');
		cmd.push('uci set nft-qos.m' + nmac + 'down.unit=kbytes');
		cmd.push('uci set nft-qos.m' + nmac + 'down.ipaddr=' + ip);
		// Mb/s to KB/s
		cmd.push('uci set nft-qos.m' + nmac + 'down.rate=' + parseInt(bwdown * 1024 / 8));
	}

	cmd.push('uci set nft-qos.default.limit_enable=1');
	cmd.push('uci set nft-qos.default.limit_type=static');
	cmd.push('uci commit nft-qos');
	cmd.push('/etc/init.d/nft-qos restart');

	if (bwup > 0 || bwdown > 0) {
		cmd.push('uci set dhcp.m' + nmac + '=host');
		cmd.push('uci set dhcp.m' + nmac + '.mac=' + mac);
		cmd.push('uci set dhcp.m' + nmac + '.ip=' + ip);
		cmd.push('uci commit dhcp');
		cmd.push('/etc/init.d/dnsmasq restart');
	}

	execute(cmd, showwlanclients);
}

function cancelhostqos() {
	setDisplay('div_hostqos', false);
}

function hoststatistics(id, type, limit) {
	var host;
	for (var i = 0; i < wlanclients.length; i++) {
		if (wlanclients[i].id == id) {
			host = wlanclients[i];
			break;
		}
	}
	hoststatisticsmodal(host.mac, 'Statystyka transferu dla "' + host.displayname + '"', type, limit)
}

function hoststatisticsmodal(mac, title, type, limit) {
	ubus_call('"easyconfig", "clientstatistics", {"mac":"' + mac + '"}', function(data) {
		var html = title + '<hr>';
		if ((data.statistics).length == 0) {
			html += 'Brak danych';
		} else {
			if (type == 'm') {
				for (var idx = 0; idx < (data.statistics).length; idx++) {
					(data.statistics)[idx].date = ((data.statistics)[idx].date).substring(0,6);
				}
				html += createRow4ColForModal('Miesiąc', 'Wysłano', 'Pobrano', 'Łącznie');
			} else {
				html += createRow4ColForModal('Dzień', 'Wysłano', 'Pobrano', 'Łącznie');
			}
			var traffic = [];
			var sorted = sortJSON(data.statistics, 'date', 'desc');
			var date = sorted[0].date;
			var total_tx = sorted[0].tx;
			var total_rx = sorted[0].rx;
			for (var idx = 1; idx < sorted.length; idx++) {
				if (sorted[idx].date == date) {
					total_tx += sorted[idx].tx;
					total_rx += sorted[idx].rx;
				} else {
					traffic.push({'date':date,'tx':total_tx,'rx':total_rx});
					date = sorted[idx].date;
					total_tx = sorted[idx].tx;
					total_rx = sorted[idx].rx;
				}
			}
			traffic.push({'date':date,'tx':total_tx,'rx':total_rx});

			if (limit < 0) {
				traffic.shift();
				traffic.splice(limit * -1);
			}
			if (limit > 0) {
				traffic.splice(limit);
			}
			var total_total = 0;
			total_tx = 0;
			total_rx = 0;
			for (var idx = 0; idx < traffic.length; idx++) {
				html += createRow4ColForModal(formatDateTime(traffic[idx].date), bytesToSize(traffic[idx].tx), bytesToSize(traffic[idx].rx), bytesToSize(traffic[idx].tx + traffic[idx].rx));
				total_tx += traffic[idx].tx;
				total_rx += traffic[idx].rx;
				total_total += traffic[idx].tx + traffic[idx].rx;
			}
			if (traffic.length > 1) {
				html += '<p></p>' + createRow4ColForModal('Łącznie', bytesToSize(total_tx), bytesToSize(total_rx), bytesToSize(total_total));
			}
		}
		showMsg(html);
	});
}

/*****************************************************************************/

function showqueries() {
	ubus_call('"easyconfig", "queries", {}', function(data) {
		queries = data.result;
		queriescallback('id', 'desc');
	});
}

var queries;

function queriescallback(sortby, order) {
	var html = '';
	if (queries.length > 0) {

		html += '<div class="row"><label class="col-xs-6 text-right">Liczba zapytań</label><div class="col-xs-6"><p>' + queries.length + '</p></div></div>';
		var cnt = 0;
		for (var idx = 0; idx < queries.length; idx++) {
			if (queries[idx].nxdomain) {
				cnt ++;
			}
		}
		html += '<div class="row"><label class="col-xs-6 text-right">Liczba zapytań o niedostępne domeny</label><div class="col-xs-6"><p>' + cnt + '<span class="visible-xs oneline"></span><small> (' + parseInt(cnt * 100 / queries.length) + '%)</small></p></div></div>';
		html += '<hr>'

		html += '<div class="row">';
		html += '<div class="col-xs-6 col-sm-4"><span class="click" onclick="queriescallback(\'time\');"><span id="queries_sortby_time">Czas</span></span></div>';
		html += '<div class="col-xs-6 col-sm-4"><span class="click" onclick="queriescallback(\'host\');"><span id="queries_sortby_host">Klient</span></span></div>';
		html += '<div class="col-xs-12 col-sm-4"><span class="click" onclick="queriescallback(\'query\');"><span id="queries_sortby_query">Zapytanie</span></span></div>';
		html += '</div><hr>';

		var sorted = sortJSON(queries, sortby, (order ? order : 'asc'));
		for (var idx = 0; idx < sorted.length; idx++) {
			html += '<div class="row space">';
			html += '<div class="col-xs-6 col-sm-4">' + formatDateTime(sorted[idx].time) + '</div>';
			html += '<div class="col-xs-6 col-sm-4">' + sorted[idx].host + '</div>';
			if (sorted[idx].nxdomain) {
				html += '<div class="col-xs-12 col-sm-4 text-muted" title="brak domeny">' + sorted[idx].query + '</div>';
			} else {
				if (config.services.adblock) {
					html += '<div class="col-xs-12 col-sm-4"><span class="click" onclick="queriesmenu(\'' + sorted[idx].query + '\');">' + sorted[idx].query + '</span></div>';
				} else {
					html += '<div class="col-xs-12 col-sm-4">' + sorted[idx].query + '</div>';
				}
			}
			html += '</div>';
		}
	} else {
		html += '<div class="alert alert-warning">Brak zapytań DNS</div>';
	}
	setValue('div_queries_content', html);

	if (queries.length > 0) {
		var all = ['time', 'query', 'host'];
		for (var idx = 0; idx < all.length; idx++) {
			var e = document.getElementById('queries_sortby_' + all[idx]);
			e.style.fontWeight = (sortby == all[idx]) ? 700 : 400;
		}
	}
}

function queriesmenu(domain) {
	var html = domain + '<hr>';
	html += '<p><a span class="click" onclick="closeMsg();gotoadblock(\'' + domain + '\');">przenieś do blokady domen</span></p>';
	showMsg(html);
}

function gotoadblock(domain) {
	setValue('adblock_domain', domain);
	btn_pages('adblock');
	document.getElementById('adblock_domain').focus();
}

/*****************************************************************************/

function lastDays(cnt,d) {
	d = +(d || new Date());
	var days = [];
	var i=cnt;
	while (i--) {
		days.push(formatDate(new Date(d-=8.64e7)));
	}
	return days;
}

function currentPeriod(start) {
	var d = new Date();
	var days = [];
	var i=31;
	d.setDate(d.getDate() + 1);
	while (i--) {
		var nd = new Date(d-=8.64e7);
		days.push(formatDate(nd));
		if (nd.getDate() == start) {
			return days;
		}
	}
	return days;
}

function lastPeriod(start) {
	d = new Date();
	var days = [];
	var i = 62;
	var t = 0;
	d.setDate(d.getDate() + 1);
	while (i--) {
		var nd = new Date(d-=8.64e7);
		if (nd.getDate() == start) {
			if (t == 1) {
				days.push(formatDate(nd));
				t = 0;
			} else {
				t = 1;
			}
			continue;
		}
		if (t == 1) {
			days.push(formatDate(nd));
		}
	}
	return days;
}

function formatDate(d) {
	function z(n){return (n<10?'0':'')+ +n;}
	return d.getFullYear() + '' + z(d.getMonth() + 1) + '' + z(d.getDate());
}

function showtraffic() {
	ubus_call('"easyconfig", "traffic", {}', function(data) {
		setValue('traffic_cycle', data.traffic_cycle);

		var now = new Date();
		var day = now.getDate();
		var month = now.getMonth();
		var year = now.getFullYear();
		now = new Date(year, month, day);
		if (day <= data.traffic_cycle) {
			var newdate = new Date(year, month, data.traffic_cycle);
		} else {
			var newdate = month == 11 ? new Date(year + 1, 0, data.traffic_cycle) : new Date(year, month + 1, data.traffic_cycle);
		}
		var timediff = Math.abs(newdate.getTime() - now.getTime());
		var diffdays = Math.ceil(timediff / (1000 * 3600 * 24));
		setValue('traffic_currentperiod_daysleft', diffdays);

		setValue('traffic_warning_enabled', (data.traffic_warning_enabled == '1'));
		setValue('traffic_warning_value', data.traffic_warning_value);
		setValue('traffic_warning_unit', data.traffic_warning_unit);
		setValue('traffic_warning_cycle', data.traffic_warning_cycle);

		var traffic_warning_cycle = data.traffic_warning_cycle;
		var traffic_warning_limit = -1;
		if (data.traffic_warning_enabled=="1") {
			traffic_warning_limit = data.traffic_warning_value;
			if (data.traffic_warning_unit == "m") {traffic_warning_limit *= 1024*1024;}
			if (data.traffic_warning_unit == "g") {traffic_warning_limit *= 1024*1024*1024;}
			if (data.traffic_warning_unit == "t") {traffic_warning_limit *= 1024*1024*1024*1024;}
		}
		var traffic_cycle = data.traffic_cycle;

		ubus_call('"easyconfig", "clientstatistics", {"mac":"wan"}', function(data) {
			var today = new Array(formatDate(new Date));
			var yesterday = lastDays(1);
			var last7d = lastDays(7);
			var last30d = lastDays(30);
			var current_period = currentPeriod(traffic_cycle);
			var last_period = lastPeriod(traffic_cycle);

			var traffic_today = 0;
			var traffic_today_rx = 0;
			var traffic_today_tx = 0;
			var traffic_yesterday = 0;
			var traffic_last7d = 0;
			var traffic_last30d = 0;
			var traffic_total = 0;
			var traffic_currentperiod = 0;
			var traffic_lastperiod = 0;
			var total_since = '';

			var traffic = [];
			if ((data.statistics).length > 0) {
				traffic = data.statistics;
			}
			for (var idx = 0; idx < traffic.length; idx++) {
				var t_date = traffic[idx].date;
				var t_rx = traffic[idx].rx;
				var t_tx = traffic[idx].tx;
				var t_value = (parseInt(t_rx) || 0) + (parseInt(t_tx) || 0);
				if (total_since == '') {total_since = t_date;}

				if (t_date == today[0]) {
					traffic_today += parseInt(t_value);
					traffic_today_rx += parseInt(t_rx);
					traffic_today_tx += parseInt(t_tx);
				}

				if (t_date == yesterday[0]) {
					traffic_yesterday += parseInt(t_value);
				}

				for (var idx1 = 0; idx1 < 7; idx1++) {
					if (t_date == last7d[idx1]) {
						traffic_last7d += parseInt(t_value);
					}
				}

				for (var idx1 = 0; idx1 < 30; idx1++) {
					if (t_date == last30d[idx1]) {
						traffic_last30d += parseInt(t_value);
					}
				}

				for (var idx1 = 0; idx1 < current_period.length; idx1++) {
					if (t_date == current_period[idx1]) {
						traffic_currentperiod += parseInt(t_value);
					}
				}

				for (var idx1 = 0; idx1 < last_period.length; idx1++) {
					if (t_date == last_period[idx1]) {
						traffic_lastperiod += parseInt(t_value);
					}
				}

				traffic_total += parseInt(t_value);
				if (total_since > t_date) {total_since = t_date;}
			}

			var e1 = document.getElementById('traffic_today');
			e1.style.color = null;
			var e2 = document.getElementById('traffic_currentperiod');
			e2.style.color = null;
			setDisplay('div_traffic_today_progress', false);
			setDisplay('div_traffic_currentperiod_progress', false);
			var color = '#31708f';

			if (traffic_warning_limit > -1) {
				if (traffic_warning_cycle == 'd') {
					if (traffic_today >= traffic_warning_limit) {color = 'red';}

					var percent = parseInt((traffic_today * 100) / traffic_warning_limit);
					setValue('traffic_today_progress', ' (' + percent + '% z ' + bytesToSize(traffic_warning_limit) + ')');
					if (percent > 100) {percent = 100;}
					document.getElementById('div_traffic_today_progress1').style.width = percent + '%';
					setDisplay('div_traffic_today_progress', true);
					setValue('traffic_currentperiod_progress', '');
				}
				if (traffic_warning_cycle == 'p') {
					if (traffic_currentperiod >= traffic_warning_limit) { e2.style.color = "red"; }

					var percent = parseInt((traffic_currentperiod * 100) / traffic_warning_limit);
					setValue('traffic_currentperiod_progress', ' (' + percent + '% z ' + bytesToSize(traffic_warning_limit) + ')');
					if (percent > 100) {percent = 100;}
					document.getElementById('div_traffic_currentperiod_progress1').style.width = percent + '%';
					setDisplay('div_traffic_currentperiod_progress', true);
					setValue('traffic_today_progress', '');
				}
			} else {
				setValue('traffic_today_progress', '');
				setValue('traffic_currentperiod_progress', '');
			}

			if (traffic_today == 0) {
				setValue('traffic_today', 0);
			} else {
				setValue('traffic_today', '<span class="click" style="color:' + color + '" onclick="hoststatisticsmodal(\'wan\',\'' + getLabelText('traffic_today') + '\',\'d\',1);">' + bytesToSize(traffic_today) + '</span>');
			}
			if (traffic_yesterday == 0) {
				setValue('traffic_yesterday', 0);
			} else {
				setValue('traffic_yesterday', '<span class="click" style="color:' + color + '" onclick="hoststatisticsmodal(\'wan\',\'' + getLabelText('traffic_yesterday') + '\',\'d\',-1);">' + bytesToSize(traffic_yesterday) + '</span>');
			}
			if (traffic_last7d == 0) {
				setValue('traffic_last7d', 0);
			} else {
				setValue('traffic_last7d', '<span class="click" style="color:' + color + '" onclick="hoststatisticsmodal(\'wan\',\'' + getLabelText('traffic_last7d') + '\',\'d\',-7);">' + bytesToSize(traffic_last7d) + '</span>');
			}
			if (traffic_last30d == 0) {
				setValue('traffic_last30d', 0);
			} else {
				setValue('traffic_last30d', '<span class="click" style="color:' + color + '" onclick="hoststatisticsmodal(\'wan\',\'' + getLabelText('traffic_last30d') + '\',\'d\',-30);">' + bytesToSize(traffic_last30d) + '</span>');
			}
			if (traffic_total == 0) {
				setValue('traffic_total', 0);
			} else {
				setValue('traffic_total', '<span class="click" style="color:' + color + '" onclick="hoststatisticsmodal(\'wan\',\'' + getLabelText('traffic_total') + '\',\'m\',0);">' + bytesToSize(traffic_total) + '</span>');
			}
			if (total_since) {
				setValue('traffic_total_since', ' (od ' + formatDateTime(total_since) + ')');
			} else {
				setValue('traffic_total_since', '');
			}
			setValue('traffic_currentperiod', bytesToSize(traffic_currentperiod));
			setValue('traffic_lastperiod', bytesToSize(traffic_lastperiod));
		});
	});
}

function savetraffic() {
	if (checkField('traffic_warning_value', validateNumeric)) {return;}

	var cmd = [];
	cmd.push('uci set easyconfig.traffic=service');
	cmd.push('uci set easyconfig.traffic.cycle=' + getValue('traffic_cycle'));
	cmd.push('uci set easyconfig.traffic.warning_enabled=' + (getValue('traffic_warning_enabled') ? '1' : '0'));
	cmd.push('uci set easyconfig.traffic.warning_value=' + getValue('traffic_warning_value'));
	cmd.push('uci set easyconfig.traffic.warning_cycle=' + getValue('traffic_warning_cycle'));
	cmd.push('uci set easyconfig.traffic.warning_unit=' + getValue('traffic_warning_unit'));
	cmd.push('uci commit easyconfig');

	execute(cmd, showtraffic);
}

function removetraffic() {
	showDialog('Usunąć dane o transferze?', 'Anuluj', 'Usuń', okremovetraffic);
}

function okremovetraffic() {
	var cmd = [];

	cmd.push('DB=/tmp/easyconfig_statistics.json');
	cmd.push('SDB=/usr/lib/easyconfig/easyconfig_statistics.json.gz');
	cmd.push('. /usr/share/libubox/jshn.sh');
	cmd.push('if [ -e \\\"$DB\\\" ]; then');
	cmd.push('json_init');
	cmd.push('json_load_file \\\"$DB\\\"');
	cmd.push('json_add_object \\\"wan\\\"');
	cmd.push('json_add_string \\\"first_seen\\\" \\\"$(date \\\"+%Y%m%d%H%M\\\")\\\"');
	cmd.push('json_close_object');
	cmd.push('json_dump > \\\"$DB\\\"');
	cmd.push('date -d \\\"2000-01-01 00:00:00\\\" \\\"$SDB\\\"');
	cmd.push('/usr/bin/easyconfig_statistics.sh');
	cmd.push('fi');

	execute(cmd, showtraffic);
}

/*****************************************************************************/

function removeDiacritics(str) {
	var from = "ąćęłńóśżźĄĆĘŁŃÓŚŻŹ";
	var to   = "acelnoszzACELNOSZZ";
	for (var idx = 0, l = from.length; idx < l; idx++) {
		str = str.replace(new RegExp(from.charAt(idx), 'g'), to.charAt(idx));
	}
	return str;
}

function sendussd() {
	if (checkField('ussd_code', validateussd)) {return;}
	var ussd = getValue("ussd_code");

	ubus_call('"easyconfig", "ussd", {"code":"' + ussd + '"}', function(data) {
		if (data.response == "") {
			showMsg("Brak odpowiedzi z modemu");
		} else {
			showMsg((data.result).replace(/(\r\n|\r|\n)/g, '<br />'));
		}
	});
}

function sendsms() {
	if (checkField('sms_number', validateNumeric)) {return;}
	if (checkField('sms_msg', validateSMSText)) {return;}

	var tnumber = getValue("sms_number").replace(/[^0-9]/g, '');
	var msg = getValue("sms_msg");

	msg = removeDiacritics(msg);

	ubus_call('"easyconfig", "sms", {"action":"send","arg1":"' + tnumber + '","arg2":"' + msg + '"}', function(data) {
		if ((data.response).match(/sms sent sucessfully/) == null)
			showMsg("Wystąpił problem z wysłaniem wiadomości")
		else {
			showMsg("Wysłano wiadomość")
		}
	});
}

function readsms() {
	ubus_call('"easyconfig", "sms", {"action":"read","arg1":"","arg2":""}', function(data) {
		var html = '';
		var arr = data.msg;
		if (arr.length > 0) {
			var sorted = sortJSON(arr, 'timestamp', 'asc');
			for (var idx = 0; idx < sorted.length; idx++) {
				html += '<hr><div class="row">';
				html += '<div class="col-xs-10">Od: ' + sorted[idx].sender + ', odebrano: ' + formatDateTime(sorted[idx].timestamp);
				if (sorted[idx].part) {
					html += ' (' + sorted[idx].part + '/' + sorted[idx].total + ')';
				}
				html += '</div>';
				html += '<div class="col-xs-2 text-right"><span class="click" onclick="removesms(\'' + sorted[idx].index + '\',\'' + sorted[idx].sender + '\',\'' + sorted[idx].timestamp + '\');"><i data-feather="trash-2"></i></span></div>';
				html += '<div class="col-xs-12">' + (sorted[idx].content).replace(/\n/g,"<br>") + '</div>';
				html += '</div>';
			}
			html += '<hr><p>Liczba wiadomości: ' + arr.length + '</p>';
		} else {
			html += '<br><div class="alert alert-warning">Brak wiadomości</div>';
		}
		setValue('div_sms_content', html);
		showicon();
	});
}

function removesms(index, sender, timestamp) {
	setValue('dialog_val', index);
	showDialog('Usunąć wiadomość od "' + sender + '" otrzymaną ' + formatDateTime(timestamp) + '?', 'Anuluj', 'Usuń', okremovesms);
}

function okremovesms() {
	var index = getValue('dialog_val');

	ubus_call('"easyconfig", "sms", {"action":"delete","arg1":"' + index + '","arg2":""}', function(data) {
		if ((data.response).match(/Deleted message/) == null)
			showMsg('Wystąpił problem z usunięciem wiadomości')
		else {
			readsms();
		}
	});
}

function validateSMSText(msg) {
	var errorCode = 0;

	if (!msg || 0 === msg.length) {
		errorCode = 1;
	}
	var count = (msg.match(/[\^{}\\[~]|]/g) || []).length;
	var len = 160 - msg.length - count;
	if (len < 0) {
		errorCode = 2;
	}

	setValue('sms_len', len);
	return errorCode;
}

function proofreadSMSText(input) {
	proofreadText(input, validateSMSText, 0);
}

function readussdshortcuts() {
	ubus_call('"easyconfig", "ussdshortcuts", {}', function(data) {
		var arr = data.shortcuts;
		if (arr.length > 0) {
			setElementEnabled('ussd_shortcuts', true, false);
			removeOptions('ussd_shortcuts');
			var select = document.getElementById('ussd_shortcuts');
			var opt = document.createElement('option');
			opt.value = 'own';
			opt.innerHTML = 'wybierz kod USSD';
			select.appendChild(opt);
			for (var propt in arr) {
				for (var propt1 in arr[propt]) {
					var opt = document.createElement('option');
					opt.value = propt1;
					opt.innerHTML = arr[propt][propt1];
					select.appendChild(opt);
				}
			}
		} else {
			setElementEnabled('ussd_shortcuts', false, false);
		}
	});
}

function selectussd(code) {
	if (code == 'own') { return; }
	setValue('ussd_code', getValue('ussd_shortcuts'));
}

/*****************************************************************************/

function upgrade_step1() {
	ubus_call('"easyconfig", "upgrade", {"step":"1"}', function(data) {
		var msg = "";
		var e = document.getElementById("div_upgrade_msg");
		removeClasses(e, ["alert-warning","alert-info"]);
		if (data.error) {
			addClasses(e, ["alert-warning"]);

//# 1 nie można pobrać pliku z danymi
//# 2 nie można znaleźć pliku z firmware
//# 3 nie ma innej wersji

			if (data.error == 2 || data.error == 3) {
				msg = "Brak nowej wersji.";
			} else {
				msg = "Wystąpił błąd podczas sprawdzania aktualizacji. Kod błędu: #" + data.error;
			}
			setValue("upgrade_msg", "Kod błędu: " + data.error);
			setDisplay("div_upgrade_step1", true);
			setDisplay("div_upgrade_step2", false);
			setDisplay("div_upgrade_step3", false);
		} else {
			addClasses(e, ["alert-info"]);

			setValue("upgrade_url", data.url);
			setValue("upgrade_sha256sum", data.sha256sum);

			msg += 'Dostępna jest nowa wersja oprogramowania <strong>' + data.version + '</strong>. Wybierz ';
			msg += 'przycisk "Pobierz" aby pobrać nową wersję. W zależności od szybkości połączenia ';
			msg += 'z internetem może to potrwać do kilku minut.';
			msg += '<br><br>Nie zmieniaj ustawień i nie wyłączaj urządzenia w czasie tego procesu.';

			setDisplay("div_upgrade_step1", false);
			setDisplay("div_upgrade_step2", true);
			setDisplay("div_upgrade_step3", false);
		}
		setValue("upgrade_msg", msg);
		setDisplay("div_upgrade_msg", true);
	});
}

function upgrade_step2() {

	var url = getValue("upgrade_url");
	var sha256sum = getValue("upgrade_sha256sum");

	ubus_call('"easyconfig", "upgrade", {"step":"2", "arg1":"' + url + '","arg2":"' + sha256sum + '"}', function(data) {
		var msg = "";
		var e = document.getElementById("div_upgrade_msg");
		removeClasses(e, ["alert-warning","alert-info"]);
		if (data.error) {
			addClasses(e, ["alert-warning"]);

//# 4 brak podanego url
//# 5 brak podanego sha256sum
//# 6 nie zgadza się suma kontrolna pobranego pliku

			if (data.error == 6) {
				msg = "Wystąpił błąd podczas pobierania pliku. Spróbuj ponownie za kilka minut.";
			} else {
				msg = "Wystąpił błąd podczas pobierania pliku. Kod błędu: #" + data.error;
			}

			setDisplay("div_upgrade_step1", true);
			setDisplay("div_upgrade_step2", false);
			setDisplay("div_upgrade_step3", false);
		} else {
			addClasses(e, ["alert-info"]);

			msg += 'Wybierz przycisk "Aktualizacja" aby zainstalować nową wersję oprogramowania. ';
			msg += 'Zaznaczając "Zachowaj ustawienia" możliwe jest zapisane bieżących ustawień. ';
			msg += 'Po wykonaniu aktualizacji nastąpi automatyczny restart urządzenia.';
			msg += '<br><br>Nie zmieniaj konfiguracji i nie wyłączaj urządzenia w czasie tego procesu.';

			setDisplay("div_upgrade_step1", false);
			setDisplay("div_upgrade_step2", false);
			setDisplay("div_upgrade_step3", true);
		}
		setValue("upgrade_msg", msg);
		setDisplay("div_upgrade_msg", true);
	});
}

function upgrade_step3() {

	var sha256sum = getValue("upgrade_sha256sum");
	var ps = getValue("upgrade_preserve_settings");

	ubus_call_noerror('"easyconfig", "upgrade", {"step":"3", "arg1":"' + sha256sum + '","arg2":' + (ps?"true":"false") + '}', function(data) {
		var msg = "";
		var e = document.getElementById("div_upgrade_msg");
		removeClasses(e, ["alert-warning","alert-info"]);
		if (data.error) {
			addClasses(e, ["alert-warning"]);

//# 7 brak podanego sha256sum
//# 8 brak pliku do aktualizacji
//# 9 nie zgadza sie suma kontrolna pliku

			msg = "Wystąpił błąd podczas wykonywania aktualizacji. Kod błędu: #" + data.error;
			setDisplay("div_upgrade_step1", true);
		} else {
			addClasses(e, ["alert-info"]);
			msg = "<b>Trwa aktualizowanie systemu...</b>";
			msg += '<br><br>Nie zmieniaj konfiguracji i nie wyłączaj urządzenia w czasie tego procesu. ';
			msg += 'Po wykonaniu aktualizacji nastąpi automatyczny restart urządzenia.';
			setDisplay("div_upgrade_step1", false);
		}
		setDisplay("div_upgrade_step2", false);
		setDisplay("div_upgrade_step3", false);
		setValue("upgrade_msg", msg);
		setDisplay("div_upgrade_msg", true);
	});
}

/*****************************************************************************/

function showpptp() {
	ubus_call('"easyconfig", "pptp", {}', function(data) {
		setValue('pptp_up', data.up ? 'Uruchomiony' : 'Brak połączenia');
		setValue('pptp_ip', (data.ip == '') ? '-' : '<span class="click" onclick="showgeolocation();">' + data.ip + '</span>');
		setValue('pptp_uptime', formatDuration(data.uptime, false));
		setValue('pptp_uptime_since', data.uptime_since == '' ? '' : ' (od ' + formatDateTime(data.uptime_since) + ')');
		setValue('pptp_auto', data.auto == '1');
		setValue('pptp_name', data.name);
		setValue('pptp_server', data.server);
		setValue('pptp_username', data.username);
		setValue('pptp_password', data.password);
		setValue('pptp_mppe', data.mppe == '1');

		document.getElementById('btn_uppptp').disabled = (data.proto == '' || data.server == '');
		document.getElementById('btn_downpptp').disabled = (data.proto == '' || data.server == '');

		removeOptions('pptp_profile');
		e = document.getElementById('pptp_profile');
		var opt = document.createElement('option');
		opt.value = '';
		opt.innerHTML = 'brak';
		e.appendChild(opt);
		var arr = sortJSON(data.profiles, 'name', 'asc');
		var selected = '';
		for (var idx = 0; idx < arr.length; idx++) {
			var opt = document.createElement('option');
			opt.value = (JSON.stringify(arr[idx])).replace(/\"/g,"$")
			opt.innerHTML = arr[idx].name;
			e.appendChild(opt);
			if (arr[idx].name == data.name) {
				selected = opt.value;
			}
		}
		setValue('pptp_profile', selected);
		selectVpn(selected, false);

		removeOptions('pptp_led');
		e = document.getElementById('pptp_led');
		opt = document.createElement('option');
		opt.value = '';
		opt.innerHTML = 'brak';
		e.appendChild(opt);
		arr = data.leds;
		for (var idx = 0; idx < arr.length; idx++) {
			var opt = document.createElement('option');
			opt.value = arr[idx];
			opt.innerHTML = arr[idx];
			e.appendChild(opt);
		}
		setValue('pptp_led', data.led);
	});
}

function savepptp() {
	var cmd = [];

	var pptp_name = getValue('pptp_name');
	if (pptp_name == '') {
		showMsg('Błąd w polu ' + getLabelText('pptp_name'), true);
		return;
	}
	if (checkField('pptp_server', validateHost)) {return;}

	cmd.push('uci set network.vpn=interface');
	cmd.push('uci set network.vpn.proto=pptp');
	cmd.push('uci set network.vpn.name=\\\"' + escapeShell(getValue('pptp_name')) + '\\\"');
	cmd.push('uci set network.vpn.server=\\\"' + getValue('pptp_server') + '\\\"');
	cmd.push('uci set network.vpn.username=\\\"' + escapeShell(getValue('pptp_username')) + '\\\"');
	cmd.push('uci set network.vpn.password=\\\"' + escapeShell(getValue('pptp_password')) + '\\\"');
	if (getValue('pptp_mppe')) {
		cmd.push('uci -q del network.vpn.pppd_options');
	} else {
		cmd.push('uci set network.vpn.pppd_options=\\\"nomppe\\\"');
	}
	var led = getValue('pptp_led');
	if (led != '') {
		cmd.push('uci set system.led_vpn=led');
		cmd.push('uci set system.led_vpn.name=VPN');
		cmd.push('uci set system.led_vpn.sysfs=\\\"' + led + '\\\"');
		cmd.push('uci set system.led_vpn.trigger=netdev');
		cmd.push('uci set system.led_vpn.dev=pptp-vpn');
		cmd.push('uci set system.led_vpn.mode=link');
	} else {
		cmd.push('uci -q del system.led_vpn');
	}
	cmd.push('ZONE=$(uci show firewall | awk -F. \'/name=.wan.$/{print $2}\')');
	cmd.push('uci del_list firewall.$ZONE.network=vpn');
	cmd.push('uci add_list firewall.$ZONE.network=vpn');

	// profile
	if (getValue('pptp_name') != '') {
		var section = 'v' + (getValue('pptp_name').toLowerCase().replace(/[^a-z0-9_]/g, ''));
		cmd.push('uci -q del easyconfig.' + section);
		cmd.push('uci set easyconfig.' + section + '=vpn');
		cmd.push('uci set easyconfig.' + section + '.proto=pptp');
		cmd.push('uci set easyconfig.' + section + '.name=\\\"' + escapeShell(getValue('pptp_name')) + '\\\"');
		cmd.push('uci set easyconfig.' + section + '.server=\\\"' + getValue('pptp_server') + '\\\"');
		cmd.push('uci set easyconfig.' + section + '.username=\\\"' + escapeShell(getValue('pptp_username')) + '\\\"');
		cmd.push('uci set easyconfig.' + section + '.password=\\\"' + escapeShell(getValue('pptp_password')) + '\\\"');
		cmd.push('uci set easyconfig.' + section + '.mppe=' + (getValue('pptp_mppe') ? '1' : '0'));
		cmd.push('uci set easyconfig.' + section + '.auto=' + (getValue('pptp_auto') ? '1' : '0'));
	}

	if (getValue('pptp_auto')) {
		cmd.push('uci set network.vpn.auto=1');
		cmd.push('uci commit');
		cmd.push('ubus call network reload');
		cmd.push('ifup vpn');
	} else {
		cmd.push('uci set network.vpn.auto=0');
		cmd.push('uci commit');
		cmd.push('ubus call network reload');
		cmd.push('ifdown vpn');
	}
	cmd.push('/etc/init.d/led restart');

	execute(cmd, showpptp);
}

function uppptp() {
	ubus_call('"network.interface", "up", {"interface":"vpn"}', function(data) {
	});
}

function downpptp() {
	ubus_call('"network.interface", "down", {"interface":"vpn"}', function(data) {
		ubus_call('"network.interface", "up", {"interface":"wan"}', function(data) {
		});
	});
}

function selectVpn(data, copydatafromprofile) {
	if (data == '') {
		document.getElementById('btn_removepptp').disabled = true;
	} else {
		document.getElementById('btn_removepptp').disabled = false;
		if (copydatafromprofile) {
			var profile = JSON.parse((data).replace(/\$/g,'"'));
			setValue('pptp_auto', profile.auto == '1');
			setValue('pptp_name', profile.name);
			setValue('pptp_server', profile.server);
			setValue('pptp_username', profile.username);
			setValue('pptp_password', profile.password);
			setValue('pptp_mppe', profile.mppe == '1');
		}
	}
}

function removepptp() {
	var profile = JSON.parse(getValue('pptp_profile').replace(/\$/g,'"'));
	showDialog('Usunąć profil "' + profile.name + '"?', 'Anuluj', 'Usuń', okremovevpnprofile);
}

function okremovevpnprofile() {
	var cmd = [];
	var profile = JSON.parse(getValue('pptp_profile').replace(/\$/g,'"'));
	var section = 'v' + ((profile.name).toLowerCase().replace(/[^a-z0-9_]/g, ''));
	cmd.push('uci -q del easyconfig.' + section);
	cmd.push('[ \\\"x$(uci -q get network.vpn.name)\\\" = \\\"x' + profile.name + '\\\" ] && uci -q del network.vpn');
	cmd.push('uci commit');

	execute(cmd, showpptp);
}

/*****************************************************************************/

function showgeolocation() {
	ubus_call('"easyconfig", "geolocation", {}', function(data) {
		if (data.status == 'success') {
			var html = '';
			html += createRowForModal('Twoje IP', (data.query ? data.query : '-'));
			html += createRowForModal('ISP', (data.isp ? data.isp : '-'));
			html += createRowForModal('Miasto', (data.city ? data.city : '-'));
			html += createRowForModal('Region', (data.regionName ? data.regionName : '-'));
			html += createRowForModal('Kraj', (data.country ? data.country : '-'));
			showMsg(html, false);
		} else {
			showMsg('Błąd odczytu lokalizacji', true);
		}
	});
}

/*****************************************************************************/

var adblock_compressed_lists = false;
var adblock_lists;

function showadblock() {
	ubus_call('"easyconfig", "adblock", {}', function(data) {
		var tmp = data.domains == '' ? '-' : data.domains
		if (data.domains == '0') {
			if (data.status == 'running') { tmp += ' (trwa uruchamianie)' }
		}
		setValue('adblock_domains', tmp);
		setValue('adblock_enabled', data.enabled);
		setValue('adblock_forcedns', data.forcedns);

		adblock_lists = data.lists;
		adblock_compressed_lists = data.compressed_lists;
		var html = '';
		if (adblock_lists.length > 0) {
			html += '<h3 class="section">Źródła</h3>';
		}
		for (var i in adblock_lists) {
			html += '<div class="form-group" id="div_adblock_' + adblock_lists[i].section + '">';
			html += '<label for="adblock_' + adblock_lists[i].section + '" class="col-xs-4 col-sm-3 control-label">' + adblock_lists[i].section + '</label>';
			html += '<div class="col-xs-8 col-sm-9">';
			html += '<label class="switch">';
			html += '<input id="adblock_' + adblock_lists[i].section + '" type="checkbox">';
			html += '<div class="slider round"></div>';
			html += '</label>';
			if (adblock_compressed_lists) {
				html += '<span class="hidden-xs control-label labelleft">Kategoria: ' + adblock_lists[i].focus + ', wielkość: ' + adblock_lists[i].size + ', <a href="' + adblock_lists[i].descurl + '" class="click" target="_blank">opis &rarr;</a></span>';
				html += '<div class="visible-xs">Kategoria: ' + adblock_lists[i].focus + ', wielkość: ' + adblock_lists[i].size + ', <a href="' + adblock_lists[i].descurl + '" class="click" target="_blank">opis &rarr;</a></div>';
			} else {
				html += '<span class="hidden-xs control-label labelleft">' + adblock_lists[i].desc + '</span>';
				html += '<div class="visible-xs">' + adblock_lists[i].desc + '</div>';
			}
			html += '</div>';
			if (adblock_lists[i].section == 'blacklist') {
				if (!adblock_lists[i].enabled) {
					if ((data.blacklist).length > 0) {
						html += '<label class="col-xs-4 col-sm-3 control-label">&nbsp;</label>';
						html += '<div class="col-xs-8 col-sm-9 alert alert-warning" style="margin-bottom:-5px !important;">UWAGA: lista jest wyłączona, ręcznie dodane domeny nie będą blokowane</div>';
					}
				}
			}
			html += '</div>';
		}
		setValue('div_adblock_lists', html);
		setDisplay('div_adblock_lists', true);
		for (var i in adblock_lists) {
			setValue('adblock_' + adblock_lists[i].section, adblock_lists[i].enabled);
		}

		html = '';
		var blacklist = data.blacklist;
		if (blacklist.length > 0) {
			for (var idx = 0; idx < blacklist.length; idx++) {
				html += '<div class="row">';
				html += '<div class="col-xs-9">' + blacklist[idx] + '</div>';
				html += '<div class="col-xs-3 text-right"><span class="click" onclick="removefromblacklist(\'' + blacklist[idx] + '\');"><i data-feather="trash-2"></i></span></div>';
				html += '</div>';
			}
			html += '<hr>';
		}
		html += '<p>Liczba domen: ' + blacklist.length + '</p>';
		setValue('div_adblock_list_blacklist', html);

		html = '';
		var whitelist = data.whitelist;
		if (whitelist.length > 0) {
			for (var idx = 0; idx < whitelist.length; idx++) {
				html += '<div class="row">';
				html += '<div class="col-xs-9">' + whitelist[idx] + '</div>';
				html += '<div class="col-xs-3 text-right"><span class="click" onclick="removefromwhitelist(\'' + whitelist[idx] + '\');"><i data-feather="trash-2"></i></span></div>';
				html += '</div>';
			}
			html += '<hr>';
		}
		html += '<p>Liczba domen: ' + whitelist.length + '</p>';
		setValue('div_adblock_list_whitelist', html);

		showicon();
	});
}

function saveadblock() {
	var cmd = [];

	cmd.push('uci set adblock.global.adb_enabled=' + (getValue('adblock_enabled') ? '1' : '0'));
	if (adblock_compressed_lists) {
		cmd.push('uci set adblock.global.adb_forcedns=' + (getValue('adblock_forcedns') ? '1' : '0'));
		cmd.push('uci -q del adblock.global.adb_sources');
		for (var idx in adblock_lists) {
			if (getValue('adblock_' + adblock_lists[idx].section)) {
				cmd.push('uci add_list adblock.global.adb_sources=' + adblock_lists[idx].section);
			}
		}
	} else {
		cmd.push('uci set adblock.extra.adb_forcedns=' + (getValue('adblock_forcedns') ? '1' : '0'));
		for (var idx in adblock_lists) {
			cmd.push('uci set adblock.' + adblock_lists[idx].section + '.enabled=' + (getValue('adblock_' + adblock_lists[idx].section) ? '1' : '0'));
		}
	}
	cmd.push('uci commit adblock');
	cmd.push('/etc/init.d/adblock restart');

	execute(cmd, showadblock);
}

function checkdomain() {
	if (!getValue('adblock_enabled')) {
		showMsg("Blokada domen jest wyłączona. Nie można sprawdzić domeny");
		return
	}

	if (checkField('adblock_domain', validateHost)) {return;}

	ubus_call('"file", "exec", {"command":"/etc/init.d/adblock","params":["query","' + getValue('adblock_domain') + '"]}', function(data) {
		showMsg((data.stdout).replace(/\n/g,'<br>'));
	});
}

function blacklistdomain() {
	if (checkField('adblock_domain', validateHost)) {return;}

	var domain = getValue('adblock_domain');

	var cmd = [];
	cmd.push('F=$(uci -q get adblock.blacklist.adb_src)');
	cmd.push('[ -z \\\"$F\\\" ] && F=/etc/adblock/adblock.blacklist');
	cmd.push('mkdir -p $(dirname $F)');
	cmd.push('echo \\\"' + domain + '\\\" >> $F');
	cmd.push('/etc/init.d/adblock restart');

	execute(cmd, function(){
		setValue('adblock_domain', '');
		showadblock();
	});
}

function removefromblacklist(domain) {
	setValue('dialog_val', domain);
	showDialog('Usunąć domenę "' + domain + '" z listy blokowanych?', 'Anuluj', 'Usuń', okremovefromblacklist);
}

function okremovefromblacklist() {
	var domain = getValue('dialog_val');

	var cmd = [];
	cmd.push('F=$(uci -q get adblock.blacklist.adb_src)');
	cmd.push('[ -z \\\"$F\\\" ] && F=/etc/adblock/adblock.blacklist');
	cmd.push('sed -i \\\"/^' + domain + '$/d\\\" \\\"$F\\\"');
	cmd.push('/etc/init.d/adblock restart');

	execute(cmd, showadblock);
}

function whitelistdomain() {
	if (checkField('adblock_domain', validateHost)) {return;}

	var domain = getValue('adblock_domain');

	var cmd = [];
	cmd.push('F=/etc/adblock/adblock.whitelist');
	cmd.push('mkdir -p $(dirname $F)');
	cmd.push('echo \\\"' + domain + '\\\" >> $F');
	cmd.push('/etc/init.d/adblock restart');

	execute(cmd, function(){
		setValue('adblock_domain', '');
		showadblock();
	});
}

function removefromwhitelist(domain) {
	setValue('dialog_val', domain);
	showDialog('Usunąć domenę "' + domain + '" z listy dozwolonych?', 'Anuluj', 'Usuń', okremovefromwhitelist);
}

function okremovefromwhitelist() {
	var domain = getValue('dialog_val');

	var cmd = [];
	cmd.push('F=/etc/adblock/adblock.whitelist');
	cmd.push('sed -i \\\"/^' + domain + '$/d\\\" \\\"$F\\\"');
	cmd.push('/etc/init.d/adblock restart');

	execute(cmd, showadblock);
}

/*****************************************************************************/

function shownightmode() {
	ubus_call('"easyconfig", "nightmode", {}', function(data) {
		setValue('nightmode_led_auto_enabled', data.enabled);
		setValue('nightmode_led_auto_latitude', data.latitude);
		setValue('nightmode_led_auto_longitude', data.longitude);
		if (data.sunrise) {
			setValue('nightmode_led_auto_note', 'wschód słońca: ' + data.sunrise + ', zachód: ' + data.sunset);
		} else {
			setValue('nightmode_led_auto_note', '');
		}
	})
}

function savenightmode() {
	if (checkField('nightmode_led_auto_latitude', validateFloat)) {return;}
	if (checkField('nightmode_led_auto_longitude', validateFloat)) {return;}

	var cmd = [];
	cmd.push('uci set easyconfig.global=easyconfig');
	cmd.push('uci set easyconfig.global.latitude=\\\"' + getValue("nightmode_led_auto_latitude") + '\\\"');
	cmd.push('uci set easyconfig.global.longitude=\\\"' + getValue("nightmode_led_auto_longitude") + '\\\"');
	cmd.push('uci commit');
	cmd.push('touch /etc/crontabs/root');
	cmd.push('sed -i \\\"/easyconfig_nightmode/d\\\" /etc/crontabs/root');
	if (getValue("nightmode_led_auto_enabled")) {
		cmd.push('echo \\\"1 0 * * * /usr/bin/easyconfig_nightmode.sh\\\" >> /etc/crontabs/root');
		cmd.push('/usr/bin/easyconfig_nightmode.sh >/dev/null 2>&1');
	} else {
		cmd.push('killall sunwait >/dev/null 2>&1');
	}
	cmd.push('/etc/init.d/cron restart');

	execute(cmd, shownightmode);
}

function btn_nightmode_wifi_on() {
	var cmd = ['wifi up'];

	execute(cmd, function() {});
}

function btn_nightmode_wifi_off() {
	var cmd = ['wifi down'];

	execute(cmd, function() {});
}

function btn_nightmode_leds_on() {
	ubus_call('"easyconfig", "leds", {"action":"on"}', function(data) {});
}

function btn_nightmode_leds_off() {
	ubus_call('"easyconfig", "leds", {"action":"off"}', function(data) {});
}

function btn_nightmode_getlocation() {
	ubus_call('"easyconfig", "geolocation", {}', function(data) {
		if (data.status == 'success') {
			setValue('nightmode_led_auto_latitude', data.lat ? data.lat : '');
			setValue('nightmode_led_auto_longitude', data.lon ? data.lon : '');
		} else {
			showMsg('Błąd odczytu lokalizacji', true);
		}
	});
}

/*****************************************************************************/

function opennav() {
	document.getElementById("menu").style.width = '250px';
}

function closenav() {
	document.getElementById("menu").style.width = '0';
}

function btn_pages(page) {
	closenav();
	setDisplay('div_status',   (page == 'status'));
	setDisplay('div_settings', (page == 'settings'));
	setDisplay('div_system',   (page == 'system'));
	setDisplay('div_watchdog', (page == 'watchdog'));
	setDisplay('div_sitesurvey', (page == 'sitesurvey'));
	setDisplay('div_wlanclients', (page == 'wlanclients'));
	setDisplay('div_clientslogs', (page == 'clientslogs'));
	setDisplay('div_queries', (page == 'queries'));
	setDisplay('div_traffic', (page == 'traffic'));
	setDisplay('div_ussdsms', (page == 'ussdsms'));
	setDisplay('div_pptp', (page == 'pptp'));
	setDisplay('div_adblock', (page == 'adblock'));
	setDisplay('div_nightmode', (page == 'nightmode'));

	if (page == 'status') {
		showstatus();
		showmodemsection();
	}

	if (page == 'settings') {
		showsettings();
	}

	if (page == 'system') {
		showsystem();
	}

	if (page == 'watchdog') {
		showwatchdog();
	}

	if (page == 'sitesurvey') {
		showsitesurvey();
	}

	if (page == 'wlanclients') {
		showwlanclients();
	}

	if (page == 'clientslogs') {
		showclientslogs();
	}

	if (page == 'queries') {
		showqueries();
	}

	if (page == 'traffic') {
		showtraffic();
	}

	if (page == 'ussdsms') {
		readsms();
		readussdshortcuts();
	}

	if (page == 'pptp') {
		showpptp();
	}

	if (page == 'adblock') {
		showadblock();
	}

	if (page == 'nightmode') {
		shownightmode();
	}
}

window.onload = easyconfig_onload;

/*****************************************************************************/

livegraph = {
	axisTop: 10,
	axisRight: 2,
	axisBottom: 20,

	getX: function (graph, tick) {
		return (((180 - (graph.time - tick) / 1000) * graph.width) / 180) + graph.axisLeft;
	},

	getY: function(graph, tick) {
		return (((graph.max - tick) * graph.height) / graph.max) + livegraph.axisTop;
	},

	plot: function (graph) {
		var ctx = graph.context;
		var data = graph.data;
		ctx.strokeStyle = '#c0c0c0';
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(graph.axisLeft, livegraph.axisTop);
		ctx.lineTo(graph.axisLeft + graph.width, livegraph.axisTop);
		ctx.lineTo(graph.axisLeft + graph.width, livegraph.axisTop + graph.height);
		ctx.lineTo(graph.axisLeft, livegraph.axisTop + graph.height);
		ctx.lineTo(graph.axisLeft, livegraph.axisTop);
		ctx.stroke();
		ctx.fillStyle = rgb2hex(window.getComputedStyle(document.body,null).getPropertyValue('color'));
		var offset;
		if (graph.axisLeft > 10) {
			ctx.textAlign = 'right';
			offset = -5;
		} else {
			ctx.textAlign = 'left';
			offset = 5;
		}
		var t;
		t = bandwidth_unit ? graph.max : graph.max * 8;
		var pow = parseInt(Math.floor(Math.log(t) / Math.log(1024)));
		for (var i = 1; i < 11; i++) {
			var y = livegraph.getY(graph, i * graph.max / 10);
			ctx.beginPath();
			ctx.moveTo(graph.axisLeft, y);
			ctx.lineTo(graph.axisLeft + graph.width, y);
			ctx.stroke();
			t = (convertToSpeed(i * graph.max / 10, pow)).split(' ');
			ctx.fillText(t[0], graph.axisLeft + offset, y + 5);
		}
		if (t[1]) {
			var m = (livegraph.getY(graph, 9 * graph.max / 10) - livegraph.getY(graph, graph.max)) / 2;
			ctx.fillText(t[1], graph.axisLeft + offset, livegraph.getY(graph, graph.max) + 5 + m);
		}

		var oldwidth = 0;
		ctx.textAlign = 'center';
		if (data.length > 0) {
			if (data[0].length > 0) {
				graph.time = data[0][data[0].length - 1][0];
			}
			for (var i = 0; i < data[0].length; i++) {
				var x = livegraph.getX(graph, data[0][i][0]);
				if (oldwidth < x) {
					ctx.beginPath();
					ctx.moveTo(x, livegraph.axisTop);
					ctx.lineTo(x, livegraph.axisTop + graph.height);
					ctx.stroke();
					var t = new Date(data[0][i][0]);
					var t1 = (t.getHours() < 10 ? '0' : '') + t.getHours()  + ':' + (t.getMinutes() < 10 ? '0' : '') + t.getMinutes() + ':' + (t.getSeconds() < 10 ? '0' : '') + t.getSeconds();
					ctx.fillText(t1, x, livegraph.axisTop + graph.height + 15);
					oldwidth = x + ctx.measureText(t1).width + 10;
				}
			}
		}
		for (var i = 0; i < (graph.legend).length; i++) {
			for (var j = 0; j < (graph.legend)[i].elements.length; j++) {
				document.getElementById((graph.legend)[i].elements[j]).style.color = (graph.legend)[i].color;
			}
		}

		function plot1(idx, fill) {
			ctx.beginPath();
			var x = livegraph.getX(graph, data[idx][0][0]);
			var y = livegraph.getY(graph, data[idx][0][1]);
			if (fill) {
				ctx.moveTo(x, livegraph.axisTop + graph.height)
				ctx.lineTo(x, y);
			} else {
				ctx.moveTo(x, y);
			}
			for (var i = 1; i < data[idx].length; i++) {
				x = livegraph.getX(graph, data[idx][i][0]);
				y = livegraph.getY(graph, data[idx][i][1]);
				ctx.lineTo(x, y);
			}
			if (fill) {
				ctx.lineTo(x, livegraph.axisTop + graph.height);
				ctx.fill();
			} else {
				ctx.stroke();
			}
		}

		ctx.lineWidth = 1.5;
		for (var i = 0; i < (graph.data).length; i++) {
			if (data[i].length == 0) { continue; }
			ctx.fillStyle = (graph.legend)[i].color;
			ctx.strokeStyle = ctx.fillStyle;
			ctx.globalAlpha = 0.2;
			plot1(i, true);
			ctx.globalAlpha = 1;
			plot1(i, false);
		}
	},

	draw: function (graph) {
		var canvas = document.getElementById(graph.element);
		if (canvas == null) {
			return;
		}

		var ctx = canvas.getContext('2d');
		if (ctx == null) {
			return;
		}

		var positionInfo = document.getElementById('div_' + graph.element).getBoundingClientRect();
		canvas.width = positionInfo.width - 30;
		graph.axisLeft = (canvas.width > 400) ? 80 : 5;

		graph.width = canvas.width - livegraph.axisRight - graph.axisLeft;
		graph.height = canvas.height - livegraph.axisTop - livegraph.axisBottom;

		ctx.font = window.getComputedStyle(document.body,null).getPropertyValue('font-size') + ' ' + window.getComputedStyle(document.body,null).getPropertyValue('font-family');
		graph.context = ctx;

		graph.max = 1;
		for (var j = 0; j < (graph.data).length; j++) {
			for (var i = 0; i < (graph.data)[j].length; i++) {
				if ((graph.data)[j][i][1] > graph.max) { graph.max = (graph.data)[j][i][1]; }
			}
		}
		livegraph.plot(graph);
	}
};
