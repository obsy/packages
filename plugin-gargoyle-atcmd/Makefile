include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_atcmd
PKG_VERSION:=20230623
PKG_RELEASE:=1

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-atcmd
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=AT Commands plugin for Gargoyle
	DEPENDS:=+gargoyle +sms-tool
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Package/plugin-gargoyle-atcmd/description
	AT Command plugin for Gargoyle
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-atcmd/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	menu_name="AT Commands"
	[ -n `which i18n` ] && {
		mn=$$(i18n-menu gargoyle.display.system_atcmd)
		if [ -n "$$mn" ] ; then
			menu_name="$$mn"
		fi
	}
	uci set gargoyle.display.system_atcmd="$$menu_name"
	uci set gargoyle.scripts.system_atcmd="atcmd.sh"
	uci set gargoyle.system.atcmd='351'
	uci commit gargoyle
fi
endef

define Package/plugin-gargoyle-atcmd/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.system_atcmd
	uci del gargoyle.scripts.system_atcmd
	uci del gargoyle.system.atcmd
	uci commit gargoyle
fi
endef

define Package/plugin-gargoyle-atcmd/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,plugin-gargoyle-atcmd))
