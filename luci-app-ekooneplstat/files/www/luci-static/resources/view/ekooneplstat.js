'use strict';
'require form';
'require fs';
'require ui';
'require uci';
'require view';

function handleAction(ev, token) {
	if (ev === 'all') {
		window.open('https://dl.eko.one.pl/stat.html');
		return
	}

	if (ev === 'this') {
		window.open('https://dl.eko.one.pl/cgi-bin/router.cgi?token=' + token);
		return;
	}
}

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

		m = new form.Map('system', _('Statistics'), html);

		s = m.section(form.NamedSection, 'global');
		s.render = L.bind(function(view, section_id) {
			return E('div', { 'class': 'cbi-section' }, [
				E('h3', _('Information')),
				E('div', { 'class': 'cbi-value' }, [
					E('label', { 'class': 'cbi-value-title', 'style': 'padding-top:0rem' }, _('Last update')),
					E('div', { 'class': 'cbi-value-field', 'id': 'status', 'style': 'color:#37c' }, data[1] ? data[1] : '-')
				]),
				E('div', { class: 'right' }, [
					E('button', {
					'class': 'btn cbi-button cbi-button-apply',
					'click': ui.createHandlerFn(this, function() {
						return handleAction('all', null);
					})
					}, [ _('See all statistics') ]),
					'\xa0\xa0\xa0',
					E('button', {
					'class': 'btn cbi-button cbi-button-apply',
					'id': 'btn_suspend',
					'click': ui.createHandlerFn(this, function() {
						return handleAction('this', token);
					})
					}, [ _('This router statistics') ])
				])
			]);
		}, o, this);

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
