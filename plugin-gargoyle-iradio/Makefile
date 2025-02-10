include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_iradio
PKG_VERSION:=20250210

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-iradio
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=iradio for Gargoyle
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	DEPENDS:=+gargoyle +madplay +kmod-usb-audio +alsa-utils
	PKGARCH:=all
endef

define Package/plugin-gargoyle-iradio/description
	Internet Radio Player
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-iradio/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	menu_name="Internet Radio"
	[ -n `which i18n` ] && {
		mn=$$(i18n-menu gargoyle.display.status_iradio)
		if [ -n "$$mn" ] ; then
			menu_name="$$mn"
		fi
	}
	uci set gargoyle.display.status_iradio="$$menu_name"
	uci set gargoyle.scripts.status_iradio='iradio.sh'
	uci set gargoyle.status.iradio='910'
	uci commit
fi
endef

define Package/plugin-gargoyle-iradio/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.status_iradio
	uci del gargoyle.scripts.status_iradio
	uci del gargoyle.status.iradio
	uci commit
fi
endef

define Package/plugin-gargoyle-iradio/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
	[ -n "$$$$(which uglifyjs)" ] && uglifyjs ./files/www/js/iradio.js > $(1)/www/js/iradio.js || true
endef

$(eval $(call BuildPackage,plugin-gargoyle-iradio))
