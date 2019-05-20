include $(TOPDIR)/rules.mk

PKG_NAME:=sunwait
PKG_VERSION:=1.0
PKG_RELEASE:=1

PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk

define Package/sunwait
	SECTION:=utils
	CATEGORY:=Utilities
	TITLE:=Calculate sunrise and sunset
	URL:=https://github.com/probonopd/sunwait
endef

define Package/sunwait/description
	Calculate sunrise and sunset, as well as civil, nautical, and astronomical twilights.
	Has features that make it useful for home automation tasks.
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/* $(PKG_BUILD_DIR)/
endef

define Package/sunwait/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/sunwait $(1)/usr/bin
endef

$(eval $(call BuildPackage,sunwait))
