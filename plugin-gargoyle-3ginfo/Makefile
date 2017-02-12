include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_3ginfo
PKG_VERSION:=20170212

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-3ginfo
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=3ginfo for Gargoyle
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	DEPENDS:=+gargoyle +3ginfo-text
	PKGARCH:=all
endef

define Package/plugin-gargoyle-3ginfo/description
	3ginfo for Gargoyle
endef

define Build/Compile
endef

define Package/plugin-gargoyle-3ginfo/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	menu_name="USB Modem"
	[ -n `which i18n` ] && {
		mn=$$(i18n-menu gargoyle.display.status_3ginfo)
		if [ -n "$$mn" ] ; then
			menu_name="$$mn"
		fi
	}
	uci set gargoyle.display.status_3ginfo="$$menu_name"
	uci set gargoyle.scripts.status_3ginfo='3ginfo.sh'
	uci set gargoyle.status.3ginfo='900'
	uci commit
fi
endef

define Package/plugin-gargoyle-3ginfo/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.status_3ginfo
	uci del gargoyle.scripts.status_3ginfo
	uci del gargoyle.status.3ginfo
	uci commit
fi
endef

define Package/plugin-gargoyle-3ginfo/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
	[ -n "$$$$(which uglifyjs)" ] && uglifyjs ./files/www/js/3ginfo.js > $(1)/www/js/3ginfo.js || true
endef

$(eval $(call BuildPackage,plugin-gargoyle-3ginfo))
