include $(TOPDIR)/rules.mk

PKG_NAME:=simplefailover
PKG_VERSION:=20160218
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/simplefailover
	SECTION:=net
	CATEGORY:=Network
	TITLE:=Simple failover WAN<->WAN2
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Package/simplefailover/description
  Simple failover WAN<->WAN2
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/simplefailover/install
	$(CP) ./files/* $(1)
endef

$(eval $(call BuildPackage,simplefailover))
