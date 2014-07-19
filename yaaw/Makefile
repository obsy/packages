include $(TOPDIR)/rules.mk

PKG_NAME:=yaaw
PKG_VERSION:=$(shell date +%Y%m%d)

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=git://github.com/binux/yaaw.git
PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)
PKG_SOURCE_VERSION:=HEAD

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION)-$(PKG_SOURCE_VERSION).tar.gz

include $(INCLUDE_DIR)/package.mk

define Package/yaaw
	SECTION:=net
	CATEGORY:=Network
	DEPENDS:=+aria2
	TITLE:=Yet another aria2 web frontend
	URL:=https://github.com/binux/yaaw
	PKGARCH:=all
endef

define Package/yaaw/description
	Yet Another Aria2 Web Frontend in pure HTML/CSS/Javascirpt.
endef

define Build/Compile
endef

define Package/yaaw/install
	$(INSTALL_DIR) $(1)/www/yaaw
	$(CP) $(PKG_BUILD_DIR)/js $(1)/www/yaaw
	$(CP) $(PKG_BUILD_DIR)/img $(1)/www/yaaw
	$(CP) $(PKG_BUILD_DIR)/css $(1)/www/yaaw
	$(CP) $(PKG_BUILD_DIR)/index.html $(1)/www/yaaw
	$(CP) $(PKG_BUILD_DIR)/offline.appcache $(1)/www/yaaw
endef

$(eval $(call BuildPackage,yaaw))
