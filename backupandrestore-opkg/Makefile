include $(TOPDIR)/rules.mk

PKG_NAME:=backupandrestore-opkg
PKG_VERSION:=20241128

include $(INCLUDE_DIR)/package.mk

define Package/backupandrestore-opkg
	CATEGORY:=Administration
	SUBMENU:=eko.one.pl services
	SECTION:=admin
	TITLE:=eko.one.pl services - backup and restore
	PKGARCH:=all
	DEPENDS:=+opkg
	PROVIDES:=backupandrestore
endef

define Build/Compile
endef

define Package/backupandrestore-opkg/install
	$(CP) ./files/* $(1)
endef

$(eval $(call BuildPackage,backupandrestore-opkg))
