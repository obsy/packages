include $(TOPDIR)/rules.mk

PKG_NAME:=webui-aria2
PKG_VERSION:=$(shell date +%Y%m%d)

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=git://github.com/ziahamza/webui-aria2.git
PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)
PKG_SOURCE_VERSION:=HEAD

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION)-$(PKG_SOURCE_VERSION).tar.gz
# PKG_RELEASE:=$(PKG_SOURCE_VERSION)

include $(INCLUDE_DIR)/package.mk

PKG_UNPACK:= \
	mkdir -p $(PKG_BUILD_DIR)/aria2 && \
	zcat $(DL_DIR)/$(PKG_SOURCE) | \
	$(TAR) -C $(PKG_BUILD_DIR)/aria2 --strip-components=1 $(TAR_OPTIONS)

define Package/webui-aria2
	SECTION:=net
	CATEGORY:=Network
	TITLE:=webui-aria2
	DEPENDS:=+aria2
	PKGARCH:=all
endef

define Build/Compile
endef

define Package/webui-aria2/install
	$(INSTALL_DIR) $(1)/www
	$(CP) $(PKG_BUILD_DIR)/aria2 $(1)/www
endef

$(eval $(call BuildPackage,webui-aria2))
