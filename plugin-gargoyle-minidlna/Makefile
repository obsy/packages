include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_minidlna
PKG_VERSION:=20130705
PKG_RELEASE:=3

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-minidlna
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=DLNA Support for Gargoyle (PL)
	DEPENDS:=+gargoyle +minidlna
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
endef

define Package/plugin-gargoyle-minidlna/description
	DLNA Support for Gargoyle (PL)
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-minidlna/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci set gargoyle.display.system_minidlna='DLNA'
	uci set gargoyle.scripts.system_minidlna='minidlna.sh'
	uci set gargoyle.system.minidlna='352'
	uci commit gargoyle
fi
endef

define Package/plugin-gargoyle-minidlna/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.system_minidlna
	uci del gargoyle.scripts.system_minidlna
	uci del gargoyle.system.minidlna
	uci commit gargoyle
fi
endef

define Package/plugin-gargoyle-minidlna/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,plugin-gargoyle-minidlna))
