include $(TOPDIR)/rules.mk

PKG_NAME:=downloadmanager
PKG_VERSION:=20140129
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/downloadmanager
	SECTION:=net
	CATEGORY:=Network
	TITLE:=Download manager for OpenWrt
	DEPENDS:=+aria2
	PKGARCH:=all
endef

define Build/Compile
endef

define Package/downloadmanager/install
	$(CP) files/* $(1)
endef

$(eval $(call BuildPackage,downloadmanager))
