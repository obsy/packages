/*****************************************************************************/

function proofreadHostname(input) {
	proofreadText(input, validateHostname, 0);
}

function proofreadHost(input) {
	proofreadText(input, validateHost, 0);
}

function proofreadIp(input) {
	proofreadText(input, validateIP, 0);
}

function proofreadMask(input) {
	proofreadText(input, validateMask, 0);
}

function proofreadText(input, proofFunction, validReturnCode) {
	if (input.disabled != true) {
		if (proofFunction(input.value) == validReturnCode) {
			input.style.color = "#555";
			input.closest('div').className = input.closest('div').className.replace( /(?:^|\s)has-error(?!\S)/g , '' )
		} else {
			input.style.color = "red";
			input.closest('div').className += " has-error";
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

function checkField(element, proofFunction) {
	if (proofFunction(getValue(element)) != 0) {
		showMsg("Błąd w polu " + getLabelText(element), true);
		return true;
	}
	return false;
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

function enableDns(enable) {
	setValue("wan_dns", enable);
	setElementEnabled("wan_dns1", true, !enable);
	setElementEnabled("wan_dns2", true, !enable);
}

function enableWan(proto) {
	var fields = [];
	if ((proto == "static") || (proto == "dhcp") || (proto == "dhcp_hilink")) {
		fields = ["wan_ipaddr","wan_netmask","wan_gateway","wan_dns1","wan_dns2"];
	}
	if ((proto == "3g") || (proto == "qmi") || (proto == "ncm")) {
		fields=["wan_apn","wan_device","wan_pincode","wan_dns1","wan_dns2"];
	}

	var all = ["wan_ipaddr","wan_netmask","wan_gateway","wan_dns","wan_dns1","wan_dns2","wan_pincode","wan_device","wan_apn"];
	for(var idx=0; idx < all.length; idx++) {
		setElementEnabled(all[idx], false, false);
	}
	for(var idx=0; idx < fields.length; idx++) {
		setElementEnabled(fields[idx], true, (proto == "dhcp" || proto == "dhcp_hilink"));
	}
	if (proto != "static" && proto != "none") {
		setElementEnabled("wan_dns", true, false);
		var t = (config.wan_use_dns == 1)
		setValue("wan_dns", t);
		setElementEnabled("wan_dns1", true, !t);
		setElementEnabled("wan_dns2", true, !t);
	}

	setElementEnabled("firewall_dmz", (proto != "none"), false);

	setDisplay("div_status_wan", (proto != "none"));
}

function enableWlanEncryption(encryption, cnt) {
	setElementEnabled("wlan_key"+cnt, (encryption!="none" && encryption!=""), false);
}

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
		e.className += " has-error";
	} else {
		e.style.color = "#555";
		e.className = e.className.replace( /(?:^|\s)has-error(?!\S)/g , '' )
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
	wan['none']="Brak";
	wan['dhcp']="Port WAN (DHCP)";
	wan['static']="Port WAN (Statyczny IP)";
	wan['3g']="Modem USB (RAS)";
	wan['qmi']="Modem USB (QMI)";
	wan['ncm']="Modem USB (NCM)";
	wan['dhcp_hilink']="Modem USB (HiLink lub RNDIS)";

	removeOptions('wan_proto');
	var e = document.getElementById('wan_proto');
	var arr = config.wan_protos;
	for (var idx=0; idx<arr.length; idx++) {
		var opt = document.createElement('option');
		opt.value = arr[idx];
		opt.innerHTML = wan[arr[idx]];
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

	setValue('wan_ipaddr', config.wan_ipaddr);
	setValue('wan_netmask', config.wan_netmask);
	setValue('wan_gateway', config.wan_gateway);
	setValue('wan_apn', config.wan_apn);
	setValue('wan_device', config.wan_device);
	setValue('wan_pincode', config.wan_pincode);
	setValue('wan_dns1', config.wan_dns1);
	setValue('wan_dns2', config.wan_dns2);
	setValue('wan_proto', config.wan_proto);
	if (config.wan_proto=="dhcp") {
		if (config.wan_ifname == config.wan_ifname_hilink) {
			setValue('wan_proto', "dhcp_hilink");
			config.wan_ifname="dhcp_hilink";
		}
	}
	enableWan(getValue("wan_proto"));

	// lan
	setValue('lan_ipaddr', config.lan_ipaddr);
	setValue('lan_dhcp_enabled', (config.lan_dhcp_enabled == 1));
	setValue('dhcp_logqueries', (config.dhcp_logqueries == 1));
	setDisplay("menu_queries", (config.dhcp_logqueries == 1));

	// wlan
	var radios=[];
	if (config.radio0) {radios.push("0");}
	if (config.radio1) {radios.push("1");}

	for (var i = 0; i < radios.length; i++) {
		var is_radio2=false;
		var is_radio5=false;
		removeOptions('wlan_channel' + radios[i]);
		select = document.getElementById('wlan_channel' + radios[i]);
		obj = config["radio" + radios[i]].wlan_channels;
		for(var propt in obj){
			var opt = document.createElement('option');
			opt.value = propt;
			opt.innerHTML = obj[propt];
			select.appendChild(opt);
			if (propt < 36) {is_radio2=true};
			if (propt >= 36) {is_radio5=true};
		}

		if (is_radio2) {setValue('radio' + radios[i], "Wi-Fi 2.4GHz");}
		if (is_radio5) {setValue('radio' + radios[i], "Wi-Fi 5GHz");}
		if (is_radio2 && is_radio5) {setValue('radio' + radios[i], "Wi-Fi 2.4/5GHz");}

		setValue('wlan_enabled' + radios[i], (config["radio" + radios[i]].wlan_disabled != "1"));
		setValue('wlan_channel' + radios[i], config["radio" + radios[i]].wlan_channel);
		setValue('wlan_ssid' + radios[i], config["radio" + radios[i]].wlan_ssid);
		setValue('wlan_encryption' + radios[i], config["radio" + radios[i]].wlan_encryption);
		setValue('wlan_key' + radios[i], config["radio" + radios[i]].wlan_key);
		enableWlanEncryption(config["radio" + radios[i]].wlan_encryption, radios[i])
		setValue('wlan_isolate' + radios[i], config["radio" + radios[i]].wlan_isolate==1);
		setDisplay("div_radio" + radios[i], true);
	}

	// system
	setValue('system_hostname_label', config.system_hostname);
	setValue('system_hostname', config.system_hostname);
	document.title = config.system_hostname;

	// firewall
	setValue('firewall_dmz', config.firewall_dmz);

	// stat
	setDisplay("div_stat", (config.statistics.enabled != -1));
	if (config.statistics.enabled != -1)
		setValue('stat_enabled', (config.statistics.enabled == 1));

	showmodemsection();
}

function saveconfig() {
	var cmd = [];

	cmd.push('#!/bin/sh');

	// wan
	cmd.push('uci -q del network.wan');
	cmd.push('uci set network.wan=interface');

	use_dns = getValue("wan_dns");

	wan_type=getValue('wan_proto');
	if (wan_type=='none') {
		use_dns = false;
	}
	if (wan_type=='static') {
		if (checkField('wan_ipaddr', validateIP)) {return;}
		if (checkField('wan_netmask', validateMask)) {return;}
		if (checkField('wan_gateway', validateIP)) {return;}

		cmd.push('uci set network.wan.ifname='+config.wan_ifname_default);
		cmd.push('uci set network.wan.ipaddr='+getValue('wan_ipaddr'));
		cmd.push('uci set network.wan.netmask='+getValue('wan_netmask'));
		cmd.push('uci set network.wan.gateway='+getValue('wan_gateway'));
		use_dns = true;
	}
	if (wan_type=='3g' || wan_type=='qmi' || wan_type=='ncm') {
		cmd.push('uci set network.wan.apn=\\\"'+getValue('wan_apn')+'\\\"');
		cmd.push('uci set network.wan.device=\\\"'+getValue('wan_device')+'\\\"');
		cmd.push('uci set network.wan.pincode='+getValue('wan_pincode'));
	}
	if (wan_type=='dhcp') {
		cmd.push('uci set network.wan.ifname='+config.wan_ifname_default);
	}
	if (wan_type=='dhcp_hilink') {
		cmd.push('uci set network.wan.ifname='+config.wan_ifname_hilink);
		wan_type='dhcp';
	}
	cmd.push('uci set network.wan.proto='+wan_type);
	config.wan_proto=wan_type;

	if (wan_type == "none") {
		cmd.push('uci -q del firewall.dmz');
	}

	// dns
	if (use_dns) {
		if (checkField('wan_dns1', validateIP)) {return;}
		if (checkField('wan_dns2', validateIP)) {return;}

		cmd.push('uci set network.wan.dns=\\\"'+getValue('wan_dns1')+' '+getValue('wan_dns2')+'\\\"');
		cmd.push('uci set network.wan.peerdns=0');
	} else {
		cmd.push('uci -q del network.wan.dns');
		cmd.push('uci -q del network.wan.peerdns');
	}

	// firewall
	firewall_dmz=getValue("firewall_dmz");
	if (validateIP(firewall_dmz) != 0) {
		if (firewall_dmz != "") {
			showMsg("Błąd w polu " + getLabelText("firewall_dmz"), true);
			return;
		}
	}
	if (firewall_dmz == "") {
		cmd.push('uci -q del firewall.dmz');
	} else {
		cmd.push('uci set firewall.dmz=redirect');
		cmd.push('uci set firewall.dmz.src=wan');
		cmd.push('uci set firewall.dmz.proto=all');
		cmd.push('uci set firewall.dmz.dest_ip='+firewall_dmz);
	}

	// lan
	if (checkField('lan_ipaddr', validateIP)) {return;}
	cmd.push('uci set network.lan.ipaddr='+getValue('lan_ipaddr'));

	if (getValue("lan_dhcp_enabled")) {
		cmd.push('uci -q del dhcp.lan.ignore');
	} else {
		cmd.push('uci set dhcp.lan.ignore=1');
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

	var radios=[];
	if (config.radio0 != null) {radios.push("0");}
	if (config.radio1 != null) {radios.push("1");}

	for (var i = 0; i < radios.length; i++) {

		if (config["radio"+radios[i]].wlan_section == "") {
			wlan_restart_required=true;
			cmd.push('uci add wireless wifi-iface');
			config["radio"+radios[i]].wlan_section="@wifi-iface[-1]"
			cmd.push('uci set wireless.'+config["radio"+radios[i]].wlan_section+'.device=radio'+radios[i]);
			if (!getValue("wlan_enabled"+radios[i])) {
				cmd.push('uci set wireless.'+config["radio"+radios[i]].wlan_section+'.disabled=1');
			}
		}

		if (getValue("wlan_enabled"+radios[i])) {
			if (config["radio"+radios[i]].wlan_disabled === "1") {
				wlan_restart_required=true;
				cmd.push('uci -q del wireless.radio'+radios[i]+'.disabled');
				cmd.push('uci -q del wireless.'+config["radio"+radios[i]].wlan_section+'.disabled');
			}
		} else {
			if (config["radio"+radios[i]].wlan_disabled !== "1") {
				wlan_restart_required=true;
				cmd.push('uci set wireless.radio'+radios[i]+'.disabled=1');
				cmd.push('uci set wireless.'+config["radio"+radios[i]].wlan_section+'.disabled=1');
			}
		}

		wlan_channel=getValue('wlan_channel'+radios[i]);
		if (config["radio"+radios[i]].wlan_channel != wlan_channel) {
			wlan_restart_required=true;
			cmd.push('uci set wireless.radio'+radios[i]+'.channel='+wlan_channel);
			cmd.push('uci set wireless.radio'+radios[i]+'.hwmode=11'+((wlan_channel < 36)?'g':'a'));
		}
		if (config["radio"+radios[i]].wlan_ssid != getValue('wlan_ssid'+radios[i])) {
			wlan_restart_required=true;
			cmd.push('uci set wireless.'+config["radio"+radios[i]].wlan_section+'.ssid=\\\"'+getValue('wlan_ssid'+radios[i])+'\\\"');
		}
		wlan_encryption=getValue('wlan_encryption'+radios[i]);
		if (config["radio"+radios[i]].wlan_encryption != wlan_encryption) {
			wlan_restart_required=true;
			cmd.push('uci set wireless.'+config["radio"+radios[i]].wlan_section+'.encryption=\\\"'+wlan_encryption+'\\\"');
		}
		wlan_key=getValue('wlan_key'+radios[i]);
		if (config["radio"+radios[i]].wlan_key != wlan_key) {
			if (wlan_encryption != "none") {
				if (wlan_key.length < 8) {
					showMsg("Hasło do Wi-Fi musi mieć co najmniej 8 znaków!", true);
					return;
				}
			}
			wlan_restart_required=true;
			cmd.push('uci set wireless.'+config["radio"+radios[i]].wlan_section+'.key=\\\"'+wlan_key+'\\\"');
		}

		if (getValue("wlan_isolate"+radios[i])) {
			if (config["radio"+radios[i]].wlan_isolate !== "1") {
				wlan_restart_required=true;
				cmd.push('uci set wireless.'+config["radio"+radios[i]].wlan_section+'.isolate=1');
			}
		} else {
			if (config["radio"+radios[i]].wlan_isolate === "1") {
				wlan_restart_required=true;
				cmd.push('uci -q del wireless.'+config["radio"+radios[i]].wlan_section+'.isolate');
			}
		}

		if (wlan_restart_required) {
			cmd.push('uci set wireless.'+config["radio"+radios[i]].wlan_section+'.mode=ap');
			cmd.push('uci set wireless.'+config["radio"+radios[i]].wlan_section+'.network=lan');
		}
	}

	// system
	system_hostname=getValue('system_hostname');
	if (checkField('system_hostname', validateHostname)) {return;}

	cmd.push('uci set system.@system[0].hostname=\\\"'+system_hostname+'\\\"');
	setValue('system_hostname_label', system_hostname);
	document.title = system_hostname;

	// stat
	if (config.statistics.enabled != -1) {
		if (getValue("stat_enabled")) {
			if (config.statistics.enabled !== "1") {
				cmd.push('uci set system.@system[0].stat=1');
				cmd.push('/sbin/stat-cron.sh');
			}
		} else {
			if (config.statistics.enabled == "1") {
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

	cmd.push('rm -- \\\"$0\\\"');
	cmd.push('exit 0');
	cmd.push('');

//console.log(cmd);

	ubus_call('"file", "write", {"path":"/tmp/tmp.sh","data":"'+cmd.join('\n')+'"}', function(data) {
		ubus_call('"file", "exec", {"command":"sh", "params":["/tmp/tmp.sh"]}', function(data1) {
			cleanField('password1');
			cleanField('password2');
			showconfig();
		});
	});
}

function showstatistics() {
	var w = window.open('http://dl.eko.one.pl/cgi-bin/router.cgi?token=' + config.statistics.token, '_blank');
	win.focus();
}

/*****************************************************************************/

function showstatus() {
	ubus_call('"easyconfig", "status", { }', function(data) {
		setValue('system_uptime', data.system_uptime);
		setValue('system_load', data.system_load);
		setValue('wlan_clients', data.wlan_clients + ' &rarr;');
		setValue('wan_rx', data.wan_rx);
		setValue('wan_tx', data.wan_tx);
		setValue('wan_uptime', data.wan_uptime);
		setValue('firmware_version', data.version);
		setValue('gui_version', data.gui_version);
		setValue('model', data.model);
	});
}

function showmodem() {
	ubus_call('"easyconfig", "modem", { }', function(data) {
		setValue('modem_signal', data.signal?data.signal + "%":"?");
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
			setValue('modem_registration', '-');
		}
	});
}

function showmodemsection() {
	var wan_type = getValue("wan_proto");
	if (wan_type == '3g' || wan_type == 'qmi' || wan_type == 'ncm') {
		setDisplay("menu_ussdsms", (config.sms_tool == 1));
		setDisplay("div_status_modem", true);
		showmodem();
	} else {
		setDisplay("menu_ussdsms", false);
		setDisplay("div_status_modem", false);
	}
}

/*****************************************************************************/

function btn_system_reboot() {
	ubus('"system", "reboot", {}', function(data) {
		showMsg("Trwa ponownie uruchomienie urządzenia, może to potrwać do trzech minut...", false);
	}, function(status) {
		showMsg("Błąd pobierania danych!", true);
	});
}

/*****************************************************************************/

function showwatchdog() {
	setDisplay("watchdog_enabled_info", (config.wan_proto == "none"));
	setDisplay("div_watchdog_minavgmax", false)

	ubus_call('"easyconfig", "watchdog", { }', function(data) {
		setValue("watchdog_enabled", data.watchdog_enabled);
		setValue("watchdog_dest", data.watchdog_dest);
		setValue("watchdog_period", data.watchdog_period);
		setValue("watchdog_period_count", data.watchdog_period_count);
		setValue("watchdog_delay", data.watchdog_delay);
		setValue("watchdog_action", data.watchdog_action);
		if (data.watchdog_minavgmax != "") {
			setDisplay("div_watchdog_minavgmax", true)
			setValue("watchdog_minavgmax", data.watchdog_minavgmax);
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
	cmd.push('#!/bin/sh');
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

	cmd.push('rm -- \\\"$0\\\"');
	cmd.push('exit 0');
	cmd.push('');

	ubus_call('"file", "write", {"path":"/tmp/tmp.sh","data":"'+cmd.join('\n')+'"}', function(data) {
		ubus_call('"file", "exec", {"command":"sh", "params":["/tmp/tmp.sh"]}', function(data1) {
			showwatchdog();
		});
	});
}

/*****************************************************************************/

function sortJSON(data, key, way) {
	return data.sort(function(a, b) {
		var x = a[key]; var y = b[key];
		if (way === '123' ) { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
		if (way === '321') { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
	});
}

var wifiscanresults;

function showsitesurvey() {
	ubus_call('"file", "exec", {"command":"/bin/sh","params":["/usr/bin/easyconfig_wifiscan.sh"]}', function(data) {
		var arr = JSON.parse((data.stdout).replace(/\\/g,"\\\\"));

		var ts = Date.now()/1000;
		var l = arr.length;
		for (var idx1=0; idx1 < l; idx1++) {
			arr[idx1].timestamp = parseInt(ts).toString();
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
		sitesurveycallback("ssid");
	});
}

function sitesurveycallback(sortby) {
	var div = document.getElementById('div_sitesurvey_content');
	var html = "";
	if (wifiscanresults.length > 1) {
		html += '<div class="row"><div class="col-xs-12">';
		html += '<span>Sortowanie po</span>';
		html += '<a href="#" class="click" onclick="sitesurveycallback(\'ssid\');"><span id="sitesurvey_sortby_ssid"> nazwie </span></a>|';
		html += '<a href="#" class="click" onclick="sitesurveycallback(\'mac\');"><span id="sitesurvey_sortby_mac"> adresie mac </span></a>|';
		html += '<a href="#" class="click" onclick="sitesurveycallback(\'signal\');" ><span id="sitesurvey_sortby_signal"> sile sygnału </span></a>|';
		html += '<a href="#" class="click" onclick="sitesurveycallback(\'freq\');"><span id="sitesurvey_sortby_freq"> kanale </span></a>|';
		html += '<a href="#" class="click" onclick="sitesurveycallback(\'timestamp\');"><span id="sitesurvey_sortby_timestamp"> widoczności </span></a>';
		html += '<div></div><p></p>';

		var ts = Date.now()/1000;
		var sorted = sortJSON(wifiscanresults, sortby, '123');
		for(var idx=0; idx<sorted.length; idx++){
			if (sorted[idx].mac == '') {continue;}
			html += '<hr><div class="row"><div class="col-xs-6"><h4>' + sorted[idx].ssid + '</h4>' + sorted[idx].mac + '<br>widoczność ' + parseInt(ts - sorted[idx].timestamp) + 's temu</div><div class="col-xs-6 text-right">RSSI ' + sorted[idx].signal.replace(/\..*/,"") + ' dBm<br>Kanał ' + sorted[idx].channel + ' (' + sorted[idx].freq + ' MHz)<br>' + (sorted[idx].encryption?'Szyfrowanie ' + sorted[idx].encryption:'') + '</div></div>';
		}
		html += "<hr><p>Liczba sieci bezprzewodowych: " + (sorted.length - 1) + "</p>";
	} else {
		html += '<div class="alert alert-warning">Brak sieci bezprzewodowych lub Wi-Fi jest wyłączone</div>'
	}
	div.innerHTML = html;

	if (wifiscanresults.length > 1) {
		var all=["ssid","mac","signal","freq","timestamp"];
		for(var idx=0; idx<all.length; idx++){
			var e = document.getElementById('sitesurvey_sortby_'+all[idx]);
			e.style.fontWeight = (sortby==all[idx])?700:400;
		}
	}
}

/*****************************************************************************/

function bytesToSize(bytes) {
	var sizes = ['', 'KiB', 'MiB', 'GiB', 'TiB'];
	if (bytes == 0) return '0';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

var wlanclients;

function showwlanclients() {
	ubus_call('"easyconfig", "clients", { }', function(data) {
		wlanclients = data.clients;
		wlanclientscallback("name");
	});
}

function wlanclientscallback(sortby) {
	var div = document.getElementById('div_wlanclients_content');
	var html = "";
	if (wlanclients.length > 1) {
		html += '<div class="row">';
		html += '<div class="col-md-4"><a href="#" class="click" onclick="wlanclientscallback(\'name\');"><span id="wlanclients_sortby_name">Nazwa</span></a></div>';
		html += '<div class="col-xs-3"><a href="#" class="click" onclick="wlanclientscallback(\'tx\');"><span id="wlanclients_sortby_tx">Wysłano</span></a></div>';
		html += '<div class="col-xs-3"><a href="#" class="click" onclick="wlanclientscallback(\'rx\');"><span id="wlanclients_sortby_rx">Pobrano</span></a></div>';
		html += '<div class="col-xs-2">&nbsp;</div>';
		html += '</div><hr>';

		var sorted = sortJSON(wlanclients, sortby, '123');
		for(var idx=0; idx<sorted.length; idx++){
			if (sorted[idx].mac == '') {continue;}
			var name = (sorted[idx].name!=""?sorted[idx].name:sorted[idx].mac);
			html += '<div class="row space">';
			html += '<div class="col-md-4"><a href="#" class="click" onclick="clientnameedit(\'' + sorted[idx].mac + '\',\'' + name + '\');">' + name + '</a></div>';
			html += '<div class="col-xs-3">'+bytesToSize(sorted[idx].tx)+'</div>';
			html += '<div class="col-xs-3">'+bytesToSize(sorted[idx].rx)+'</div>';
			html += '<div class="col-xs-2"><a href="#" class="click" onclick="wlanclientblock(\'' + sorted[idx].mac + '\',\'' + name + '\',\'' + sorted[idx].real_name + '\',\'' + bytesToSize(sorted[idx].tx) + '\',\'' + bytesToSize(sorted[idx].rx) + '\');">blokuj</a></div>';
			html += '</div>';
		}
		html += "<hr><p>Liczba klientów: " + (sorted.length - 1) + "</p>";
	} else {
		html += '<div class="alert alert-warning">Brak połączonych klientów Wi-Fi</div>'
	}
	div.innerHTML = html;

	if (wlanclients.length > 1) {
		var all=["name","tx","rx"];
		for(var idx=0; idx<all.length; idx++){
			var e = document.getElementById('wlanclients_sortby_'+all[idx]);
			e.style.fontWeight = (sortby==all[idx])?700:400;
		}
	}
}

function wlanclientblock(mac, name, realname, tx, rx) {
	setValue('block_host_mac', mac);
	setValue('block_host_realname', realname);
	setValue('block_host_tx', tx);
	setValue('block_host_rx', rx);

	setValue('block_mac', mac);
	setValue('block_name', name);
	setDisplay("div_block", true);
	setValue("block_text", 'Zablokować dostęp do internetu dla "' + name + '"?')
}

function cancelblock() {
	setDisplay("div_block", false);
}

function okblock() {
	cancelblock();
	var mac = getValue('block_mac');
	var name = getValue('block_name');
	ubus_call('"file", "exec", {"command":"iptables","params":["-I","FORWARD","-p","tcp","-m","mac","--mac-source","' + mac + '","-j","REJECT"]}', function(data) {
		showMsg('"' + name + '" stracił dostęp do internetu');
	});
}

function clientnameedit(mac, name) {
	setDisplay("div_clientname", true);
	setValue('clientname_mac', mac);
	setValue('clientname_name', name);
	document.getElementById('clientname_name').focus();
}

function cancelclientname() {
	setDisplay("div_clientname", false);
}

function saveclientname() {
	cancelclientname();

	var mac = getValue('clientname_mac');
	var nmac = mac.replace(/:/g,'');
	var name = getValue('clientname_name');

	var cmd = [];
	cmd.push('#!/bin/sh');
	cmd.push('uci -q del dhcp.m' + nmac);
	cmd.push('uci set dhcp.m' + nmac + '=mac');
	cmd.push('uci set dhcp.m' + nmac + '.mac=\\\"' + mac + '\\\"');
	cmd.push('uci set dhcp.m' + nmac + '.networkid=\\\"' + name +'\\\"');
	cmd.push('uci commit dhcp');
	cmd.push('rm -- \\\"$0\\\"');
	cmd.push('exit 0');
	cmd.push('');

	ubus_call('"file", "write", {"path":"/tmp/tmp.sh","data":"'+cmd.join('\n')+'"}', function(data) {
		ubus_call('"file", "exec", {"command":"sh", "params":["/tmp/tmp.sh"]}', function(data1) {
			showwlanclients();
		});
	});
}

/*****************************************************************************/

function showqueries() {
	ubus_call('"file", "exec", {"command":"/bin/sh","params":["/usr/bin/easyconfig_queries.sh"]}', function(data) {
		queries = JSON.parse((data.stdout).replace(/\\/g,"\\\\"));
		queriescallback("time", "321");
	});
}

var queries;

function queriescallback(sortby, order) {
	var div = document.getElementById('div_queries_content');
	var html = "";
	if (queries.length > 1) {
		html += '<div class="row">';
		html += '<div class="col-xs-4"><a href="#" class="click" onclick="queriescallback(\'time\');"><span id="queries_sortby_time">Czas</span></a></div>';
		html += '<div class="col-xs-4"><a href="#" class="click" onclick="queriescallback(\'query\');"><span id="queries_sortby_query">Zapytanie</span></a></div>';
		html += '<div class="col-xs-4"><a href="#" class="click" onclick="queriescallback(\'host\');"><span id="queries_sortby_host">Klient</span></a></div>';
		html += '</div><hr>';

		var sorted = sortJSON(queries, sortby, (order?order:'123'));
		for(var idx=0; idx<sorted.length; idx++){
			if (sorted[idx].time == '') {continue;}
			html += '<div class="row space">';
			html += '<div class="col-xs-4">' + sorted[idx].time + '</div>';
			html += '<div class="col-xs-4 wraptext">' + sorted[idx].query + '</div>';
			html += '<div class="col-xs-4 wraptext">' + sorted[idx].host + '</div>';
			html += '</div>';
		}
	} else {
		html += '<div class="alert alert-warning">Brak zapytań DNS</div>'
	}
	div.innerHTML = html;

	if (queries.length > 1) {
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
			var t_date=traffic[idx].split(" ")[0];
			var t_value=traffic[idx].split(" ")[1];
			if (total_since == "") {total_since = t_date;}

			if (t_date == today[0]) {
				traffic_today = t_value;
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

		if (traffic_warning_limit > -1) {
			if (traffic_warning_cycle == "d") {
				if (traffic_today >= traffic_warning_limit) { e1.style.color = "red"; }

				var percent = parseInt((traffic_today * 100) / traffic_warning_limit);
				setValue("traffic_today_progress", percent + "%, " + bytesToSize(traffic_today) + " z " + bytesToSize(traffic_warning_limit));
				if (percent > 100) {percent = 100;}
				document.getElementById("div_traffic_today_progress1").style.width = percent + '%';
				setDisplay("div_traffic_today_progress", true);
			}
			if (traffic_warning_cycle == "p") {
				if (traffic_currentperiod >= traffic_warning_limit) { e2.style.color = "red"; }

				var percent = parseInt((traffic_currentperiod * 100) / traffic_warning_limit);
				setValue("traffic_currentperiod_progress", percent + "%, " + bytesToSize(traffic_currentperiod) + " z " + bytesToSize(traffic_warning_limit));
				if (percent > 100) {percent = 100;}
				document.getElementById("div_traffic_currentperiod_progress1").style.width = percent + '%';
				setDisplay("div_traffic_currentperiod_progress", true);
			}
		}

		setValue("traffic_today", bytesToSize(traffic_today));
		setValue("traffic_yesterday", bytesToSize(traffic_yesterday));
		setValue("traffic_last7d", bytesToSize(traffic_last7d));
		setValue("traffic_last30d", bytesToSize(traffic_last30d));
		setValue("traffic_total", bytesToSize(traffic_total));
		if (total_since) {
			setValue("traffic_total_since", '(od '+ total_since + ')');
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
	cmd.push('#!/bin/sh');

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

	cmd.push('rm -- \\\"$0\\\"');
	cmd.push('exit 0');
	cmd.push('');

	ubus_call('"file", "write", {"path":"/tmp/tmp.sh","data":"'+cmd.join('\n')+'"}', function(data) {
		ubus_call('"file", "exec", {"command":"sh", "params":["/tmp/tmp.sh"]}', function(data1) {
			showtraffic();
		});
	});

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
	cmd.push('#!/bin/sh');
	cmd.push('rm /usr/lib/easyconfig/easyconfig_traffic.txt.gz');
	cmd.push('touch /usr/lib/easyconfig/easyconfig_traffic.txt');
	cmd.push('gzip /usr/lib/easyconfig/easyconfig_traffic.txt');
	cmd.push('rm /tmp/easyconfig_traffic.txt');
	cmd.push('rm -- \\\"$0\\\"');
	cmd.push('exit 0');
	cmd.push('');

	ubus_call('"file", "write", {"path":"/tmp/tmp.sh","data":"'+cmd.join('\n')+'"}', function(data) {
		ubus_call('"file", "exec", {"command":"sh", "params":["/tmp/tmp.sh"]}', function(data1) {
			showtraffic();
		});
	});

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
		showMsg(data.response);
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
			html += '<br><div class="alert alert-warning">Brak wiadomości</div>'
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

	if (page == 'status') {
		showstatus();
		showmodemsection();
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
}
