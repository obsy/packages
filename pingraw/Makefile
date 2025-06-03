include $(TOPDIR)/rules.mk

PKG_NAME:=pingraw
PKG_VERSION:=20250502
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/pingraw
	SECTION:=utils
	CATEGORY:=Utilities
	TITLE:=pingraw
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/* $(PKG_BUILD_DIR)/
endef

define Package/pingraw/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/pingraw $(1)/usr/bin
endef

$(eval $(call BuildPackage,pingraw))
