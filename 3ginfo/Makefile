include $(TOPDIR)/rules.mk

PKG_NAME:=3ginfo
PKG_VERSION:=20161111

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/3ginfo/Default
	SECTION:=net
	CATEGORY:=Network
	TITLE:=Information about status of 3G/4G connections
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Package/3ginfo-text
$(call Package/3ginfo/Default)
	TITLE+= (txt version)
	DEPENDS:=+comgt
endef

define Package/3ginfo
$(call Package/3ginfo/Default)
	DEPENDS:=+3ginfo-text +uhttpd
endef

define Package/3ginfo-text/conffiles
/etc/config/3ginfo
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

$(eval $(call BuildPackage,3ginfo-text))
$(eval $(call BuildPackage,3ginfo))
