include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_apcups
PKG_VERSION:=20180204

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-apcups
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=APC UPS Status for Gargoyle
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	DEPENDS:=+gargoyle +apcupsd +kmod-usb-hid
	PKGARCH:=all
endef

define Package/plugin-gargoyle-apcups/description
	APC UPS Status for Gargoyle
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-apcups/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	menu_name="UPS"
	[ -n `which i18n` ] && {
		mn=$$(i18n-menu gargoyle.display.status_ups)
		if [ -n "$$mn" ] ; then
			menu_name="$$mn"
		fi
	}
	uci set gargoyle.display.status_ups="$$menu_name"
	uci set gargoyle.scripts.status_ups='ups.sh'
	uci set gargoyle.status.ups='901'
	uci commit

	if [ -e /etc/apcupsd/apcupsd.conf ]; then
		sed -i 's/^UPSCABLE.*/UPSCABLE usb/' /etc/apcupsd/apcupsd.conf
		sed -i 's/^UPSTYPE.*/UPSTYPE usb/' /etc/apcupsd/apcupsd.conf
		sed -i 's/^DEVICE.*/DEVICE/' /etc/apcupsd/apcupsd.conf
	fi

	if [ -e /etc/init.d/apcupsd ]; then
		/etc/init.d/apcupsd enable
		/etc/init.d/apcupsd start
	fi
fi
endef

define Package/plugin-gargoyle-apcups/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.status_ups
	uci del gargoyle.scripts.status_ups
	uci del gargoyle.status.ups
	uci commit
fi
endef

define Package/plugin-gargoyle-apcups/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
	[ -n "$$$$(which uglifyjs)" ] && uglifyjs -nc ./files/www/js/ups.js > $(1)/www/js/ups.js || true
endef

$(eval $(call BuildPackage,plugin-gargoyle-apcups))
