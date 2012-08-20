include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_ftp
PKG_VERSION:=20120326
PKG_RELEASE:=3


PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-ftp
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=FTP Service for Gargoyle (PL)
	DEPENDS:=+vsftpd
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Package/plugin-gargoyle-ftp/description
	FTP Support for Gargoyle
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-ftp/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci set gargoyle.display.system_ftp='Serwer FTP'
	uci set gargoyle.scripts.system_ftp='ftp.sh'
	uci set gargoyle.system.ftp='351'
	uci commit
fi
endef

define Package/plugin-gargoyle-ftp/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.system_ftp
	uci del gargoyle.scripts.system_ftp
	uci del gargoyle.system.ftp
	uci commit
fi
endef

define Package/plugin-gargoyle-ftp/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,plugin-gargoyle-ftp))
