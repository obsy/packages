include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_modemband
PKG_VERSION:=20230622

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-modemband
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=Modemband for Gargoyle
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	DEPENDS:=+gargoyle +modemband
	PKGARCH:=all
endef

define Package/plugin-gargoyle-modemband/description
	Modemband plugin for Gargoyle
endef

define Build/Compile
endef

define Package/plugin-gargoyle-modemband/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	menu_name="Modem bands"
	[ -n `which i18n` ] && {
		mn=$$(i18n-menu gargoyle.display.system_modemband)
		if [ -n "$$mn" ] ; then
			menu_name="$$mn"
		fi
	}
	uci set gargoyle.display.system_modemband="$$menu_name"
	uci set gargoyle.scripts.system_modemband='modemband.sh'
	uci set gargoyle.system.modemband='351'
	uci commit
fi
endef

define Package/plugin-gargoyle-modemband/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.system_modemband
	uci del gargoyle.scripts.system_modemband
	uci del gargoyle.system.modemband
	uci commit
fi
endef

define Package/plugin-gargoyle-modemband/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
	[ -n "$$$$(which uglifyjs)" ] && uglifyjs ./files/www/js/modemband.js > $(1)/www/js/modemband.js || true
endef

$(eval $(call BuildPackage,plugin-gargoyle-modemband))
