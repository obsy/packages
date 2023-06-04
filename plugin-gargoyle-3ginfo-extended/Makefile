include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_3ginfo_extended
PKG_VERSION:=20230603

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-3ginfo-extended
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=3ginfo extended for Gargoyle
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	DEPENDS:=+gargoyle +sms-tool +comgt
	PKGARCH:=all
endef

define Package/plugin-gargoyle-3ginfo-extended/description
	Modem information plugin for Gargoyle
endef

define Build/Compile
endef

define Package/plugin-gargoyle-3ginfo-extended/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	menu_name="Cellular Modem"
	[ -n `which i18n` ] && {
		mn=$$(i18n-menu gargoyle.display.status_3ginfo_extended)
		if [ -n "$$mn" ] ; then
			menu_name="$$mn"
		fi
	}
	uci set gargoyle.display.status_3ginfo_extended="$$menu_name"
	uci set gargoyle.scripts.status_3ginfo_extended='3ginfo_extended.sh'
	uci set gargoyle.status.3ginfo_extended='900'
	uci commit
fi
endef

define Package/plugin-gargoyle-3ginfo-extended/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.status_3ginfo_extended
	uci del gargoyle.scripts.status_3ginfo_extended
	uci del gargoyle.status.3ginfo_extended
	uci commit
fi
endef

define Package/plugin-gargoyle-3ginfo-extended/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
	[ -n "$$$$(which uglifyjs)" ] && uglifyjs ./files/www/js/3ginfo_extended.js > $(1)/www/js/3ginfo_extended.js || true
endef

$(eval $(call BuildPackage,plugin-gargoyle-3ginfo-extended))
