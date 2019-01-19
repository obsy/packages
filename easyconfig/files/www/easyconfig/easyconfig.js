/*****************************************************************************/

function setCookie(cname, cvalue) {
	var d = new Date();
	d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
	document.cookie = cname + "=" + cvalue + ";" + "expires="+d.toUTCString() + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
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

/*****************************************************************************/

function proofreadHostname(input) {
	proofreadText(input, validateHostname, 0);
}

function proofreadHost(input) {
	proofreadText(input, validateHost, 0);
}

function proofreadDomain(input) {
	proofreadText(input, validateDomain, 0);
}

function proofreadIp(input) {
	proofreadText(input, validateIP, 0);
}

function proofreadMask(input) {
	proofreadText(input, validateMask, 0);
}

function proofreadText(input, proofFunction, validReturnCode) {
	if (input.disabled != true) {
		var e = input.closest('div');
		if (proofFunction(input.value) == validReturnCode) {
			input.style.color = "#555";
			removeClasses(e, ["has-error"]);
		} else {
			input.style.color = "red";
			addClasses(e, ["has-error"]);
		}
	}
}

function proofreadNumericRange(input, min, max) {
	proofreadText(input, function(text){return validateNumericRange(text,min,max)}, 0);
}

function proofreadNumeric(input) {
	proofreadText(input, function(text){return validateNumeric(text)}, 0);
}

function proofreadussd(input) {
	proofreadText(input, validateussd, 0);
}

function validateHostname(name) {
	var errorCode = 0;

	if (name == "") {
		errorCode = 1;
	} else if (name.match(/[^a-zA-Z0-9\-]/) !== null) {
		errorCode = 2;
	}
	return errorCode;
}

function validateHost(name) {
	var errorCode = 0;

	if (name == "") {
		errorCode = 1;
	} else if (name.match(/[^a-zA-Z0-9.]/) !== null) {
		errorCode = 2;
	}
	return errorCode;
}

function validateDomain(name) {
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
			for(field=1; field <= 4; field++) {
				if ((ipFields[field] > 255) || (ipFields[field] == 255 && field==4)) {
					errorCode = 1;
				}
			}
		}
	}
	return errorCode;
}

function validateMask(mask) {
	var errorCode = 0;
	var ipFields = mask.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	if (ipFields == null) {
		errorCode = 1;
	} else {
		previousField = 255;
		for(field=1; field <= 4; field++) {
			if (ipFields[field] > 255) {
				errorCode = 1;
			}
			if (previousField < 255 && ipFields[field] != 0 && errorCode < 2) {
				errorCode = 1;
			}
			if (ipFields[field] != 255 &&
				ipFields[field] != 254 &&
				ipFields[field] != 252 &&
				ipFields[field] != 248 &&
				ipFields[field] != 240 &&
				ipFields[field] != 224 &&
				ipFields[field] != 192 &&
				ipFields[field] != 128 &&
				ipFields[field] != 0 &&
				errorCode < 1) {
				errorCode = 1;
			}

			previousField = ipFields[field];
		}
	}
	return errorCode;
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

/*****************************************************************************/

var modal;

function showPassword(element) {
	var e = document.getElementById(element);
	e.type = (e.type=='password') ? 'text' : 'password';
}

function removeOptions(element) {
	var e = document.getElementById(element);
	for(var idx = e.options.length - 1 ; idx >= 0 ; idx--) {
		e.remove(idx);
	}
}

function cleanField(element) {
	document.getElementById(element).value = "";
}

function setValue(element, value) {
	var e = document.getElementById(element);
	if (e.tagName == "SELECT") {
		for(var i = 0; i < e.options.length; i++) {
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
	} else {
		e.value = value;
	}
}

function getValue(element) {
	var e = document.getElementById(element);
	if (e.tagName == "SELECT") {
		return e.options[e.selectedIndex].value;
	} else if (e.type === 'checkbox') {
		return e.checked;
	} else {
		var val=e.value;
		return val.replace(/(["\\])/g,'');
	}
}

function setDisplay(element, show) {
	document.getElementById(element).style.display = (show?"block":"none");
}

function addClasses(element, classes) {
	for(var i = 0; i < classes.length; i++) {
		if (!element.className.match(new RegExp('(?:^|\\s)' + classes[i] + '(?!\\S)', 'g')))
			element.className += " " + classes[i];
	}
}

function removeClasses(element, classes) {
	for(var i = 0; i < classes.length; i++) {
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

function canceldetectwan() {
	setDisplay('div_detectwan', false);
}

function okdetectwan() {
	canceldetectwan();

	var data = JSON.parse(document.getElementById('detectwan_data').value);

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

	execute(cmd, showconfig);
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
			if (data.action == "pinrequired") {
				setValue('detectwan_proto', data.proto);
				setValue('detectwan_device', data.device);
				setDisplay('div_detectwan_pin', true);
				document.getElementById('detectwan_pin').focus();
			}
		} else {
			data.pincode = pin;
			if (data.proto == "none") {
				showMsg("Nie wykryto żadnego dostępnego połączenia z internetem");
				return;
			}
			msg = '';
			msg += '<div class="row space"><div class="col-xs-12 text-center">Proponowane ustawienia<hr></div></div>';
			msg += '<div class="row space">';
			msg += '<div class="col-xs-6 text-right">Typ połączenia</div>';
			if (data.proto == "dhcp") {
				msg += '<div class="col-xs-6 text-left">Port WAN (DHCP)</div>';
			}
			if (data.proto == "dhcp_hilink") {
				msg += '<div class="col-xs-6 text-left">Modem USB (Hilink lub RNDIS)</div>';
			}
			if (data.proto == "3g" || data.proto == "qmi" || data.proto == "ncm") {
				msg += '<div class="col-xs-6 text-left">Modem USB ';
				if (data.proto == "qmi") { msg += '(QMI)'; }
				if (data.proto == "ncm") { msg += '(NCM)'; }
				if (data.proto == "3g")  { msg += '(RAS)'; }
				msg += '</div>';
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
			setValue('detectwan_data', JSON.stringify(data));
			setValue('detectwan_txt', msg);
			setDisplay('div_detectwan', true);
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
			t = {"":"Wg ustawień modemu","all":"Wybór automatyczny 4G/3G/2G","lte":"Tylko 4G (LTE)","umts":"Tylko 3G (HSPA/UMTS)","gsm":"Tylko 2G (EDGE/GSM)"};
		}
		if (proto == 'ncm') {
			t = {"":"Wg ustawień modemu","auto":"Wybór automatyczny 4G/3G/2G","lte":"Tylko 4G (LTE)","umts":"Tylko 3G (HSPA/UMTS)","gsm":"Tylko 2G (EDGE/GSM)"};
		}
		e = document.getElementById('wan_modem_mode');
		for (key in t) {
			if (t.hasOwnProperty(key)) {
				var opt = document.createElement('option');
				opt.value = key;
				opt.innerHTML = t[key];
				e.appendChild(opt);
			}
		}
	}
	if (proto != "static" && proto != "dhcp" && config.wan_ifname_default !== "") {
		fields.push("wan_wanport");
	}

	var all = ["wan_ipaddr","wan_netmask","wan_gateway","wan_dns","wan_dns_url","wan_dns1","wan_dns2","wan_pincode","wan_device","wan_apn","wan_dashboard_url","wan_modem_mode","wan_wanport"];
	for(var idx=0; idx < all.length; idx++) {
		setElementEnabled(all[idx], false, false);
	}
	for(var idx=0; idx < fields.length; idx++) {
		setElementEnabled(fields[idx], true, false);
	}
	if (proto != "static" && proto != "none") {
		var t = ([config.wan_dns1,config.wan_dns2]).sort().filter(function (val) {return val;}).join(',');

		if (t == "" || config.wan_dns_dhcp) {
			setValue("wan_dns", "isp");
		} else {
			setValue("wan_dns", "custom");
			for(var idx=0; idx<dns.length; idx++){
				var ip = (dns[idx].ip).sort();
				if (ip == t) {
					setValue("wan_dns", t);
					break;
				}
			}
		}
		setElementEnabled("wan_dns", true, false);
		enableDns(getValue("wan_dns"));
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

/*****************************************************************************/

function setElementEnabled(element, show, disabled) {
	var e = document.getElementById(element);
	if (show) {
		e.disabled = disabled;
		e.readonly = disabled;
	} else {
		e.disabled = true;
	}
	setDisplay("div_" + element, show);
}

function showMsg(msg, error) {
	closeMsg();

	if (!msg || 0 === msg.length) {msg = "Proszę czekać...";}
	var e = document.getElementById('msgtxt');
	e.innerHTML = msg;

	if (error) {
		e.style.color = "red";
		addClasses(e, ["has-error"]);
	} else {
		e.style.color = "#555";
		removeClasses(e, ["has-error"]);
	}

	modal = document.getElementById('div_msg');
	modal.style.display = "block";

	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}
}

function closeMsg() {
	if (modal) {modal.style.display = "none";}
}

var config;
var counter=0;
var token="00000000000000000000000000000000";
var expires;
var timeout;

var ubus = function(param, successHandler, errorHandler) {
//console.log(param);

	showMsg();
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
			closeMsg();
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
	};
	xhr.send(param);
};

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
	});
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
	});
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
	var system_user = getValue("system_login");
	var system_pass = getValue("system_password");

	ubus('"session", "login", { "username": "' + system_user + '", "password": "' + system_pass + '" }', function(data) {
		if (data.error) {
			ubus_error(data.error.code);
		} else {
			if (data.result[0] === 0) {
				token = data.result[1].ubus_rpc_session;

				if (expires) {clearTimeout(expires);}
				expires = setTimeout(function(){ location.reload(); }, data.result[1].expires * 1000);
				timeout = data.result[1].timeout;

				setDisplay("div_login", false);
				setDisplay("div_content", true);

				if (getCookie("easyconfig_status_wan") === "1") {
					setDisplay("div_status_wan", true);
				}
				if (getCookie("easyconfig_status_modem") === "1") {
					setDisplay("div_status_modem", true);
					setDisplay("div_system_modem", true);
				}

				showconfig();
				showstatus();
			} else {
				showMsg("Błąd logowania!", true);
			}
		}
	}, function(status) {
		showMsg("Błąd logowania!", true);
	});
}

/*****************************************************************************/

function showconfig() {
	ubus_call('"easyconfig", "config", { }', showcallback);
}

function showcallback(data) {
	config = data;

//console.log(config);

	// wan
	var wan = [];
	wan['none'] = "Brak";
	wan['dhcp'] = "Port WAN (DHCP)";
	wan['static'] = "Port WAN (Statyczny IP)";
	wan['3g'] = "Modem USB (RAS)";
	wan['qmi'] = "Modem USB (QMI)";
	wan['ncm'] = "Modem USB (NCM)";
	wan['dhcp_hilink'] = "Modem USB (HiLink lub RNDIS)";
	wan['-'] = " ";
	wan['detect'] = "Wykryj...";

	removeOptions('wan_proto');
	var e = document.getElementById('wan_proto');
	var arr = config.wan_protos;
	arr.push('-');
	arr.push('detect');
	for (var idx=0; idx<arr.length; idx++) {
		var opt = document.createElement('option');
		opt.value = arr[idx];
		opt.innerHTML = wan[arr[idx]];
		if (arr[idx] == '-') { opt.disabled = true; }
		e.appendChild(opt);
	}

	removeOptions('wan_device');
	e = document.getElementById('wan_device');
	var arr = config.wan_devices;
	for(var idx=0; idx<arr.length; idx++){
		var opt = document.createElement('option');
		opt.value = arr[idx];
		opt.innerHTML = arr[idx];
		e.appendChild(opt);
	}

	removeOptions('wan_dns');
	var sorteddns = [];
	sorteddns = sortJSON(dns, 'name', '123');
	sorteddns = [{"ip":["isp"],"name":"Otrzymane od dostawcy","url":""},{"ip":["custom"],"name":"Inne","url":""}].concat(sorteddns);
	e = document.getElementById('wan_dns');
	for(var idx=0; idx<sorteddns.length; idx++){
		var opt = document.createElement('option');
		opt.value = (sorteddns[idx].ip).sort();
		opt.innerHTML = sorteddns[idx].name;
		opt.setAttribute("data-url", sorteddns[idx].url);
		e.appendChild(opt);
	}

	setValue('wan_ipaddr', config.wan_ipaddr);
	setValue('wan_netmask', config.wan_netmask);
	setValue('wan_gateway', config.wan_gateway);
	setValue('wan_apn', config.wan_apn);
	setValue('wan_device', config.wan_device);
	setValue('wan_pincode', config.wan_pincode);
	setValue('wan_modem_mode', config.wan_modem_mode);
	setValue('wan_dns1', config.wan_dns1);
	setValue('wan_dns2', config.wan_dns2);
	setValue('wan_proto', config.wan_proto);
	setValue('wan_wanport', (config.wan_wanport == 'bridge'));
	if (config.wan_proto=="dhcp") {
		if (config.wan_ifname == config.wan_ifname_hilink) {
			setValue('wan_proto', "dhcp_hilink");
		}
	}
	enableWan(getValue("wan_proto"));

	// lan
	setValue('lan_ipaddr', config.lan_ipaddr);
	setValue('lan_dhcp_enabled', config.lan_dhcp_enabled);
	setValue('lan_forcedns', config.lan_forcedns);
	setValue('dhcp_logqueries', config.dhcp_logqueries);
	setDisplay("menu_queries", config.dhcp_logqueries);

	// wlan
	var radios = config.wlan_devices;
	for (var i = 0; i < radios.length; i++) {
		var is_radio2 = false;
		var is_radio5 = false;
		removeOptions('wlan_channel' + i);
		select = document.getElementById('wlan_channel' + i);
		obj = config[radios[i]].wlan_channels;
		for(var propt in obj){
			var opt = document.createElement('option');
			opt.value = propt;
			opt.innerHTML = propt + " (" + obj[propt][1] + " dBm)" + (obj[propt][2]?" DFS":"");
			select.appendChild(opt);
			if (propt < 36) {is_radio2=true};
			if (propt >= 36) {is_radio5=true};
		}

		if (is_radio2) {setValue('radio' + i, 'Wi-Fi 2.4GHz');}
		if (is_radio5) {setValue('radio' + i, 'Wi-Fi 5GHz');}
		if (is_radio2 && is_radio5) {setValue('radio' + i, 'Wi-Fi 2.4/5GHz');}

		setValue('wlan_enabled' + i, (config[radios[i]].wlan_disabled != "1"));
		setValue('wlan_channel' + i, config[radios[i]].wlan_channel);
		setValue('wlan_ssid' + i, config[radios[i]].wlan_ssid);
		setValue('wlan_encryption' + i, config[radios[i]].wlan_encryption);
		setValue('wlan_key' + i, config[radios[i]].wlan_key);
		enableWlanEncryption(config[radios[i]].wlan_encryption, i)
		setValue('wlan_isolate' + i, config[radios[i]].wlan_isolate);
		setDisplay('div_radio' + i, true);
	}

	if (!is_radio2 && !is_radio5) {
		setDisplay('menu_wlan', false);
		setDisplay('div_status_wlan', false);
	}

	// system
	setValue('system_hostname_label', config.system_hostname);
	setValue('system_hostname', config.system_hostname);
	document.title = config.system_hostname;

	// firewall
	setValue('firewall_dmz', config.firewall_dmz);

	// stat
	setDisplay("div_stat", (config.services.statistics.enabled != -1));
	if (config.services.statistics.enabled != -1)
		setValue('stat_enabled', (config.services.statistics.enabled == 1));

	// pptp
	setDisplay('menu_pptp', config.services.pptp);

	// adblock
	setDisplay('menu_adblock', config.services.adblock);

	showmodemsection();
}

function saveconfig() {
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
		if (checkField('wan_netmask', validateMask)) {return;}
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
		var t = '';
		if (use_dns == 'custom') {
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

	if (getValue("lan_forcedns")) {
		cmd.push('uci set firewall.adblock_dns=redirect');
		cmd.push('uci set firewall.adblock_dns.name=\\\"Adblock DNS\\\"');
		cmd.push('uci set firewall.adblock_dns.src=lan');
		cmd.push('uci set firewall.adblock_dns.proto=\\\"tcp udp\\\"');
		cmd.push('uci set firewall.adblock_dns.src_dport=53');
		cmd.push('uci set firewall.adblock_dns.dest_port=53');
		cmd.push('uci set firewall.adblock_dns.target=DNAT');
	} else {
		cmd.push('uci -q del firewall.adblock_dns');
	}

	if (getValue("dhcp_logqueries")) {
		cmd.push('uci set dhcp.@dnsmasq[0].logqueries=1');
		setDisplay("menu_queries", true);
	} else {
		cmd.push('uci -q del dhcp.@dnsmasq[0].logqueries');
		setDisplay("menu_queries", false);
	}

	// wlan
	var wlan_restart_required=false;

	var radios = config.wlan_devices;

	for (var i = 0; i < radios.length; i++) {
		var section = config[radios[i]].wlan_section;

		if (section == "") {
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
			if (config[radios[i]].wlan_disabled === "1") {
				wlan_restart_required = true;
				cmd.push('uci -q del wireless.' + radios[i] + '.disabled');
				cmd.push('uci -q del wireless.' + section + '.disabled');
			}
		} else {
			if (config[radios[i]].wlan_disabled !== "1") {
				wlan_restart_required = true;
				cmd.push('uci set wireless.' + radios[i] + '.disabled=1');
				cmd.push('uci set wireless.' + section + '.disabled=1');
			}
		}

		wlan_channel = getValue('wlan_channel' + i);
		if (config[radios[i]].wlan_channel != wlan_channel) {
			wlan_restart_required = true;
			cmd.push('uci set wireless.' + radios[i] + '.channel=' + wlan_channel);
			cmd.push('uci set wireless.' + radios[i] + '.hwmode=11'+((wlan_channel < 36)?'g':'a'));
		}
		wlan_ssid = getValue('wlan_ssid' + i);
		if (config[radios[i]].wlan_ssid != wlan_ssid) {
			if (wlan_ssid == "") {
				showMsg('Błąd w polu ' + getLabelText('wlan_ssid' + i), true);
				return;
			}
			wlan_restart_required = true;
			cmd.push('uci set wireless.' + section + '.ssid=\\\"'+wlan_ssid+'\\\"');
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
					showMsg('Hasło do Wi-Fi musi mieć co najmniej 8 znaków!', true);
					return;
				}
			}
			wlan_restart_required = true;
			cmd.push('uci set wireless.' + section + '.key=\\\"'+wlan_key+'\\\"');
		}

		if (getValue('wlan_isolate' + i)) {
			if (config[radios[i]].wlan_isolate === false) {
				wlan_restart_required = true;
				cmd.push('uci set wireless.' + section + '.isolate=1');
			}
		} else {
			if (config[radios[i]].wlan_isolate) {
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
	if (checkField('system_hostname', validateHostname)) {return;}

	cmd.push('uci set system.@system[0].hostname=\\\"'+system_hostname+'\\\"');
	setValue('system_hostname_label', system_hostname);
	document.title = system_hostname;

	// stat
	if (config.services.statistics.enabled != -1) {
		if (getValue("stat_enabled")) {
			if (config.services.statistics.enabled !== "1") {
				cmd.push('uci set system.@system[0].stat=1');
				cmd.push('/sbin/stat-cron.sh');
			}
		} else {
			if (config.services.statistics.enabled == "1") {
				cmd.push('uci set system.@system[0].stat=0');
				cmd.push('/sbin/stat-cron.sh');
			}
		}
	}

	// commit & restart services
	cmd.push('uci commit');
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
			showMsg("Hasła nie są takie same!", true);
			return;
		}
		cmd.push('(echo \\\"'+pass1+'\\\"; sleep 1; echo \\\"'+pass1+'\\\") | passwd root');
	}

//console.log(cmd);
	execute(cmd, function(){ cleanField('password1'); cleanField('password2'); showconfig(); });
}

function showstatistics() {
	var w = window.open('http://dl.eko.one.pl/cgi-bin/router.cgi?token=' + config.services.statistics.token, '_blank');
	w.focus();
}

/*****************************************************************************/

function showwanup(data) {
	var html = 'Wznowienia połączenia z internetem';
	arr = JSON.parse((data).replace(/\$/g,'"'));
	if (arr.length > 9)
		html += '<br>(ostatnie 10)';
	html += '<hr>';
	for (var propt in arr) {
		for (var k in arr[propt]) {
			if (arr[propt][k] == '') {
				html += formatTime(k, true) + ' temu<br>';
			} else {
				html += arr[propt][k] + ' (' + formatTime(k, true) + ' temu)<br>';
			}
		}
	}
	showMsg(html);
}

function showstatus() {
	ubus_call('"easyconfig", "status", { }', function(data) {
		setValue('system_uptime', formatTime(data.system_uptime, false));
		setValue('system_uptime_since', data.system_uptime_since == '-'?'':' (od ' + data.system_uptime_since + ')');
		setValue('system_load', data.system_load);
		setValue('system_time', data.system_time);
		setValue('wlan_clients', data.wlan_clients + ' &rarr;');
		setValue('wan_rx', data.wan_rx == '-'?'-':bytesToSize(data.wan_rx));
		setValue('wan_tx', data.wan_tx == '-'?'-':bytesToSize(data.wan_tx));
		setValue('wan_uptime', formatTime(data.wan_uptime, false));
		setValue('wan_uptime_since', data.wan_uptime_since == '-'?'':' (od ' + data.wan_uptime_since + ')');
		setValue('wan_up_cnt', (data.wan_up_cnt == '-')?'-':'<a href="#" class="click" onclick="showwanup(\'' + (JSON.stringify(data.wan_up_since)).replace(/\"/g,"$") + '\');">'+ data.wan_up_cnt + '</a>');
		setValue('wan_ipaddr_status', (data.wan_ipaddr == '-')?'-':'<a href="#" class="click" onclick="showgeolocation();">'+ data.wan_ipaddr + '</a>');
		setDisplay('div_pptp_up_status', data.pptp_up);
	});
}

function showsystem() {
	ubus_call('"easyconfig", "system", { }', function(data) {
		setValue('firmware_version', data.version);
		setValue('gui_version', data.gui_version);
		setValue('model', data.model);
		setValue('modem_vendor', data.modem.vendor);
		setValue('modem_model', data.modem.product);
		setValue('modem_revision', data.modem.revision);
		setValue('modem_imei', data.modem.imei);
		setValue('modem_iccid', data.modem.iccid);
	});
}

function showmodem() {
	ubus_call('"easyconfig", "modem", { }', function(data) {
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
			setValue('modem_registration', data.registration == '-'?'-':data.registration);
		}

		if (data.addon) {
			var div = document.getElementById('div_status_modem_addon');
			var html = "";
			for (var i in data.addon) {
				for (var j in data.addon[i]) {
					html += '<div class="row"><label class="col-xs-6 text-right">' + j + '</label>';
					html += '<div class="col-xs-6"><p>' + data.addon[i][j] + '</p></div></div>';
				}
			}
			div.innerHTML = html;
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
	var wan_type = getValue("wan_proto");
	if (wan_type == '3g' || wan_type == 'qmi' || wan_type == 'ncm') {
		setDisplay("menu_ussdsms", config.services.ussdsms);
		setDisplay("div_status_modem", true);
		setDisplay("div_system_modem", true);
		setCookie("easyconfig_status_modem", "1");
		showmodem();
	} else {
		setDisplay("menu_ussdsms", false);
		setDisplay("div_status_modem", false);
		setDisplay("div_system_modem", false);
		setCookie("easyconfig_status_modem", "0");
	}
}

/*****************************************************************************/

function btn_system_reboot() {
	ubus('"easyconfig", "reboot", {}', function(data) {
		showMsg("Trwa ponownie uruchomienie urządzenia, może to potrwać do trzech minut...", false);
	}, function(status) {
		showMsg("Błąd pobierania danych!", true);
	});
}

/*****************************************************************************/

function showwatchdog() {
	setDisplay("watchdog_enabled_info", (config.wan_proto == "none"));

	ubus_call('"easyconfig", "watchdog", { }', function(data) {
		setValue("watchdog_enabled", data.watchdog_enabled);
		setValue("watchdog_dest", data.watchdog_dest);
		setValue("watchdog_period", data.watchdog_period);
		setValue("watchdog_period_count", data.watchdog_period_count);
		setValue("watchdog_delay", data.watchdog_delay);
		setValue("watchdog_action", data.watchdog_action);
		if (data.watchdog_minavgmax != "") {
			setValue("watchdog_min", data.watchdog_minavgmax.split("/")[0] + " ms");
			setValue("watchdog_avg", data.watchdog_minavgmax.split("/")[1] + " ms");
			setValue("watchdog_max", data.watchdog_minavgmax.split("/")[2] + " ms");
			setValue("watchdog_rundate", data.watchdog_rundate);
		} else {
			setValue("watchdog_min", "-");
			setValue("watchdog_avg", "-");
			setValue("watchdog_max", "-");
			setValue("watchdog_rundate", "-");
		}
	});
}

function savewatchdog() {
	var watchdog_enabled = getValue("watchdog_enabled");
	if (checkField('watchdog_dest', validateHost)) {return;}
	var watchdog_dest = getValue("watchdog_dest");
	var watchdog_period = getValue("watchdog_period");
	if (validateNumericRange(watchdog_period,1,59) != 0) {
		showMsg("Błąd w polu " + getLabelText("watchdog_period"), true);
		return;
	}
	var watchdog_period_count = getValue("watchdog_period_count");
	if (validateNumericRange(watchdog_period_count,1,59) != 0) {
		showMsg("Błąd w polu " + getLabelText("watchdog_period_count"), true);
		return;
	}
	var watchdog_delay = getValue("watchdog_delay");
	if (validateNumericRange(watchdog_delay,1,59) != 0) {
		showMsg("Błąd w polu " + getLabelText("watchdog_delay"), true);
		return;
	}
	var watchdog_action = getValue("watchdog_action");

	var cmd = [];
	cmd.push('F=$(mktemp)');
	cmd.push('touch /etc/crontabs/root');
	cmd.push('grep -v easyconfig_watchdog /etc/crontabs/root > $F');

	if (watchdog_enabled) {
		cmd.push('echo \\\"*/' + watchdog_period + ' * * * * /usr/bin/easyconfig_watchdog.sh ' + (watchdog_delay * 60) + ' 3 ' + watchdog_dest + ' ' + watchdog_period_count + ' ' + watchdog_action + '\\\" >> $F');
	}

	cmd.push('mv $F /etc/crontabs/root');
	cmd.push('rm -f $F');
	cmd.push('/etc/init.d/cron restart');

	cmd.push('uci set easyconfig.watchdog.period='+watchdog_period);
	cmd.push('uci set easyconfig.watchdog.period_count='+watchdog_period_count);
	cmd.push('uci set easyconfig.watchdog.delay='+watchdog_delay);
	cmd.push('uci set easyconfig.watchdog.dest='+watchdog_dest);
	cmd.push('uci set easyconfig.watchdog.action='+watchdog_action);
	cmd.push('uci commit easyconfig');

	execute(cmd, showwatchdog);
}

/*****************************************************************************/

function sortJSON(data, key, way) {
	return data.sort(function(a, b) {
		var x = a[key]; var y = b[key];
		if (way === '123' ) { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
		if (way === '321') { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
	});
}

function formatTime(s, showsec) {
	if (s === "-") {return s;}
	var d = Math.floor(s/86400),
	    h = Math.floor(s/3600) % 24,
	    m = Math.floor(s/60)%60,
	    s = s % 60;
	var time = d>0?d+'d ':'';
	if (time != "") {time += h+'h '} else {time = h>0?h+'h ':''}
	if (time != "") {time += m+'m '} else {time = m>0?m+'m ':''}
	if (showsec) {
		time += s+'s';
	} else {
		if (time == "") {time += m+'m'};
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
					for(var propt in obj) {
						if (obj[propt][0] == arr[idx1].freq) {
							arr[idx1].channel = propt;
							break;
						}
					}
				}
			}

		}
		if (wifiscanresults) {
			for (var idx=wifiscanresults.length - 1; idx >= 0; idx--) {
				if ((ts - wifiscanresults[idx].timestamp) > 180) {
					wifiscanresults.splice(idx, 1);
				} else {
					for (var idx1=0; idx1 < l; idx1++) {
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
		sitesurveycallback('ssid');
	});
}

function sitesurveycallback(sortby) {
	var div = document.getElementById('div_sitesurvey_content');
	var html = "";
	if (wifiscanresults.length > 0) {
		html += '<div class="row space"><div class="col-xs-12">';
		html += '<span>Sortowanie po</span>';
		html += '<a href="#" class="click" onclick="sitesurveycallback(\'ssid\');"><span id="sitesurvey_sortby_ssid"> nazwie </span></a>|';
		html += '<a href="#" class="click" onclick="sitesurveycallback(\'mac\');"><span id="sitesurvey_sortby_mac"> adresie mac </span></a>|';
		html += '<a href="#" class="click" onclick="sitesurveycallback(\'signal\');" ><span id="sitesurvey_sortby_signal"> sile sygnału </span></a>|';
		html += '<a href="#" class="click" onclick="sitesurveycallback(\'freq\');"><span id="sitesurvey_sortby_freq"> kanale </span></a>|';
		html += '<a href="#" class="click" onclick="sitesurveycallback(\'timestamp\');"><span id="sitesurvey_sortby_timestamp"> widoczności </span></a>';
		html += '<div></div>';

		var wlan_devices = config.wlan_devices;
		var ts = Date.now()/1000;
		var sorted = sortJSON(wifiscanresults, sortby, '123');
		var rogueap = false;
		for(var idx = 0; idx < sorted.length; idx++){

			rogueap = false;
			for (var i = 0; i < wlan_devices.length; i++) {
				if (config[wlan_devices[i]].wlan_ssid === sorted[idx].ssid) {
					rogueap = true;
					break;
				}
			}

			html += '<hr><div class="row">';
			html += '<div class="col-xs-6">';
			html += '<h4' + (rogueap?' style="color:red;"':'') + '>' + sorted[idx].ssid + '</h4>';
			html += sorted[idx].mac + '<br>';

			var key = (sorted[idx].mac).substring(0,8).toUpperCase();
			if (key in manuf) {html += manuf[key] + '<br>';}
			if (parseInt(ts - sorted[idx].timestamp) > 0) {html += 'widoczność ' + formatTime(parseInt(ts - sorted[idx].timestamp), true) + ' temu';}
			if (rogueap) {html += '<br><span style="color:red;">Wrogi AP</span>';}
			html += '</div>';
			html += '<div class="col-xs-6 text-right">';
			html += 'RSSI ' + sorted[idx].signal.replace(/\..*/,"") + ' dBm<br>';
			html += 'Kanał ' + sorted[idx].channel + ' (' + sorted[idx].freq/1000 + ' GHz)<br>';
			html += (sorted[idx].encryption?'<span class="hidden-vxs">Szyfrowanie </span>' + sorted[idx].encryption + '<br>':'');
			html += '<span class="hidden-vxs">Standard </span>802.11' + sorted[idx].mode1 + (sorted[idx].mode2!=''?', ' + sorted[idx].mode2:'');
			html += '</div></div>';
		}
		html += '<hr><p>Liczba sieci bezprzewodowych: ' + sorted.length + '</p>';

		html += '<hr><h3 class="section">Wykorzystanie kanałów</h3>';

		var channels = [];
		for (var i = 0; i < wlan_devices.length; i++) {
			for (var ch in config[wlan_devices[i]].wlan_channels) {
				channels[ch] = 0;
			}
		}

		for (var ch in channels) {
			html += '<div class="row">';
			html += '<div class="col-xs-1 text-right">' + ch + '</div>';
			html += '<div class="col-xs-6">';
			html += '	<div class="progress" style="margin-bottom:2px;">';
			html += '		<div class="progress-bar" id="channel' + ch + 'bar">&nbsp;</div>';
			html += '	</div>';
			html += '</div>';
			html += '<div class="col-xs-5"><span id="channel' + ch + 'percent">0%</div>';
			html += '</div>';
		}

	} else {
		html += '<div class="alert alert-warning">Brak sieci bezprzewodowych lub Wi-Fi jest wyłączone</div>';
	}
	div.innerHTML = html;

	if (wifiscanresults.length > 0) {
		for(var idx = 0; idx < sorted.length; idx++){
			if (sorted[idx].channel != '?') {channels[sorted[idx].channel]++;}
		}
		for (var ch in channels) {
			var percent = parseInt(channels[ch] * 100 / sorted.length) + '%';
			document.getElementById('channel' + ch + 'bar').style.width = percent;
			setValue('channel' + ch + 'percent', percent == '0%'?' ':(percent + ', ' + channels[ch] + ' z ' + sorted.length));
		}
		var all=['ssid','mac', 'signal', 'freq', 'timestamp'];
		for(var idx = 0; idx < all.length; idx++){
			var e = document.getElementById('sitesurvey_sortby_' + all[idx]);
			e.style.fontWeight = (sortby == all[idx])?700:400;
		}
	}
}

/*****************************************************************************/

function bytesToSize(bytes) {
	var sizes = ['', 'KiB', 'MiB', 'GiB', 'TiB'];
	if (bytes == 0) return '0';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	var dm = 0;
	if (i > 2) {dm = 3;}
	return parseFloat((bytes / Math.pow(1024, i)).toFixed(dm)) + ' ' + sizes[i];
};

var wlanclients;
var clientslogs;

function showwlanclients() {
	ubus_call('"easyconfig", "clients", { }', function(data) {
		wlanclients = data.clients;
		wlanclientscallback("name");
		clientslogs = data.logs;
		clientslogscallback();
	});
}

function wlanclientscallback(sortby) {
	var div = document.getElementById('div_wlanclients_content');
	var html = '';
	if (wlanclients.length > 0) {
		html += '<div class="row space"><div class="col-xs-12">';
		html += '<span>Sortowanie po</span>';
		html += '<a href="#" class="click" onclick="wlanclientscallback(\'name\');"><span id="wlanclients_sortby_name"> nazwie </span></a>|';
		html += '<a href="#" class="click" onclick="wlanclientscallback(\'tx\');"><span id="wlanclients_sortby_tx"> wysłano </span></a>|';
		html += '<a href="#" class="click" onclick="wlanclientscallback(\'rx\');"><span id="wlanclients_sortby_rx"> pobrano </span></a>|';
		html += '<a href="#" class="click" onclick="wlanclientscallback(\'percent\');"><span id="wlanclients_sortby_percent"> udziale w ruchu </span></a>';
		html += '<div></div>';

		var total = 0;
		for(var idx=0; idx<wlanclients.length; idx++){
			total += wlanclients[idx].tx + wlanclients[idx].rx;
		}
		for(var idx=0; idx<wlanclients.length; idx++){
			wlanclients[idx].percent = parseInt((wlanclients[idx].tx + wlanclients[idx].rx) * 100 / total);
		}
		var sorted = sortJSON(wlanclients, sortby, '123');
		for(var idx=0; idx<sorted.length; idx++){
			var name = (sorted[idx].name != '' ? sorted[idx].name : sorted[idx].mac);
			name = (sorted[idx].name != '*' ? sorted[idx].name : sorted[idx].mac);
			html += '<hr><div class="row">';
			html += '<div class="col-xs-9"><a href="#" class="click" onclick="hostnameedit(\'' + sorted[idx].mac + '\',\'' + name + '\');">' + name + '</a></div>';
			html += '<div class="col-xs-3 text-right"><a href="#" class="click" onclick="hostmenu(\'' + (JSON.stringify(sorted[idx])).replace(/\"/g,"$") + '\');">akcje</a></div>';
			html += '<div class="col-xs-12">Wysłano: ' + bytesToSize(sorted[idx].tx) + ', pobrano: ' + bytesToSize(sorted[idx].rx) + ', ' + sorted[idx].percent + '% udziału w ruchu' + '</div>';
			html += '</div>';
		}
		html += '<hr><p>Liczba klientów: ' + sorted.length + '</p>';
	} else {
		html += '<div class="alert alert-warning">Brak połączonych klientów Wi-Fi</div>';
	}
	div.innerHTML = html;

	if (wlanclients.length > 0) {
		var all=['name', 'tx', 'rx', 'percent'];
		for(var idx=0; idx<all.length; idx++){
			var e = document.getElementById('wlanclients_sortby_'+all[idx]);
			e.style.fontWeight = (sortby==all[idx])?700:400;
		}
	}
}

function clientslogscallback() {
	var div = document.getElementById('div_clientslogs_content');
	var html = "";
	if (clientslogs.length > 0) {
		var sorted = sortJSON(clientslogs, 'time', '321');
		for(var idx=0; idx<sorted.length; idx++){
			html += '<div class="row space">';
			html += '<div class="col-xs-4 col-sm-3">' + sorted[idx].time + '</div>';
			html += '<div class="col-xs-2 visible-xs">' + (sorted[idx].event=='login'?'poł.':'rozł.') + '</div>';
			html += '<div class="col-sm-3 hidden-xs">' + (sorted[idx].event=='login'?'połączenie':'rozłączenie') + '</div>';
			if (sorted[idx].mac == '') {
				html += '<div class="col-xs-6">' + sorted[idx].name + '</div>';
			} else {
				html += '<div class="col-xs-6 visible-xs">' + (sorted[idx].name!=""?sorted[idx].name + '<br>' + sorted[idx].mac:sorted[idx].mac) + '</div>';
				html += '<div class="col-xs-6 hidden-xs">' + (sorted[idx].name!=""?sorted[idx].name + ' / ' + sorted[idx].mac:sorted[idx].mac) + '</div>';
			}
			html += '</div>';
		}
	} else {
		html += '<div class="alert alert-warning">Brak historii połączeń</div>';
	}
	div.innerHTML = html;
}

function hostmenu(data) {
	var host = JSON.parse((data).replace(/\$/g,'"'));
	var name = (host.name != '' ? host.name : host.mac);
	name = (host.name != '*' ? host.name : host.mac);

	var html = name + '<hr>';

	html += '<p><a href="#" class="click" onclick="closeMsg();hostinfo(\'' + host.mac + '\',\'' + name + '\',\'' + host.real_name + '\',\'' + bytesToSize(host.tx) + '\',\'' + bytesToSize(host.rx) + '\',\'' + host.signal + '\',\'' + host.connected + '\',\'' + host.connected_since + '\',\'' + host.band + '\');">informacje</a></p>';
	html += '<p><a href="#" class="click" onclick="closeMsg();hostnameedit(\'' + host.mac + '\',\'' + name + '\');">zmiana nazwy</a>';
	html += '<p><a href="#" id="bm' + (host.mac).replace(/:/g,'') + '" class="click" onclick="closeMsg();hostblock(\'' + host.mac + '\',\'' + name + '\',' + host.block + ');">' + (host.block == 0?"blokada":"odblokuj") + '</a></p>';
	if (config.services.nftqos) {
		html += '<p><a href="#" class="click" onclick="closeMsg();hostqos(\'' + host.mac + '\',\'' + name + '\',\'' + host.ip + '\',' + host.qos.bwup + ',' + host.qos.bwdown + ');">limity</a></p>';
	}
	html += '<p><a href="#" class="click" onclick="closeMsg();hostip(\'' + host.mac + '\',\'' + host.ip + '\',\'' + host.staticdhcp + '\');">statyczny adres IP</a></p>';
	showMsg(html);
}

function hostinfo(mac, name, realname, tx, rx, signal, connected, connected_since, band) {
	setValue('hostinfo_mac', mac);
	var key = mac.substring(0,8).toUpperCase();
	if (key in manuf) {
		setValue('hostinfo_vendor', manuf[key]);
	} else {
		setValue('hostinfo_vendor', "");
	}
	setValue('hostinfo_name', name);
	if (realname == '') {
		setValue('hostinfo_realname', '-');
	} else if (realname == '*') {
		setValue('hostinfo_realname', '-');
	} else {
		setValue('hostinfo_realname', realname);
	}
	setValue('hostinfo_tx', tx);
	setValue('hostinfo_rx', rx);
	setValue('hostinfo_signal', signal + ' dBm');
	setValue('hostinfo_band', band==2?'2.4GHz':'5GHz');
	setValue('hostinfo_connected', formatTime(connected, false));
	setValue('hostinfo_connected_since', connected_since == '-'?'':' (od ' + connected_since + ')');
	setDisplay("div_hostinfo", true);
}

function hostblock(mac, name, action) {
	setValue('hostblock_mac', mac);
	setValue('hostblock_name', name);
	setValue('hostblock_action', action);
	setValue('btn_okhostblock', action == 0?"Zablokuj":"Odblokuj");
	setValue('hostblock_text', (action == 0?'Zablokować':'Odblokować') + ' dostęp do internetu dla "' + name + '"?')
	setDisplay('div_hostblock', true);
}

function cancelhostblock() {
	setDisplay("div_hostblock", false);
}

function okhostblock() {
	cancelhostblock();
	var mac = getValue('hostblock_mac');
	var nmac = mac.replace(/:/g,'');
	var name = getValue('hostblock_name');
	var action = getValue('hostblock_action');

	var cmd = [];
	cmd.push('uci -q del firewall.m' + nmac);
	if (action == 0) {
		cmd.push('uci set firewall.m' + nmac + '=rule');
		cmd.push('uci set firewall.m' + nmac + '.src=lan');
		cmd.push('uci set firewall.m' + nmac + '.dest=wan');
		cmd.push('uci set firewall.m' + nmac + '.src_mac=' + mac);
		cmd.push('uci set firewall.m' + nmac + '.target=REJECT');
		cmd.push('uci set firewall.m' + nmac + '.proto=\\\"tcp udp\\\"');
		cmd.push('uci set firewall.m' + nmac + '.name=\\\"' + name + '\\\"');
	}
	cmd.push('uci commit firewall');
	cmd.push('/etc/init.d/firewall restart');
	cmd.push('sleep 1');

	execute(cmd, function() {
		var e = document.getElementById('bm' + nmac);
		e.innerHTML = (action == 0?'odblokuj':'blokada');
		e.setAttribute('onClick', 'hostblock("' + mac + '","' + name + '",' + (action == 0?'1':'0') + ');');
		showMsg('"' + name + '" ' + (action == 0?'stracił':'uzyskał') + ' dostęp do internetu');
	});
}

function hostnameedit(mac, name) {
	setValue('hostname_mac', mac);
	setValue('hostname_name', name);
	setDisplay("div_hostname", true);
	document.getElementById('hostname_name').focus();
}

function okhostinfo() {
	setDisplay("div_hostinfo", false);
}

function cancelhostname() {
	setDisplay("div_hostname", false);
}

function savehostname() {
	cancelhostname();

	var mac = getValue('hostname_mac');
	var nmac = mac.replace(/:/g,'');
	var name = getValue('hostname_name');

	var cmd = [];
	cmd.push('uci -q del easyconfig.m' + nmac);
	cmd.push('uci set easyconfig.m' + nmac + '=mac');
	cmd.push('uci set easyconfig.m' + nmac + '.name=\\\"' + name +'\\\"');
	cmd.push('uci commit easyconfig');

	execute(cmd, showwlanclients);
}

function hostip(mac, ip, staticdhcp) {
	setValue('hostip_mac', mac);
	setValue('hostip_ip', (staticdhcp == ""?ip:staticdhcp));
	var e = document.getElementById('hostip_ip');
	proofreadText(e, validateIP, 0);
	setValue('hostip_disconnect', false);

	var msg;
	if (staticdhcp == "") {
		msg = '- brak statycznego adresu IP';
	} else {
		msg = '- obecny statyczny adres IP: ' + staticdhcp;
	}
	setValue('hostip_help', msg + '<br>- rozłączenie klienta może być niezbędne do pobrania statycznego adresu IP');
	setDisplay("div_hostip", true);
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
	cmd.push('/etc/init.d/dnsmasq reload');

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
	cmd.push('/etc/init.d/dnsmasq reload');

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

function hostqos(mac, name, ip, bwup, bwdown) {
	setValue('hostqos_mac', mac);
	setValue('hostqos_header', name);
	setValue('hostqos_ip', ip);

	// KB/s to Mb/s
	setValue('hostqos_upload', parseInt(bwup * 8 / 1024));
	setValue('hostqos_download', parseInt(bwdown * 8 / 1024));

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
		cmd.push('/etc/init.d/dnsmasq reload');
	}

	execute(cmd, showwlanclients);
}

function cancelhostqos() {
	setDisplay('div_hostqos', false);
}

/*****************************************************************************/

function showqueries() {
	ubus_call('"easyconfig", "queries", {}', function(data) {
		queries = data.result;
		queriescallback("time", "321");
	});
}

var queries;

function queriescallback(sortby, order) {
	var div = document.getElementById('div_queries_content');
	var html = "";
	if (queries.length > 0) {
		html += '<div class="row">';
		html += '<div class="col-xs-6 col-sm-4"><a href="#" class="click" onclick="queriescallback(\'time\');"><span id="queries_sortby_time">Czas</span></a></div>';
		html += '<div class="col-xs-6 col-sm-4"><a href="#" class="click" onclick="queriescallback(\'host\');"><span id="queries_sortby_host">Klient</span></a></div>';
		html += '<div class="col-xs-12 col-sm-4"><a href="#" class="click" onclick="queriescallback(\'query\');"><span id="queries_sortby_query">Zapytanie</span></a></div>';
		html += '</div><hr>';

		var sorted = sortJSON(queries, sortby, (order?order:'123'));
		for(var idx=0; idx<sorted.length; idx++){
			html += '<div class="row space">';
			html += '<div class="col-xs-6 col-sm-4">' + sorted[idx].time + '</div>';
			html += '<div class="col-xs-6 col-sm-4">' + sorted[idx].host + '</div>';
			html += '<div class="col-xs-12 col-sm-4' + (sorted[idx].nxdomain?' text-muted" title="brak domeny':'') + '">' + sorted[idx].query + '</div>';
			html += '</div>';
		}
	} else {
		html += '<div class="alert alert-warning">Brak zapytań DNS</div>';
	}
	div.innerHTML = html;

	if (queries.length > 0) {
		var all=["time","query","host"];
		for(var idx=0; idx<all.length; idx++){
			var e = document.getElementById('queries_sortby_'+all[idx]);
			e.style.fontWeight = (sortby==all[idx])?700:400;
		}
	}
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
	var i=62;
	var t=0;
	d.setDate(d.getDate() + 1);
	while (i--) {
		var nd = new Date(d-=8.64e7);
		if (nd.getDate() == start) {
			if (t == 1) {
				days.push(formatDate(nd));
				t=0;
			} else {
				t=1;
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
	return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
}

function showtraffic() {

	ubus_call('"easyconfig", "traffic", { }', function(data) {
		setValue("traffic_enabled", data.traffic_enabled);
		setValue("traffic_period", data.traffic_period);
		setValue("traffic_cycle", data.traffic_cycle);

		var now = new Date();
		var day = now.getDate();
		var month = now.getMonth();
		var year = now.getFullYear();
		now = new Date(year, month, day);
		if (day <= data.traffic_cycle) {
			var newdate = new Date(year, month, data.traffic_cycle);
		} else {
			var newdate = month == 11 ? new Date(year+1, 0, data.traffic_cycle) : new Date(year, month+1, data.traffic_cycle);
		}
		var timediff = Math.abs(newdate.getTime() - now.getTime());
		var diffdays = Math.ceil(timediff / (1000 * 3600 * 24));
		setValue("traffic_currentperiod_daysleft", diffdays);

		setValue("traffic_warning_enabled", (data.traffic_warning_enabled=="1"));
		setValue("traffic_warning_value", data.traffic_warning_value);
		setValue("traffic_warning_unit", data.traffic_warning_unit);
		setValue("traffic_warning_cycle", data.traffic_warning_cycle);

		var traffic_warning_cycle = data.traffic_warning_cycle;
		var traffic_warning_limit = -1;
		if (data.traffic_warning_enabled=="1") {
			traffic_warning_limit = data.traffic_warning_value;
			if (data.traffic_warning_unit == "m") {traffic_warning_limit *= 1024*1024;}
			if (data.traffic_warning_unit == "g") {traffic_warning_limit *= 1024*1024*1024;}
			if (data.traffic_warning_unit == "t") {traffic_warning_limit *= 1024*1024*1024*1024;}
		}
		var traffic_cycle = data.traffic_cycle;

		ubus_call('"file", "exec", {"command":"zcat","params":["/usr/lib/easyconfig/easyconfig_traffic.txt.gz"]}', function(data) {

		var today = new Array(formatDate(new Date));
		var yesterday = lastDays(1);
		var last7d = lastDays(7);
		var last30d = lastDays(30);
		var current_period = currentPeriod(traffic_cycle);
		var last_period = lastPeriod(traffic_cycle);

		var traffic_today=0;
		var traffic_today_rx=0;
		var traffic_today_tx=0;
		var traffic_yesterday=0;
		var traffic_last7d=0;
		var traffic_last30d=0;
		var traffic_total=0;
		var traffic_currentperiod=0;
		var traffic_lastperiod=0;
		var total_since="";

		var traffic = [];
		if (data.stdout) {
			traffic = data.stdout.split("\n");
		}
		for (var idx in traffic) {
			if (traffic[idx] == "") {continue;}
			var t_date = traffic[idx].split(" ")[0];
			var t_rx = traffic[idx].split(" ")[1];
			var t_tx = traffic[idx].split(" ")[2];
			var t_value = (parseInt(t_rx) || 0) + (parseInt(t_tx) || 0);
			if (total_since == "") {total_since = t_date;}

			if (t_date == today[0]) {
				traffic_today = t_value;
				traffic_today_rx = t_rx;
				traffic_today_tx = t_tx;
			}

			if (t_date == yesterday[0]) {
				traffic_yesterday = t_value;
			}

			for (var idx1=0; idx1<7; idx1++) {
				if (t_date == last7d[idx1]) {
					traffic_last7d += parseInt(t_value);
				}
			}

			for (var idx1=0; idx1<30; idx1++) {
				if (t_date == last30d[idx1]) {
					traffic_last30d += parseInt(t_value);
				}
			}

			for (var idx1=0; idx1<current_period.length; idx1++) {
				if (t_date == current_period[idx1]) {
					traffic_currentperiod += parseInt(t_value);
				}
			}

			for (var idx1=0; idx1<last_period.length; idx1++) {
				if (t_date == last_period[idx1]) {
					traffic_lastperiod += parseInt(t_value);
				}
			}

			traffic_total += parseInt(t_value);
			if (total_since > t_date) {total_since = t_date;}
		}

		var e1 = document.getElementById("traffic_today");
		e1.style.color = "#333";
		var e2 = document.getElementById("traffic_currentperiod");
		e2.style.color = "#333";
		setDisplay("div_traffic_today_progress", false);
		setDisplay("div_traffic_currentperiod_progress", false);
		var color = "#31708f";

		if (traffic_warning_limit > -1) {
			if (traffic_warning_cycle == "d") {
				if (traffic_today >= traffic_warning_limit) { color = "red"; }

				var percent = parseInt((traffic_today * 100) / traffic_warning_limit);
				setValue("traffic_today_progress", " (" + percent + "% z " + bytesToSize(traffic_warning_limit) + ")");
				if (percent > 100) {percent = 100;}
				document.getElementById("div_traffic_today_progress1").style.width = percent + '%';
				setDisplay("div_traffic_today_progress", true);
				setValue("traffic_currentperiod_progress", '');
			}
			if (traffic_warning_cycle == "p") {
				if (traffic_currentperiod >= traffic_warning_limit) { e2.style.color = "red"; }

				var percent = parseInt((traffic_currentperiod * 100) / traffic_warning_limit);
				setValue("traffic_currentperiod_progress", ' (' + percent + "% z " + bytesToSize(traffic_warning_limit) + ')');
				if (percent > 100) {percent = 100;}
				document.getElementById("div_traffic_currentperiod_progress1").style.width = percent + '%';
				setDisplay("div_traffic_currentperiod_progress", true);
				setValue("traffic_today_progress", '');
			}
		} else {
			setValue("traffic_today_progress", '');
			setValue("traffic_currentperiod_progress", '');
		}

		if (traffic_today == 0) {
			setValue("traffic_today", traffic_today);
		} else {
			setValue("traffic_today", '<a href="#" class="click" style="color:'+ color + '" onclick="showtrafficdetails(\'Dziś\',' + traffic_today + ',' + traffic_today_tx + ',' + traffic_today_rx + ');">' + bytesToSize(traffic_today) + '</a>');
		}
		setValue("traffic_yesterday", bytesToSize(traffic_yesterday));
		setValue("traffic_last7d", bytesToSize(traffic_last7d));
		setValue("traffic_last30d", bytesToSize(traffic_last30d));
		setValue("traffic_total", bytesToSize(traffic_total));
		if (total_since) {
			setValue("traffic_total_since", ' (od '+ total_since + ')');
		} else {
			setValue("traffic_total_since", '');
		}
		setValue("traffic_currentperiod", bytesToSize(traffic_currentperiod));
		setValue("traffic_lastperiod", bytesToSize(traffic_lastperiod));

		});

	});

}

function savetraffic() {
	if (checkField('traffic_warning_value', validateNumeric)) {return;}

	var cmd = [];
	cmd.push('touch /etc/crontabs/root');
	cmd.push('sed -i \\\"/easyconfig_traffic/d\\\" /etc/crontabs/root');
	if (getValue("traffic_enabled")) {
		cmd.push('echo \\\"*/1 * * * * /usr/bin/easyconfig_traffic.sh\\\" >> /etc/crontabs/root');
	}
	cmd.push('/etc/init.d/cron restart');

	cmd.push('uci set easyconfig.traffic.period='+getValue("traffic_period"));
	cmd.push('uci set easyconfig.traffic.cycle='+getValue("traffic_cycle"));
	cmd.push('uci set easyconfig.traffic.warning_enabled='+(getValue("traffic_warning_enabled")?"1":"0"));
	cmd.push('uci set easyconfig.traffic.warning_value='+getValue("traffic_warning_value"));
	cmd.push('uci set easyconfig.traffic.warning_cycle='+getValue("traffic_warning_cycle"));
	cmd.push('uci set easyconfig.traffic.warning_unit='+getValue("traffic_warning_unit"));
	cmd.push('uci commit easyconfig');

	execute(cmd, showtraffic);
}

function removetraffic() {
	setDisplay("div_removetraffic", true);
}

function cancelremovetraffic() {
	setDisplay("div_removetraffic", false);
}

function okremovetraffic() {
	cancelremovetraffic();

	var cmd = [];
	cmd.push('rm /usr/lib/easyconfig/easyconfig_traffic.txt.gz');
	cmd.push('touch /usr/lib/easyconfig/easyconfig_traffic.txt');
	cmd.push('gzip /usr/lib/easyconfig/easyconfig_traffic.txt');
	cmd.push('rm /tmp/easyconfig_traffic.txt');

	execute(cmd, showtraffic);
}

function showtrafficdetails(period, total, tx, rx) {
	setValue("trafficdetails_period", period);
	setValue("trafficdetails_total", bytesToSize(total));
	setValue("trafficdetails_tx", bytesToSize(tx));
	setValue("trafficdetails_rx", bytesToSize(rx));
	setDisplay("div_trafficdetails", true);
}

function oktrafficdetails() {
	setDisplay("div_trafficdetails", false);
}

/*****************************************************************************/

function removeDiacritics(str) {
	var from = "ąćęłńóśżźĄĆĘŁŃÓŚŻŹ";
	var to   = "acelnoszzACELNOSZZ";
	for (var idx=0, l=from.length; idx<l; idx++) {
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
			showMsg((data.response).replace(/(\r\n|\r|\n)/g, '<br />'));
		}
	});
}

function sendsms() {
	if (checkField('sms_number', validateNumeric)) {return;}
	if (checkField('sms_msg', validateSMSText)) {return;}

	var tnumber = getValue("sms_number");
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
		var div = document.getElementById('div_sms_content');
		var html = "";

		var arr = data.msg;
		if (arr.length > 0) {
			var sorted = sortJSON(arr, 'timestamp', '123');
			for (var idx=0; idx<sorted.length; idx++) {
				html += '<hr><div class="row">';
				html += '<div class="col-xs-10">Od: ' + sorted[idx].sender + ', odebrano: ' + sorted[idx].timestamp;
				if (sorted[idx].part) {
					html += ' (' + sorted[idx].part + '/' + sorted[idx].total + ')';
				}
				html += '</div>';
				html += '<div class="col-xs-2 text-right"><a href="#" class="click" onclick="removesms(\'' + sorted[idx].index + '\',\'' + sorted[idx].sender + '\',\'' + sorted[idx].timestamp + '\');">usuń</a></div>';
				html += '<div class="col-xs-12">' + (sorted[idx].content).replace(/\n/g,"<br>") + '</div>';
				html += '</div>';
			}
			html += "<hr><p>Liczba wiadomości: " + arr.length + "</p>";
		} else {
			html += '<br><div class="alert alert-warning">Brak wiadomości</div>';
		}

		div.innerHTML = html;
	});
}

function removesms(index, sender, timestamp) {
	setValue("sms_index", index);
	setValue("removesms_text", "Usunąć wiadomość od \"" + sender + "\" otrzymaną " + timestamp + "?");
	setDisplay("div_removesms", true);
}

function cancelremovesms() {
	setDisplay("div_removesms", false);
}

function okremovesms() {
	var index = getValue("sms_index");
	cancelremovesms();
	ubus_call('"easyconfig", "sms", {"action":"delete","arg1":"' + index + '","arg2":""}', function(data) {
		if ((data.response).match(/Deleted message/) == null)
			showMsg("Wystąpił problem z usunięciem wiadomości")
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

	setValue("sms_len", len);
	return errorCode;
}

function proofreadSMSText(input) {
	proofreadText(input, validateSMSText, 0);
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
	ubus_call('"easyconfig", "pptp", { }', function(data) {

		setValue("pptp_up", data.up?"Uruchomiony":"Brak połączenia");
		setValue('pptp_ip', (data.ip == '')?'-':'<a href="#" class="click" onclick="showgeolocation();">'+ data.ip + '</a>');

		setValue('pptp_uptime', formatTime(data.uptime, false));
		setValue('pptp_uptime_since', data.uptime_since == '-'?'':' (od ' + data.uptime_since + ')');

		setValue("pptp_enabled", data.enabled);
		setValue("pptp_server", data.server);
		setValue("pptp_username", data.username);
		setValue("pptp_password", data.password);

		removeOptions('pptp_led');
		e = document.getElementById('pptp_led');

		var opt = document.createElement('option');
		opt.value = "";
		opt.innerHTML = "żadna";
		e.appendChild(opt);

		var arr = data.leds;
		for(var idx=0; idx<arr.length; idx++){
			var opt = document.createElement('option');
			opt.value = arr[idx];
			opt.innerHTML = arr[idx];
			e.appendChild(opt);
		}

		setValue("pptp_led", data.led);
	});
}

function savepptp() {
	var cmd = [];

	cmd.push('uci set network.vpn_pptp=interface');
	cmd.push('uci set network.vpn_pptp.proto=pptp');
	cmd.push('uci set network.vpn_pptp.server=\\\"' + getValue("pptp_server") + '\\\"');
	cmd.push('uci set network.vpn_pptp.username=\\\"' + getValue("pptp_username") + '\\\"');
	cmd.push('uci set network.vpn_pptp.password=\\\"' + getValue("pptp_password") + '\\\"');
	cmd.push('ZONE=$(uci show firewall | awk -F. \'/name=.wan.$/{print $2}\')');
	cmd.push('uci del_list firewall.$ZONE.network=\\\"vpn_pptp\\\"');

	var led = getValue("pptp_led");
	if (led != "") {
		cmd.push('uci set system.vpn_pptp=led');
		cmd.push('uci set system.vpn_pptp.sysfs=\\\"' + led + '\\\"');
		cmd.push('uci set system.vpn_pptp.trigger=\\\"netdev\\\"');
		cmd.push('uci set system.vpn_pptp.dev=\\\"pptp-vpn_pptp\\\"');
		cmd.push('uci set system.vpn_pptp.mode=\\\"link\\\"');
	} else {
		cmd.push('uci -q del system.vpn_pptp');
	}

	if (getValue("pptp_enabled")) {
		cmd.push('uci set network.vpn_pptp.auto=1');
		cmd.push('uci add_list firewall.$ZONE.network=\\\"vpn_pptp\\\"');
		cmd.push('uci commit');
		cmd.push('ifup vpn_pptp');
	} else {
		cmd.push('uci set network.vpn_pptp.auto=0');
		cmd.push('uci commit');
		cmd.push('ifdown vpn_pptp');
	}
	execute(cmd, function(){ showpptp(); });
}

function uppptp() {
	ubus_call('"network.interface", "up", {"interface":"vpn_pptp"}', function(data) {
	});
}

function downpptp() {
	ubus_call('"network.interface", "down", {"interface":"vpn_pptp"}', function(data) {
		ubus_call('"network.interface", "up", {"interface":"wan"}', function(data) {
		});
	});
}

/*****************************************************************************/

function showgeolocation() {
	ubus_call('"easyconfig", "geolocation", { }', function(data) {
		if (data.status == 'success') {
			setValue('geolocation_ip', data.query?data.query:'-');
			setValue('geolocation_isp', data.isp?data.isp:'-');
			setValue('geolocation_city', data.city?data.city:'-');
			setValue('geolocation_region', data.regionName?data.regionName:'-');
			setValue('geolocation_country', data.country?data.country:'-');
			setDisplay('div_geolocation', true);
		} else {
			showMsg('Błąd odczytu lokalizacji', true);
		}
	});
}

function okgeolocation() {
	setDisplay("div_geolocation", false);
}

/*****************************************************************************/

var adblock_lists;

function showadblock() {
	ubus_call('"easyconfig", "adblock", { }', function(data) {
		setValue("adblock_domains", data.domains);
		setValue("adblock_enabled", data.enabled);
		setValue("adblock_forcedns", data.forcedns);

		adblock_lists = data.lists;

		var div = document.getElementById('div_adblock_lists');
		var html = "";
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
			html += '<span class="hidden-xs control-label labelleft">' + adblock_lists[i].desc + '</span>';
			html += '<div class="visible-xs">' + adblock_lists[i].desc + '</div>';
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
		div.innerHTML = html;
		setDisplay('div_adblock_lists', true);
		for (var i in adblock_lists) {
			setValue("adblock_" + adblock_lists[i].section, adblock_lists[i].enabled);
		}

		div = document.getElementById('div_adblock_list_blacklist');
		html = "";
		var blacklist = data.blacklist;
		if (blacklist.length > 0) {
			html = '<hr>';
			for (var idx=0; idx<blacklist.length; idx++) {
				html += '<div class="row">';
				html += '<div class="col-xs-9">' + blacklist[idx] + '</div>';
				html += '<div class="col-xs-3 text-right"><a href="#" class="click" onclick="removefromblacklist(\'' + blacklist[idx] + '\');">usuń</a></div>';
				html += '</div>';
			}
		}
		html += "<hr><p>Liczba domen na czarnej liście: " + blacklist.length + "</p>";
		div.innerHTML = html;
	});
}

function saveadblock() {
	var cmd = [];

	cmd.push('uci set adblock.global.adb_enabled=' + (getValue("adblock_enabled")?'1':'0'));
	cmd.push('uci set adblock.extra.adb_forcedns=' + (getValue("adblock_forcedns")?'1':'0'));
	for (var i in adblock_lists) {
		cmd.push('uci set adblock.' + adblock_lists[i].section + '.enabled=' + (getValue("adblock_" + adblock_lists[i].section)?'1':'0'));
	}
	cmd.push('uci commit adblock');
	cmd.push('/etc/init.d/adblock restart');
	execute(cmd, function(){ showadblock(); });
}

function checkdomain() {
	if (!getValue('adblock_enabled')) {
		showMsg("Blokada domen jest wyłączona. Nie można sprawdzić domeny");
		return
	}

	if (checkField('adblock_domain', validateDomain)) {return;}

	ubus_call('"file", "exec", {"command":"/etc/init.d/adblock","params":["query","' + getValue('adblock_domain') + '"]}', function(data) {
		showMsg((data.stdout).replace(/\n/g,'<br>'));
	});
}

function blacklistdomain() {
	if (checkField('adblock_domain', validateDomain)) {return;}

	var domain = getValue('adblock_domain');

	var cmd = [];
	cmd.push('F=$(uci -q get adblock.blacklist.adb_src)');
	cmd.push('[ -z \\\"$F\\\" ] && exit 0');
	cmd.push('mkdir -p $(dirname $F)');
	cmd.push('echo \\\"' + domain + '\\\" >> $F');
	cmd.push('/etc/init.d/adblock restart');
	execute(cmd, function(){
		setValue('adblock_domain', '');
		showadblock();
	});
}

function removefromblacklist(domain) {
	setValue("removefromblacklist_domain", domain);
	setValue("removefromblacklist_text", "Usunąć domenę \"" + domain + "\" z czarnej listy?");
	setDisplay("div_removefromblacklist", true);
}

function cancelremovefromblacklist() {
	setDisplay("div_removefromblacklist", false);
}

function okremovefromblacklist() {
	var domain = getValue("removefromblacklist_domain");
	cancelremovefromblacklist();

	var cmd = [];
	cmd.push('F=$(uci -q get adblock.blacklist.adb_src)');
	cmd.push('[ -z \\\"$F\\\" ] && exit 0');
	cmd.push('sed -i \\\"/^' + domain + '$/d\\\" \\\"$F\\\"');
	cmd.push('/etc/init.d/adblock restart');
	execute(cmd, function(){ showadblock(); });
}

/*****************************************************************************/

function opennav() {
	document.getElementById("menu").style.width = "250px";
}

function closenav() {
	document.getElementById("menu").style.width = "0";
}

function btn_pages(page) {
	closenav();
	setDisplay("div_status",   (page == 'status'));
	setDisplay("div_settings", (page == 'settings'));
	setDisplay("div_system",   (page == 'system'));
	setDisplay("div_watchdog", (page == 'watchdog'));
	setDisplay("div_sitesurvey", (page == 'sitesurvey'));
	setDisplay("div_wlanclients", (page == 'wlanclients'));
	setDisplay("div_queries", (page == 'queries'));
	setDisplay("div_traffic", (page == 'traffic'));
	setDisplay("div_ussdsms", (page == 'ussdsms'));
	setDisplay("div_pptp", (page == 'pptp'));
	setDisplay("div_adblock", (page == 'adblock'));

	if (page == 'status') {
		showstatus();
		showmodemsection();
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

	if (page == 'queries') {
		showqueries();
	}

	if (page == 'traffic') {
		showtraffic();
	}

	if (page == 'ussdsms') {
		readsms();
	}

	if (page == 'pptp') {
		showpptp();
	}

	if (page == 'adblock') {
		showadblock();
	}
}
