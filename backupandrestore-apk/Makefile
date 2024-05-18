include $(TOPDIR)/rules.mk

PKG_NAME:=backupandrestore-apk
PKG_VERSION:=20240518

include $(INCLUDE_DIR)/package.mk

define Package/backupandrestore-apk
	CATEGORY:=Administration
	SUBMENU:=eko.one.pl services
	SECTION:=admin
	TITLE:=eko.one.pl services - backup and restore
	PKGARCH:=all
	DEPENDS:=+apk
	PROVIDES:=backupandrestore
endef

define Build/Compile
endef

define Package/backupandrestore-apk/install
	$(CP) ./files/* $(1)
endef

$(eval $(call BuildPackage,backupandrestore-apk))
