'use strict';
'require form';
'require fs';
'require uci';
'require view';

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(fs.exec('/sbin/stat.sh', [ 'token' ]), null),
			L.resolveDefault(fs.read('/tmp/stat_time.txt'), null)
		]);
	},

	render: function(data) {
		var m, s, o;
		var token = data[0].stdout.replace(/(?:\r\n|\r|\n)/g, '');

		var html = _('Sending information about the router for statistical purposes. More information on the') + ' <a href="https://eko.one.pl/forum/viewtopic.php?id=7708" target="_blank">' + _('eko.one.pl forum') + '</a>.';
		html += '<div class="cbi-section">';
		html += '<div class="cbi-value" style="margin-top:20px;margin-bottom:5px"><label class="cbi-value-title" style="padding-top:0rem">' + _('Last update') + '</label><div class="cbi-value-field" style="font-weight: bold;margin-bottom:5px;color:#37c">' + (data[1] ? data[1] : '-') + '</div></div>';
		html += '<div class="right"><button class="btn cbi-button cbi-button-apply" style="margin-bottom:5px" onclick="window.open(\'https://dl.eko.one.pl/stat.html\')"/>' + _("See all statistics") + '</button>';
		html += '<button class="btn cbi-button cbi-button-apply" style="margin-left:10px" onclick="window.open(\'https://dl.eko.one.pl/cgi-bin/router.cgi?token=' + token + '\')"/>' + _("This router statistics") + '</button></div>';
		html += '</div>';

		m = new form.Map('system', _('Statistics'), html);

		s = m.section(form.TypedSection, 'system', _('Settings'));
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Flag, 'stat', _('Send statistical information'));
		o.rmempty = false;

		return m.render();
	},

	handleSave: function(ev) {
		var value = (document.querySelector('input[type=checkbox]').checked || '0');
		uci.set('system', '@system[0]', 'stat', value);
		uci.save();
		uci.apply();
		fs.exec('/sbin/stat-cron.sh');
	},
	handleSaveApply: null,
	handleReset: null
});
