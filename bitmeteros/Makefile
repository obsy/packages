include $(TOPDIR)/rules.mk

PKG_NAME:=bitmeteros
PKG_VERSION:=2015-10-26
PKG_RELEASE=$(PKG_SOURCE_VERSION)

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=git://github.com/codebox/bitmeteros.git
PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)
PKG_SOURCE_VERSION:=5b649e6344316508b15d09c7ad66862dc76ca625
PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION)-$(PKG_SOURCE_VERSION).tar.gz

include $(INCLUDE_DIR)/package.mk

define Package/bitmeteros
  SECTION:=net
  CATEGORY:=Network
  DEPENDS:=+libsqlite3
  TITLE:=An open-source bandwidth meter with a sophisticated web interface
endef

define Build/Compile
	$(MAKE) -C  $(PKG_BUILD_DIR)/build/linux \
		$(TARGET_CONFIGURE_OPTS) \
		LIBS="-lsqlite3 -lm -L$(STAGING_DIR)/usr/lib" \
		all
endef

define Package/bitmeteros/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/build/linux/bmcapture $(1)/usr/bin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/build/linux/bmclient $(1)/usr/bin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/build/linux/bmws $(1)/usr/bin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/build/linux/bmdb $(1)/usr/bin/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/build/linux/bmsync $(1)/usr/bin/
	$(INSTALL_DIR) $(1)/usr/lib/bitmeter/
	$(CP) $(PKG_BUILD_DIR)/webserver/web $(1)/usr/lib/bitmeter/
	$(CP) $(PKG_BUILD_DIR)/build/bitmeter.db $(1)/usr/lib/bitmeter/
	$(CP) ./files/* $(1)
	[ -n "$$$$(which uglifyjs)" ] && find $(1)/usr/lib/bitmeter/ -type f -name \*.js -exec uglifyjs -o {} {} \; || true
endef

$(eval $(call BuildPackage,bitmeteros))
