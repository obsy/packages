include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_smsbox
PKG_VERSION:=20230520
PKG_RELEASE:=1


PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-smsbox
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=SMS/USSD Support for Gargoyle
	DEPENDS:=+gargoyle +sms-tool
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Package/plugin-gargoyle-smsbox/description
	SMS/USSD Support for Gargoyle
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-smsbox/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci set gargoyle.display.system_smsbox='SMS/USSD'
	uci set gargoyle.scripts.system_smsbox='smsbox.sh'
	uci set gargoyle.system.smsbox='351'
	uci commit gargoyle
fi
endef

define Package/plugin-gargoyle-smsbox/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.system_smsbox
	uci del gargoyle.scripts.system_smsbox
	uci del gargoyle.system.smsbox
	uci commit gargoyle
fi
endef

define Package/plugin-gargoyle-smsbox/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,plugin-gargoyle-smsbox))
