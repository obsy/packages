include $(TOPDIR)/rules.mk

PKG_NAME:=megatools
PKG_VERSION:=1.9.98
PKG_RELEASE:=1
PKG_SOURCE=$(PKG_NAME)-$(PKG_RELEASE).tar.gz
PKG_SOURCE_URL=https://megatools.megous.com/builds/
PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_RELEASE)
PKG_INSTALL:=1

include $(INCLUDE_DIR)/package.mk

CONFIGURE_ARGS += --disable-docs

define Package/megatools
	SECTION:=utils
	CATEGORY:=Utilities
	TITLE:=megatools
	DEPENDS:=+libopenssl +libcurl +libfuse +glib2 +ca-certificates
endef

define Package/megatools/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/usr/bin/mega* $(1)/usr/bin/
endef

$(eval $(call BuildPackage,megatools))
