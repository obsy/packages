include $(TOPDIR)/rules.mk

PKG_NAME:=tplinkmodem-helper
PKG_VERSION:=20180304
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/tplinkmodem-helper
	SECTION:=utils
	CATEGORY:=Utilities
	TITLE:=TP-LINK Archer MR200/TL-MR6400 modem helper
	PKGARCH:=all
	DEPENDS:=+comgt
endef

define Build/Compile
endef

define Package/tplinkmodem-helper/install
	$(CP) ./files/* $(1)
endef

$(eval $(call BuildPackage,tplinkmodem-helper))
