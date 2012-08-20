include $(TOPDIR)/rules.mk

PKG_NAME:=vsftpd
PKG_VERSION:=2.3.4
PKG_RELEASE:=gargoyle-4

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=ftp://vsftpd.beasts.org/users/cevans/
PKG_MD5SUM:=2ea5d19978710527bb7444d93b67767a

include $(INCLUDE_DIR)/package.mk

define Package/vsftpd
  SUBMENU:=File Transfer
  SECTION:=net
  CATEGORY:=Network
  TITLE:=A fast and secure FTP server
  URL:=http://vsftpd.beasts.org/
  MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
  DEPENDS:=+gargoyle
endef

define Package/vsftpd/conffiles
/etc/vsftpd.conf.template
endef

define Build/Compile
	$(MAKE) -C $(PKG_BUILD_DIR) \
		CC="$(TARGET_CC)" \
		CFLAGS="$(TARGET_CFLAGS)" \
		vsftpd
endef

define Package/vsftpd/install
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/vsftpd $(1)/usr/sbin/
	$(INSTALL_DIR) $(1)/etc
	$(INSTALL_CONF) ./files/vsftpd.conf.template $(1)/etc/
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/vsftpd.init $(1)/etc/init.d/vsftpd
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./files/vsftpd.config $(1)/etc/config/vsftpd
endef

$(eval $(call BuildPackage,vsftpd))
