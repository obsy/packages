include $(TOPDIR)/rules.mk

PKG_NAME:=ekooneplstat
PKG_VERSION:=20150706
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/ekooneplstat
	CATEGORY:=Administration
	SUBMENU:=eko.one.pl services
	SECTION:=admin
	TITLE:=eko.one.pl services - statistics
	PKGARCH:=all
endef

define Build/Compile
endef

define Package/ekooneplstat/install
	$(CP) ./files/* $(1)
endef

$(eval $(call BuildPackage,ekooneplstat))
