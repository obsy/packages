include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_usbrelay
PKG_VERSION:=20171013

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-usbrelay
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=USB Relay
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	DEPENDS:=+gargoyle
	PKGARCH:=all
endef

define Package/plugin-gargoyle-usbrelay/description
	USB Relay
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-usbrelay/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	menu_name="USB Relay"
	[ -n `which i18n` ] && {
		mn=$$(i18n-menu gargoyle.display.status_usbrelay)
		if [ -n "$$mn" ] ; then
			menu_name="$$mn"
		fi
	}
	uci set gargoyle.display.status_usbrelay="$$menu_name"
	uci set gargoyle.scripts.status_usbrelay='usbrelay.sh'
	uci set gargoyle.status.usbrelay='910'
	uci commit
fi
endef

define Package/plugin-gargoyle-usbrelay/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.status_usbrelay
	uci del gargoyle.scripts.status_usbrelay
	uci del gargoyle.status.usbrelay
	uci commit
fi
endef

define Package/plugin-gargoyle-usbrelay/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,plugin-gargoyle-usbrelay))
