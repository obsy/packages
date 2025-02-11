'use strict';
'require form';
'require view';

return view.extend({
	load: function() {
		return Promise.resolve();
	},

	render: function(data) {
		var m, s, o;

		m = new form.Map('system', 'easyconfig', 'Na tym routerze zainstalowany jest także <b>easyconfig</b>! Kliknij poniżej aby go otworzyć.');

		s = m.section(form.NamedSection, 'global');
		s.render = L.bind(function(view, section_id) {
			return E('div', { 'class': 'cbi-section' }, [
				E('div', { class: 'right' }, [
					E('button', {
						'class': 'btn cbi-button cbi-button-apply',
						'onclick': 'window.open("/easyconfig.html");',
					}, [ 'Otwórz easyconfig' ])
				])
			]);
		}, o, this);

		return m.render();
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
