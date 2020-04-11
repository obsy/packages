
module("luci.controller.ekooneplstat", package.seeall)

function index()

	if nixio.fs.access("/etc/config/system") then
	local page

	page = entry({"admin", "services", "ekooneplstat"}, cbi("ekooneplstat"), _("Statistics"), 60)
	page.i18n = "Statistics"
	page.dependent = true
	end
end
