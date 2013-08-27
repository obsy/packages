include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_3ginfo
PKG_VERSION:=20130827

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-3ginfo
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=3ginfo for Gargoyle (PL)
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	DEPENDS:=+gargoyle +3ginfo-text
	PKGARCH:=all
endef

define Package/plugin-gargoyle-3ginfo/description
	3ginfo for Gargoyle (PL)
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-3ginfo/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci set gargoyle.display.status_3ginfo='Modem 3G/LTE'
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
	[ -n "$$$$(which uglifyjs)" ] && uglifyjs -nc ./files/www/js/3ginfo.js > $(1)/www/js/3ginfo.js
endef

$(eval $(call BuildPackage,plugin-gargoyle-3ginfo))
