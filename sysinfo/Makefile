include $(TOPDIR)/rules.mk

PKG_NAME:=sysinfo
PKG_VERSION:=20170131

include $(INCLUDE_DIR)/package.mk

define Package/sysinfo
	SECTION:=utils
	CATEGORY:=Utilities
	TITLE:=eko.one.pl Services
	PKGARCH:=all
endef

define Build/Compile
endef

define Package/sysinfo/install
	$(CP) ./files/* $(1)
endef

define Package/sysinfo/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	/etc/uci-defaults/99-sysinfo
}
exit 0
endef

$(eval $(call BuildPackage,sysinfo))

