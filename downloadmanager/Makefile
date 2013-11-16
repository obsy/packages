include $(TOPDIR)/rules.mk

PKG_NAME:=downloadmanager
PKG_VERSION:=20131025
PKG_RELEASE:=2

include $(INCLUDE_DIR)/package.mk

define Package/downloadmanager
	SECTION:=net
	CATEGORY:=Network
	TITLE:=Download manager for OpenWrt
	DEPENDS:=+aria2
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Build/Compile
endef

define Package/downloadmanager/install
	$(CP) files/* $(1)
endef

$(eval $(call BuildPackage,downloadmanager))
