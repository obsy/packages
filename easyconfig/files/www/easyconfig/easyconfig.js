/*****************************************************************************/

function setCookie(cname, cvalue, cexpire) {
	var d = new Date();
	var expire = (cexpire || 31536000);
	d.setTime(d.getTime() + (expire * 1000));
	document.cookie = cname + '=' + cvalue + ';' + 'expires=' + d.toUTCString() + ';path=/';
}

function getCookie(cname) {
	var name = cname + '=';
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
	return '';
}

function setTheme(mode) {
	switch (mode) {
		case '0':
			document.body.classList.remove('darkmode');
			setCookie('easyconfig_darkmode', '0');
			break;
		case '1':
			document.body.classList.add('darkmode');
			setCookie('easyconfig_darkmode', '1');
			break;
		default:
			if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
				document.body.classList.add('darkmode');
			} else {
				document.body.classList.remove('darkmode');
			}
			setCookie('easyconfig_darkmode', '2');
			break;
	}
}

function showicon() {
	feather.replace({'width':18, 'height':18});
}

function easyconfig_onload() {
	showicon();
	setTheme(getCookie('easyconfig_darkmode'));

	var inittoken = '00000000000000000000000000000000';

	token = getCookie('easyconfig_token');
	if (token.length == 32) {
		ubus('"session", "list", {}', function(data) {
			if (data.error) {
				token = inittoken;
			} else {
				if (data.result[0] === 0) {
					if (data.result[1].ubus_rpc_session == token) {
						loginok(data.result[1], true);
					} else {
						token = inittoken;
					}
				} else {
					token = inittoken;
				}
			}
		}, function(status) {
			token = inittoken;
		}, false);
	} else {
		token = inittoken;
	}
}

function string2color(str) {
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	var color = '#';
	for (var i = 0; i < 3; i++) {
		var value = (hash >> (i * 8)) & 0xFF;
		color += ('00' + value.toString(16)).slice(-2);
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

function freq2band(freq) {
	if (freq >= 2412 && freq <= 2484) {
		return 2;
	}
	if (freq >= 5160 && freq <= 5885) {
		return 5;
	}
	if (freq >= 5955 && freq <= 7115) {
		return 6;
	}
	return 0;
}

/*****************************************************************************/

function proofreadHost(input) {
	proofreadText(input, validateHost, 0);
}

function proofreadIp(input) {
	proofreadText(input, validateIP, 0);
}

function proofreadIpWithMask(input) {
	proofreadText(input, validateIPWithMask, 0);
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

function validateIPWithMask(address) {
	var errorCode = 0;
	var ipFields = address.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
	if (ipFields == null) {
		errorCode = 1;
	} else {
		for (field=1; field <= 4; field++) {
			if ((ipFields[field] > 255) || (ipFields[field] == 255 && field==4)) {
				errorCode = 1;
			}
		}
		if ((ipFields[5] < 0) || (ipFields[5] > 32)) {
			errorCode = 1;
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
	return '<div class="row"><div class="col-xs-5 col-sm-6 text-right">' + key + '</div><div class="col-xs-7 col-sm-6 text-left"><p>' + value + '</p></div></div>';
}

function createRow4ColForModal(key, value1, value2, value3) {
	return '<div class="row">' +
		'<div class="col-xs-3 text-right">' + key + '</div>' +
		'<div class="col-xs-3 text-left"><p>' + value1 + '</p></div>' +
		'<div class="col-xs-3 text-left"><p>' + value2 + '</p></div>' +
		'<div class="col-xs-3 text-left"><p>' + value3 + '</p></div>' +
		'</div>';
}

function createRow9ColForModal(arr) {
	return '<div class="row">' +
		'<div class="col-xs-1 text-right"><p>' + arr[0] + '</p></div>' +
		'<div class="col-xs-3 text-left"><p>' + arr[1] + '</p></div>' +
		'<div class="col-xs-2 text-left"><p>' + arr[2] + '</p></div>' +
		'<div class="col-xs-1 text-left"><p>' + arr[3] + '</p></div>' +
		'<div class="col-xs-1 text-left"><p>' + arr[4] + '</p></div>' +
		'<div class="col-xs-1 text-left"><p>' + arr[5] + '</p></div>' +
		'<div class="col-xs-1 text-left"><p>' + arr[6] + '</p></div>' +
		'<div class="col-xs-1 text-left"><p>' + arr[7] + '</p></div>' +
		'<div class="col-xs-1 text-left"><p>' + arr[8] + '</p></div>' +
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
	return e;
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
	} else if (e.tagName == "H3") {
		return e.innerHTML;
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
	var url = e1.options[e1.selectedIndex].getAttribute("data-url");
	document.getElementById("wan_dns_url").setAttribute("href", url);
	setElementEnabled("wan_dns_url", (url!=""), false);
}

function okdetectwan() {
	var data = JSON.parse(getValue('dialog_val'));

	var cmd = [];
	cmd.push('uci -q del network.wan');
	cmd.push('uci set network.wan=interface');

	if (data.proto == '3g' || data.proto == 'mbim' || data.proto == 'ncm' || data.proto == 'qmi') {
		cmd.push('uci set network.wan.proto=' + data.proto);
		cmd.push('uci set network.wan.device=\\\"' + data.device + '\\\"');
		cmd.push('uci set network.wan.apn=\\\"' + data.apn + '\\\"');
		cmd.push('uci set network.wan.pincode=' + data.pincode);
	}
	if (data.proto == 'dhcp' || data.proto == 'dhcp_hilink') {
		cmd.push('uci set network.wan.proto=dhcp');
		if (config.devicesection) {
			cmd.push('uci set network.wan.device=' + data.ifname);
		} else {
			cmd.push('uci set network.wan.ifname=' + data.ifname);
		}
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
			if (data.proto == '3g' || data.proto == 'ncm' || data.proto == 'qmi') {
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

	if (proto == 'detect') {
		var proto = document.getElementById('wan_proto').getAttribute('data-prev');
		setValue('wan_proto', proto);
		detectwan('');
		return;
	}

	var fields = [];
	if (proto == 'static') {
		fields = ['wan_ipaddr', 'wan_netmask', 'wan_gateway', 'wan_dns1', 'wan_dns2'];
	}
	if (proto == 'mbim') {
		fields = ['wan_apn', 'wan_device', 'wan_pincode'];
	}
	if (proto == 'modemmanager') {
		fields = ['wan_apn', 'wan_device_mm', 'wan_pincode'];
	}
	if (proto == '3g' || proto == 'ncm' || proto == 'qmi') {
		fields = ['wan_apn', 'wan_device', 'wan_pincode', 'wan_modem_mode'];

		var e = removeOptions('wan_modem_mode');
		var t;
		if (proto == '3g') {
			t = {"":"Wg ustawień modemu","umts":"Wybór automatyczny 3G/2G","umts_only":"Tylko 3G (HSPA/UMTS)","gprs_only":"Tylko 2G (EDGE/GSM)"};
		}
		if (proto == 'ncm') {
			t = {"":"Wg ustawień modemu","auto":"Wybór automatyczny 4G/3G/2G","lte":"Tylko 4G (LTE)","umts":"Tylko 3G (HSPA/UMTS)","gsm":"Tylko 2G (EDGE/GSM)"};
		}
		if (proto == 'qmi') {
			t = {"":"Wg ustawień modemu","all":"Wybór automatyczny 5G/4G/3G/2G","lte":"Tylko 4G (LTE A/LTE)","umts":"Tylko 3G (HSPA/UMTS)","gsm":"Tylko 2G (EDGE/GSM)"};
		}
		for (key in t) {
			var opt = document.createElement('option');
			opt.value = key;
			opt.innerHTML = t[key];
			e.appendChild(opt);
		}
	}
	if (proto != 'static' && proto != 'dhcp' && config.wan_ifname_default !== '' && config.wan_ifname_default != 'br-wan') {
		fields.push('wan_wanport');
	}
	if (proto != 'none') {
		fields.push('wan_metered');
		fields.push('wan_lanto');
		fields.push('firewall_dmz');

		var e = document.getElementById('wan_proto');
		var tmp = e.options[e.selectedIndex].text;
		setValue('wan_lanto_interface1', tmp);
		setValue('wan_lanto_interface2', tmp);
	}

	var all = ['wan_ipaddr', 'wan_netmask', 'wan_gateway', 'wan_dns', 'wan_dns_url', 'wan_dns1', 'wan_dns2', 'wan_pincode', 'wan_device', 'wan_device_mm', 'wan_apn', 'wan_dashboard_url', 'wan_modem_mode', 'wan_wanport', 'wan_metered', 'wan_lanto', 'firewall_dmz'];
	for (var idx = 0; idx < all.length; idx++) {
		setElementEnabled(all[idx], false, false);
	}
	for (var idx = 0; idx < fields.length; idx++) {
		setElementEnabled(fields[idx], true, false);
	}
	if (proto != 'static' && proto != 'none') {
		var t = (config.wan_dns).slice(0,2).sort().join(',');

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

	setDisplay('div_status_wan', (proto != 'none'));
	setCookie('easyconfig_status_wan', (proto != 'none' ? '1' : '0'));
	document.getElementById('wan_proto').setAttribute('data-prev', getValue('wan_proto'));

	if (proto == 'dhcp_hilink' && config.wan_ifname == config.wan_ifname_hilink && config.wan_dashboard_url) {
		document.getElementById('wan_dashboard_url').setAttribute('href', config.wan_dashboard_url);
		setElementEnabled('wan_dashboard_url', true, false);
	}

	if (proto == '3g' || proto == 'mbim' || proto == 'ncm' || proto == 'qmi') {
		modem = 1;
		setDisplay('menu_ussdsms', config.services.ussdsms);
		setDisplay('div_status_modem', true);
		setDisplay('div_system_modem', true);
		setCookie('easyconfig_status_modem', '1');
	} else {
		modem = 0;
		setDisplay('menu_ussdsms', false);
		setDisplay('div_status_modem', false);
		setDisplay('div_system_modem', false);
		setCookie('easyconfig_status_modem', '0');
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
var modem = -1;
var counter = 0;
var token = "00000000000000000000000000000000";
var expires;
var timeout;

var ubus = function(param, successHandler, errorHandler, showWait) {
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
				setCookie('easyconfig_token', token, timeout);
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

	var filename = '/tmp/' + Math.random().toString(36).substring(2, 10) + '-' + Math.random().toString(36).substring(2, 10);
	ubus_call('"file", "write", {"path":"' + filename + '","data":"' + cmd.join('\n') + '"}', function(data) {
		ubus_call('"file", "exec", {"command":"sh", "params":["' + filename + '"]}', function(data1) {
			callback();
		});
	});
}

/*****************************************************************************/

function login() {
	var system_user = getValue('system_login');
	var system_pass = getValue('system_password');

	ubus('"session", "login", { "username": "' + system_user + '", "password": "' + (system_pass).replace(/\\/g, '\\\\').replace(/"/g,'\\\"') + '" }', function(data) {
		if (data.error) {
			ubus_error(data.error.code);
		} else {
			if (data.result[0] === 0) {
				setDisplay('div_security', (system_pass == '12345678'));
				loginok(data.result[1], false);
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

function loginok(session, showlastpage) {
	token = session.ubus_rpc_session;

	if (expires) { clearTimeout(expires); }
	expires = setTimeout(function(){ location.reload(); }, session.expires * 1000);
	timeout = session.timeout;
	setCookie('easyconfig_token', token, timeout);

	if (getCookie('easyconfig_status_wan') === '1') {
		setDisplay('div_status_wan', true);
	}
	if (getCookie('easyconfig_status_modem') === '1') {
		setDisplay('div_status_modem', true);
		setDisplay('div_system_modem', true);
	}

	showconfig();
	var page = 'status';
	if (showlastpage) {
		page = getCookie('easyconfig_page');
		if (page == '' || page == 'logout') {
			page = 'status';
		}
	}

	var clearid = null;
	function waitForConfig(callback, page) {
		clearid = window.setInterval(function() {
			if (typeof config != 'undefined' && typeof config.system_hostname != 'undefined') {
				callback(page);
			}
		}, 100, page);
	}

	function readyConfig(page) {
		clearInterval(clearid);
		setDisplay('div_login', false);
		setValue('system_password', '');
		setDisplay('div_content', true);
		if (page == 'config') {
			setDisplay('div_config', true);
		} else {
			btn_pages(page);
		}
	}
	waitForConfig(readyConfig, page);
}

function logout() {
	ubus('"session", "destroy", {}', function(data) {
		setCookie('easyconfig_token', '', 1);
		setCookie('easyconfig_page', '', 1);
		if (expires) { clearTimeout(expires); }
		document.getElementById('system_password').focus();
		location.reload();
	}, function(status) {
		showMsg('Błąd wylogowania!', true);
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

function showChannelRange(current_channels) {
	if (config) {
		current_channels = current_channels.filter((value, index, self) =>
			index === self.findIndex((t) => (
				t.channel === value.channel && t.min === value.min && t.max === value.max && t.phy === value.phy
			))
		)
		var t = '';
		var sorted = sortJSON(current_channels, 'channel', 'asc');
		for (var idx = 0; idx < sorted.length; idx++) {
			var o = sorted[idx];
			for (var idx1 = 0; idx1 < (config.wlan_devices).length; idx1++) {
				if (config[config.wlan_devices[idx1]].wlan_phy == o.phy) {
					var wlan_channels = config[config.wlan_devices[idx1]].wlan_channels;
					o.min = findClosestChannel(true, o.min, wlan_channels);
					o.max = findClosestChannel(false, o.max, wlan_channels);
					break;
				}
			}
			if (t != '') { t += ', '; }
			t += o.channel + ' (' + o.min + ' - ' + o.max + ')';
		}
		setValue('wlan_current_channels', t == '' ? '-' : t);
	}
}

var wan = [];
wan['none'] = 'Brak';
wan['dhcp'] = 'Port WAN (DHCP)';
wan['static'] = 'Port WAN (Statyczny IP)';
wan['3g'] = 'Modem komórkowy (RAS)';
wan['mbim'] = 'Modem komórkowy (MBIM)';
wan['modemmanager'] = 'Modem komórkowy';
wan['ncm'] = 'Modem komórkowy (NCM)';
wan['qmi'] = 'Modem komórkowy (QMI)';
wan['dhcp_hilink'] = 'Modem komórkowy (HiLink lub RNDIS)';
wan['-'] = ' ';
wan['detect'] = 'Wykryj...';

function showconfig() {
	ubus_call('"easyconfig", "config", {}', function(data) {
		config = data;

		// wan
		var e = removeOptions('wan_proto');
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

		e = removeOptions('wan_device');
		var arr = config.wan_devices;
		for (var idx = 0; idx<arr.length; idx++) {
			var opt = document.createElement('option');
			opt.value = arr[idx];
			opt.innerHTML = arr[idx];
			e.appendChild(opt);
		}

		e = removeOptions('modemsettings_modem_device');
		var opt = document.createElement('option');
		opt.value = '';
		opt.innerHTML = 'Automatyczne wykrywanie';
		e.appendChild(opt);
		for (var idx = 0; idx < arr.length; idx++) {
			var opt = document.createElement('option');
			opt.value = arr[idx];
			opt.innerHTML = arr[idx];
			e.appendChild(opt);
		}

		e = removeOptions('wan_device_mm');
		var arr = config.wan_devices_mm;
		for (var idx = 0; idx < arr.length; idx++) {
			var opt = document.createElement('option');
			opt.value = arr[idx][0];
			opt.innerHTML = arr[idx][1] + ' ' + arr[idx][2];
			e.appendChild(opt);
		}

		e = removeOptions('wan_dns');
		var sorteddns = [];
		sorteddns = sortJSON(dns, 'name', 'asc');
		sorteddns = [{"ip":["isp"],"name":"Otrzymane od dostawcy","url":""},{"ip":["custom"],"name":"Inne","url":""}].concat(sorteddns);
		if (config.services.stubby) {
			sorteddns = [{"ip":["stubby"],"name":"DNS over TLS","url":""}].concat(sorteddns);
		}
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
		setValue('wan_device_mm', config.wan_device);
		setValue('wan_pincode', config.wan_pincode);
		setValue('wan_dns1', (config.wan_dns.length > 0 ? config.wan_dns[0] : ''));
		setValue('wan_dns2', (config.wan_dns.length > 1 ? config.wan_dns[1] : ''));
		setValue('wan_proto', config.wan_proto);
		setValue('wan_wanport', (config.wan_wanport == 'bridge'));
		if (config.wan_proto == 'dhcp') {
			if (config.wan_ifname == config.wan_ifname_hilink) {
				setValue('wan_proto', 'dhcp_hilink');
			}
		}
		enableWan(getValue('wan_proto'));
		setValue('wan_modem_mode', config.wan_modem_mode);
		setValue('wan_metered', config.wan_metered);
		setValue('wan_lanto', config.wan_lanto != '');
		setDisplay('div_wan_lanto_status', config.wan_lanto == '');

		// lan
		setValue('lan_ipaddr', config.lan_ipaddr);
		setValue('lan_dhcp_enabled', config.lan_dhcp_enabled);
		setValue('lan_forcedns', config.lan_forcedns);
		setValue('dhcp_logqueries', config.dhcp_logqueries);
		setDisplay('menu_queries', config.dhcp_logqueries);

		// wlan
		showChannelRange(config.wlan_current_channels);

		var is_radio2 = false;
		var is_radio5 = false;
		var is_radio6 = false;
		var enc = [];
		enc['none'] = 'Brak';
		enc['psk'] = 'WPA Personal';
		enc['psk2'] = 'WPA2 Personal';
		if (config.services.sae) {
			enc['sae-mixed'] = 'WPA2/WPA3 Personal';
			enc['sae'] = 'WPA3 Personal';
		}

		setValue('div_radio_content', '');
		var radios = config.wlan_devices;
		for (var i = 0; i < radios.length; i++) {
			is_radio2 = false;
			is_radio5 = false;
			is_radio6 = false;

			var html = ('<div>' + document.getElementById('div_radio_template').innerHTML + '</div>').replaceAll('_idx', '_' + i);
			document.getElementById('div_radio_content').insertAdjacentHTML('beforeend', html);
			if (i > 0) { setDisplay('div_wlan_copy_link_' + i, true); }

			select = removeOptions('wlan_channel_' + i);
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
				switch (freq2band(obj[propt][0])) {
					case 2:
						is_radio2 = true;
						break;
					case 5:
						is_radio5 = true;
						break;
					case 6:
						is_radio6 = true;
						break;
				}
			}

			var wifidesc1 = '';
			var wifidesc2 = '';
			if ((config[radios[i]].wlan_hwmode).includes('n')) { wifidesc1 = ' 4, ' + config[radios[i]].wlan_hwmode + ','; }
			if ((config[radios[i]].wlan_hwmode).includes('ac')) { wifidesc1 = ' 5, ' + config[radios[i]].wlan_hwmode + ','; }
			if ((config[radios[i]].wlan_hwmode).includes('ax')) { wifidesc1 = ' 6, ' + config[radios[i]].wlan_hwmode + ','; }
			if (is_radio2) { wifidesc2 = ' 2.4 GHz'; }
			if (is_radio5) { wifidesc2 = ' 5 GHz'; }
			if (is_radio2 && is_radio5) { wifidesc2 = ' 2.4/5 GHz'; }
			if (is_radio6) { wifidesc2 = ' 6 GHz'; }
			if (is_radio2 && is_radio5 && is_radio6) { wifidesc2 = ' 2.4/5/6 GHz'; }
			setValue('radio_' + i, 'Wi-Fi' + wifidesc1 + wifidesc2);

			setValue('wlan_enabled_' + i, (config[radios[i]].wlan_disabled != 1));
			setValue('wlan_channel_' + i, config[radios[i]].wlan_channel);
			enableWlanTXPower(config[radios[i]].wlan_channel, '_' + i);
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
			setValue('wlan_txpower_' + i, txpower);
			setValue('wlan_ssid_' + i, config[radios[i]].wlan_ssid);

			var select = removeOptions('wlan_encryption_' + i);
			for (var propt in enc) {
				var opt = document.createElement('option');
				opt.value = propt;
				opt.innerHTML = enc[propt];
				select.appendChild(opt);
			}
			setValue('wlan_encryption_' + i, config[radios[i]].wlan_encryption);

			setValue('wlan_key_' + i, config[radios[i]].wlan_key);
			enableWlanEncryption(config[radios[i]].wlan_encryption, '_' + i);
			setValue('wlan_isolate_' + i, config[radios[i]].wlan_isolate == 1);
		}

		if (!is_radio2 && !is_radio5 && !is_radio6) {
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
		if (config.services.statistics.enabled != -1) {
			setValue('stat_enabled', (config.services.statistics.enabled == 1));
		}
		setDisplay('div_stat', (config.services.statistics.enabled != -1));

		// vpn
		setDisplay('menu_vpn', (config.services.vpn).length > 0);

		// nightmode / sunwait
		setDisplay('div_nightmode_led_auto', config.services.sunwait);
		if (config.services.gps) { document.getElementById('btn_nightmode_locationfromgps').style.display = 'inline-block'; }

		// modembands
		setDisplay('link_modembands4g', config.services.modemband4g);
		setDisplay('link_modembands5gnsa', config.services.modemband5gnsa);
		setDisplay('link_modembands5gsa', config.services.modemband5gsa);

		// gps
		setDisplay('menu_gps', config.services.gps);

		// button
		if (config.button.code != '') {
			select = removeOptions('system_button');
			var opt = document.createElement('option');
			opt.value = 'none';
			opt.innerHTML = 'Brak akcji';
			select.appendChild(opt);
			opt = document.createElement('option');
			opt.value = 'leds';
			opt.innerHTML = 'Włącz/wyłącz diody LED';
			select.appendChild(opt);
			if (is_radio2 || is_radio5 || is_radio6) {
				opt = document.createElement('option');
				opt.value = 'rfkill';
				opt.innerHTML = 'Włącz/wyłącz Wi-Fi';
				select.appendChild(opt);
			}
			if ((config.services.vpn).length > 0) {
				opt = document.createElement('option');
				opt.value = 'vpn';
				opt.innerHTML = 'Włącz/wyłącz VPN';
				select.appendChild(opt);
			}
			opt = document.createElement('option');
			opt.value = 'killswitch';
			opt.innerHTML = 'Włącz/wyłącz dostęp z sieci lokalnej (killswitch)';
			select.appendChild(opt);
			setValue('system_button_name', config.button.name);
			setValue('system_button', config.button.action);
		}
		setDisplay('div_button', config.button.code != '');

		// button reset
		if (config.button_reset != -1) {
			setValue('system_button_reset', (config.button_reset == 1));
		}
		setDisplay('div_button_reset', (config.button_reset != -1));

		setValue('datarec_period', config.datarec_period);
	})
}

function copywireless(idx) {
	var previdx = parseInt(idx.replace('_', '')) - 1;
	setValue('wlan_enabled' + idx, getValue('wlan_enabled_' + previdx));
	setValue('wlan_ssid' + idx, getValue('wlan_ssid_' + previdx));
	setValue('wlan_encryption' + idx, getValue('wlan_encryption_' + previdx));
	setValue('wlan_key' + idx, getValue('wlan_key_' + previdx));
	setValue('wlan_isolate' + idx, getValue('wlan_isolate_' + previdx));
	enableWlanEncryption(getValue('wlan_encryption_' + previdx), idx);
}

function saveconfig() {
	var cmd = [];

	// wan
	cmd.push('uci set network.wan=interface');
	cmd.push('uci -q del network.wan.ifname');
	cmd.push('uci -q del network.wan.ipaddr');
	cmd.push('uci -q del network.wan.netmask');
	cmd.push('uci -q del network.wan.gateway');
	cmd.push('uci -q del network.wan.apn');
	cmd.push('uci -q del network.wan.device');
	cmd.push('uci -q del network.wan.pincode');
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

		if (config.devicesection) {
			cmd.push('uci set network.wan.device=' + config.wan_ifname_default);
		} else {
			cmd.push('uci set network.wan.ifname=' + config.wan_ifname_default);
		}
		cmd.push('uci set network.wan.ipaddr='+getValue('wan_ipaddr'));
		cmd.push('uci set network.wan.netmask='+getValue('wan_netmask'));
		cmd.push('uci set network.wan.gateway='+getValue('wan_gateway'));
		use_dns = 'custom';
		use_wanport = false;
	}
	if (wan_type == '3g' || wan_type == 'mbim' || wan_type == 'modemmanager' || wan_type == 'ncm' || wan_type == 'qmi') {
		cmd.push('uci set network.wan.apn=\\\"' + getValue('wan_apn') + '\\\"');
		cmd.push('uci set network.wan.device=\\\"' + getValue('wan_device' + (wan_type == 'modemmanager' ? '_mm' : '')) + '\\\"');
		cmd.push('uci set network.wan.pincode=' + getValue('wan_pincode'));
	}
	if (wan_type == '3g') {
		cmd.push('uci set network.wan.service=\\\"' + getValue('wan_modem_mode') + '\\\"');
	}
	if (wan_type == 'ncm') {
		cmd.push('uci set network.wan.mode=\\\"' + getValue('wan_modem_mode') + '\\\"');
	}
	if (wan_type == 'qmi') {
		cmd.push('uci set network.wan.modes=\\\"' + getValue('wan_modem_mode') + '\\\"');
		if (config.wan_proto != wan_type || config.wan_device != getValue('wan_device') || config.wan_apn != getValue('wan_apn')) {
			cmd.push('rm /var/state/easyconfig_modem 2>/dev/null');
			cmd.push('easyconfig_setapn.sh');
		}
	}
	if (wan_type == 'dhcp') {
		if (config.devicesection) {
			cmd.push('uci set network.wan.device=' + config.wan_ifname_default);
		} else {
			cmd.push('uci set network.wan.ifname=' + config.wan_ifname_default);
		}
		use_wanport = false;
	}
	if (wan_type == 'dhcp_hilink') {
		if (config.devicesection) {
			cmd.push('uci set network.wan.device=' + config.wan_ifname_hilink);
		} else {
			cmd.push('uci set network.wan.ifname=' + config.wan_ifname_hilink);
		}
		wan_type='dhcp';
	}
	cmd.push('uci set network.wan.proto='+wan_type);
	config.wan_proto=wan_type;

	if (config.wan_ifname_default !== '') {
		if (config.devicesection) {
			cmd.push('T=$(uci -q get network.lan.device)');
			cmd.push('SEC=$(uci show network | awk -F. \'/\\\\\.name=\'\\\\\'\'\'$T\'\'\\\\\'\'$/{print $2}\')');
			cmd.push('uci -q del_list network.$SEC.ports=' + config.wan_ifname_default);
			if (use_wanport && getValue('wan_wanport')) {
				cmd.push('uci add_list network.$SEC.ports=' + config.wan_ifname_default);
			}
		} else {
			cmd.push('T=$(uci -q get network.lan.ifname | sed \'s|' + config.wan_ifname_default + '||\' | xargs)');
			if (use_wanport && getValue('wan_wanport')) {
				cmd.push('uci set network.lan.ifname=\\\"$T ' + config.wan_ifname_default + '\\\"');
			} else {
				cmd.push('uci set network.lan.ifname=\\\"$T\\\"');
			}
		}
	}

	if (wan_type == 'none') {
		cmd.push('uci -q del firewall.dmz');
	}

	cmd.push('uci -q del_list dhcp.lan.dhcp_option=\'43,ANDROID_METERED\'');
	if (getValue('wan_metered')) {
		cmd.push('uci add_list dhcp.lan.dhcp_option=\'43,ANDROID_METERED\'');
	}

	if (getValue('wan_lanto')) {
		if (config.wan_lanto == '') {
			cmd.push('uci add firewall forwarding');
			cmd.push('uci set firewall.@forwarding[-1].src=lan');
			cmd.push('uci set firewall.@forwarding[-1].dest=wan');
		}
	} else {
		if (config.wan_lanto != '') {
			cmd.push('uci -q del firewall.' + config.wan_lanto);
		}
	}

	// dns
	cmd.push('uci -q del dhcp.@dnsmasq[0].noresolv');
	cmd.push('uci -q del dhcp.@dnsmasq[0].server');
	cmd.push('uci -q del network.wan.dns');
	cmd.push('uci -q del network.wan.peerdns');
	if (use_dns != 'none') {
		var t = [];
		if (use_dns == 'stubby') {
			t.push('127.0.0.1');
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
			if (getValue('wan_dns1') != '') { t.push(getValue('wan_dns1')); }
			if (getValue('wan_dns2') != '') { t.push(getValue('wan_dns2')); }
		} else if (use_dns == 'isp') {
			t = [];
		} else {
			t = use_dns.split(',');
		}
		if (t.length > 0) {
			cmd.push('uci set network.wan.peerdns=0');
			t.forEach(function(address) {
				cmd.push('uci add_list network.wan.dns=\\\"' + address + '\\\"');
			});
		}
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
	cmd.push('uci set network.lan.netmask=' + config.lan_netmask);

	if (getValue("lan_dhcp_enabled")) {
		cmd.push('uci -q del dhcp.lan.ignore');
	} else {
		cmd.push('uci set dhcp.lan.ignore=1');
	}

	if (getValue('lan_forcedns')) {
		cmd.push('uci set firewall.dns_53_redirect=redirect');
		cmd.push('uci set firewall.dns_53_redirect.name=\\\"Adblock DNS, port 53\\\"');
		cmd.push('uci set firewall.dns_53_redirect.src=lan');
		cmd.push('uci set firewall.dns_53_redirect.proto=\\\"tcp udp\\\"');
		cmd.push('uci set firewall.dns_53_redirect.src_dport=53');
		cmd.push('uci set firewall.dns_53_redirect.dest_port=53');
		cmd.push('uci set firewall.dns_53_redirect.target=DNAT');
	} else {
		cmd.push('uci -q del firewall.dns_53_redirect');
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

	var radios = config.wlan_devices;
	for (var i = 0; i < radios.length; i++) {
		var section = config[radios[i]].wlan_section;

		if (section == '') {
			wlan_restart_required = true;
			cmd.push('uci add wireless wifi-iface');
			section = '@wifi-iface[-1]';
			config[radios[i]].wlan_section = section;
			cmd.push('uci set wireless.' + section + '.device=' + radios[i]);
		}

		if (getValue('wlan_enabled_' + i)) {
			if (config[radios[i]].wlan_disabled == 1) {
				wlan_restart_required = true;
				cmd.push('uci -q del wireless.' + radios[i] + '.disabled');
			}
		} else {
			if (config[radios[i]].wlan_disabled != 1) {
				wlan_restart_required = true;
				cmd.push('uci set wireless.' + radios[i] + '.disabled=1');
			}
		}

		wlan_channel = getValue('wlan_channel_' + i);
		if (config[radios[i]].wlan_channel != wlan_channel) {
			wlan_restart_required = true;
			cmd.push('uci set wireless.' + radios[i] + '.channel=' + wlan_channel);
			if (wlan_channel > 0) {
				var band = freq2band(config[radios[i]].wlan_channels[wlan_channel][0]);
				if (config[radios[i]].wlan_band != '') {
					cmd.push('uci set wireless.' + radios[i] + '.band=' + band + 'g');
				} else {
					cmd.push('uci set wireless.' + radios[i] + '.hwmode=11' + (band == 2 ? 'g' : 'a'));
				}
			}
		}
		if (wlan_channel > 0) {
			txpower = getValue('wlan_txpower_' + i);
			var maxtxpower = config[radios[i]].wlan_channels[wlan_channel][1];
			var curtxpower = Math.round(txpower * maxtxpower / 100);
			if (config[radios[i]].wlan_txpower != curtxpower) {
				wlan_restart_required = true;
				cmd.push('uci set wireless.' + radios[i] + '.txpower=' + curtxpower);
			}
		} else {
			cmd.push('uci -q del wireless.' + radios[i] + '.txpower');
		}
		wlan_ssid = getValue('wlan_ssid_' + i);
		if (wlan_ssid == '') {
			showMsg('Błąd w polu ' + getLabelText('wlan_ssid_' + i) + ' dla ' + getValue('radio_' + i), true);
			return;
		}
		if (validateLengthRange(wlan_ssid, 1, 32) != 0) {
			showMsg('Błąd w polu ' + getLabelText('wlan_ssid_' + i) + ' dla ' + getValue('radio_' + i) + '<br><br>Nazwa Wi-Fi nie może być dłuższa niż 32 znaki', true);
			return;
		}
		if (config[radios[i]].wlan_ssid != wlan_ssid) {
			wlan_restart_required = true;
			cmd.push('uci set wireless.' + section + '.ssid=\\\"' + escapeShell(wlan_ssid) + '\\\"');
		}
		wlan_encryption = getValue('wlan_encryption_' + i);
		if (config[radios[i]].wlan_encryption != wlan_encryption) {
			wlan_restart_required = true;
			cmd.push('uci set wireless.' + section + '.encryption=\\\"'+wlan_encryption+'\\\"');
		}
		wlan_key = getValue('wlan_key_' + i);
		if (config[radios[i]].wlan_key != wlan_key) {
			if (wlan_encryption != 'none') {
				if (wlan_key.length < 8) {
					showMsg('Błąd w polu ' + getLabelText('wlan_key_' + i) + ' dla ' + getValue('radio_' + i) + '<br><br>Hasło do Wi-Fi musi mieć co najmniej 8 znaków', true);
					return;
				}
			}
			wlan_restart_required = true;
			cmd.push('uci set wireless.' + section + '.key=\\\"' + escapeShell(wlan_key) + '\\\"');
		}

		if (getValue('wlan_isolate_' + i)) {
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
		var action = getValue('system_button');
		if (config.button.action != action) {
			cmd.push('rm /etc/rc.button/' + config.button.code + '>/dev/null');
			cmd.push('[ -e /usr/share/easyconfig/rc.button/' + action + ' ] && ln -s /usr/share/easyconfig/rc.button/' + action + ' /etc/rc.button/' + config.button.code);
		}
	}

	if (config.button_reset > -1) {
		if (getValue('system_button_reset')) {
			cmd.push('[ -e /etc/rc.button/reset ] || cp /usr/share/easyconfig/rc.button/reset /etc/rc.button/reset');
		} else {
			cmd.push('[ -e /etc/rc.button/reset ] && rm /etc/rc.button/reset');
		}
	}

	cmd.push('uci set easyconfig.global.datarec_period=' + getValue('datarec_period'));

	// commit & restart services
	cmd.push('uci commit');
	cmd.push('reload_config');
	cmd.push('/etc/init.d/firewall restart');
	cmd.push('ifup wan');
	if (wlan_restart_required) {
		cmd.push('wifi down');
		cmd.push('sleep 2');
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

	execute(cmd, function(){
		cleanField('password1');
		cleanField('password2');
		setDisplay('div_security', (pass1 == '12345678'));
		showconfig();
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

function showbandwidth(mac) {
	var html = '';
	html += '<div class="row"><div class="col-xs-5 col-sm-6 text-right">Wysłano</div><div class="col-xs-7 col-sm-6 text-left"><p id="bandwidth_all_tx">-</p></div></div>';
	html += '<div class="row"><div class="col-xs-5 col-sm-6 text-right">Pobrano</div><div class="col-xs-7 col-sm-6 text-left"><p id="bandwidth_all_rx">-</p></div></div>';
	html += '<div class="row space"><div class="col-xs-5 col-sm-6 text-right">Jednostki</div><div class="col-xs-7 col-sm-6 text-left">';
	html += '<span class="click" onclick="bandwidthcallback(false);"><span id="bandwidth_bits"> bity </span></span>|';
	html += '<span class="click" onclick="bandwidthcallback(true);"><span id="bandwidth_bytes"> bajty </span></span>';
	html += '</div></div>';
	html += '<div class="row"><div class="col-xs-3 col-xs-offset-5 col-sm-3 col-sm-offset-6 text-left"><p>teraz</p></div><div class="col-xs-4 col-sm-3 text-left"><p>maks.</p></div></div>';
	html += '<div class="row"><div class="col-xs-5 col-sm-6 text-right" id="bandwidth_speed_label_tx">Szybkość wysyłania</div><div class="col-xs-3 col-sm-3 text-left"><p id="bandwidth_speed_tx">-</p></div><div class="col-xs-4 col-sm-3 text-left"><p id="bandwidth_speed_max_tx">-</p></div></div>';
	html += '<div class="row"><div class="col-xs-5 col-sm-6 text-right" id="bandwidth_speed_label_rx">Szybkość pobierania</div><div class="col-xs-3 col-sm-3 text-left"><p id="bandwidth_speed_rx">-</p></div><div class="col-xs-4 col-sm-3 text-left"><p id="bandwidth_speed_max_rx">-</p></div></div>';
	html += '<div class="row" id="div_bandwidth"><div class="col-xs-12"><canvas id="bandwidth" height="400"></canvas></div></div>';
	showMsg(html);
	var bandwidth_arr = []; bandwidth_arr[0] = []; bandwidth_arr[1] = [];
	var bandwidth_old = []; bandwidth_old['tx'] = -1;
	var bandwidth_max = []; bandwidth_max['tx'] = 0; bandwidth_max['rx'] = 0;
	var bandwidth_legend = [{color:'green',elements:['bandwidth_speed_label_tx','bandwidth_speed_tx','bandwidth_speed_max_tx']},{color:'blue',elements:['bandwidth_speed_label_rx','bandwidth_speed_rx','bandwidth_speed_max_rx']}];
	livegraph.draw({element: 'bandwidth', data: bandwidth_arr, legend: bandwidth_legend});
	if (config.wan_ifname != '' || mac) {
		bandwidthcallback(false);
		bandwidthID = setInterval(function() {
			var e = document.getElementById('bandwidth_all_tx');
			if (!e || e.offsetParent === null) {
				clearInterval(bandwidthID);
				if (mac == '') {
					if (bandwidth_old['tx'] > -1) {
						setValue('wan_tx', '<span class="click" onclick="showbandwidth(\'\');">' + bytesToSize(bandwidth_old['tx']) + '</span>');
						setValue('wan_rx', '<span class="click" onclick="showbandwidth(\'\');">' + bytesToSize(bandwidth_old['rx']) + '</span>');
					}
				} else {
					for (var idx = 0; idx < clients.length; idx++) {
						if (clients[idx].mac == mac && clients[idx].active) {
							if (bandwidth_old['tx'] > -1) {
								clients[idx].tx = bandwidth_old['tx'];
								clients[idx].rx = bandwidth_old['rx'];
							}
							clientscallback('');
							break;
						}
					}
				}
				return;
			}
			var source = '';
			if (mac == '') {
				source = '"network.device", "status", {"name":"' + config.wan_ifname + '"}';
			} else {
				source = '"easyconfig", "clientbandwidth", {"mac":"' + mac + '"}';
			}
			ubus_call_nomsg(source, function(data) {
				var tx = 0;
				var rx = 0;
				if (mac == '') {
					tx = data.statistics.tx_bytes;
					rx = data.statistics.rx_bytes;
				} else {
					for (var idx = 0; idx < data.result.length; idx++) {
						tx += data.result[idx].tx_bytes;
						rx += data.result[idx].rx_bytes;
					}
				}
				setValue('bandwidth_all_tx', bytesToSize(tx));
				setValue('bandwidth_all_rx', bytesToSize(rx));
				if (bandwidth_old['tx'] != -1) {
					var dtx = tx - bandwidth_old['tx'];
					var drx = rx - bandwidth_old['rx'];
					if (dtx < 0) { dtx = 0; }
					if (drx < 0) { drx = 0; }
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
				bandwidth_old['tx'] = tx;
				bandwidth_old['rx'] = rx;
			});
		}, 1000);
	}
}

var physicalports = [];
var simslot = {};

function showstatus() {
	ubus_call('"easyconfig", "status", {}', function(data) {
		simslot = data.simslot;
		setValue('system_uptime', formatDuration(data.system_uptime, false));
		setValue('system_uptime_since', data.system_uptime_since == '' ? '' : ' (od ' + formatDateTime(data.system_uptime_since) + ')');
		setValue('system_load', data.system_load);
		setValue('system_time', data.system_time == '' ? '-' : formatDateTime(data.system_time));
		setValue('wlan_clients', data.wlan_clients + ' &rarr;');
		setValue('lan_clients', data.lan_clients + ' &rarr;');
		setValue('wan_rx', data.wan_rx == '' ? '-' : '<span class="click" onclick="showbandwidth(\'\');">' + bytesToSize(data.wan_rx) + '</span>');
		setValue('wan_tx', data.wan_tx == '' ? '-' : '<span class="click" onclick="showbandwidth(\'\');">' + bytesToSize(data.wan_tx) + '</span>');
		setValue('wan_uptime', formatDuration(data.wan_uptime, false));
		setValue('wan_uptime_since', data.wan_uptime_since == '' ? '' : ' (od ' + formatDateTime(data.wan_uptime_since) + ')');
		setValue('wan_up_cnt', (data.wan_up_cnt == '') ? '0' : '<span class="click" onclick="showwanup(\'' + (JSON.stringify(data.wan_up_since)).replace(/\"/g,"$") + '\');">' + data.wan_up_cnt + '</span>');
		setValue('wan_ipaddr_status', (data.wan_ipaddr == '') ? '-' : '<span class="click" onclick="showgeolocation();">' + data.wan_ipaddr + '</span>');
		setDisplay('div_vpn_up_status', data.vpn_up);
		if ((data.sensors).length > 0) {
			var html = '';
			for (var i in data.sensors) {
				for (var j in data.sensors[i]) {
					html += '<div class="row"><div class="col-xs-6 text-right">' + j + '</div>';
					html += '<div class="col-xs-6"><p>' + data.sensors[i][j] + '</p></div></div>';
				}
			}
			setValue('div_status_sensors_addon', html);
			setDisplay('div_status_sensors', true);
		} else {
			setDisplay('div_status_sensors', false);
		}
		showChannelRange(data.wlan_current_channels);

		if ((data.ports).length > 0) {
			for (var idx = 0; idx < (data.ports_swconfig).length; idx++) {
				var idx1 = (data.ports).findIndex(x => x.port === data.ports_swconfig[idx].port);
				if (idx1 > -1) {
					(data.ports).splice(idx1, 1);
				}
				(data.ports).push({'port': ((data.ports_swconfig[idx]).role == 'wan' ? 'wan' : (data.ports_swconfig[idx]).role + (data.ports_swconfig[idx]).id), 'speed': (data.ports_swconfig[idx]).speed, 'macs': -1});
			}
			if ((data.ports).length > 0) {
				physicalports = data.ports;
				var sorted = naturalSortJSON(data.ports, 'port');
				var html = '<center><table><tr>';
				for (var idx = 0; idx < sorted.length; idx++) {
					html += '<td style="padding:5px;text-align:center"' + (sorted[idx].macs > 0 ? ' title="Połączonych klientów: ' + sorted[idx].macs + '"' : '') + '><i data-feather="wire' + (sorted[idx].speed > 0 ? '2' : '1')  + '">x</i><br>' + (sorted[idx].port).toUpperCase();
					html += '<br>' + networkspeed(sorted[idx].speed);
					html += '</td>';
					if (((idx + 1) % 5) == 0 && (idx + 1) < sorted.length) {
						html += '</tr><tr>';
					}
				}
				html += '</tr></table></center>'
				setValue('div_status_lan_ports', html);
				feather.replace({'width':36, 'height':36});
				setDisplay('div_status_lan_ports', true);
			} else {
				setDisplay('div_status_lan_ports', false);
			}
		} else {
			setDisplay('div_status_lan_ports', false);
		}

		if (data.mwan3_use_policy) {
			switch (data.mwan3_use_policy) {
				case 'balanced':
					setValue('mwan3_policy', 'Równoważenie obciążenia');
					break;
				case 'wan_wanb':
					setValue('mwan3_policy', 'Przełączanie awaryjne WAN -> WANB');
					break;
				case 'wanb_wan':
					setValue('mwan3_policy', 'Przełączanie awaryjne WANB -> WAN');
					break;
				default:
					setValue('mwan3_policy', data.mwan3_use_policy);
					break;
			}

			ubus_call('"mwan3", "status", {}', function(data1) {
				var interfaces = new Object();
				for (var policy in data1.policies.ipv4) {
					if (data.mwan3_use_policy == policy) {
						for (var idx in data1.policies.ipv4[policy]) {
							interfaces[data1.policies.ipv4[policy][idx].interface] = data1.policies.ipv4[policy][idx].percent;
						}
						break;
					}
				}

				html = '';
				for (var i in data1.interfaces) {
					html += '<div class="row"><div class="col-xs-3 text-right">' + i + '</div>';
					var css = '';
					var status1 = '';
					var status2 = '';
					var status3 = (interfaces[i] === undefined ? '-' : interfaces[i] + '%');
					switch (data1.interfaces[i].status) {
						case 'online':
							css = ' style="color:green";';
							status1 = 'Dostępny';
							status2 = formatDuration(data1.interfaces[i].online, true) + '<span class="visible-xs oneline"></span> (od ' + formatDateTime(timestampToDate(Date.now()/1000 - data1.interfaces[i].online)) +  ')';
							break;
						case 'offline':
							css = ' style="color:red";';
							status1 = 'Niedostępny';
							status2 = 'przestój ' + formatDuration(data1.interfaces[i].offline, true) + '<span class="visible-xs oneline"></span> (od ' + formatDateTime(timestampToDate(Date.now()/1000 - data1.interfaces[i].offline)) +  ')';
							break;
						case 'notracking':
							status1 = 'Bez śledzenia';
							if (data1.interfaces[i].uptime > 0) {
								css = ' style="color:green";';
								status2 = formatDuration(data1.interfaces[i].uptime, true) + '<span class="visible-xs oneline"></span> (od ' + formatDateTime(timestampToDate(Date.now()/1000 - data1.interfaces[i].uptime)) +  ')';
							} else {
								css = '';
								status2 = '-';
							}
							break;
						default:
							css = '';
							status1 = 'Wyłączony';
							status2 = '-';
					}
					html += '<div class="col-xs-3"><p><span' + css + '>' + status1 + '</span></p></div>';
					html += '<div class="col-xs-3"><p>' + status2 + '</p></div>';
					html += '<div class="col-xs-3"><p>' + status3 + '</p></div>';
					html += '</div>';
				}
				setValue('div_status_mwan3_content', html);
				setDisplay('div_status_mwan3', true);
			})
		} else {
			setDisplay('div_status_mwan3', false);
		}
	});
}

function networkspeed(speed) {
	switch (speed) {
		case 40000:
			return '40Gbps';
			break;
		case 25000:
			return '25Gbps';
			break;
		case 10000:
			return '10Gbps';
			break;
		case 5000:
			return '5Gbps';
			break;
		case 2500:
			return '2.5Gbps';
			break;
		case 1000:
			return '1Gbps';
			break;
		case 100:
			return '100Mbps';
			break;
		case 10:
			return '10Mbps';
			break;
		default:
			return '-';
	}
}

function showsystem() {
	ubus_call('"easyconfig", "system", {}', function(data) {
		setValue('firmware_version', data.version);
		setValue('gui_version', data.gui_version);
		setValue('model', data.model == '' ? '-' : data.model);
		if (data.mac != '') {
			setValue('system_mac', (data.mac).toUpperCase());
			setDisplay('div_system_mac', true);
		} else {
			setDisplay('div_system_mac', false);
		}
		if (data.sn != '') {
			setValue('system_sn', data.sn);
			setDisplay('div_system_sn', true);
		} else {
			setDisplay('div_system_sn', false);
		}
		var theme = getCookie('easyconfig_darkmode');
		if (theme == '') { theme = 2; }
		setValue('theme', theme);
	});
}

function showmodeminfo() {
	if (modem == 0) { return; }
	ubus_call('"easyconfig", "modeminfo", {}', function(data) {
		setValue('modem_vendor', data.vendor == '' ? '-' : data.vendor);
		setValue('modem_model', data.product == '' ? '-' : data.product);
		setValue('modem_revision', data.revision == '' ? '-' : data.revision);
		setValue('modem_imei', data.imei == '' ? '-' : data.imei);
		setValue('modem_iccid', data.iccid == '' ? '-' : data.iccid);
		if (data.simslot.hasOwnProperty('active')) {
			var e = removeOptions('modem_simslot');
			var arr = sortJSON(data.simslot.slots, 'index', 'asc');
			for (var idx = 0; idx < arr.length; idx++) {
				var opt = document.createElement('option');
				opt.value = arr[idx]["value"];
				opt.innerHTML = arr[idx]["description"];
				e.appendChild(opt);
			}
			setValue('modem_simslot', data.simslot.active);
			setDisplay('div_modem_simslot', true);
		} else {
			setDisplay('div_modem_simslot', false);
		}
	});
}

function cancelmodemsettings() {
	setDisplay('div_modemsettings', false);
}

function savemodemsettings() {
	cancelmodemsettings();

	var cmd = [];
	cmd.push('uci set easyconfig.modem.device=' + getValue('modemsettings_modem_device'));
	cmd.push('uci set easyconfig.modem.force_qmi=' + (getValue('modemsettings_modem_force_qmi') ? '1' : '0'));
	cmd.push('uci set easyconfig.modem.force_plmn=' + (getValue('modemsettings_modem_force_plmn') ? '1' : '0'));
	cmd.push('uci set easyconfig.sms.storage=' + getValue('modemsettings_sms_storage'));
	cmd.push('uci set easyconfig.ussd.raw_input=' + (getValue('modemsettings_ussd_raw_input') ? '1' : '0'));
	cmd.push('uci set easyconfig.ussd.raw_output=' + (getValue('modemsettings_ussd_raw_output') ? '1' : '0'));
	cmd.push('uci commit easyconfig');
	execute(cmd, showsystem);
}

function modemsettings() {
	ubus_call('"easyconfig", "modemsettings", {}', function(data) {
		setValue('modemsettings_modem_device', data.modem_device);
		setValue('modemsettings_modem_force_qmi', data.modem_force_qmi == 1);
		setValue('modemsettings_modem_force_plmn', data.modem_force_plmn == 1);
		setValue('modemsettings_sms_storage', data.sms_storage);
		setValue('modemsettings_ussd_raw_input', data.ussd_raw_input == 1);
		setValue('modemsettings_ussd_raw_output', data.ussd_raw_output == 1);
		setDisplay('div_modemsettings', true);
	})
}

function modemat() {
	setDisplay('div_modemat', true);
	var e = document.getElementById('modemat_cmd');
	e.focus();
	var val = e.value;
	e.value = '';
	e.value = val;
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
	cmd.push('MODEM=$(/usr/share/easyconfig/modem/detect.sh)');
	cmd.push('ATLOCK=\\\"flock -x /tmp/at_cmd_lock\\\"');
	cmd.push('$ATLOCK chat -t 3 -e ABORT \\\"ERROR\\\" \'\' \\\"' + atcmd + '\\\" OK >> $MODEM < $MODEM');
	cmd.push('RET=$?');
	cmd.push('rm -- \\\"$0\\\"');
	cmd.push('exit $RET');
	cmd.push('');
	var filename = '/tmp/' + Math.random().toString(36).substring(2, 10) + '-' + Math.random().toString(36).substring(2, 10);
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

function modembands4g() {
	closemodembands4g();
	ubus_call('"file", "exec", {"command":"modemband.sh","params":["json"]}', function(data) {
		if (data.code == 0) {
			var modem = JSON.parse(data.stdout);

			var arr = sortJSON(modem.supported, 'band', 'asc');
			var html = '<div class="form-group">';
			for (var idx = 0; idx < arr.length; idx++) {
				html += '<label for="modembands_band_4g_' + arr[idx].band + '" class="col-xs-3 col-sm-2 control-label">B' + arr[idx].band + '</label> \
						<div class="col-xs-9 col-sm-4"> \
						<label class="switch"><input data-band=' + arr[idx].band + ' id="modembands_band_4g_' + arr[idx].band + '" type="checkbox" class="band_4g"><div class="slider round"></div></label> \
						<span class="control-label labelleft">' + arr[idx].txt + '</span> \
						</div>';
			}
			html += '</div>';
			setValue('modembands_bands_4g', html);

			arr = modem.enabled;
			for (var idx = 0; idx < arr.length; idx++) {
				var e = document.getElementById('modembands_band_4g_' + arr[idx]);
				if (e) {
					e.checked = 1;
				}
			}
			setDisplay('div_modembands4g', true);
		}
	})
}

function savemodembands4g() {
	closemodembands4g();
	var bands = '';
	(document.querySelectorAll('.band_4g')).forEach((e) => {
		if (e.checked) {
			bands += e.getAttribute('data-band') + ' ';
		}
	})
	if (bands == '') {
		bands = 'default';
	}

	var cmd = [];
	cmd.push('modemband.sh setbands \\\"' + bands + '\\\"');
	execute(cmd, modembands4g);
}

function defaultmodembands4g() {
	closemodembands4g();
	execute(['modemband.sh setbands default'], modembands4g);
}

function closemodembands4g() {
	setDisplay('div_modembands4g', false);
}

function modembands5gnsa() {
	closemodembands5gnsa();
	ubus_call('"file", "exec", {"command":"modemband.sh","params":["json"]}', function(data) {
		if (data.code == 0) {
			var modem = JSON.parse(data.stdout);

			var arr = sortJSON(modem.supported5gnsa, 'band', 'asc');
			var html = '<div class="form-group">';
			for (var idx = 0; idx < arr.length; idx++) {
				html += '<label for="modembands_band_5gnsa_' + arr[idx].band + '" class="col-xs-3 col-sm-2 control-label">n' + arr[idx].band + '</label> \
						<div class="col-xs-9 col-sm-4"> \
						<label class="switch"><input data-band=' + arr[idx].band + ' id="modembands_band_5gnsa_' + arr[idx].band + '" type="checkbox" class="band_5gnsa"><div class="slider round"></div></label> \
						<span class="control-label labelleft">' + arr[idx].txt + '</span> \
						</div>';
			}
			html += '</div>';
			setValue('modembands_bands_5gnsa', html);

			arr = modem.enabled5gnsa;
			for (var idx = 0; idx < arr.length; idx++) {
				var e = document.getElementById('modembands_band_5gnsa_' + arr[idx]);
				if (e) {
					e.checked = 1;
				}
			}
			setDisplay('div_modembands5gnsa', true);
		}
	})
}

function savemodembands5gnsa() {
	closemodembands5gnsa();
	var bands = '';
	(document.querySelectorAll('.band_5gnsa')).forEach((e) => {
		if (e.checked) {
			bands += e.getAttribute('data-band') + ' ';
		}
	})
	if (bands == '') {
		bands = 'default';
	}

	var cmd = [];
	cmd.push('modemband.sh setbands5gnsa \\\"' + bands + '\\\"');
	execute(cmd, modembands5gnsa);
}

function defaultmodembands5gnsa() {
	closemodembands5gnsa();
	execute(['modemband.sh setbands5gnsa default'], modembands5gnsa);
}

function closemodembands5gnsa() {
	setDisplay('div_modembands5gnsa', false);
}

function modembands5gsa() {
	closemodembands5gsa();
	ubus_call('"file", "exec", {"command":"modemband.sh","params":["json"]}', function(data) {
		if (data.code == 0) {
			var modem = JSON.parse(data.stdout);

			var arr = sortJSON(modem.supported5gsa, 'band', 'asc');
			var html = '<div class="form-group">';
			for (var idx = 0; idx < arr.length; idx++) {
				html += '<label for="modembands_band_5gsa_' + arr[idx].band + '" class="col-xs-3 col-sm-2 control-label">n' + arr[idx].band + '</label> \
						<div class="col-xs-9 col-sm-4"> \
						<label class="switch"><input data-band=' + arr[idx].band + ' id="modembands_band_5gsa_' + arr[idx].band + '" type="checkbox" class="band_5gsa"><div class="slider round"></div></label> \
						<span class="control-label labelleft">' + arr[idx].txt + '</span> \
						</div>';
			}
			html += '</div>';
			setValue('modembands_bands_5gsa', html);

			arr = modem.enabled5gsa;
			for (var idx = 0; idx < arr.length; idx++) {
				var e = document.getElementById('modembands_band_5gsa_' + arr[idx]);
				if (e) {
					e.checked = 1;
				}
			}
			setDisplay('div_modembands5gsa', true);
		}
	})
}

function savemodembands5gsa() {
	closemodembands5gsa();
	var bands = '';
	(document.querySelectorAll('.band_5gsa')).forEach((e) => {
		if (e.checked) {
			bands += e.getAttribute('data-band') + ' ';
		}
	})
	if (bands == '') {
		bands = 'default';
	}

	var cmd = [];
	cmd.push('modemband.sh setbands5gsa \\\"' + bands + '\\\"');
	execute(cmd, modembands5gsa);
}

function defaultmodembands5gsa() {
	closemodembands5gsa();
	execute(['modemband.sh setbands5gsa default'], modembands5gsa);
}

function closemodembands5gsa() {
	setDisplay('div_modembands5gsa', false);
}

function modem_simslot_save() {
	showDialog('UWAGA: zmiana aktywnego slotu SIM spowoduje rozłaczenie połączenia z internetem. Zmienić slot?', 'Nie', 'Tak', oksimslotchange);
}

function oksimslotchange() {
	ubus_call('"easyconfig", "setsimslot", {"slot":"' + getValue('modem_simslot') + '"}', function(data) {
		showsystem();
	});
}

function restartwan(modal) {
	switch (modal) {
		case '4g':
			closemodembands4g();
			execute(['ifdown wan', 'sleep 3', 'ifup wan'], modembands4g);
			break;
		case '5gnsa':
			closemodembands5gnsa();
			execute(['ifdown wan', 'sleep 3', 'ifup wan'], modembands5gnsa);
			break;
		case '5gsa':
			closemodembands5gsa();
			execute(['ifdown wan', 'sleep 3', 'ifup wan'], modembands5gsa);
			break;
	}
}

var arrmodemaddon = [];

function showmodem() {
	if (modem == 0) { return; }
	ubus_call('"easyconfig", "modem", {}', function(data) {
		if (data.error)
			return;

		arrmodemaddon = [];

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

		if (data.registration == '1' || data.registration == '5') {
			setValue('modem_signal', data.signal == '' ? '-' : data.signal + '%');

			if (data.signal) {
				var e = document.getElementById('modem_signal_bars');
				removeClasses(e, ['lzero', 'lone', 'ltwo', 'lthree', 'lfour', 'lfive', 'one-bar', 'two-bars', 'three-bars', 'four-bars', 'five-bars']);
				if (data.signal >= 80) {
					addClasses(e, ['lfive', 'five-bars']);
				}
				if (data.signal < 80 && data.signal >= 60) {
					addClasses(e, ['lfour', 'four-bars']);
				}
				if (data.signal < 60 && data.signal >= 40) {
					addClasses(e, ['lthree', 'three-bars']);
				}
				if (data.signal < 40 && data.signal >= 20) {
					addClasses(e, ['ltwo', 'two-bars']);
				}
				if (data.signal < 20 && data.signal > 0) {
					addClasses(e, ['lone', 'one-bar']);
				}
				if (data.signal == 0) {
					addClasses(e, ['lzero', 'one-bar']);
				}
			}

			setValue('modem_operator', data.operator_name == '' ? '-' : data.operator_name);
			var mode = (data.mode == '' ? '-' : data.mode);
			if (mode.toLowerCase().includes('lte') || mode.toLowerCase().includes('5g')) {
				if (mode.toLowerCase().includes('lte')) {
					mode = (data.mode).split(' ')[0];
				}
				if (mode.toLowerCase().includes('5g')) {
					mode = (data.mode).split(' ')[0] + ' ' + (data.mode).split(' ')[1];
				}
				var count = ((data.mode).match(/\//g) || []).length;
				if (count > 0) {
					mode += ' (' + (count + 1) + 'CA)';
				}
			}
			setValue('modem_mode', mode);

			arrmodemaddon.push({'idx':1, 'key':'Technologia', 'value':data.mode});
			if (data.operator_mcc && data.operator_mcc != '' && data.operator_mnc && data.operator_mnc != '') {
				arrmodemaddon.push({'idx':20, 'key':'MCC MNC', 'value':data.operator_mcc + ' ' + data.operator_mnc});
			}
			if (data.lac_dec && data.lac_dec > 0) {
				arrmodemaddon.push({'idx':22, 'key':'LAC', 'value':data.lac_dec + ' (' + data.lac_hex + ')'});
			}
			if (data.cid_dec && data.cid_dec > 0) {
				arrmodemaddon.push({'idx':21, 'key':'Cell ID', 'value':data.cid_dec + ' (' + data.cid_hex + ')'});
			}

			if (data.cid_dec && data.cid_dec > 0 && data.operator_mcc == 260) {
				document.getElementById('modem_btsearch').setAttribute("href", "http://www.btsearch.pl/szukaj.php?search=" + data.cid_dec + "&siec=-1&mode=std");
				setDisplay('div_modem_btsearch', true);
			} else {
				setDisplay('div_modem_btsearch', false);
			}
		} else {
			setValue('modem_signal', '-');
			var e = document.getElementById('modem_signal_bars');
			removeClasses(e, ['lzero', 'lone', 'ltwo', 'lthree', 'lfour', 'lfive', 'one-bar', 'two-bars', 'three-bars', 'four-bars', 'five-bars']);
			addClasses(e, ['lzero', 'one-bar']);
			setValue('modem_operator', '-');
			setValue('modem_mode', '-');
			setDisplay('div_modem_btsearch', false);
		}
		if (simslot.hasOwnProperty('active')) {
			for (var idx = 0; idx < simslot.slots.length; idx++) {
				if (simslot.slots[idx].value == simslot.active) {
					arrmodemaddon.push({'idx':9, 'key':'Aktywny slot SIM', 'value':simslot.slots[idx].description});
					break;
				}
			}
		}

		if (data.addon) {
			arrmodemaddon = arrmodemaddon.concat(data.addon);
		}
		setDisplay('div_modem_addon', arrmodemaddon.length > 0);
	});
}

function paramdesc(param, value) {
	var pvalue = parseInt(value.split(' ')[0]);
	var description = '';
	var color = '';
	var title = '';
	switch(param) {
		case 'rssi':
			if (pvalue > -65) { color = '#2bdf5a'; description += 'doskonały'; }
			if (pvalue > -75 && pvalue <= -65 ) { color = '#efff12'; description += 'dobry'; }
			if (pvalue > -85 && pvalue <= -75 ) { color = '#f8c200'; description += 'słaby'; }
			if (pvalue > -95 && pvalue <= -85 ) { color = '#fa0000'; description += 'zły'; }
			if (pvalue <= -95) { color = '#fa0000'; description += 'bardzo zły'; }
			title += "> -65 dBm doskonały\n";
			title += "> -75 dBm i <= -65 dBm dobry\n";
			title += "> -85 dBm i <= -75 dBm słaby\n";
			title += "> -95 dBm i <= -85 dBm zły\n";
			title += "<= -95 dBm bardzo zły";
			break;
		case 'rsrp':
			if (pvalue >= -80) { color = '#2bdf5a'; description += 'doskonały'; }
			if (pvalue >= -90 && pvalue < -80 ) { color = '#efff12'; description += 'dobry'; }
			if (pvalue >= -100 && pvalue < -90 ) { color = '#f8c200'; description += 'słaby'; }
			if (pvalue < -100) { color = '#fa0000'; description += 'zły'; }
			title += "> -80 dBm doskonały\n";
			title += ">= -90 dBm i < -80 dBm dobry\n";
			title += ">= -100 dBm i < -90 dBm słaby\n";
			title += "< -100 dBm zły";
			break;
		case 'rsrq':
			if (pvalue >= -10) { color = '#2bdf5a'; description += 'doskonały'; }
			if (pvalue >= -15 && pvalue < -10 ) { color = '#efff12'; description += 'dobry'; }
			if (pvalue >= -20 && pvalue < -15 ) { color = '#f8c200'; description += 'słaby'; }
			if (pvalue < -20) { color = '#fa0000'; description += 'zły'; }
			title += ">= -10 dB doskonały\n";
			title += ">= -15 dB i < -10 dB dobry\n";
			title += ">= -20 dB i < -15 dB słaby\n";
			title += "< -20 dB zły";
			break;
	}
	return ', <span style="color:' + color + '" title="' + title + '">' + description + '</span>';
}

function modemaddon() {
	var htmlco = '';
	var htmlxs = '';
	var html = '';
	var pcc = [];
	var scc1 = [];
	var scc2 = [];
	var scc3 = [];
	var scc4 = [];
	var sorted = sortJSON(arrmodemaddon, 'idx', 'asc');
	sorted.forEach(function(e) {
		var description = '';
		switch (e.idx) {
			// MODE
			case 1:
				if ((e.value).search(/^LTE B/) > -1 || (e.value).search(/^LTE_A B/) > -1) {
					pcc = Array(9).fill('-');
					pcc[0] = 'PCC';
					pcc[1] = (e.value).replace(/^LTE /, '').replace(/^LTE_A /, '');
				}
				if ((e.value).search(/^5G/) > -1) {
					pcc = Array(9).fill('-');
					pcc[0] = 'PCC';
					pcc[1] = (e.value).replace(/^5G NSA /, '').replace(/^5G SA /, '');
				}
				break;
			// PCC
			case 30:
				pcc = Array(9).fill('-');
				pcc[0] = 'PCC';
				if ((e.value).includes(' @')) {
					pcc[1] = (e.value).split(' @')[0];
					pcc[2] = (e.value).split(' @')[1];
				} else {
					pcc[1] = e.value;
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 32:
				if ((e.key).toLowerCase().includes('bandwidth dl') || (e.key).toLowerCase() == 'bandwidth') {
					pcc[2] = e.value;
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 33:
				pcc[3] = e.value;
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 34:
				if (!(e.key).toLowerCase().includes('earfcn ul')) {
					pcc[4] = e.value;
				} else {
					html += createRowForModal(e.key, e.value);
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 35:
				description = paramdesc('rssi', e.value);
				pcc[5] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 36:
				description = paramdesc('rsrp', e.value);
				pcc[6] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 37:
				description = paramdesc('rsrq', e.value);
				pcc[7] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 38:
				if ((e.key).toLowerCase().includes('sinr')) {
					pcc[8] = e.value;
				} else {
					html += createRowForModal(e.key, e.value);
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			// SCC1
			case 50:
				scc1 = Array(9).fill('-');
				scc1[0] = 'SCC1';
				if ((e.value).includes(' @')) {
					scc1[1] = (e.value).split(' @')[0];
					scc1[2] = (e.value).split(' @')[1];
				} else {
					scc1[1] = e.value;
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 52:
				scc1[2] = e.value;
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 53:
				scc1[3] = e.value;
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 54:
				if (!(e.key).toLowerCase().includes('earfcn ul')) {
					scc1[4] = e.value;
				} else {
					html += createRowForModal(e.key, e.value);
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 55:
				description = paramdesc('rssi', e.value);
				scc1[5] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 56:
				description = paramdesc('rsrp', e.value);
				scc1[6] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 57:
				description = paramdesc('rsrq', e.value);
				scc1[7] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 58:
				if ((e.key).toLowerCase().includes('sinr')) {
					scc1[8] = e.value;
				} else {
					html += createRowForModal(e.key, e.value);
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			// SCC2
			case 60:
				scc2 = Array(9).fill('-');
				scc2[0] = 'SCC2';
				if ((e.value).includes(' @')) {
					scc2[1] = (e.value).split(' @')[0];
					scc2[2] = (e.value).split(' @')[1];
				} else {
					scc2[1] = e.value;
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 62:
				scc2[2] = e.value;
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 63:
				scc2[3] = e.value;
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 64:
				if (!(e.key).toLowerCase().includes('earfcn ul')) {
					scc2[4] = e.value;
				} else {
					html += createRowForModal(e.key, e.value);
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 65:
				description = paramdesc('rssi', e.value);
				scc2[5] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 66:
				description = paramdesc('rsrp', e.value);
				scc2[6] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 67:
				description = paramdesc('rsrq', e.value);
				scc2[7] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 68:
				if ((e.key).toLowerCase().includes('sinr')) {
					scc2[8] = e.value;
				} else {
					html += createRowForModal(e.key, e.value);
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			// SCC3
			case 70:
				scc3 = Array(9).fill('-');
				scc3[0] = 'SCC3';
				if ((e.value).includes(' @')) {
					scc3[1] = (e.value).split(' @')[0];
					scc3[2] = (e.value).split(' @')[1];
				} else {
					scc3[1] = e.value;
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 72:
				scc3[2] = e.value;
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 73:
				scc3[3] = e.value;
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 74:
				if (!(e.key).toLowerCase().includes('earfcn ul')) {
					scc3[4] = e.value;
				} else {
					html += createRowForModal(e.key, e.value);
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 75:
				description = paramdesc('rssi', e.value);
				scc3[5] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 76:
				description = paramdesc('rsrp', e.value);
				scc3[6] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 77:
				description = paramdesc('rsrq', e.value);
				scc3[7] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 78:
				if ((e.key).toLowerCase().includes('sinr')) {
					scc3[8] = e.value;
				} else {
					html += createRowForModal(e.key, e.value);
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			// SCC4
			case 80:
				scc4 = Array(9).fill('-');
				scc4[0] = 'SCC4';
				if ((e.value).includes(' @')) {
					scc4[1] = (e.value).split(' @')[0];
					scc4[2] = (e.value).split(' @')[1];
				} else {
					scc4[1] = e.value;
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 82:
				scc4[2] = e.value;
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 83:
				scc4[3] = e.value;
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 84:
				if (!(e.key).toLowerCase().includes('earfcn ul')) {
					scc4[4] = e.value;
				} else {
					html += createRowForModal(e.key, e.value);
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			case 85:
				description = paramdesc('rssi', e.value);
				scc4[5] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 86:
				description = paramdesc('rsrp', e.value);
				scc4[6] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 87:
				description = paramdesc('rsrq', e.value);
				scc4[7] = e.value + description.replace(', ', '<br>');
				htmlxs += createRowForModal(e.key, e.value + description);
				break;
			case 88:
				if ((e.key).toLowerCase().includes('sinr')) {
					scc4[8] = e.value;
				} else {
					html += createRowForModal(e.key, e.value);
				}
				htmlxs += createRowForModal(e.key, e.value);
				break;
			default:
				if (e.idx < 30) {
					htmlco += createRowForModal((e.key == 'Temperature' ? 'Temperatura' : e.key), e.value);
				} else {
					html += createRowForModal(e.key, e.value);
					htmlxs += createRowForModal(e.key, e.value);
				}
		}
	});
	htmlco += '<div class="visible-xs-block visible-sm-block">' + htmlxs + '</div>';
	var table = (pcc.length + scc1.length + scc2.length + scc3.length + scc4.length > 0);
	if (table) { htmlco += '<div class="margintop hidden-xs hidden-sm">' + html; }
	if (pcc.length > 0) {
		htmlco += createRow9ColForModal(['', 'Pasmo', 'Szerokość', 'PCI', 'EARFCN', 'RSSI', 'RSRP', 'RSRQ', 'SINR']);
		htmlco += createRow9ColForModal(pcc);
	}
	if (scc1.length > 0) { htmlco += createRow9ColForModal(scc1); }
	if (scc2.length > 0) { htmlco += createRow9ColForModal(scc2); }
	if (scc3.length > 0) { htmlco += createRow9ColForModal(scc3); }
	if (scc4.length > 0) { htmlco += createRow9ColForModal(scc4); }
	if (table) { htmlco += '</div>'; }
	showMsg(htmlco);
}

/*****************************************************************************/

function btn_system_reboot() {
	showDialog('Uruchomić urządzenie ponownie?', 'Nie', 'Tak', okreboot);
}

function okreboot() {
	ubus('"easyconfig", "reboot", {}', function(data) {
		token = "00000000000000000000000000000000";
		setCookie('easyconfig_token', '', 1);
		setCookie('easyconfig_page', '', 1);
		showMsg("Trwa ponowne uruchomienie urządzenia, może to potrwać kilka minut...", false);
	}, function(status) {
		showMsg("Błąd pobierania danych!", true);
	}, true);
}

function btn_system_firstboot() {
	showDialog('Przywrócić ustawienia domyślne urządzenia?', 'Nie', 'Tak', okfirstboot);
}

function okfirstboot() {
	ubus('"file", "exec", {"command":"firstboot","params":["-r", "-y"]}', function(data) {
		token = "00000000000000000000000000000000";
		setCookie('easyconfig_token', '', 1);
		setCookie('easyconfig_page', '', 1);
		showMsg("Trwa ponowne uruchomienie urządzenia, może to potrwać kilka minut...", false);
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

function naturalSortJSON(data, key) {
	return data.sort((a, b) => a[key].localeCompare(b[key], undefined, { numeric: true, sensitivity: 'base' }));
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
		var arr = [...new Map((data.result).map(v => [JSON.stringify([v.mac,v.ssid,v.freq,v.signal,v.channel,v.encryption,v.mode1,v.mode2,v.vhtch1,v.vhtch2]), v])).values()]

		var wlan_devices = config.wlan_devices;

		var ts = Date.now()/1000;
		var l = arr.length;
		for (var idx1 = 0; idx1 < l; idx1++) {
			arr[idx1].timestamp = parseInt(ts).toString();
			arr[idx1].ssid = (arr[idx1].ssid).replace(/(?:\\x[\da-fA-F]{2})+/g, function (val) {return decodeURIComponent(val.replace(/\\x/g, '%'))});
			if (arr[idx1].ssid == '') { arr[idx1].ssid = '<bez nazwy>'; }
			arr[idx1].signal = parseInt(arr[idx1].signal);
			if (isNaN(arr[idx1].signal)) { arr[idx1].signal = -100; }

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
	var all = ['all', '2', '5', '6'];
	for (var idx = 0; idx < all.length; idx++) {
		var e = document.getElementById('sitesurvey_filter_' + all[idx]);
		if (e !== null) {
			e.style.fontWeight = (filterby == all[idx]) ? 700 : 400;
		}
	}
}

function sitesurveycallback(sortby) {

	var all;
	var filterby = 'all';
	all = ['all', '2', '5', '6'];
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
		var is_radio2 = 0;
		var is_radio5 = 0;
		var is_radio6 = 0;
		(config.wlan_devices).forEach((item) => {
			for (var channel in config[item].wlan_channels) {
				switch (freq2band(config[item].wlan_channels[channel][0])) {
					case 2:
						is_radio2 = 1;
						break;
					case 5:
						is_radio5 = 1;
						break;
					case 6:
						is_radio6 = 1;
						break;
				}
			}
		})
		html += '<div class="row space">';
		html += '<div class="col-xs-12 space">';
		html += '<span>Filtrowanie:</span>';
		if (is_radio2 + is_radio5 + is_radio6 >= 2) {
			html += '<span class="click" onclick="sitesurveycallbackfilter(\'all\');sitesurveycallback(\'\');"><span id="sitesurvey_filter_all"> wszystkie (0) </span></span>|';
		}
		if (is_radio2) {
			html += '<span class="click" onclick="sitesurveycallbackfilter(\'2\');sitesurveycallback(\'\');"><span id="sitesurvey_filter_2"> 2.4 GHz (0) </span></span>';
			if (is_radio5 + is_radio6 > 0) { html += '|'; }
		}
		if (is_radio5) {
			html += '<span class="click" onclick="sitesurveycallbackfilter(\'5\');sitesurveycallback(\'\');"><span id="sitesurvey_filter_5"> 5 GHz (0) </span></span>';
			if (is_radio6) { html += '|'; }
		}
		if (is_radio6) {
			html += '<span class="click" onclick="sitesurveycallbackfilter(\'6\');sitesurveycallback(\'\');"><span id="sitesurvey_filter_6"> 6 GHz (0) </span></span>';
		}
		html += '</div>';
		html += '<div class="col-xs-12">';
		html += '<span>Sortowanie po</span>';
		html += '<span class="click" onclick="sitesurveycallback(\'ssid\');"><span id="sitesurvey_sortby_ssid"> nazwie </span></span>|';
		html += '<span class="click" onclick="sitesurveycallback(\'mac\');"><span id="sitesurvey_sortby_mac"> adresie mac </span></span>|';
		html += '<span class="click" onclick="sitesurveycallback(\'signal\');"><span id="sitesurvey_sortby_signal"> sile sygnału </span></span>|';
		html += '<span class="click" onclick="sitesurveycallback(\'freq\');"><span id="sitesurvey_sortby_freq"> kanale </span></span>|';
		html += '<span class="click" onclick="sitesurveycallback(\'timestamp\');"><span id="sitesurvey_sortby_timestamp"> widoczności </span></span>';
		html += '</div></div>';
		html += '<div class="row" id="div_channels2" style="display:none">';
		html += '<div class="col-xs-12"><h3 class="section">Sieci 2.4 GHz</h3><canvas id="channels2" height="400"></canvas></div>';
		html += '</div>';
		html += '<div class="row" id="div_channels5" style="display:none">';
		html += '<div class="col-xs-12"><h3 class="section">Sieci 5 GHz</h3></div>';
		html += '<div class="col-xs-12" id="div_channels51"><canvas id="channels51" height="400"></canvas></div>';
		html += '<div class="col-xs-12" id="div_channels52"><canvas id="channels52" height="400"></canvas></div>';
		html += '<div class="col-xs-12" id="div_channels53"><canvas id="channels53" height="400"></canvas></div>';
		html += '</div>';
		html += '<div class="row" id="div_channels6" style="display:none">';
		html += '<div class="col-xs-12"><h3 class="section">Sieci 6 GHz</h3></div>';
		html += '<div class="col-xs-12" id="div_channels61"><canvas id="channels61" height="400"></canvas></div>';
		html += '<div class="col-xs-12" id="div_channels62"><canvas id="channels62" height="400"></canvas></div>';
		html += '<div class="col-xs-12" id="div_channels63"><canvas id="channels63" height="400"></canvas></div>';
		html += '<div class="col-xs-12" id="div_channels64"><canvas id="channels64" height="400"></canvas></div>';
		html += '<div class="col-xs-12" id="div_channels65"><canvas id="channels65" height="400"></canvas></div>';
		html += '<div class="col-xs-12" id="div_channels66"><canvas id="channels66" height="400"></canvas></div>';
		html += '<div class="col-xs-12" id="div_channels67"><canvas id="channels67" height="400"></canvas></div>';
		html += '</div>';

		var wlan_devices = config.wlan_devices;
		var ts = Date.now()/1000;
		var sorted = sortJSON(wifiscanresults, sortby, 'asc');
		var rogueap = false;
		var counter_all = 0;
		var counter_2 = 0;
		var counter_5 = 0;
		var counter_6 = 0;
		for (var idx = 0; idx < sorted.length; idx++) {
			counter_all ++;
			switch (freq2band(sorted[idx].freq)) {
				case 2:
					counter_2 ++;
					if (filterby != '2' && filterby != 'all') { continue; }
					break;
				case 5:
					counter_5 ++;
					if (filterby != '5' && filterby != 'all') { continue; }
					break;
				case 6:
					counter_6 ++;
					if (filterby != '6' && filterby != 'all') { continue; }
					break;
				default:
					break;
			}

			rogueap = false;
			for (var i = 0; i < wlan_devices.length; i++) {
				if (config[wlan_devices[i]].wlan_ssid === sorted[idx].ssid) {
					rogueap = true;
					break;
				}
			}

			html += '<hr><div class="row' + (rogueap ? ' text-danger' : '') +  '">';
			html += '<div class="col-xs-6">';
			html += '<h4><span class="wordbreak">' + sorted[idx].ssid + '</span></h4>';
			html += sorted[idx].mac;

			var manuf = getmanuf(sorted[idx].mac);
			if (manuf != '-') { html += '<br>' + manuf; }
			if (parseInt(ts - sorted[idx].timestamp) > 0) {html += '<br>widoczność ' + formatDuration(parseInt(ts - sorted[idx].timestamp), true) + ' temu';}
			if (rogueap) { html += '<br>Wrogi AP'; }
			html += '</div>';
			html += '<div class="col-xs-6 text-right">';
			html += 'RSSI ' + sorted[idx].signal + ' dBm';
			html += '<br>Kanał ' + sorted[idx].channel + ' (' + (sorted[idx].freq/1000).toFixed(3) + ' GHz)';
			html += (sorted[idx].encryption ? '<br><span class="hidden-vxs">Szyfrowanie </span>' + sorted[idx].encryption : '');
			var mode = '802.11' + sorted[idx].mode1 + (sorted[idx].mode2 != '' ? ', ' + sorted[idx].mode2 : '');
			switch (sorted[idx].mode1) {
				case 'n':
					html += '<br>Wi-Fi 4 (' + mode + ')';
					break;
				case 'ac':
					html += '<br>Wi-Fi 5 (' + mode + ')';
					break;
				case 'ax':
					html += '<br>Wi-Fi 6' + (freq2band(sorted[idx].freq) == 6 ? 'E' : '') + ' (' + mode + ')';
					break;
				default:
					html += '<br>' + mode;
			}
			html += (sorted[idx].uptime ? '<br><span class="hidden-vxs">Czas działania </span>' + formatDuration(sorted[idx].uptime, false) : '');
			if (sorted[idx].bssload > -1) { html += '<br>Liczba klientów: ' + sorted[idx].bssload; }
			html += '</div></div>';
		}
	} else {
		html += '<div class="alert alert-warning">Brak sieci bezprzewodowych lub Wi-Fi jest wyłączone</div>';
	}
	setValue('div_sitesurvey_content', html);

	if (wifiscanresults.length > 0) {
		var surveydata2 = [];
		var surveydata51 = [];
		var surveydata52 = [];
		var surveydata53 = [];
		var surveydata61 = [];
		var surveydata62 = [];
		var surveydata63 = [];
		var surveydata64 = [];
		var surveydata65 = [];
		var surveydata66 = [];
		var surveydata67 = [];
		for (var idx = 0; idx < wifiscanresults.length; idx++) {
			switch (freq2band(wifiscanresults[idx].freq)) {
				case 2:
					if (filterby != '2' && filterby != 'all') { continue; }
					break;
				case 5:
					if (filterby != '5' && filterby != 'all') { continue; }
					break;
				case 6:
					if (filterby != '6' && filterby != 'all') { continue; }
					break;
			}

			var a = {};
			a['mac'] = wifiscanresults[idx].mac;
			a['ssid'] = wifiscanresults[idx].ssid;
			a['signal'] = wifiscanresults[idx].signal;
			if (a['signal'] < -100) { continue; }
			a['channel'] = parseInt(wifiscanresults[idx].channel);
			a['vhtch1'] = parseInt(wifiscanresults[idx].vhtch1);
			a['vhtch2'] = parseInt(wifiscanresults[idx].vhtch2);
			a['width'] = wifiscanresults[idx].mode2;
			switch (freq2band(wifiscanresults[idx].freq)) {
				case 2:
					surveydata2.push(a);
					break;
				case 5:
					if (a['channel'] >= 149) {
						surveydata53.push(a);
					} else if (a['channel'] >= 100) {
						surveydata52.push(a);
					} else if (a['channel'] >= 36) {
						surveydata51.push(a);
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
					break;
				case 6:
					if (a['channel'] >= 193) {
						surveydata67.push(a);
					} else if (a['channel'] >= 161) {
						surveydata66.push(a);
					} else if (a['channel'] >= 129) {
						surveydata65.push(a);
					} else if (a['channel'] >= 97) {
						surveydata64.push(a);
					} else if (a['channel'] >= 65) {
						surveydata63.push(a);
					} else if (a['channel'] >= 33) {
						surveydata62.push(a);
					} else if (a['channel'] >= 1) {
						surveydata61.push(a);
					}
					break;
			}

		}
		var len = surveydata2.length;
		setDisplay('div_channels2', (len > 0));
		if (len > 0) {
			wifigraph.draw({band: 2, element: 'channels2', data: surveydata2});
		}
		len = surveydata51.length + surveydata52.length + surveydata53.length;
		setDisplay('div_channels5', (len > 0));
		if (len > 0) {
			wifigraph.draw({band: 51, element: 'channels51', data: surveydata51});
			wifigraph.draw({band: 52, element: 'channels52', data: surveydata52});
			wifigraph.draw({band: 53, element: 'channels53', data: surveydata53});
		}
		len = surveydata61.length + surveydata62.length + surveydata63.length +
			surveydata64.length + surveydata65.length + surveydata66.length + surveydata67.length;
		setDisplay('div_channels6', (len > 0));
		if (len > 0) {
			wifigraph.draw({band: 61, element: 'channels61', data: surveydata61});
			wifigraph.draw({band: 62, element: 'channels62', data: surveydata62});
			wifigraph.draw({band: 63, element: 'channels63', data: surveydata63});
			wifigraph.draw({band: 64, element: 'channels64', data: surveydata64});
			wifigraph.draw({band: 65, element: 'channels65', data: surveydata65});
			wifigraph.draw({band: 66, element: 'channels66', data: surveydata66});
			wifigraph.draw({band: 67, element: 'channels67', data: surveydata67});
		}

		all = ['ssid', 'mac', 'signal', 'freq', 'timestamp'];
		for (var idx = 0; idx < all.length; idx++) {
			var e = document.getElementById('sitesurvey_sortby_' + all[idx]);
			e.style.fontWeight = (sortby == all[idx]) ? 700 : 400;
		}

		if (is_radio2 + is_radio5 + is_radio6 >= 2) {
			setValue('sitesurvey_filter_all', ' wszystkie (' + counter_all + ') ');
		}
		if (is_radio2) {
			setValue('sitesurvey_filter_2', ' 2.4 GHz (' + counter_2 + ') ');
		}
		if (is_radio5) {
			setValue('sitesurvey_filter_5', ' 5 GHz (' + counter_5 + ') ');
		}
		if (is_radio6) {
			setValue('sitesurvey_filter_6', ' 6 GHz (' + counter_6 + ') ');
		}
		sitesurveycallbackfilter(filterby);
	}
}

function getmanuf(mac) {
	var key = mac.substring(0,8).toUpperCase();
	if (key in manuf) {
		return manuf[key];
	} else {
		if ((parseInt(mac.substring(1,2), 16) & 1<<1) != 0) {
			return '<i>Adres prywatny</i>';
		}
	}
	return '-';
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
	ch61: [1,5,9,13,17,21,25,29],
	ch62: [33,37,41,45,49,53,57,61],
	ch63: [65,69,73,77,81,85,89,93],
	ch64: [97,101,105,109,113,117,121,125],
	ch65: [129,133,137,141,145,149,153,157],
	ch66: [161,165,169,173,177,181,185,189],
	ch67: [193,197,201,205,209,213,217,221,225,229],

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
			case 61:
				return ((channel + 1) * graph.width) / 32 + wifigraph.axisLeft;
				break;
			case 62:
				return ((channel - 32) * graph.width) / 30 + wifigraph.axisLeft;
				break;
			case 63:
				return ((channel - 64) * graph.width) / 30 + wifigraph.axisLeft;
				break;
			case 64:
				return ((channel - 96) * graph.width) / 30 + wifigraph.axisLeft;
				break;
			case 65:
				return ((channel - 128) * graph.width) / 30 + wifigraph.axisLeft;
				break;
			case 66:
				return ((channel - 160) * graph.width) / 30 + wifigraph.axisLeft;
				break;
			case 67:
				return ((channel - 192) * graph.width) / 38 + wifigraph.axisLeft;
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
			case 61:
				ch = wifigraph.ch61;
				break;
			case 62:
				ch = wifigraph.ch62;
				break;
			case 63:
				ch = wifigraph.ch63;
				break;
			case 64:
				ch = wifigraph.ch64;
				break;
			case 65:
				ch = wifigraph.ch65;
				break;
			case 66:
				ch = wifigraph.ch66;
				break;
			case 67:
				ch = wifigraph.ch67;
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
				var band = graph.band;
				if (graph.band > 50) { band = 5; }
				if (graph.band > 60) { band = 6; }
				ctx.fillStyle = color;
				for (var idx = 0; idx < (config.wlan_current_channels).length; idx++) {
					if (freq2band(config.wlan_current_channels[idx].freq) == band) {
						if (ch[i] >= config.wlan_current_channels[idx].min && ch[i] <= config.wlan_current_channels[idx].max) {
							ctx.fillStyle = 'red';
							break;
						}
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

			if (width == 'HT40-' || width == 'HE40-') {
				x1 = wifigraph.getX(graph, data[i].channel - 6);
				x11 = wifigraph.getX(graph, data[i].channel - 5);
			} else 	if (width == 'VHT40' || width == 'HE40') {
				x1 = wifigraph.getX(graph, data[i].vhtch1 - 4);
				x11 = wifigraph.getX(graph, data[i].vhtch1 - 3);
			} else if (width == 'VHT80' || width == 'VHT80+80' || width == 'HE80') {
				x1 = wifigraph.getX(graph, data[i].vhtch1 - 8);
				x11 = wifigraph.getX(graph, data[i].vhtch1 - 7);
			} else if (width == 'VHT160' || width == 'HE160') {
				x1 = wifigraph.getX(graph, data[i].vhtch2 - 16);
				x11 = wifigraph.getX(graph, data[i].vhtch2 - 15);
			} else {
				x1 = wifigraph.getX(graph, data[i].channel - 2);
				x11 = wifigraph.getX(graph, data[i].channel - 1);
			}

			if (width == 'HT40+' || width == 'HE40+') {
				x2 = wifigraph.getX(graph, data[i].channel + 6);
				x22 = wifigraph.getX(graph, data[i].channel + 5);
			} else if (width == 'VHT40' || width == 'HE40') {
				x2 = wifigraph.getX(graph, data[i].vhtch1 + 4);
				x22 = wifigraph.getX(graph, data[i].vhtch1 + 3);
			} else if (width == 'VHT80' || width == 'VHT80+80' || width == 'HE80') {
				x2 = wifigraph.getX(graph, data[i].vhtch1 + 8);
				x22 = wifigraph.getX(graph, data[i].vhtch1 + 7);
			} else if (width == 'VHT160' || width == 'HE160') {
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

var clients;

function showclients() {
	ubus_call('"easyconfig", "clients", {}', function(data) {
		clients = data.result;
		clientscallback('');
	});
}

function clientscallbackfilter(filterby) {
	var all = ['active', 'all'];
	for (var idx = 0; idx < all.length; idx++) {
		var e = document.getElementById('clients_filter_' + all[idx]);
		e.style.fontWeight = (filterby == all[idx]) ? 700 : 400;
	}
}

function clientscallback(sortby) {

	var all;
	var filterby = 'active';
	all = ['active', 'all'];
	for (var idx = 0; idx < all.length; idx++) {
		var e = document.getElementById('clients_filter_' + all[idx]);
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
			all = ['displayname', 'tx', 'rx', 'percent', 'connected', 'type'];
		} else {
			all = ['displayname', 'mac', 'last_seen'];
		}
		for (var idx = 0; idx < all.length; idx++) {
			var e = document.getElementById('clients_sortby_' + all[idx]);
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
	if (clients.length > 0) {
		html += '<div class="row space"><div class="col-xs-9 space">';
		html += '<span>Filtrowanie:</span>';
		html += '<span class="click" onclick="clientscallbackfilter(\'active\');clientscallback(\'\');"><span id="clients_filter_active"> aktywni (0) </span></span>|';
		html += '<span class="click" onclick="clientscallbackfilter(\'all\');clientscallback(\'\');"><span id="clients_filter_all"> wszyscy (0) </span></span>';
		html += '</div>';
		html += '<div class="col-xs-3 text-right"><span class="click" title="nowi klienci" onclick="clientsstats();"><i data-feather="bar-chart-2"></i></span></div>';
		html += '<div class="col-xs-12">';
		html += '<span>Sortowanie po</span>';
		html += '<span class="click" onclick="clientscallback(\'displayname\');"><span id="clients_sortby_displayname"> nazwie </span></span>|';
		if (filterby == 'active') {
			html += '<span class="click" onclick="clientscallback(\'tx\');"><span id="clients_sortby_tx"> wysłano </span></span>|';
			html += '<span class="click" onclick="clientscallback(\'rx\');"><span id="clients_sortby_rx"> pobrano </span></span>|';
			html += '<span class="click" onclick="clientscallback(\'percent\');"><span id="clients_sortby_percent"> udziale w ruchu </span></span>|';
			html += '<span class="click" onclick="clientscallback(\'connected\');"><span id="clients_sortby_connected"> czasie połączenia </span></span>|';
			html += '<span class="click" onclick="clientscallback(\'type\');"><span id="clients_sortby_type"> typie połączenia </span></span>';
		} else {
			html += '<span class="click" onclick="clientscallback(\'mac\');"><span id="clients_sortby_mac"> MAC </span></span>|';
			html += '<span class="click" onclick="clientscallback(\'last_seen\');"><span id="clients_sortby_last_seen"> ostatniej widoczności </span></span>';
		}
		html += '</div></div>';

		var total = 0;
		for (var idx = 0; idx < clients.length; idx++) {
			if (!clients[idx].active) {
				clients[idx].active_id = -1;
				clients[idx].ip = '';
				clients[idx].tx = 0;
				clients[idx].rx = 0;
				clients[idx].percent = 0;
				clients[idx].connected = 0;
				continue;
			} else {
				clients[idx].first_seen = '-';
				clients[idx].last_seen = '-';
				if (clients[idx].tx === undefined) {
					clients[idx].tx = 0
					clients[idx].rx = 0
				}
			}
			total += clients[idx].tx + clients[idx].rx;
		}

		if (filterby == 'active' && total > 0) {
			html += '<div id="div_clients_pie"><canvas id="clients_pie" height="400"></canvas><div class="text-center text-muted"><em><small>podział wg udziału w ruchu dla klientów bezprzewodowych</em></small></div></div>';
			html += '<div id="div_clients_pie_tooltip" class="tooltip"></div>';
		}

		for (var idx = 0; idx < clients.length; idx++) {
			clients[idx].percent = parseInt((clients[idx].tx + clients[idx].rx) * 100 / total);
			if (clients[idx].dhcpname == '*') { clients[idx].dhcpname = ''; }
			clients[idx].displayname = (clients[idx].username != '' ? clients[idx].username : (clients[idx].dhcpname != '' ? clients[idx].dhcpname : clients[idx].mac ));
			clients[idx].id = idx;
			if (clients[idx].active) {
				counter_active ++;
				for (var idx1 = 0; idx1 < clients.length; idx1++) {
					if (!clients[idx1].active) {
						if (clients[idx1].mac == clients[idx].mac) {
							clients[idx1].active_id = clients[idx].id;
							clients[idx1].ip = clients[idx].ip;
							clients[idx].first_seen = clients[idx1].first_seen;
							clients[idx].last_seen = clients[idx1].last_seen;
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
		var sorted = sortJSON(clients, sortby, 'asc');
		for (var idx = 0; idx < sorted.length; idx++) {
			if (filterby == 'active') {
				if (!sorted[idx].active) { continue; }
				var limitations = '';
				if (sorted[idx].qos.bwup > 0 || sorted[idx].qos.bwdown > 0 || sorted[idx].block > 0) {
					limitations = '<span title="ograniczenia">&#9888;</span>&nbsp;';
				}
				html += '<hr><div class="row">';

				html += '<div class="col-xs-9 visible-xs-block"><span style="color:' + string2color(sorted[idx].mac) + '">&#9608;</span>&nbsp;<span class="click" onclick="hostnameedit(' + sorted[idx].id + ');">' + sorted[idx].displayname + '</span></div>';
				html += '<div class="col-xs-3 visible-xs-block text-right"><span class="click" title="menu" onclick="hostmenu(' + sorted[idx].id + ');"><i data-feather="more-vertical"></i></span></div>';
				html += '<div class="col-xs-12 visible-xs-block">' + limitations;
				html += 'MAC: ' + sorted[idx].mac + (sorted[idx].ip == '' ? '' : ', IP: ' + sorted[idx].ip) + ', ';
				if (sorted[idx].type == 1) {
					html += 'przewodowo';
					var obj = physicalports.find(o => o.port === sorted[idx].port);
					if (obj) {
						html += ' ' + (sorted[idx].port).toUpperCase();
					}
					html += '</div>';
				} else {
					html += 'bezprzewodowo ' + (sorted[idx].band == 2 ? '2.4' : sorted[idx].band) + ' GHz, wysłano: ' + bytesToSize(sorted[idx].tx) + ', pobrano: ' + bytesToSize(sorted[idx].rx) + ', ' + sorted[idx].percent + '% udziału w ruchu, połączony ' + formatDuration(sorted[idx].connected, false) + '</div>';
				}

				var title1 = '';
				var title2 = '';
				if (sorted[idx].type == 2) {
					title1 = ' title="' + sorted[idx].percent + '% udziału w ruchu"';
					title2 = ' title="połączony: ' + formatDuration(sorted[idx].connected, false) + '"';
				}
				html += '<div class="col-xs-3 hidden-xs"><span style="color:' + string2color(sorted[idx].mac) + '"' + title1 + '>&#9608;</span>&nbsp;<span class="click" onclick="hostnameedit(' + sorted[idx].id + ');"' + title2 + '>' + sorted[idx].displayname + '</span></div>';
				html += '<div class="col-xs-3 hidden-xs">' + limitations + '<span title="adres MAC">' + sorted[idx].mac + '</span><br><span title="adres IP">' + sorted[idx].ip + '</span></div>';
				html += '<div class="col-xs-3 hidden-xs" title="sposób połączenia">';
				if (sorted[idx].type == 1) {
					html += 'przewodowo';
					var obj = physicalports.find(o => o.port === sorted[idx].port);
					if (obj) {
						html += '<br>' + (sorted[idx].port).toUpperCase();
					}
					html += '</div>';
					html += '<div class="col-xs-2"></div>';
				} else {
					html += 'bezprzewodowo<br>' + (sorted[idx].band == 2 ? '2.4' : sorted[idx].band) + ' GHz</div>';
					html += '<div class="col-xs-2 hidden-xs"><span class="click" onclick="showbandwidth(\'' + sorted[idx].mac + '\');" title="wysłano">&uarr;&nbsp;' + bytesToSize(sorted[idx].tx) + '</span><br><span class="click" onclick="showbandwidth(\'' + sorted[idx].mac + '\');" title="pobrano">&darr;&nbsp;' + bytesToSize(sorted[idx].rx) + '</span></div>';
				}
				html += '<div class="col-xs-1 hidden-xs text-right"><span class="click" title="menu" onclick="hostmenu(' + sorted[idx].id + ');"><i data-feather="more-vertical"></i></span></div>';

				html += '</div>';
				any_active = true;
			} else {
				if (sorted[idx].active) { continue; }
				html += '<hr><div class="row">';
				html += '<div class="col-xs-9"><span class="click" onclick="hostnameedit(' + sorted[idx].id + ');">' + (sorted[idx].active_id > -1 ? '<span title="aktywny" style="color:green">&#9679;</span>&nbsp;' : '') + sorted[idx].displayname + '</span></div>';
				html += '<div class="col-xs-3 text-right"><span class="click" title="menu" onclick="hostmenu(' + sorted[idx].id + ');"><i data-feather="more-vertical"></i></span></div>';
				html += '<div class="col-xs-12">MAC: ' + sorted[idx].mac + ', pierwszy raz: ' + formatDateTime(sorted[idx].first_seen) +  (sorted[idx].active_id > -1 ? ', <span style="color:green">aktywny</span>' : ', ostatni raz: ' + formatDateTime(sorted[idx].last_seen)) + '</div>';
				html += '</div>';
				any_all = true;
			}
		}
	}
	if (filterby == 'active') {
		if (!any_active) {
			html += '<div class="alert alert-warning">Brak połączonych klientów</div>';
		}
	} else {
		if (!any_all) {
			html += '<div class="alert alert-warning">Brak informacji o połączeniach klientów</div>';
		}
	}
	setValue('div_clients_content', html);

	if (clients.length > 0) {
		all = ['displayname', 'tx', 'rx', 'percent', 'connected', 'type', 'mac', 'last_seen'];
		for (var idx = 0; idx < all.length; idx++) {
			var e = document.getElementById('clients_sortby_' + all[idx]);
			if (e === null) {
				continue;
			}
			e.style.fontWeight = (sortby == all[idx]) ? 700 : 400;
		}
		showicon();

		setValue('clients_filter_active', ' aktywni (' + counter_active + ') ');
		setValue('clients_filter_all', ' wszyscy (' + counter_all + ') ');
		clientscallbackfilter(filterby);

		if (filterby == 'active' && total > 0) {
			var canvas = document.getElementById('clients_pie');
			var ctx = canvas.getContext('2d');
			var previousRadian = 1.5 * Math.PI;
			var positionInfo = document.getElementById('div_clients_pie').getBoundingClientRect();
			canvas.width = positionInfo.width;
			var middle = {
				x: canvas.width / 2,
				y: canvas.height / 2,
				radius: (Math.min(canvas.width, canvas.height) / 2) - 10,
			};

			ctx.strokeStyle = 'white';
			for (var idx = 0; idx < sorted.length; idx++) {
				if (!sorted[idx].active) { continue; }
				ctx.fillStyle = string2color(sorted[idx].mac);
				radian = (2 * Math.PI) * ((sorted[idx].tx + sorted[idx].rx) / total);
				ctx.beginPath();
				ctx.moveTo(middle.x, middle.y);
				ctx.arc(middle.x, middle.y, middle.radius, previousRadian, previousRadian + radian, false);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				previousRadian += radian;
			}

			ctx.strokeStyle = (getCookie('easyconfig_darkmode') == '1' ? 'white' : 'black');
			ctx.beginPath();
			ctx.arc(middle.x, middle.y, middle.radius, 0, 2 * Math.PI);
			ctx.closePath();
			ctx.stroke();

			var clients_pie_tooltip = function (e) {
				var eventDoc, doc, body;
				e = e || window.event;
				if (e.pageX == null && e.clientX != null) {
					eventDoc = (e.target && e.target.ownerDocument) || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
					e.pageX = e.clientX +
					  (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
					  (doc && doc.clientLeft || body && body.clientLeft || 0);
					e.pageY = e.clientY +
					  (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
					  (doc && doc.clientTop  || body && body.clientTop  || 0 );
				}

				const rect = this.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				var c = this.getContext('2d');
				var p = c.getImageData(x, y, 1, 1).data;
				var hex = rgb2hex('rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')');
				setDisplay('div_clients_pie_tooltip', false);
				for (var idx = 0; idx < sorted.length; idx++) {
					if (!sorted[idx].active) { continue; }
					if (string2color(sorted[idx].mac) == hex) {
						var e1 = document.getElementById('div_clients_pie_tooltip');
						e1.style.top = (e.pageY + 15) + 'px';
						e1.style.left = (e.pageX + 15) + 'px';
						setValue('div_clients_pie_tooltip', sorted[idx].displayname + ': ' + bytesToSize(sorted[idx].tx + sorted[idx].rx) + ' (' +  sorted[idx].percent + '%), połączony ' + formatDuration(sorted[idx].connected, false));
						setDisplay('div_clients_pie_tooltip', true);
						break;
					}
				}
			};

			document.getElementById('clients_pie').addEventListener('mousemove', clients_pie_tooltip, false);
		}
	}
}

function clientsstats() {
	var html = 'Nowi klienci<br><br><div class="text-left">';
	var html1;
	var now = new Date();
	var countdownYear = now.getFullYear();
	var countdownMonth = now.getMonth();
	var cnt;
	var sorted = sortJSON(clients, 'first_seen', 'desc');

	const monthNames = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];

	for (var idx = 0; idx < 12; idx++) {
		var day = new Date(countdownYear, countdownMonth, 1);
		var toDate = formatDateWithoutDay(day);
		var toHumanReadableDate = monthNames[day.getMonth()];
		countdownMonth -= 1;
		if (countdownMonth == -1) {
			countdownMonth = 11;
			countdownYear -= 1;
		}

		cnt = 0;
		html1 = '';
		for (var idx1 = 0; idx1 < sorted.length; idx1++) {
			if (sorted[idx1].active) { continue; }
			if ((sorted[idx1].first_seen).startsWith(toDate)) {
				cnt += 1;
				html1 += createRowForModal(sorted[idx1].displayname, formatDateTime(sorted[idx1].first_seen));
			}
		}
		html += formatDateTime(toDate) + ' (' + toHumanReadableDate + '): ' + cnt  + '<br>';
		html += html1 + '<hr>';
	}
	html += '</div>';
	showMsg(html);
}

var logs;
var logs_hosts = [];

function showclientslogs() {
	ubus_call('"easyconfig", "clientslogs", {}', function(data) {
		logs = sortJSON(data.result, 'id', 'desc');

		var lookup = {};
		var hosts = [];
		for (var idx = 0; idx < logs.length; idx++) {
			var mac = logs[idx].mac;
			if (!(mac in lookup)) {
				lookup[mac] = 1;
				hosts.push({'mac': mac, 'username': logs[idx].username != '' ? logs[idx].username : (logs[idx].dhcpname != '' ? logs[idx].dhcpname + ' / ' + logs[idx].mac : logs[idx].mac)});
			}
		}
		logs_hosts = sortJSON(hosts, 'username', 'asc');

		clientslogscallback(0, 9);
	});
}

function timestampToDate(ts) {
	function z(n){return (n<10?'0':'')+ +n;}
	var d = new Date(ts * 1000);
	return '' + d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds());
}

function clientslogscallback(first, last) {
	var selected = 'all'
	var e = document.getElementById('clientslogs_hosts');
	if (e != null) {
		selected = e.options[e.selectedIndex].value;
	}
	var tmp = getValue('clientslogs_mac');
	if (tmp != '') { selected = tmp; }
	setValue('clientslogs_mac', '');

	var filtered = [];
	if (selected == 'all') {
		filtered = logs;
	} else {
		for (var idx = 0; idx < logs.length ; idx++) {
			if (logs[idx].mac == selected) {
				filtered.push(logs[idx]);
			}
		}
	}

	var html = '';
	if (filtered.length > 0) {
		html += '<div class="form-group row" id="div_clientslogs_hosts">';
		html += '<div class="col-xs-12 col-sm-offset-6 col-sm-6"><select id="clientslogs_hosts" class="form-control" onchange="clientslogscallback(0,9);">';
		html += '<option value="all">Wszyscy</option>';
		for (var idx = 0; idx < logs_hosts.length; idx++) {
			html += '<option value="' + logs_hosts[idx].mac + '">' + logs_hosts[idx].username + '</option>';
		}
		html += '</select></div></div>';

		if (selected != 'all') {
			html += '<div class="row space" id="div_timelinelogs"><div class="col-xs-12"><canvas id="timelinelogs" height="100"></canvas></div></div>';
		}

		if (first < 0) { first = 0; }
		if (filtered.length - 1 < last) { last = filtered.length - 1; }
		for (var idx = first; idx <= last; idx++) {
			var title = '';
			if (filtered[idx].desc !== '' && typeof filtered[idx].desc.band !== 'undefined') {
				title = 'Pasmo: ' + (filtered[idx].desc.band == 2 ? '2.4' : filtered[idx].desc.band) + ' GHz, SSID: ' + filtered[idx].desc.ssid;
			}
			html += '<div class="row space">';
			html += '<div class="col-xs-6 col-sm-3">' + formatDateTime(timestampToDate(filtered[idx].id)) + '</div>';
			html += '<div class="col-xs-6 col-sm-3" title="' + title + '">' + (filtered[idx].event == 'connect' ? 'połączenie' : 'rozłączenie') + '</div>';
			html += '<div class="col-xs-12 col-sm-6">' + ((selected != 'all') ? title : (filtered[idx].username != '' ? filtered[idx].username : (filtered[idx].dhcpname != '' ? filtered[idx].dhcpname + ' / ' + filtered[idx].mac : filtered[idx].mac))) + '</div>';
			html += '</div>';
		}
		html += '<div class="row">';
		html += '<div class="col-xs-4 text-left"><p>' + (first + 1) + ' - ' + (last + 1) + ' z ' + filtered.length + '</p></div>';
		html += '<div class="col-xs-8 text-right">';
		html += '<span class="btn btn-default" onclick="clientslogscallback(0,9);">|&larr;</span>';
		html += '<span class="btn btn-default" onclick="clientslogscallback(' + ((first - 10) < 0 ? '0,9' : (first - 10) + ',' + (first - 1)) + ');">&larr;</span>';
		html += '<span class="btn btn-default" onclick="clientslogscallback(' + ((last + 10) > (filtered.length - 1) ? (filtered.length - 10) + ',' + (filtered.length - 1) : (last + 1) + ',' + (last + 10))  + ');">&rarr;</span>';
		html += '<span class="btn btn-default" onclick="clientslogscallback(' + (filtered.length - 10) + ',' + (filtered.length - 1) + ');">&rarr;|</span>';
		html += '</div>';
		html += '</div>';
	} else {
		html += '<div class="alert alert-warning">Brak historii połączeń</div>';
	}
	setValue('div_clientslogs_content', html);
	if (filtered.length > 0) {
		setValue('clientslogs_hosts', selected);
		if (selected != 'all') {
			var timelinelogs_arr = []; timelinelogs_arr[0] = [];
			var min = filtered[0].id * 1 - 86400;
			for (var idx = filtered.length - 1; idx > -1; idx--) {
				if (filtered[idx].id * 1 > min) {
					timelinelogs_arr[0].push([filtered[idx].id * 1000, (filtered[idx].event == 'connect' ? 1 : 0)]);
				}
			}
			staticgraph.draw({element: 'timelinelogs', data: timelinelogs_arr, legend: [{color:'blue'}]});
		}
	}
}

function hostmenu(id) {
	var host;
	for (var i = 0; i < clients.length; i++) {
		if (clients[i].id == id) {
			host = clients[i];
			break;
		}
	}
	var html = host.displayname + '<hr>';

	html += '<p><span class="click" onclick="closeMsg();hostinfo(' + (host.active_id > -1 ? host.active_id : host.id) + ');">informacje</span></p>';
	html += '<p><span class="click" onclick="closeMsg();hostnameedit(' + host.id + ');">zmiana nazwy</span></p>';
	html += '<p><span class="click" onclick="closeMsg();hostblock(' + host.id + ');">blokady</span></p>';
	if (config.services.nftqos) {
		html += '<p><span class="click" onclick="closeMsg();hostqos(' + host.id + ');">limity</span></p>';
	}
	if (config.lan_dhcp_enabled) {
		html += '<p><span class="click" onclick="closeMsg();hostip(' + host.id + ');">statyczny adres IP</span></p>';
	}
	html += '<p><span class="click" onclick="closeMsg();hostlogs(' + host.id + ');">historia połączeń &rarr;</span></p>';
	html += '<p><span class="click" onclick="closeMsg();hostqueries(' + host.id + ');">zapytania DNS &rarr;</span></p>';
	if (host.type == 2) {
		html += '<p><span class="click" onclick="closeMsg();hoststatistics(' + host.id + ',\'d\',30);">transfer z ostatnich 30 dni</span></p>';
		html += '<p><span class="click" onclick="closeMsg();hoststatistics(' + host.id + ',\'m\',0);">transfer miesięczny</span></p>';
	}
	html += '<hr><p><span class="click" onclick="closeMsg();hostremovedata(' + host.id + ');">usuwanie danych</span></p>';
	showMsg(html);
}

function calculatedistance(frequency, signal) {
	var dist = Math.pow(10.0, (27.55 - (20 * Math.log10(frequency)) + Math.abs(signal)) / 20.0);
	return dist.toFixed(0);
}

function hostinfo(id) {
	var html = '';
	var vendor = '-';
	var host;
	for (var i = 0; i < clients.length; i++) {
		if (clients[i].id == id) {
			host = clients[i];
			break;
		}
	}

	html += createRowForModal('Nazwa', (host.username == '' ? '-' : host.username));
	html += createRowForModal('MAC', host.mac);
	html += createRowForModal('Producent', getmanuf(host.mac));
	html += createRowForModal('Nazwa rzeczywista', (host.dhcpname == '' ? '-' : host.dhcpname));
	html += createRowForModal('Typ połączenia', (host.type == 1 ? 'przewodowo' : 'bezprzewodowo'));
	if (host.active) {
		if (host.type == 1) {
			var obj = physicalports.find(o => o.port === host.port);
			if (obj) {
				html += createRowForModal('Port', (host.port).toUpperCase());
			}
		}
		if (host.type == 2) {
			html += createRowForModal('Pasmo', (host.band == 2 ? '2.4' : host.band) + ' GHz');
			if (host.capa) {
				switch (host.capa) {
					case 4:
						html += createRowForModal('Standard', 'Wi-Fi 4 (802.11n)');
						break;
					case 5:
						html += createRowForModal('Standard', 'Wi-Fi 5 (802.11ac)');
						break;
					case 6:
						html += createRowForModal('Standard', 'Wi-Fi 6' + (host.band == 6 ? 'E' : '') + ' (802.11ax)');
						break;
				}
			}
			var distance = '';
			for (var idx = 0; idx < (config.wlan_current_channels).length; idx++) {
				if (config.wlan_current_channels[idx].phy == host.phy) {
					distance = ' (~' + calculatedistance(config.wlan_current_channels[idx].freq, host.signal) + ' m)';
					break;
				}
			}
			html += createRowForModal('Poziom sygnału', (host.signal + ' dBm' + distance));
			html += createRowForModal('Wysłano', '<span class="click" onclick="showbandwidth(\'' + host.mac + '\');">' + bytesToSize(host.tx) + '</span>');
			html += createRowForModal('Pobrano', '<span class="click" onclick="showbandwidth(\'' + host.mac + '\');">' + bytesToSize(host.rx) + '</span>');
			html += createRowForModal('Połączony', '<span>' + formatDuration(host.connected, false) + '</span><span class="visible-xs oneline"></span><span>' + (host.connected_since == '' ? '' : ' (od ' + formatDateTime(host.connected_since) + ')') + '</span>');
		}
		html += createRowForModal('Adres IP', (host.ip == '' ? '-' : host.ip));
	}
	html += createRowForModal('Pierwszy raz widziany', formatDateTime(host.first_seen));
	if (!host.active) {
		html += createRowForModal('Ostatni raz widziany', formatDateTime(host.last_seen) + '</span><span class="visible-xs oneline"></span><span>' + ' (' + formatDuration(parseInt((new Date() - new Date((host.last_seen).substring(0,4), (host.last_seen).substring(4,6) - 1, (host.last_seen).substring(6,8), (host.last_seen).substring(8,10), (host.last_seen).substring(10,12), (host.last_seen).substring(12,14)))/1000), false) + ' temu)' + '</span>');
	}
	showMsg(html, false);
}

function hostblock(id) {
	var host;
	for (var i = 0; i < clients.length; i++) {
		if (clients[i].id == id) {
			host = clients[i];
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

	execute(cmd, showclients);
}

function hostblock_toggle(evt) {
	setValue('hostblock_temporary', true);
	var e = evt.target;
	e.style.backgroundColor = (e.style.backgroundColor == document.getElementById('hostblock_off').style.backgroundColor) ? document.body.style.backgroundColor : '#337ab7';
}

function hostblock_checkall() {
	setValue('hostblock_temporary', true);
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
	for (var i = 0; i < clients.length; i++) {
		if (clients[i].id == id) {
			host = clients[i];
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

	execute(cmd, showclients);
}

function hostip(id) {
	var host;
	for (var i = 0; i < clients.length; i++) {
		if (clients[i].id == id) {
			host = clients[i];
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

	execute(cmd, showclients);
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

	execute(cmd, showclients);
}

function hostqos(id) {
	var host;
	for (var i = 0; i < clients.length; i++) {
		if (clients[i].id == id) {
			host = clients[i];
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

	execute(cmd, showclients);
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

	execute(cmd, showclients);
}

function cancelhostqos() {
	setDisplay('div_hostqos', false);
}

function hoststatistics(id, type, limit) {
	var host;
	for (var i = 0; i < clients.length; i++) {
		if (clients[i].id == id) {
			host = clients[i];
			break;
		}
	}
	hoststatisticsmodal(host.mac, 'Statystyka transferu dla "' + host.displayname + '"', type, limit);
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

				var days = [];
				switch (limit) {
					case 30:
						days = new Array(formatDate(new Date));
						days = days.concat(lastDays(29));
						break;
					case 1:
						days = new Array(formatDate(new Date));
						break;
					case -1:
						days = lastDays(1);
						break;
					case -7:
						days = lastDays(7);
						break;
					case -30:
						days = lastDays(30);
						break;
				}
				for (var idx = (data.statistics).length - 1; idx >= 0; idx--) {
					if (days.indexOf((data.statistics[idx]).date) == -1) {
						(data.statistics).splice(idx, 1);
					}
				}
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

function hostremovedata(id) {
	var host;
	for (var i = 0; i < clients.length; i++) {
		if (clients[i].id == id) {
			host = clients[i];
			break;
		}
	}

	setValue('dialog_val', (host.mac).replace(/:/g, '_'));
	showDialog('Usunąć dane dla "' + host.displayname + '"?', 'Anuluj', 'Usuń', okremovetraffic);
}

function hostlogs(id) {
	var host;
	for (var i = 0; i < clients.length; i++) {
		if (clients[i].id == id) {
			host = clients[i];
			break;
		}
	}

	setValue('clientslogs_mac', host.mac);
	btn_pages('clientslogs');
}

function hostqueries(id) {
	var host;
	for (var i = 0; i < clients.length; i++) {
		if (clients[i].id == id) {
			host = clients[i];
			break;
		}
	}

	setValue('queries_host', host.displayname);
	btn_pages('queries');
}

/*****************************************************************************/

var queries;
var queries_hosts = [];

function showqueries() {
	ubus_call('"easyconfig", "queries", {}', function(data) {
		queries = data.result;

		var lookup = {};
		var hosts = [];
		for (var idx = 0; idx < queries.length; idx++) {
			if (!(queries[idx].host in lookup)) {
				lookup[queries[idx].host] = 1;
				hosts.push({'host': queries[idx].host});
			}
		}
		queries_hosts = sortJSON(hosts, 'host', 'asc');

		queriescallback('id', 'desc');
	});
}

function queriescallback(sortby, order) {
	var selected = 'all'
	var e = document.getElementById('queries_hosts');
	if (e != null) {
		selected = e.options[e.selectedIndex].value;
	}
	var tmp = getValue('queries_host');
	if (tmp != '') { selected = tmp; }
	setValue('queries_host', '');

	var filtered = [];
	if (selected == 'all') {
		filtered = queries;
	} else {
		for (var idx = 0; idx < queries.length ; idx++) {
			if (queries[idx].host == selected) {
				filtered.push(queries[idx]);
			}
		}
	}

	var html = '';
	if (filtered.length > 0) {

		html += '<div class="row"><div class="col-xs-6 text-right">Liczba zapytań</div><div class="col-xs-6"><p>' + filtered.length + '</p></div></div>';
		var cnt = 0;
		for (var idx = 0; idx < filtered.length; idx++) {
			if (filtered[idx].nxdomain) {
				cnt ++;
			}
		}
		html += '<div class="row"><div class="col-xs-6 text-right">Liczba zapytań o niedostępne domeny</div><div class="col-xs-6"><p>' + cnt + '<span class="visible-xs oneline"></span> (' + parseInt(cnt * 100 / filtered.length) + '%)</p></div></div>';
		html += '<hr>'

		html += '<div class="form-group row" id="div_queries_hosts">';
		html += '<div class="col-xs-offset-6 col-xs-6 col-sm-offset-4 col-sm-4"><select id="queries_hosts" class="form-control" onchange="queriescallback(\'id\', \'desc\');">';
		html += '<option value="all">Wszyscy</option>';
		for (var idx = 0; idx < queries_hosts.length; idx++) {
			html += '<option value="' + queries_hosts[idx].host + '">' + queries_hosts[idx].host + '</option>';
		}
		html += '</select></div></div>';

		html += '<div class="row">';
		html += '<div class="col-xs-6 col-sm-4"><span class="click" onclick="queriescallback(\'time\');"><span id="queries_sortby_time">Czas</span></span></div>';
		html += '<div class="col-xs-6 col-sm-4"><span class="click" onclick="queriescallback(\'host\');"><span id="queries_sortby_host">Klient</span></span></div>';
		html += '<div class="col-xs-12 col-sm-4"><span class="click" onclick="queriescallback(\'query\');"><span id="queries_sortby_query">Zapytanie</span></span></div>';
		html += '</div><hr>';

		var sorted = sortJSON(filtered, sortby, (order ? order : 'asc'));
		for (var idx = 0; idx < sorted.length; idx++) {
			html += '<div class="row space">';
			html += '<div class="col-xs-6 col-sm-4">' + formatDateTime(sorted[idx].time) + '</div>';
			html += '<div class="col-xs-6 col-sm-4">' + sorted[idx].host + '</div>';
			if (sorted[idx].nxdomain) {
				html += '<div class="col-xs-12 col-sm-4 text-muted" title="brak domeny">' + sorted[idx].query + '</div>';
			} else {
				html += '<div class="col-xs-12 col-sm-4"><span class="click" onclick="queriesmenu(\'' + sorted[idx].query + '\');">' + sorted[idx].query + '</span></div>';
			}
			html += '</div>';
		}
	} else {
		html += '<div class="alert alert-warning">Brak zapytań DNS</div>';
	}
	setValue('div_queries_content', html);

	if (filtered.length > 0) {
		var all = ['time', 'query', 'host'];
		for (var idx = 0; idx < all.length; idx++) {
			var e = document.getElementById('queries_sortby_' + all[idx]);
			e.style.fontWeight = (sortby == all[idx]) ? 700 : 400;
		}
		setValue('queries_hosts', selected);
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

function formatDateWithoutDay(d) {
	function z(n){return (n<10?'0':'')+ +n;}
	return d.getFullYear() + '' + z(d.getMonth() + 1);
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
				setValue('traffic_today', '<span class="click" style="color:' + color + '" onclick="hoststatisticsmodal(\'wan\',\'Dziś\',\'d\',1);">' + bytesToSize(traffic_today) + '</span>');
			}
			if (traffic_yesterday == 0) {
				setValue('traffic_yesterday', 0);
			} else {
				setValue('traffic_yesterday', '<span class="click" style="color:' + color + '" onclick="hoststatisticsmodal(\'wan\',\'Wczoraj\',\'d\',-1);">' + bytesToSize(traffic_yesterday) + '</span>');
			}
			if (traffic_last7d == 0) {
				setValue('traffic_last7d', 0);
			} else {
				setValue('traffic_last7d', '<span class="click" style="color:' + color + '" onclick="hoststatisticsmodal(\'wan\',\'Ostatnie 7 dni\',\'d\',-7);">' + bytesToSize(traffic_last7d) + '</span>');
			}
			if (traffic_last30d == 0) {
				setValue('traffic_last30d', 0);
			} else {
				setValue('traffic_last30d', '<span class="click" style="color:' + color + '" onclick="hoststatisticsmodal(\'wan\',\'Ostatnie 30 dni\',\'d\',-30);">' + bytesToSize(traffic_last30d) + '</span>');
			}
			if (traffic_total == 0) {
				setValue('traffic_total', 0);
			} else {
				setValue('traffic_total', '<span class="click" style="color:' + color + '" onclick="hoststatisticsmodal(\'wan\',\'Łącznie\',\'m\',0);">' + bytesToSize(traffic_total) + '</span>');
			}
			if (total_since) {
				setValue('traffic_total_since', ' (od ' + formatDateTime(total_since) + ')');
			} else {
				setValue('traffic_total_since', '');
			}
			setValue('traffic_currentperiod', bytesToSize(traffic_currentperiod));
			setValue('traffic_currentperiod_projected', bytesToSize((traffic_currentperiod / current_period.length) * (current_period.length + diffdays - 1)));
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
	setValue('dialog_val', 'wan');
	showDialog('Usunąć dane o transferze?', 'Anuluj', 'Usuń', okremovetraffic);
}

function okremovetraffic() {
	var cmd = [];
	var mac = getValue('dialog_val');

	cmd.push('DB=/tmp/easyconfig_statistics.json');
	cmd.push('SDB=/usr/lib/easyconfig/easyconfig_statistics.json.gz');
	cmd.push('. /usr/share/libubox/jshn.sh');
	cmd.push('if [ -e \\\"$DB\\\" ]; then');
	cmd.push('lock \\\"/var/lock/easyconfig_statistics.lock\\\"');
	cmd.push('if [ -e \\\"/usr/bin/easyconfig_statistics.uc\\\" ]; then');
	cmd.push('/usr/bin/easyconfig_statistics.uc \\\"' + mac + '\\\" \\\"delete\\\" 0 0 0 \\\"\\\" 0');
	cmd.push('else');
	cmd.push('json_init');
	cmd.push('json_load_file \\\"$DB\\\"');
	cmd.push('export K_J_V=$(echo \\\"${K_J_V}\\\" | sed \'s/ ' + mac + '//g\')');
	cmd.push('json_close_object');
	cmd.push('json_dump > \\\"$DB\\\"');
	cmd.push('fi');
	cmd.push('touch -d \\\"2000-01-01 00:00:00\\\" \\\"$SDB\\\"');
	cmd.push('lock -u \\\"/var/lock/easyconfig_statistics.lock\\\"');
	cmd.push('/usr/bin/easyconfig_statistics.sh');
	cmd.push('fi');

	execute(cmd, (mac == 'wan') ? showtraffic : showclients);
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
			showMsg((data.result).replace(/(\r\n|\r|\n)/g, '<br>'));
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
		if ((data.response).match(/sms sent sucessfully/) == null) {
			showMsg('Wystąpił problem z wysłaniem wiadomości');
		} else {
			showMsg('Wysłano wiadomość');
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
				html += '<div class="col-xs-2 text-right"><span class="click" title="usuń" onclick="removesms(\'' + sorted[idx].index + '\',\'' + sorted[idx].sender + '\',\'' + sorted[idx].timestamp + '\');"><i data-feather="trash-2"></i></span></div>';
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
		if ((data.response).match(/Deleted message/) == null) {
			showMsg('Wystąpił problem z usunięciem wiadomości');
		} else {
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
			var select = removeOptions('ussd_shortcuts');
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
			msg += 'Po wykonaniu aktualizacji nastąpi ponowne uruchomienie urządzenia.';
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
			msg += '<br>Po wykonaniu aktualizacji nastąpi ponowne uruchomienie urządzenia.';
			msg += '<br><br>Nie zmieniaj konfiguracji i nie wyłączaj urządzenia w czasie tego procesu.';
			setDisplay("div_upgrade_step1", false);
		}
		setDisplay("div_upgrade_step2", false);
		setDisplay("div_upgrade_step3", false);
		setValue("upgrade_msg", msg);
		setDisplay("div_upgrade_msg", true);
	});
}

/*****************************************************************************/

function upvpn(proto, interface, section) {
	if (proto == 'openvpn') {
		var cmd = [];
		cmd.push('uci set openvpn.' + section + '.enabled=1');
		cmd.push('/etc/init.d/openvpn reload');
		cmd.push('uci revert openvpn');
		execute(cmd, showvpn);
	} else if (proto == 'zerotier') {
		var cmd = [];
		cmd.push('uci set zerotier.' + section + '.enabled=1');
		cmd.push('/etc/init.d/zerotier reload');
		cmd.push('uci revert zerotier');
		execute(cmd, showvpn);
	} else {
		ubus_call('"network.interface", "up", {"interface":"' + interface + '"}', function(data) {
			showvpn();
		});
	}
}

function downvpn(proto, interface, section) {
	if (proto == 'openvpn') {
		var cmd = [];
		cmd.push('uci set openvpn.' + section + '.enabled=0');
		cmd.push('/etc/init.d/openvpn reload');
		cmd.push('uci revert openvpn');
		execute(cmd, showvpn);
	} else if (proto == 'zerotier') {
		var cmd = [];
		cmd.push('uci set zerotier.' + section + '.enabled=0');
		cmd.push('/etc/init.d/zerotier reload');
		cmd.push('uci revert zerotier');
		execute(cmd, showvpn);
	} else {
		ubus_call('"network.interface", "down", {"interface":"' + interface + '"}', function(data) {
			ubus_call('"network.interface", "up", {"interface":"wan"}', function(data1) {
				showvpn();
			});
		});
	}
}

function savevpnkillswitch() {
	var cmd = [];

	if (getValue('vpn_killswitch')) {
		if (config.wan_lanto != '') {
			cmd.push('uci -q del firewall.' + config.wan_lanto);
		}
	} else {
		if (config.wan_lanto == '') {
			cmd.push('uci add firewall forwarding');
			cmd.push('uci set firewall.@forwarding[-1].src=lan');
			cmd.push('uci set firewall.@forwarding[-1].dest=wan');
		}
	}
	cmd.push('uci commit firewall')
	cmd.push('/etc/init.d/firewall restart')
	execute(cmd, showvpn);
}

function showvpn() {
	ubus_call('"easyconfig", "vpn", {}', function(data) {
		setValue('vpn_killswitch', data.wan_lanto == '');
		config.wan_lanto = data.wan_lanto;
		var sorted = sortJSON(data.result, 'name', 'asc');
		if (sorted.length > 0) {
			var html = '<div class="row space">';
			html += '<div class="col-xs-12 col-sm-4">Nazwa</div>'
			html += '<div class="col-xs-3 col-sm-3">Typ</div>'
			html += '<div class="col-xs-7 col-sm-4">Status</div>'
			html += '<div class="col-xs-2 col-sm-1"></div>'
			html += '</div>';
			for (var idx = 0; idx < sorted.length; idx++) {
				html += '<hr><div class="row space"><div class="col-xs-12 col-sm-4 click" onclick="vpndetails(\'' + sorted[idx].proto + '\',\'' + sorted[idx].interface + '\',\'' + (sorted[idx].section ? sorted[idx].section : '') + '\');">' + (sorted[idx].name).replace(',', '<br>') + '</div>';
				html += '<div class="col-xs-3 col-sm-3">' + vpntype(sorted[idx].proto) + '</div>';
				if (sorted[idx].up) {
					if (sorted[idx].proto == 'zerotier') {
						html += '<div class="col-xs-7 col-sm-4"><span style="color:green">aktywny</span></div>';
						html += '<div class="col-xs-2 col-sm-1">';
						html += '<span class="click" onclick="vpnstatuszerotier(\'' + sorted[idx].section + '\');" title="status"><i data-feather="info"></i></span>&nbsp;';
					} else {
						html += '<div class="col-xs-7 col-sm-4"><span style="color:green">aktywny</span>, ' + formatDuration(sorted[idx].uptime, false) + (sorted[idx].uptime_since == '' ? '' : ' (od ' + formatDateTime(sorted[idx].uptime_since) + ')') + '</div>';
						html += '<div class="col-xs-2 col-sm-1">';
						html += '<span class="click" onclick="vpnstatus(\'' + sorted[idx].interface + '\');" title="status"><i data-feather="info"></i></span>&nbsp;';
					}
					html += '<span class="click" onclick="downvpn(\'' + sorted[idx].proto + '\',\'' + sorted[idx].interface + '\',\'' + (sorted[idx].section ? sorted[idx].section : '') + '\');" title="rozłącz"><i data-feather="power"></i></span>';
					html += '</div>';
				} else {
					if (sorted[idx].pending) {
						html += '<div class="col-xs-7 col-sm-4">trwa nawiązywanie połączenia</div>';
						html += '<div class="col-xs-2 col-sm-1">';
						html += '<span class="click" onclick="downvpn(\'' + sorted[idx].proto + '\',\'' + sorted[idx].interface + '\',\'' + (sorted[idx].section ? sorted[idx].section : '') + '\');"><span title="rozłącz"><i data-feather="power"></i></span>';
						html += '</div>';
					} else {
						html += '<div class="col-xs-7 col-sm-4">wyłączony</div>';
						html += '<div class="col-xs-2 col-sm-1">';
						html += '<span class="click" onclick="upvpn(\'' + sorted[idx].proto + '\',\'' + sorted[idx].interface + '\',\'' + (sorted[idx].section ? sorted[idx].section : '') + '\');" title="połącz"><i data-feather="power"></i></span>';
						html += '</div>';
					}
				}
				html += '</div>';
			}
			setValue('div_vpn_content', html);
			showicon();
		} else {
			setValue('div_vpn_content', '<div class="alert alert-warning">Brak sieci VPN</div>');
		}
	})
}

function vpnstatus(interface) {
	ubus_call('"easyconfig", "vpnstatus", {"interface":"' + interface + '"}', function(data) {
		var html = '';
		var t = formatDuration(data.uptime, false);
		if (data.uptime_since != '') {
			t += ' (od ' + formatDateTime(data.uptime_since) + ')';
		}
		html += createRowForModal('Czas połączenia', t);
		html += createRowForModal('Wysłano', bytesToSize(data.tx));
		html += createRowForModal('Pobrano', bytesToSize(data.rx));
		html += createRowForModal('Adres IP', '<span class="click" onclick="showgeolocation();">' + data.ipaddr + '</span>');

		if (data.proto == 'wireguard') {
			for (var idx = 0; idx < data.peers.length; idx++) {
				html += '<br>';
				html += createRowForModal('Nazwa połączenia', data.peers[idx].name);
				html += createRowForModal('Wysłano', bytesToSize(data.peers[idx].tx));
				html += createRowForModal('Pobrano', bytesToSize(data.peers[idx].rx));
				t = '-';
				if (data.peers[idx].handshake != '') {
					t = formatDateTime(data.peers[idx].handshake) + ' (' + formatDuration(data.peers[idx].handshake_ago, true) + ' temu)';
				}
				html += createRowForModal('Ostatni kontakt', t);
			}
		}
		showMsg(html);
	});
}

function vpnstatuszerotier(section) {
	ubus_call('"easyconfig", "vpnstatuszerotier", {"section":"' + section + '"}', function(data) {
		var html = '';
		for (var idx = 0; idx < data.networks.length; idx++) {
			if (idx > 0) { html += '<br>'; }
			html += createRowForModal('Adres IP', '<span class="click" onclick="showgeolocation();">' + data.networks[idx].ipaddr + '</span>');
			html += createRowForModal('Sieć', data.networks[idx].id);
			html += createRowForModal('Nazwa', data.networks[idx].name);
			html += createRowForModal('Typ', data.networks[idx].type);
			html += createRowForModal('Status', data.networks[idx].status);
		}
		showMsg(html);
	});
}

function vpndetails(proto, interface, section) {
	ubus_call('"easyconfig", "vpndetails", {"proto":"' + proto + '","interface":"' + interface + '","section":"' + section + '"}', function(data) {
		if (data.proto == 'openvpn') {
			setValue('vpn_openvpn_error', '');
			setValue('vpn_openvpn_interface', interface);
			setValue('vpn_openvpn_section', data.section);
			setValue('vpn_openvpn_name', data.name);
			setValue('vpn_openvpn_auto', data.autostart);
			if (data.trigger == 'wan') { setValue('vpn_openvpn_auto', 2); }
			setValue('vpn_openvpn_button', (config.button.code != '') ? data.button : false);
			setDisplay('div_vpn_openvpn_button', config.button.code != '');
			setValue('vpn_openvpn_lanto', data.lanto == 1);
			setValue('vpn_openvpn_username', data.username);
			setValue('vpn_openvpn_password', data.password);
			setValue('vpn_openvpn_configtext', data.configtext);
			setDisplay('div_vpn_openvpn', true);
		}
		if (data.proto == 'pptp') {
			setValue('vpn_pptp_error', '');
			setValue('vpn_pptp_interface', interface);
			setValue('vpn_pptp_name', data.name);
			setValue('vpn_pptp_auto', data.autostart);
			if (data.trigger == 'wan') { setValue('vpn_pptp_auto', 2); }
			setValue('vpn_pptp_button', (config.button.code != '') ? data.button : false);
			setDisplay('div_vpn_pptp_button', config.button.code != '');
			setValue('vpn_pptp_lanto', data.lanto == 1);
			setValue('vpn_pptp_server', data.server);
			setValue('vpn_pptp_username', data.username);
			setValue('vpn_pptp_password', data.password);
			setValue('vpn_pptp_mppe', data.mppe == 1);
			setDisplay('div_vpn_pptp', true);
		}
		if (data.proto == 'sstp') {
			setValue('vpn_sstp_error', '');
			setValue('vpn_sstp_interface', interface);
			setValue('vpn_sstp_name', data.name);
			setValue('vpn_sstp_auto', data.autostart);
			if (data.trigger == 'wan') { setValue('vpn_sstp_auto', 2); }
			setValue('vpn_sstp_button', (config.button.code != '') ? data.button : false);
			setDisplay('div_vpn_sstp_button', config.button.code != '');
			setValue('vpn_sstp_lanto', data.lanto == 1);
			setValue('vpn_sstp_server', data.server);
			setValue('vpn_sstp_username', data.username);
			setValue('vpn_sstp_password', data.password);
			setDisplay('div_vpn_sstp', true);
		}
		if (data.proto == 'wireguard') {
			setValue('vpn_wireguard_error', '');
			setValue('vpn_wireguard_interface', interface);
			setValue('vpn_wireguard_auto', data.autostart);
			if (data.trigger == 'wan') { setValue('vpn_wireguard_auto', 2); }
			setValue('vpn_wireguard_button', (config.button.code != '') ? data.button : false);
			setDisplay('div_vpn_wireguard_button', config.button.code != '');
			setValue('vpn_wireguard_lanto', data.lanto == 1);
			setValue('vpn_wireguard_privkey', data.privkey);
			setValue('vpn_wireguard_pubkey', data.pubkey);
			setValue('vpn_wireguard_port', data.listen_port);

			setValue('vpn_wireguard_ips_content', '');
			setValue('vpn_wireguard_ips', 0);
			for (var idx = 0; idx < data.ips.length; idx++) {
				addwireguardips();
				setValue('vpn_wireguard_ips_' + idx, data.ips[idx]);
			}

			setValue('vpn_wireguard_peers_content', '');
			setValue('vpn_wireguard_peers', 0);
			for (var idx = 0; idx < data.peers.length; idx++) {
				addwireguardpeer(false);
				setValue('vpn_wireguard_description_' + idx, data.peers[idx].description);
				setValue('vpn_wireguard_enabled_' + idx, data.peers[idx].disabled != 1);
				setValue('vpn_wireguard_pubkey_' + idx, data.peers[idx].pubkey);
				setValue('vpn_wireguard_pskey_' + idx, data.peers[idx].pskey);
				setValue('vpn_wireguard_endpoint_host_' + idx, data.peers[idx].endpoint_host);
				setValue('vpn_wireguard_endpoint_port_' + idx, data.peers[idx].endpoint_port);

				for (var idy = 0; idy < data.peers[idx].allowed_ips.length; idy++) {
					addwireguardallowedips('_' + idx);
					setValue('vpn_wireguard_allowed_ips_' + idx + '_' + idy, data.peers[idx].allowed_ips[idy]);
				}
			}

			setDisplay('div_vpn_wireguard', true);
		}
		if (data.proto == 'zerotier') {
			setValue('vpn_zerotier_error', '');
			setValue('vpn_zerotier_section', section);
			setValue('vpn_zerotier_name', data.name);
			setValue('vpn_zerotier_enabled', data.enabled);

			setValue('vpn_zerotier_network_content', '');
			setValue('vpn_zerotier_network', 0);
			for (var idx = 0; idx < data.join.length; idx++) {
				addzerotiernetwork();
				setValue('vpn_zerotier_network_' + idx, data.join[idx]);
			}

			setDisplay('div_vpn_zerotier', true);
		}
	})
}

function vpntype(proto) {
	switch (proto) {
		case 'openvpn':
			return 'OpenVPN';
			break;
		case 'wireguard':
			return 'WireGuard';
			break;
		case 'zerotier':
			return 'ZeroTier';
			break;
		default:
			return proto.toUpperCase();
	}
}

function addvpn() {
	var e = removeOptions('vpn_new');
	var arr = (config.services.vpn).sort();
	for (var idx = 0; idx < arr.length; idx++) {
		var opt = document.createElement('option');
		opt.value = arr[idx];
		opt.innerHTML = vpntype(arr[idx]);
		e.appendChild(opt);
	}

	setDisplay('div_vpn_new', true);
}

function savevpnnew() {
	setDisplay('div_vpn_new', false);

	if (getValue('vpn_new') == 'openvpn') {
		setValue('vpn_openvpn_error', '');
		var interface = Math.random().toString(36).substring(2, 10);
		setValue('vpn_openvpn_interface', interface);
		setValue('vpn_openvpn_section', interface);
		setValue('vpn_openvpn_name', '');
		setValue('vpn_openvpn_auto', 0);
		setValue('vpn_openvpn_button', false);
		setDisplay('div_vpn_openvpn_button', config.button.code != '');
		setValue('vpn_openvpn_lanto', true);
		setValue('vpn_openvpn_username', '');
		setValue('vpn_openvpn_password', '');
		setValue('vpn_openvpn_configtext', '');
		setDisplay('div_vpn_openvpn', true);
	}
	if (getValue('vpn_new') == 'pptp') {
		setValue('vpn_pptp_error', '');
		setValue('vpn_pptp_interface', Math.random().toString(36).substring(2, 10));
		setValue('vpn_pptp_name', '');
		setValue('vpn_pptp_auto', 0);
		setValue('vpn_pptp_button', false);
		setDisplay('div_vpn_pptp_button', config.button.code != '');
		setValue('vpn_pptp_lanto', true);
		setValue('vpn_pptp_server', '');
		setValue('vpn_pptp_username', '');
		setValue('vpn_pptp_password', '');
		setValue('vpn_pptp_mppe', true);
		setDisplay('div_vpn_pptp', true);
	}
	if (getValue('vpn_new') == 'sstp') {
		setValue('vpn_sstp_error', '');
		setValue('vpn_sstp_interface', Math.random().toString(36).substring(2, 10));
		setValue('vpn_sstp_name', '');
		setValue('vpn_sstp_auto', 0);
		setValue('vpn_sstp_button', false);
		setDisplay('div_vpn_sstp_button', config.button.code != '');
		setValue('vpn_sstp_lanto', true);
		setValue('vpn_sstp_server', '');
		setValue('vpn_sstp_username', '');
		setValue('vpn_sstp_password', '');
		setDisplay('div_vpn_sstp', true);
	}
	if (getValue('vpn_new') == 'wireguard') {
		setValue('vpn_wireguard_error', '');
		setValue('vpn_wireguard_interface', Math.random().toString(36).substring(2, 10));
		setValue('vpn_wireguard_auto', 0);
		setValue('vpn_wireguard_button', false);
		setDisplay('div_vpn_wireguard_button', config.button.code != '');
		setValue('vpn_wireguard_lanto', true);
		setValue('vpn_wireguard_privkey', '');
		setValue('vpn_wireguard_pubkey', '');
		setValue('vpn_wireguard_port', '');

		setValue('vpn_wireguard_ips_content', '');
		setValue('vpn_wireguard_ips', 0);
		addwireguardips();

		setValue('vpn_wireguard_peers_content', '');
		setValue('vpn_wireguard_peers', 0);
		addwireguardpeer(true);

		setDisplay('div_vpn_wireguard', true);
	}
	if (getValue('vpn_new') == 'zerotier') {
		setValue('vpn_zerotier_error', '');
		setValue('vpn_zerotier_section', Math.random().toString(36).substring(2, 10));
		setValue('vpn_zerotier_name', '');
		setValue('vpn_zerotier_enabled', true);

		setValue('vpn_zerotier_network_content', '');
		setValue('vpn_zerotier_network', 0);
		addzerotiernetwork();

		setDisplay('div_vpn_zerotier', true);
	}
}

function closevpnnew() {
	setDisplay('div_vpn_new', false);
}

function cancelopenvpn() {
	setDisplay('div_vpn_openvpn', false);
}

function removeopenvpn() {
	cancelopenvpn();
	setValue('dialog_val', getValue('vpn_openvpn_interface'));
	setValue('dialog_val1', getValue('vpn_openvpn_section'));
	showDialog('Usunąć VPN "' + getValue('vpn_openvpn_name') + '" (typu ' + vpntype('openvpn') + ')?', 'Anuluj', 'Usuń', okremoveopenvpn);
}

function okremoveopenvpn() {
	var cmd = [];
	var interface = getValue('dialog_val');
	var section = getValue('dialog_val1');

	if (interface != '') {
		cmd.push('ifdown ' + interface);
		cmd.push('uci -q del network.' + interface);
		cmd.push('uci -q del firewall.' + interface);
		cmd.push('uci -q del firewall.f1' + interface);
		cmd.push('uci -q del firewall.f2' + interface);
	}
	cmd.push('rm $(uci -q get openvpn.' + section + '.config)');
	cmd.push('uci -q del openvpn.' + section);
	cmd.push('uci commit');
	cmd.push('reload_config');
	cmd.push('ubus call network reload');
	execute(cmd, showvpn);
}

function saveopenvpn() {
	var cmd = [];

	setValue('vpn_openvpn_error', '');
	if (getValue('vpn_openvpn_name') == '') {
		setValue('vpn_openvpn_error', 'Błąd w polu ' + getLabelText('vpn_openvpn_name'));
		return;
	}
	if (getValue('vpn_openvpn_username') != '') {
		if (getValue('vpn_openvpn_password') == '') {
			setValue('vpn_openvpn_error', 'Błąd w polu ' + getLabelText('vpn_openvpn_password'));
			return;
		}
	}
	var configtext = getValue('vpn_openvpn_configtext');
	if (configtext == '') {
		setValue('vpn_openvpn_error', 'Błąd w polu ' + getLabelText('vpn_openvpn_configtext'));
		return;
	} else {
		if (configtext.indexOf('client') == -1) {
			setValue('vpn_openvpn_error', 'Plik konfiguracyjny nie zawiera opcji "client"');
			return;
		}
		if (configtext.indexOf('remote') == -1) {
			setValue('vpn_openvpn_error', 'Plik konfiguracyjny nie zawiera opcji "remote"');
			return;
		}
		if (configtext.indexOf('dev') == -1) {
			setValue('vpn_openvpn_error', 'Plik konfiguracyjny nie zawiera opcji "dev"');
			return;
		}
	}

	cancelopenvpn();

	var interface = getValue('vpn_openvpn_interface');
	var section = getValue('vpn_openvpn_section');
	if (interface == '') {
		interface = Math.random().toString(36).substring(2, 10);
	}

	ubus_call('"file", "write", {"path":"/tmp/' + interface + '","data":"' + configtext.replace(/\\/g,'\\\\').replace(/"/g, '\\"') + '"}', function(data) {
	});

	cmd.push('uci set network.' + interface + '=interface');
	cmd.push('uci set network.' + interface + '.proto=none');
	if (config.devicesection) {
		cmd.push('uci set network.' + interface + '.device=' + interface);
	} else {
		cmd.push('uci set network.' + interface + '.ifname=' + interface);
	}

	cmd.push('uci set openvpn.' + section + '=openvpn');
	cmd.push('uci set openvpn.' + section + '.name=\\\"' + escapeShell(getValue('vpn_openvpn_name')) + '\\\"');
	cmd.push('uci set openvpn.' + section + '.username=\\\"' + escapeShell(getValue('vpn_openvpn_username')) + '\\\"');
	cmd.push('uci set openvpn.' + section + '.password=\\\"' + escapeShell(getValue('vpn_openvpn_password')) + '\\\"');
	cmd.push('uci set openvpn.' + section + '.dev=' + interface);
	cmd.push('uci set openvpn.' + section + '.dev_type=tun');
	cmd.push('CFG=$(uci -q get openvpn.' + section + '.config)');
	cmd.push('if [ ! -e \\\"$CFG\\\" ]; then');
	cmd.push(' mkdir -p /etc/openvpn/');
	cmd.push(' CFG=\\\"/etc/openvpn/' + interface + '\\\"');
	cmd.push('fi');
	cmd.push('uci set openvpn.' + section + '.config=$CFG');
	cmd.push('cat /tmp/' + interface + ' > $CFG');
	cmd.push('rm /tmp/' + interface);

	if (getValue('vpn_openvpn_lanto')) {
		cmd.push('uci set firewall.' + interface + '=zone');
		cmd.push('uci set firewall.' + interface + '.name=' + interface);
		cmd.push('uci -q del firewall.' + interface + '.network');
		cmd.push('uci add_list firewall.' + interface + '.network=' + interface);
		cmd.push('uci set firewall.' + interface + '.input=REJECT');
		cmd.push('uci set firewall.' + interface + '.output=ACCEPT');
		cmd.push('uci set firewall.' + interface + '.forward=REJECT');
		cmd.push('uci set firewall.' + interface + '.masq=1');
		cmd.push('uci set firewall.' + interface + '.mtu_fix=1');
		cmd.push('uci set firewall.f1' + interface + '=forwarding');
		cmd.push('uci set firewall.f1' + interface + '.src=lan');
		cmd.push('uci set firewall.f1' + interface + '.dest=' + interface);
		cmd.push('uci set firewall.f2' + interface + '=forwarding');
		cmd.push('uci set firewall.f2' + interface + '.dest=lan');
		cmd.push('uci set firewall.f2' + interface + '.src=' + interface);
	} else {
		cmd.push('uci -q del firewall.' + interface);
		cmd.push('uci -q del firewall.f1' + interface);
		cmd.push('uci -q del firewall.f2' + interface);
	}

	if (getValue('vpn_openvpn_button')) {
		cmd.push('uci set easyconfig.vpn=button');
		cmd.push('uci set easyconfig.vpn.interface=' + interface);
	} else {
		cmd.push('T=$(uci -q get easyconfig.vpn.interface)');
		cmd.push('if [ \\\"x$T\\\" = \\\"x' + interface + '\\\" ]; then');
		cmd.push(' uci -q del easyconfig.vpn.interface');
		cmd.push('fi');
	}

	switch (parseInt(getValue('vpn_openvpn_auto'))) {
		case 0:
			cmd.push('uci set openvpn.' + section + '.enabled=0');
			cmd.push('uci -q del openvpn.' + section + '.trigger');
			break;
		case 1:
			cmd.push('uci set openvpn.' + section + '.enabled=1');
			cmd.push('uci -q del openvpn.' + section + '.trigger');
			break;
		case 2:
			cmd.push('uci set openvpn.' + section + '.enabled=0');
			cmd.push('uci set openvpn.' + section + '.trigger=wan');
			break;
	}

	cmd.push('uci commit');
	cmd.push('ubus call network reload');
	cmd.push('/etc/init.d/openvpn restart');

	execute(cmd, showvpn);
}

function cancelpptp() {
	setDisplay('div_vpn_pptp', false);
}

function removepptp() {
	cancelpptp();
	setValue('dialog_val', getValue('vpn_pptp_interface'));
	showDialog('Usunąć VPN "' + getValue('vpn_pptp_name') + '" (typu ' + vpntype('pptp') + ')?', 'Anuluj', 'Usuń', okremovevpn);
}

function okremovevpn() {
	var cmd = [];
	var interface = getValue('dialog_val');
	cmd.push('ifdown ' + interface);
	cmd.push('uci -q del network.' + interface);
	cmd.push('uci -q del firewall.' + interface);
	cmd.push('uci -q del firewall.f1' + interface);
	cmd.push('uci -q del firewall.f2' + interface);
	cmd.push('uci commit');
	cmd.push('reload_config');
	cmd.push('ubus call network reload');

	execute(cmd, showvpn);
}

function savepptp() {
	var cmd = [];

	setValue('vpn_pptp_error', '');
	if (getValue('vpn_pptp_name') == '') {
		setValue('vpn_pptp_error', 'Błąd w polu ' + getLabelText('vpn_pptp_name'));
		return;
	}
	if (validateHost(getValue('vpn_pptp_server')) != 0) {
		setValue('vpn_pptp_error', 'Błąd w polu ' + getLabelText('vpn_pptp_server'));
		return;
	}

	cancelpptp();

	var interface = getValue('vpn_pptp_interface');
	cmd.push('uci set network.' + interface + '=interface');
	cmd.push('uci set network.' + interface + '.proto=pptp');
	cmd.push('uci set network.' + interface + '.name=\\\"' + escapeShell(getValue('vpn_pptp_name')) + '\\\"');
	cmd.push('uci set network.' + interface + '.server=\\\"' + getValue('vpn_pptp_server') + '\\\"');
	cmd.push('uci set network.' + interface + '.username=\\\"' + escapeShell(getValue('vpn_pptp_username')) + '\\\"');
	cmd.push('uci set network.' + interface + '.password=\\\"' + escapeShell(getValue('vpn_pptp_password')) + '\\\"');
	if (getValue('vpn_pptp_mppe')) {
		cmd.push('uci -q del network.' + interface + '.pppd_options');
	} else {
		cmd.push('uci set network.' + interface + '.pppd_options=\\\"nomppe\\\"');
	}

	if (getValue('vpn_pptp_lanto')) {
		cmd.push('uci set firewall.' + interface + '=zone');
		cmd.push('uci set firewall.' + interface + '.name=' + interface);
		cmd.push('uci -q del firewall.' + interface + '.network');
		cmd.push('uci add_list firewall.' + interface + '.network=' + interface);
		cmd.push('uci set firewall.' + interface + '.input=REJECT');
		cmd.push('uci set firewall.' + interface + '.output=ACCEPT');
		cmd.push('uci set firewall.' + interface + '.forward=REJECT');
		cmd.push('uci set firewall.' + interface + '.masq=1');
		cmd.push('uci set firewall.' + interface + '.mtu_fix=1');
		cmd.push('uci set firewall.f1' + interface + '=forwarding');
		cmd.push('uci set firewall.f1' + interface + '.src=lan');
		cmd.push('uci set firewall.f1' + interface + '.dest=' + interface);
		cmd.push('uci set firewall.f2' + interface + '=forwarding');
		cmd.push('uci set firewall.f2' + interface + '.dest=lan');
		cmd.push('uci set firewall.f2' + interface + '.src=' + interface);
	} else {
		cmd.push('uci -q del firewall.' + interface);
		cmd.push('uci -q del firewall.f1' + interface);
		cmd.push('uci -q del firewall.f2' + interface);
	}

	if (getValue('vpn_pptp_button')) {
		cmd.push('uci set easyconfig.vpn=button');
		cmd.push('uci set easyconfig.vpn.interface=' + interface);
	} else {
		cmd.push('T=$(uci -q get easyconfig.vpn.interface)');
		cmd.push('if [ \\\"x$T\\\" = \\\"x' + interface + '\\\" ]; then');
		cmd.push(' uci -q del easyconfig.vpn.interface');
		cmd.push('fi');
	}

	switch (parseInt(getValue('vpn_pptp_auto'))) {
		case 0:
			cmd.push('uci set network.' + interface + '.auto=0');
			cmd.push('uci -q del network.' + interface + '.trigger');
			cmd.push('uci commit');
			cmd.push('ubus call network reload');
			cmd.push('ifdown ' + interface );
			break;
		case 1:
			cmd.push('uci -q del network.' + interface + '.auto');
			cmd.push('uci -q del network.' + interface + '.trigger');
			cmd.push('uci commit');
			cmd.push('ubus call network reload');
			cmd.push('ifup ' + interface);
			break;
		case 2:
			cmd.push('uci set network.' + interface + '.auto=0');
			cmd.push('uci set network.' + interface + '.trigger=wan');
			cmd.push('uci commit');
			cmd.push('ubus call network reload');
			cmd.push('ifdown ' + interface );
			break;
	}

	execute(cmd, showvpn);
}

function cancelsstp() {
	setDisplay('div_vpn_sstp', false);
}

function removesstp() {
	cancelsstp();
	setValue('dialog_val', getValue('vpn_sstp_interface'));
	showDialog('Usunąć VPN "' + getValue('vpn_sstp_name') + '" (typu ' + vpntype('sstp') + ')?', 'Anuluj', 'Usuń', okremovevpn);
}

function savesstp() {
	var cmd = [];

	setValue('vpn_sstp_error', '');
	if (getValue('vpn_sstp_name') == '') {
		setValue('vpn_sstp_error', 'Błąd w polu ' + getLabelText('vpn_sstp_name'));
		return;
	}
	if (validateHost(getValue('vpn_sstp_server')) != 0) {
		setValue('vpn_sstp_error', 'Błąd w polu ' + getLabelText('vpn_sstp_server'));
		return;
	}

	cancelsstp();

	var interface = getValue('vpn_sstp_interface');
	cmd.push('uci set network.' + interface + '=interface');
	cmd.push('uci set network.' + interface + '.proto=sstp');
	cmd.push('uci set network.' + interface + '.name=\\\"' + escapeShell(getValue('vpn_sstp_name')) + '\\\"');
	cmd.push('uci set network.' + interface + '.server=\\\"' + getValue('vpn_sstp_server') + '\\\"');
	cmd.push('uci set network.' + interface + '.username=\\\"' + escapeShell(getValue('vpn_sstp_username')) + '\\\"');
	cmd.push('uci set network.' + interface + '.password=\\\"' + escapeShell(getValue('vpn_sstp_password')) + '\\\"');

	if (getValue('vpn_sstp_lanto')) {
		cmd.push('uci set firewall.' + interface + '=zone');
		cmd.push('uci set firewall.' + interface + '.name=' + interface);
		cmd.push('uci -q del firewall.' + interface + '.network');
		cmd.push('uci add_list firewall.' + interface + '.network=' + interface);
		cmd.push('uci set firewall.' + interface + '.input=REJECT');
		cmd.push('uci set firewall.' + interface + '.output=ACCEPT');
		cmd.push('uci set firewall.' + interface + '.forward=REJECT');
		cmd.push('uci set firewall.' + interface + '.masq=1');
		cmd.push('uci set firewall.' + interface + '.mtu_fix=1');
		cmd.push('uci set firewall.f1' + interface + '=forwarding');
		cmd.push('uci set firewall.f1' + interface + '.src=lan');
		cmd.push('uci set firewall.f1' + interface + '.dest=' + interface);
		cmd.push('uci set firewall.f2' + interface + '=forwarding');
		cmd.push('uci set firewall.f2' + interface + '.dest=lan');
		cmd.push('uci set firewall.f2' + interface + '.src=' + interface);
	} else {
		cmd.push('uci -q del firewall.' + interface);
		cmd.push('uci -q del firewall.f1' + interface);
		cmd.push('uci -q del firewall.f2' + interface);
	}

	if (getValue('vpn_sstp_button')) {
		cmd.push('uci set easyconfig.vpn=button');
		cmd.push('uci set easyconfig.vpn.interface=' + interface);
	} else {
		cmd.push('T=$(uci -q get easyconfig.vpn.interface)');
		cmd.push('if [ \\\"x$T\\\" = \\\"x' + interface + '\\\" ]; then');
		cmd.push(' uci -q del easyconfig.vpn.interface');
		cmd.push('fi');
	}

	switch (parseInt(getValue('vpn_sstp_auto'))) {
		case 0:
			cmd.push('uci set network.' + interface + '.auto=0');
			cmd.push('uci -q del network.' + interface + '.trigger');
			cmd.push('uci commit');
			cmd.push('ubus call network reload');
			cmd.push('ifdown ' + interface );
			break;
		case 1:
			cmd.push('uci -q del network.' + interface + '.auto');
			cmd.push('uci -q del network.' + interface + '.trigger');
			cmd.push('uci commit');
			cmd.push('ubus call network reload');
			cmd.push('ifup ' + interface);
			break;
		case 2:
			cmd.push('uci set network.' + interface + '.auto=0');
			cmd.push('uci set network.' + interface + '.trigger=wan');
			cmd.push('uci commit');
			cmd.push('ubus call network reload');
			cmd.push('ifdown ' + interface );
			break;
	}

	execute(cmd, showvpn);
}

function addwireguardkeys(privkey) {
	ubus_call('"easyconfig", "getwireguardkeys", {"privkey":"' + privkey + '"}', function(data) {
		setValue('vpn_wireguard_privkey', data.privkey);
		setValue('vpn_wireguard_pubkey', data.pubkey);
	});
}

function cancelwireguard() {
	setDisplay('div_vpn_wireguard', false);
}

function addwireguardips() {
	var idx = getValue('vpn_wireguard_ips');
	if (idx == '') { idx = 0; }
	var html = ('<div id="div_vpn_wireguard_ips_idx">' + document.getElementById('div_vpn_wireguard_ips_template').innerHTML + '</div>').replaceAll('_idx', '_' + idx);
	document.getElementById('vpn_wireguard_ips_content').insertAdjacentHTML('beforeend', html);
	idx++;
	setValue('vpn_wireguard_ips', idx);
}

function removewireguardips(idx) {
	document.getElementById('div_vpn_wireguard_ips' + idx).remove();
}

function addwireguardpeer(withallowedip) {
	var idx = getValue('vpn_wireguard_peers');
	if (idx == '') { idx = 0; }
	var html = ('<div id="div_vpn_wireguard_peer_idx">' + document.getElementById('div_vpn_wireguard_peer_template').innerHTML + '</div>').replaceAll('_idx', "_" + idx);
	document.getElementById('vpn_wireguard_peers_content').insertAdjacentHTML('beforeend', html);
	if (withallowedip) { addwireguardallowedips('_' + idx); }
	setValue('vpn_wireguard_enabled_' + idx, true);
	idx++;
	setValue('vpn_wireguard_peers', idx);
}

function removewireguardpeer(idx) {
	document.getElementById('div_vpn_wireguard_peer' + idx).remove();
}

function addwireguardallowedips(idx) {
	var idy = getValue('vpn_wireguard_allowed_ips' + idx);
	if (idy == '') { idy = 0; }
	var html = ('<div id="div_vpn_wireguard_allowed_ips' + idx + '_' + idy + '">' + document.getElementById('div_vpn_wireguard_allowed_ips_idx_template').innerHTML + '</div>').replaceAll('_idx', idx).replaceAll('_idy', '_' + idy);
	document.getElementById('vpn_wireguard_allowed_ips' + idx + '_content').insertAdjacentHTML('beforeend', html);
	setValue('vpn_wireguard_allowed_ips' + idx + '_' + idy, '0.0.0.0/0');
	idy++;
	setValue('vpn_wireguard_allowed_ips' + idx, idy);
}

function removewireguardallowedips(idx) {
	document.getElementById('div_vpn_wireguard_allowed_ips' + idx).remove();
}

function removewireguard() {
	cancelwireguard();
	setValue('dialog_val', getValue('vpn_wireguard_interface'));
	showDialog('Usunąć ten VPN (typu ' + vpntype('wireguard') + ')?', 'Anuluj', 'Usuń', okremovewireguard);
}

function okremovewireguard() {
	var cmd = [];

	var interface = getValue('dialog_val');
	cmd.push('ifdown ' + interface);
	cmd.push('uci -q del network.' + interface);
	cmd.push('T=$(uci show network | awk -F [=.] \'/=wireguard_' + interface + '/{print $2}\' | sort -r)');
	cmd.push('for i in $T; do uci -q del network.$i; done');
	cmd.push('uci -q del firewall.' + interface);
	cmd.push('uci -q del firewall.f1' + interface);
	cmd.push('uci -q del firewall.f2' + interface);
	cmd.push('uci -q del firewall.r' + interface);
	cmd.push('uci commit');
	cmd.push('reload_config');
	cmd.push('ubus call network reload');

	execute(cmd, showvpn);
}

function savewireguard() {
	var cmd = [];

	setValue('vpn_wireguard_error', '');
	if (validateLengthRange(getValue('vpn_wireguard_privkey'), 44, 44) != 0) {
		setValue('vpn_wireguard_error', 'Błąd w polu ' + getLabelText('vpn_wireguard_privkey'));
		return;
	}
	if (validateLengthRange(getValue('vpn_wireguard_pubkey'), 44, 44) != 0) {
		setValue('vpn_wireguard_error', 'Błąd w polu ' + getLabelText('vpn_wireguard_pubkey') + '<br>Klucz prywatny ma nieprawidłową długość lub format');
		return;
	}
	var tmp = getValue('vpn_wireguard_port');
	if (tmp != '') {
		if (validateNumericRange(tmp, 0, 65535) != 0) {
			setValue('vpn_wireguard_error', 'Błąd w polu ' + getLabelText('vpn_wireguard_port'));
			return;
		}
	}

	var cnt = getValue('vpn_wireguard_ips');
	for (var idx = 0; idx < cnt; idx++) {
		e = document.getElementById('vpn_wireguard_ips_' + idx);
		if (e) {
			if (validateIPWithMask(e.value) != 0) {
				setValue('vpn_wireguard_error', 'Błąd w polu ' + getLabelText('vpn_wireguard_ips_' + idx));
				return;
			}
		}
	}

	cnt = getValue('vpn_wireguard_peers');
	for (var idx = 0; idx < cnt; idx++) {
		e = document.getElementById('vpn_wireguard_description_' + idx);
		if (!e) { continue; }

		if (validateLengthRange(e.value, 1, 255) != 0) {
			setValue('vpn_wireguard_error', 'Błąd w polu ' + getLabelText('vpn_wireguard_description_' + idx));
			return;
		}
		if (validateLengthRange(getValue('vpn_wireguard_pubkey_' + idx), 44, 44) != 0) {
			setValue('vpn_wireguard_error', 'Błąd w polu ' + getLabelText('vpn_wireguard_pubkey_' + idx));
			return;
		}
		tmp = getValue('vpn_wireguard_pskey_' + idx);
		if (tmp != '') {
			if (validateLengthRange(tmp, 44, 44) != 0) {
				setValue('vpn_wireguard_error', 'Błąd w polu ' + getLabelText('vpn_wireguard_pskey_' + idx));
				return;
			}
		}
		tmp = getValue('vpn_wireguard_endpoint_host_' + idx);
		if (tmp != '') {
			if (validateHost(tmp) != 0) {
				setValue('vpn_wireguard_error', 'Błąd w polu ' + getLabelText('vpn_wireguard_endpoint_host_' + idx));
				return;
			}
		}
		tmp = getValue('vpn_wireguard_endpoint_port_' + idx);
		if (tmp != '') {
			if (validateNumericRange(tmp, 0, 65535) != 0) {
				setValue('vpn_wireguard_error', 'Błąd w polu ' + getLabelText('vpn_wireguard_endpoint_port_' + idx));
				return;
			}
		}
		var cnt1 = getValue('vpn_wireguard_allowed_ips_' + idx);
		for (var idy = 0; idy < cnt1; idy++) {
			e = document.getElementById('vpn_wireguard_allowed_ips_' + idx + '_' + idy);
			if (e) {
				if (validateIPWithMask(e.value) != 0) {
					setValue('vpn_wireguard_error', 'Błąd w polu ' + getLabelText('vpn_wireguard_allowed_ips_' + idx + '_' + idy));
					return;
				}
			}
		}
	}

	cancelwireguard();

	var interface = getValue('vpn_wireguard_interface');
	cmd.push('uci set network.' + interface + '=interface');
	cmd.push('uci set network.' + interface + '.proto=wireguard');
	cmd.push('uci set network.' + interface + '.private_key=\\\"' + getValue('vpn_wireguard_privkey') + '\\\"');
	var port = getValue('vpn_wireguard_port');
	if (port != '') {
		cmd.push('uci set network.' + interface + '.listen_port=' + port);
		cmd.push('uci set firewall.r' + interface + '=rule');
		cmd.push('uci set firewall.r' + interface + '.name=' + interface);
		cmd.push('uci set firewall.r' + interface + '.src=wan');
		cmd.push('uci set firewall.r' + interface + '.target=ACCEPT');
		cmd.push('uci set firewall.r' + interface + '.proto=udp');
		cmd.push('uci set firewall.r' + interface + '.dest_port=' + port);
	} else {
		cmd.push('uci -q del firewall.r' + interface);
	}
	cmd.push('uci -q del network.' + interface + '.addresses');

	cnt = getValue('vpn_wireguard_ips');
	for (var idx = 0; idx < cnt; idx++) {
		e = document.getElementById('vpn_wireguard_ips_' + idx);
		if (e) {
			cmd.push('uci add_list network.' + interface + '.addresses=' + getValue('vpn_wireguard_ips_' + idx));
		}
	}

	cmd.push('T=$(uci show network | awk -F [=.] \'/=wireguard_' + interface + '/{print $2}\' | sort -r)');
	cmd.push('for i in $T; do uci -q del network.$i; done');

	cnt = getValue('vpn_wireguard_peers');
	for (var idx = 0; idx < cnt; idx++) {
		e = document.getElementById('vpn_wireguard_description_' + idx);
		if (!e) { continue; }

		cmd.push('uci add network wireguard_' + interface);
		if (getValue('vpn_wireguard_enabled_' + idx) == false) {
			cmd.push('uci set network.@wireguard_' + interface + '[-1].disabled=1');
		}
		cmd.push('uci set network.@wireguard_' + interface + '[-1].description=\\\"' + escapeShell(getValue('vpn_wireguard_description_' + idx)) + '\\\"');
		cmd.push('uci set network.@wireguard_' + interface + '[-1].public_key=\\\"' + getValue('vpn_wireguard_pubkey_' + idx) + '\\\"');
		cmd.push('uci set network.@wireguard_' + interface + '[-1].preshared_key=\\\"' + getValue('vpn_wireguard_pskey_' + idx) + '\\\"');
		cmd.push('uci set network.@wireguard_' + interface + '[-1].endpoint_host=\\\"' + getValue('vpn_wireguard_endpoint_host_' + idx) + '\\\"');
		cmd.push('uci set network.@wireguard_' + interface + '[-1].endpoint_port=\\\"' + getValue('vpn_wireguard_endpoint_port_' + idx) + '\\\"');
		cmd.push('uci set network.@wireguard_' + interface + '[-1].persistent_keepalive=25');
		cmd.push('uci set network.@wireguard_' + interface + '[-1].route_allowed_ips=1');

		cnt1 = getValue('vpn_wireguard_allowed_ips_' + idx);
		for (var idy = 0; idy < cnt1; idy++) {
			e = document.getElementById('vpn_wireguard_allowed_ips_' + idx + '_' + idy);
			if (e) {
				cmd.push('uci add_list network.@wireguard_' + interface + '[-1].allowed_ips=' + e.value);
			}
		}
	}

	if (getValue('vpn_wireguard_lanto')) {
		cmd.push('uci set firewall.' + interface + '=zone');
		cmd.push('uci set firewall.' + interface + '.name=' + interface);
		cmd.push('uci -q del firewall.' + interface + '.network');
		cmd.push('uci add_list firewall.' + interface + '.network=' + interface);
		cmd.push('uci set firewall.' + interface + '.input=REJECT');
		cmd.push('uci set firewall.' + interface + '.output=ACCEPT');
		cmd.push('uci set firewall.' + interface + '.forward=REJECT');
		cmd.push('uci set firewall.' + interface + '.masq=1');
		cmd.push('uci set firewall.' + interface + '.mtu_fix=1');
		cmd.push('uci set firewall.f1' + interface + '=forwarding');
		cmd.push('uci set firewall.f1' + interface + '.src=lan');
		cmd.push('uci set firewall.f1' + interface + '.dest=' + interface);
		cmd.push('uci set firewall.f2' + interface + '=forwarding');
		cmd.push('uci set firewall.f2' + interface + '.dest=lan');
		cmd.push('uci set firewall.f2' + interface + '.src=' + interface);
	} else {
		cmd.push('uci -q del firewall.' + interface);
		cmd.push('uci -q del firewall.f1' + interface);
		cmd.push('uci -q del firewall.f2' + interface);
	}

	if (getValue('vpn_wireguard_button')) {
		cmd.push('uci set easyconfig.vpn=button');
		cmd.push('uci set easyconfig.vpn.interface=' + interface);
	} else {
		cmd.push('T=$(uci -q get easyconfig.vpn.interface)');
		cmd.push('if [ \\\"x$T\\\" = \\\"x' + interface + '\\\" ]; then');
		cmd.push(' uci -q del easyconfig.vpn.interface');
		cmd.push('fi');
	}

	switch (parseInt(getValue('vpn_wireguard_auto'))) {
		case 0:
			cmd.push('uci set network.' + interface + '.auto=0');
			cmd.push('uci -q del network.' + interface + '.trigger');
			cmd.push('uci commit');
			cmd.push('ubus call network reload');
			cmd.push('ifdown ' + interface );
			break;
		case 1:
			cmd.push('uci -q del network.' + interface + '.auto');
			cmd.push('uci -q del network.' + interface + '.trigger');
			cmd.push('uci commit');
			cmd.push('ubus call network reload');
			cmd.push('ifup ' + interface);
			break;
		case 2:
			cmd.push('uci set network.' + interface + '.auto=0');
			cmd.push('uci set network.' + interface + '.trigger=wan');
			cmd.push('uci commit');
			cmd.push('ubus call network reload');
			cmd.push('ifdown ' + interface );
			break;
	}

	execute(cmd, showvpn);
}

function cancelzerotier() {
	setDisplay('div_vpn_zerotier', false);
}

function addzerotiernetwork() {
	var idx = getValue('vpn_zerotier_network');
	if (idx == '') { idx = 0; }
	var html = ('<div id="div_vpn_zerotier_network_idx">' + document.getElementById('div_vpn_zerotier_network_template').innerHTML + '</div>').replaceAll('_idx', '_' + idx);
	document.getElementById('vpn_zerotier_network_content').insertAdjacentHTML('beforeend', html);
	idx++;
	setValue('vpn_zerotier_network', idx);
}

function removezerotiernetwork(idx) {
	document.getElementById('div_vpn_zerotier_network' + idx).remove();
}

function removezerotier() {
	cancelzerotier();
	setValue('dialog_val', getValue('vpn_zerotier_section'));
	showDialog('Usunąć VPN "' + getValue('vpn_zerotier_name') + '" (typu ' + vpntype('zerotier') + ')?', 'Anuluj', 'Usuń', okremovezerotier);
}

function okremovezerotier() {
	var cmd = [];

	cmd.push('uci -q del zerotier.' + getValue('dialog_val'));
	cmd.push('uci commit');
	cmd.push('/etc/init.d/zerotier restart');

	execute(cmd, showvpn);
}

function savezerotier() {
	var cmd = [];

	setValue('vpn_zerotier_error', '');
	if (getValue('vpn_zerotier_name') == '') {
		setValue('vpn_zerotier_error', 'Błąd w polu ' + getLabelText('vpn_zerotier_name'));
		return;
	}
	var cnt = getValue('vpn_zerotier_network');
	for (var idx = 0; idx < cnt; idx++) {
		e = document.getElementById('vpn_zerotier_network_' + idx);
		if (e) {
				if (validateLengthRange(getValue('vpn_zerotier_network_' + idx), 16, 16) != 0) {
					setValue('vpn_zerotier_error', 'Błąd w polu ' + getLabelText('vpn_zerotier_network_' + idx));
					return;
				}
		}
	}

	cancelzerotier();

	var section = getValue('vpn_zerotier_section');
	cmd.push('uci set zerotier.' + section + '=zerotier');
	cmd.push('uci set zerotier.' + section + '.name=\\\"' + escapeShell(getValue('vpn_zerotier_name')) + '\\\"');
	cmd.push('uci set zerotier.' + section + '.enabled=' + (getValue('vpn_zerotier_enabled') ? '1' : '0'));

	cmd.push('uci -q del zerotier.' + section + '.join');
	var cnt = getValue('vpn_zerotier_network');
	for (var idx = 0; idx < cnt; idx++) {
		e = document.getElementById('vpn_zerotier_network_' + idx);
		if (e) {
			cmd.push('uci add_list zerotier.' + section + '.join=' + getValue('vpn_zerotier_network_' + idx));
		}
	}

	cmd.push('uci commit');
	cmd.push('/etc/init.d/zerotier restart');

	execute(cmd, showvpn);
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

var adblock_lists;

function showadblock() {
	ubus_call('"easyconfig", "adblock", {}', function(data) {
		if (config.services.adblock) {
			setDisplay('div_adblock_adblock', true);
			document.getElementById('btn_adblock_check').style.display = 'inline-block';
			var tmp = data.domains == '' ? '-' : data.domains
			if (data.domains == '0') {
				if (data.status == 'running') { tmp += ' (trwa uruchamianie)' }
			}
			setValue('adblock_domains', tmp);
			setValue('adblock_enabled', data.enabled);
			setValue('adblock_forcedns', data.forcedns);

			adblock_lists = data.lists;
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
				html += '<span class="hidden-xs control-label labelleft">Kategoria: ' + adblock_lists[i].focus + ', wielkość: ' + adblock_lists[i].size + ', <a href="' + adblock_lists[i].descurl + '" class="click" target="_blank">opis &rarr;</a></span>';
				html += '<div class="visible-xs">Kategoria: ' + adblock_lists[i].focus + ', wielkość: ' + adblock_lists[i].size + ', <a href="' + adblock_lists[i].descurl + '" class="click" target="_blank">opis &rarr;</a></div>';
				html += '</div>';
				if (adblock_lists[i].section == 'blacklist') {
					if (!adblock_lists[i].enabled) {
						if ((data.blacklist).length > 0) {
							html += '<div class="col-xs-4 col-sm-3 control-label">&nbsp;</div>';
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
		} else {
			setDisplay('div_adblock_easyconfig', true);
		}

		html = '';
		var blacklist = data.blacklist;
		if (blacklist.length > 0) {
			for (var idx = 0; idx < blacklist.length; idx++) {
				html += '<div class="row">';
				html += '<div class="col-xs-9">' + blacklist[idx] + '</div>';
				html += '<div class="col-xs-3 text-right"><span class="click" title="usuń" onclick="removefromblacklist(\'' + blacklist[idx] + '\');"><i data-feather="trash-2"></i></span></div>';
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
				html += '<div class="col-xs-3 text-right"><span class="click" title="usuń" onclick="removefromwhitelist(\'' + whitelist[idx] + '\');"><i data-feather="trash-2"></i></span></div>';
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
	cmd.push('uci -q del adblock.global.adb_sources');
	for (var idx in adblock_lists) {
		if (getValue('adblock_' + adblock_lists[idx].section)) {
			cmd.push('uci add_list adblock.global.adb_sources=' + adblock_lists[idx].section);
		}
	}

	if (getValue('adblock_forcedns')) {
		cmd.push('uci set firewall.dns_53_redirect=redirect');
		cmd.push('uci set firewall.dns_53_redirect.name=\\\"Adblock DNS, port 53\\\"');
		cmd.push('uci set firewall.dns_53_redirect.src=lan');
		cmd.push('uci set firewall.dns_53_redirect.proto=\\\"tcp udp\\\"');
		cmd.push('uci set firewall.dns_53_redirect.src_dport=53');
		cmd.push('uci set firewall.dns_53_redirect.dest_port=53');
		cmd.push('uci set firewall.dns_53_redirect.target=DNAT');
	} else {
		cmd.push('uci -q del firewall.dns_53_redirect');
	}

	cmd.push('uci commit');
	cmd.push('/etc/init.d/firewall restart');
	cmd.push('/etc/init.d/adblock restart');

	execute(cmd, showadblock);
}

function saveadblock_easyconfig() {
	var cmd = [];

	if (getValue('adblock_enabled_easyconfig')) {
		cmd.push('/etc/init.d/easyconfig_adblock enable');
		cmd.push('/etc/init.d/easyconfig_adblock start');
	} else {
		cmd.push('/etc/init.d/easyconfig_adblock disable');
		cmd.push('/etc/init.d/easyconfig_adblock stop');
	}

	execute(cmd, showadblock);
}

function checkdomain() {
	if (!getValue('adblock_enabled')) {
		showMsg("Blokada domen jest wyłączona. Nie można sprawdzić domeny");
		return
	}

	if (checkField('adblock_domain', validateHost)) {return;}

	ubus_call('"file", "exec", {"command":"/etc/init.d/adblock","params":["query","' + getValue('adblock_domain') + '"]}', function(data) {
		if (data.stdout) {
			showMsg((data.stdout).replace(/\n/g,'<br>'));
		}
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
	if (config.services.adblock) {
		cmd.push('/etc/init.d/adblock restart');
	} else {
		if (getValue('adblock_enabled_easyconfig')) {
			cmd.push('/etc/init.d/easyconfig_adblock start');
		}
	}

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
	if (config.services.adblock) {
		cmd.push('/etc/init.d/adblock restart');
	} else {
		if (getValue('adblock_enabled_easyconfig')) {
			cmd.push('/etc/init.d/easyconfig_adblock start');
		}
	}

	execute(cmd, showadblock);
}

function whitelistdomain() {
	if (checkField('adblock_domain', validateHost)) {return;}

	var domain = getValue('adblock_domain');

	var cmd = [];
	cmd.push('F=/etc/adblock/adblock.whitelist');
	cmd.push('mkdir -p $(dirname $F)');
	cmd.push('echo \\\"' + domain + '\\\" >> $F');
	if (config.services.adblock) {
		cmd.push('/etc/init.d/adblock restart');
	} else {
		if (getValue('adblock_enabled_easyconfig')) {
			cmd.push('/etc/init.d/easyconfig_adblock start');
		}
	}

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
	if (config.services.adblock) {
		cmd.push('/etc/init.d/adblock restart');
	} else {
		if (getValue('adblock_enabled_easyconfig')) {
			cmd.push('/etc/init.d/easyconfig_adblock start');
		}
	}

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
		cmd.push('ubus call easyconfig leds \'{\\\"action\\\":\\\"on\\\"}\'');
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

function btn_nightmode_getlocationfromgps() {
	ubus_call('"gps", "info", {}', function(data) {
		if (data.age == undefined) {
			showMsg('Błąd odczytu lokalizacji', true);
		} else {
			setValue('nightmode_led_auto_latitude', data.latitude);
			setValue('nightmode_led_auto_longitude', data.longitude);
		}
	});
}

/*****************************************************************************/

function getDD2DMS(dms, type) {
	function z(n){return (n < 10 ? '0' : '')+ +n;}
	var sign = 1, Abs = 0;
	var degrees, minutes, secounds, direction;

	if (dms < 0) { sign = -1; }
	Abs = Math.abs(Math.round(dms * 1000000.));
	if (type == "lat" && Abs > (90 * 1000000)) {
		return false;
	} else if (type == "lon" && Abs > (180 * 1000000)) {
		return false;
	}

	degrees = Math.floor(Abs / 1000000);
	minutes = Math.floor(((Abs/1000000) - degrees) * 60);
	secounds = ( Math.floor((( ((Abs/1000000) - degrees) * 60) - minutes) * 100000) *60/100000 ).toFixed();
	degrees = degrees * sign;
	if (type == 'lat') direction = degrees < 0 ? 'S' : 'N';
	if (type == 'lon') direction = degrees < 0 ? 'W' : 'E';
	return (degrees * sign) + 'º' + z(minutes) + "'" + z(secounds) + "'' " + direction;
}

var gpsID = null;
var map = null;
function readgps() {
	var marker = null;
	var first = true;

	if (map) {
		map.eachLayer(function (layer) {
			if (layer.options.alt) {
				if (layer.options.alt == 'Marker') {
					map.removeLayer(layer);
				}
			}
		});
	}

	if (gpsID) { clearInterval(gpsID); }
	gpsID = setInterval(function() {
		var e = document.getElementById('gps_fixtime');
		if (!e || e.offsetParent === null) {
			clearInterval(gpsID);
			return;
		}
		ubus_call_nomsg('"gps", "info", {}', function(data) {
			if (data.age == undefined) {
				setValue('gps_fixtime', 'brak sygnału GPS');
				setValue('gps_latitude', '-');
				setValue('gps_latitudedms', '-');
				setValue('gps_longitude', '-');
				setValue('gps_longitudedms', '-');
				setValue('gps_elevation', '-');
				setValue('gps_course', '-');
				setValue('gps_speed', '-');
				first = true;
			} else {
				fixtime = formatDuration(data.age, true) + ' temu';
				if (data.age > 3) {
					fixtime += ' (' + formatDateTime(timestampToDate(Date.now()/1000 - data.age)) +  ')';
				}
				setValue('gps_fixtime', fixtime);
				setValue('gps_latitude', data.latitude);
				setValue('gps_latitudedms', getDD2DMS(data.latitude, 'lat'));
				setValue('gps_longitude', data.longitude);
				setValue('gps_longitudedms', getDD2DMS(data.longitude, 'lon') );
				setValue('gps_elevation', data.elevation + ' m n.p.m.');

				var direction = '';
				if (data.course != '') {
					if (data.course >= 0 && data.course < 22.50) {direction = 'północ';}
					if (data.course >= 22.50 && data.course < 67.50) {direction = 'północny wschód';}
					if (data.course >= 67.50 && data.course < 112.50) {direction = 'wschód';}
					if (data.course >= 112.50 && data.course < 157.50) {direction = 'południowy wschód';}
					if (data.course >= 157.50 && data.course < 202.50) {direction = 'południe';}
					if (data.course >= 202.50 && data.course < 247.50) {direction = 'południowy zachód';}
					if (data.course >= 247.50 && data.course < 337.50) {direction = 'północny zachód';}
					if (data.course >= 337.50 && data.course <= 360) {direction = 'północ';}
				}
				setValue('gps_course', data.course == '' ? '-' : data.course + 'º' + (direction == '' ? '' : ' (' + direction + ')'));
				var speed = '-';
				if (data.speed != '') {
					if (parseFloat(data.speed) < 6.0) {
						speed = parseFloat(data.speed * 1000 / 3600).toFixed(2) + ' m/s';
					} else {
						speed = data.speed + ' km/h';
					}
				}
				setValue('gps_speed', speed);

				if (map) {
					if (marker !== null) {
						map.removeLayer(marker);
					}
					marker = L.marker([data.latitude, data.longitude]).addTo(map);
					map.setView([data.latitude, data.longitude]);
					if (first) {
						map.setZoom(16);
						first = false;
					}
				}
			}
		});
	}, 1000);
}

function showgps() {
	var url = 'https://unpkg.com/leaflet@1.9.4/dist';
	if (!Boolean(document.querySelector('script[src="' + url + '/leaflet.js"]'))) {
		var css = document.createElement('link');
		css.rel = 'stylesheet';
		css.type = 'text/css';
		css.href = url + '/leaflet.css';
		document.getElementsByTagName("head")[0].appendChild(css);

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url + '/leaflet.js';
		document.getElementsByTagName("head")[0].appendChild(script);

		script.onload = function() {
			map = L.map('gps_map').setView([52.114339, 19.423672], 6);
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}).addTo(map);
		}
	}
	readgps();
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
	setDisplay('div_status', (page == 'status'));
	setDisplay('div_config', (page == 'config'));
	setDisplay('div_system', (page == 'system'));
	setDisplay('div_watchdog', (page == 'watchdog'));
	setDisplay('div_sitesurvey', (page == 'sitesurvey'));
	setDisplay('div_clients', (page == 'clients'));
	setDisplay('div_clientslogs', (page == 'clientslogs'));
	setDisplay('div_queries', (page == 'queries'));
	setDisplay('div_traffic', (page == 'traffic'));
	setDisplay('div_ussdsms', (page == 'ussdsms'));
	setDisplay('div_vpn', (page == 'vpn'));
	setDisplay('div_adblock', (page == 'adblock'));
	setDisplay('div_nightmode', (page == 'nightmode'));
	setDisplay('div_gps', (page == 'gps'));

	var clearid = null;
	function waitForData(callback) {
		clearid = window.setInterval(function() {
			if (modem != -1) {
				callback();
			}
		}, 100);
	}

	if (page == 'status') {
		showstatus();
		function readyDataStatus() {
			clearInterval(clearid);
			showmodem();
		}
		waitForData(readyDataStatus);
	}

	if (page == 'config') {
		showconfig();
	}

	if (page == 'system') {
		showsystem();
		function readyDataSystem() {
			clearInterval(clearid);
			showmodeminfo();
		}
		waitForData(readyDataSystem);
	}

	if (page == 'watchdog') {
		showwatchdog();
	}

	if (page == 'sitesurvey') {
		showsitesurvey();
	}

	if (page == 'clients') {
		showclients();
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

	if (page == 'vpn') {
		showvpn();
	}

	if (page == 'adblock') {
		showadblock();
	}

	if (page == 'nightmode') {
		shownightmode();
	}

	if (page == 'gps') {
		showgps();
	}

	if (page == 'logout') {
		logout();
	}

	setCookie('easyconfig_page', page, timeout);
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
				ctx.moveTo(x, livegraph.axisTop + graph.height);
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

staticgraph = {
	axisTop: 4,
	axisRight: 40,
	axisBottom: 40,
	axisLeft: 40,

	getX: function (graph, tick) {
		return (((86400 - (graph.time - tick) / 1000) * graph.width) / 86400) + staticgraph.axisLeft;
	},

	getY: function(graph, tick) {
		return (((1 - tick) * graph.height)) + staticgraph.axisTop;
	},

	plot: function (graph) {
		var ctx = graph.context;
		var data = graph.data;
		ctx.strokeStyle = '#c0c0c0';
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(staticgraph.axisLeft, staticgraph.axisTop);
		ctx.lineTo(staticgraph.axisLeft + graph.width, staticgraph.axisTop);
		ctx.lineTo(staticgraph.axisLeft + graph.width, staticgraph.axisTop + graph.height);
		ctx.lineTo(staticgraph.axisLeft, staticgraph.axisTop + graph.height);
		ctx.lineTo(staticgraph.axisLeft, staticgraph.axisTop);
		ctx.stroke();
		ctx.fillStyle = rgb2hex(window.getComputedStyle(document.body,null).getPropertyValue('color'));

		var oldwidth = 0;
		ctx.textAlign = 'center';
		if (data.length > 0) {
			if (data[0].length > 0) {
				graph.time = data[0][data[0].length - 1][0];
			}
			for (var i = 0; i < data[0].length; i++) {
				var x = staticgraph.getX(graph, data[0][i][0]);
				if (oldwidth < x) {
					var t = new Date(data[0][i][0]);
					var t0 = t.getFullYear() + '-' + ((t.getMonth() + 1) < 10 ? '0' : '') + (t.getMonth() + 1)  + '-' + (t.getDate() < 10 ? '0' : '') + t.getDate();
					var t1 = (t.getHours() < 10 ? '0' : '') + t.getHours()  + ':' + (t.getMinutes() < 10 ? '0' : '') + t.getMinutes() + ':' + (t.getSeconds() < 10 ? '0' : '') + t.getSeconds();
					ctx.fillText(t0, x, staticgraph.axisTop + graph.height + 15);
					ctx.fillText(t1, x, staticgraph.axisTop + graph.height + 35);
					oldwidth = x + ctx.measureText(t0).width + 10;
				}
			}
		}

		function plot1(idx, fill) {
			ctx.beginPath();
			var x = staticgraph.getX(graph, data[idx][0][0]);
			var y = staticgraph.getY(graph, data[idx][0][1]);
			ctx.moveTo(x, staticgraph.axisTop + graph.height);
			ctx.lineTo(x, y);
			for (var i = 1; i < data[idx].length; i++) {
				x = staticgraph.getX(graph, data[idx][i][0]);
				y = staticgraph.getY(graph, data[idx][i][1]);
				ctx.lineTo(x, staticgraph.getY(graph, data[idx][i - 1][1]));
				ctx.lineTo(x, y);
			}
			if (fill) {
				ctx.lineTo(x, staticgraph.axisTop + graph.height);
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

		graph.width = canvas.width - staticgraph.axisRight - staticgraph.axisLeft;
		graph.height = canvas.height - staticgraph.axisTop - staticgraph.axisBottom;

		ctx.font = window.getComputedStyle(document.body,null).getPropertyValue('font-size') + ' ' + window.getComputedStyle(document.body,null).getPropertyValue('font-family');
		graph.context = ctx;

		staticgraph.plot(graph);
	}
};
