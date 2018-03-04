include $(TOPDIR)/rules.mk

PKG_NAME:=mr200-helper
PKG_VERSION:=20180301

include $(INCLUDE_DIR)/package.mk

define Package/mr200-helper
	SECTION:=utils
	CATEGORY:=Utilities
	TITLE:=TP-LINK Archer MR200/TL-MR6400 helper
	PKGARCH:=all
	DEPENDS:=+comgt
endef

define Build/Compile
endef

define Package/mr200-helper/install
	$(CP) ./files/* $(1)
endef

$(eval $(call BuildPackage,mr200-helper))
