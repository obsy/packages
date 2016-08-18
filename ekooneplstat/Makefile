include $(TOPDIR)/rules.mk

PKG_NAME:=ekooneplstat
PKG_VERSION:=20150706

include $(INCLUDE_DIR)/package.mk

define Package/ekooneplstat
	SECTION:=utils
	CATEGORY:=Utilities
	TITLE:=eko.one.pl Services
	PKGARCH:=all
endef

define Build/Compile
endef

define Package/ekooneplstat/install
	$(CP) ./files/* $(1)
endef

$(eval $(call BuildPackage,ekooneplstat))
