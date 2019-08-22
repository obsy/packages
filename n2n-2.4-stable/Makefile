include $(TOPDIR)/rules.mk

PKG_NAME:=n2n-v2
PKG_RELEASE:=1

PKG_SOURCE_URL:=https://github.com/ntop/n2n.git
PKG_SOURCE_PROTO:=git
PKG_SOURCE_DATE:=2019-05-23
PKG_SOURCE_VERSION:=ca407f42af26226f5c9109efdf6996f3ed595135

include $(INCLUDE_DIR)/package.mk

MAKE_FLAGS += N2N_OPTION_AES="no" DEBUG=""

define Package/n2n-v2
  SECTION:=net
  CATEGORY:=Network
  TITLE:=VPN tunneling daemon (client, no ssl)
  URL:=http://www.ntop.org/n2n/
  SUBMENU:=VPN
  DEPENDS:=+libpthread +kmod-tun
endef

define Package/n2n-v2-supernode
  SECTION:=net
  CATEGORY:=Network
  TITLE:=VPN tunneling daemon (server, no ssl)
  URL:=http://www.ntop.org/n2n/
  SUBMENU:=VPN
  DEPENDS:=+libpthread +kmod-tun
endef

define Package/n2n-v2/install
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/edge $(1)/usr/sbin/
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_DATA) ./files/n2n.config $(1)/etc/config/n2n
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/n2n.init $(1)/etc/init.d/n2n
endef

define Package/n2n-v2-supernode/install
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/supernode $(1)/usr/sbin/
endef

$(eval $(call BuildPackage,n2n-v2))
$(eval $(call BuildPackage,n2n-v2-supernode))
