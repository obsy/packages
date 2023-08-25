include $(TOPDIR)/rules.mk

PKG_NAME:=backupandrestore
PKG_VERSION:=20230824

include $(INCLUDE_DIR)/package.mk

define Package/backupandrestore
	CATEGORY:=Administration
	SUBMENU:=eko.one.pl services
	SECTION:=admin
	TITLE:=eko.one.pl services - backup and restore
	PKGARCH:=all
endef

define Build/Compile
endef

define Package/backupandrestore/install
	$(CP) ./files/* $(1)
endef

$(eval $(call BuildPackage,backupandrestore))
