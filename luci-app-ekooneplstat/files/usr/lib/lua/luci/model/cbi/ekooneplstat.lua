--[[

LuCI eko.one.pl services

]]--
local fs = require "nixio.fs"
require("luci.sys")

local m, s, tmp

local token = luci.sys.exec("/sbin/stat.sh token | tr '\n' ' '")
local thisbutton = "&nbsp;&nbsp;&nbsp;<input type=\"button\" class=\"cbi-button cbi-button-apply\" value=\" " .. translate("This router statistics") .. " \" onclick=\"window.open('http://dl.eko.one.pl/cgi-bin/router.cgi?token=" .. token .. "')\"/>"
local allbutton = "<p>&nbsp;</p><input type=\"button\" class=\"cbi-button cbi-button-apply\" value=\" " .. translate("See all statistics") .. " \" onclick=\"window.open('http://dl.eko.one.pl/stat.html')\"/>"

local last = "<p>&nbsp;</p><p>" .. translate("Last update") .. ": "
local file = "/tmp/stat_time.txt"
if file then
	tmp = fs.readfile(file) or "-"
else
	tmp = "-"
end
last = last .. tmp .. "</p>"

m = Map("system", translate("Statistics"),
	"" .. allbutton .. thisbutton .. last)

s = m:section(TypedSection, "system", translate("Settings"))
s.addremove = false
s.anonymous = true

s1 = s:option(Flag, "stat", translate("Send statistical information"))
s1.rmempty = false

function s1.validate(self, value)
	_G.eko1stat = value
	return value
end

m.on_after_commit = function(self)
	luci.sys.call("uci set system.@system[0].stat=" .. _G.eko1stat .. ";/sbin/stat-cron.sh")
end

return m
