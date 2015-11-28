include $(TOPDIR)/rules.mk

PKG_NAME:=oscam
PKG_VERSION:=11107
PKG_RELEASE:=1

PKG_SOURCE_PROTO:=svn
PKG_SOURCE_VERSION:=$(PKG_VERSION)
PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)
PKG_SOURCE:=$(PKG_SOURCE_SUBDIR).tar.bz2
PKG_SOURCE_URL:=http://www.streamboard.tv/svn/oscam/trunk

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/oscam
  SECTION:=utils
  CATEGORY:=Utilities
  DEPENDS:=+libopenssl +libusb-1.0 +libpcsclite +librt +libpthread
  TITLE:=OSCam is an Open Source Conditional Access Module software
endef

define Package/oscam/description
  OSCam is an Open Source Conditional Access Module software
endef

CMAKE_OPTIONS += \
	-DCS_CONFDIR=/etc/oscam \
	-DUSE_LIBUSB=1 \
	-DUSE_LIBCRYPT=1 \
	-DUSE_PCSC=1

define Package/oscam/conffiles
/etc/oscam/oscam.user
/etc/oscam/oscam.conf
/etc/oscam/oscam.server
endef

define Build/Configure
	(cd $(PKG_BUILD_DIR); ./config.sh --enable all)
	$(call Build/Configure/Default)
endef

define Package/oscam/install
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/oscam.init $(1)/etc/init.d/oscam

	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/usr/bin/oscam $(1)/usr/bin/

	$(INSTALL_DIR) $(1)/etc/oscam
	$(CP) ./files/oscam.server $(1)/etc/oscam/oscam.server
	$(CP) ./files/oscam.conf $(1)/etc/oscam/oscam.conf
	$(CP) ./files/oscam.user $(1)/etc/oscam/oscam.user
endef

$(eval $(call BuildPackage,oscam))
