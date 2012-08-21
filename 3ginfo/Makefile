include $(TOPDIR)/rules.mk

PKG_NAME:=3ginfo
PKG_VERSION:=1
PKG_RELEASE:=47

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/3ginfo
	SECTION:=net
	CATEGORY:=Network
	TITLE:=Informacje o statusie polaczenia 3G
	DEPENDS:=+comgt +uhttpd
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Package/3ginfo/description
  Informacje o statusie polaczenia 3G
endef

define Package/3ginfo/conffiles
/etc/config/3ginfo
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) -r ./src/* $(PKG_BUILD_DIR)/
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/3ginfo/install
	$(CP) ./files/* $(1)
endef

define Package/3ginfo/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	[ -n "$$(uci -q show uhttpd | grep -E "listen_http.*:80")" -a -e /usr/sbin/httpd_gargoyle ] && /etc/init.d/uhttpd disable
}
exit 0
endef

$(eval $(call BuildPackage,3ginfo))
