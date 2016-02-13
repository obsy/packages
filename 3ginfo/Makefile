include $(TOPDIR)/rules.mk

PKG_NAME:=3ginfo
PKG_VERSION:=20160213

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/3ginfo/Default
	SECTION:=net
	CATEGORY:=Network
	TITLE:=Information about status of 3G/LTE connections
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Package/3ginfo-text
$(call Package/3ginfo/Default)
	TITLE+= (txt version)
#	DEPENDS:=+comgt +coreutils +coreutils-stty
	DEPENDS:=+comgt
endef

define Package/3ginfo
$(call Package/3ginfo/Default)
	DEPENDS:=+3ginfo-text +uhttpd
endef

define Package/3ginfo-text/conffiles
/etc/config/3ginfo
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/3ginfo-text/install
	$(CP) ./files-text/* $(1)
endef

define Package/3ginfo-text/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	ln -sf /usr/share/3ginfo/cgi-bin/3ginfo.sh /usr/bin/3ginfo
}
exit 0
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

$(eval $(call BuildPackage,3ginfo-text))
$(eval $(call BuildPackage,3ginfo))
