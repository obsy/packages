include $(TOPDIR)/rules.mk

PKG_NAME:=sms_tool
PKG_RELEASE:=1

PKG_SOURCE_URL:=https://github.com/obsy/sms_tool
PKG_SOURCE_PROTO:=git
PKG_SOURCE_DATE:=2017-08-26
PKG_SOURCE_VERSION:=273fc7028c58a42c46a317d46858c49f1ce174d0

include $(INCLUDE_DIR)/package.mk

define Package/sms_tool
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=sms tool
  URL:=https://github.com/obsy/sms_tool
endef

define Package/sms_tool/description
	SMS Tool for Various of 3G Modems
endef

define Package/sms_tool/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/sms_tool $(1)/usr/bin/
endef

$(eval $(call BuildPackage,sms_tool))
