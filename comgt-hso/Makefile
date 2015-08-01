include $(TOPDIR)/rules.mk

PKG_NAME:=comgt-hso
PKG_VERSION:=1.0

include $(INCLUDE_DIR)/package.mk

define Package/comgt-hso
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=comgt HSO Support
  DEPENDS:=+comgt +kmod-usb-net-hso
  PKGARCH:=all
endef

define Build/Compile
endef

define Package/comgt-hso/install
	$(CP) ./files/* $(1)
endef

$(eval $(call BuildPackage,comgt-hso))
