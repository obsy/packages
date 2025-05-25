include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-ekooneplstat
PKG_VERSION:=20231220
PKG_RELEASE:=1

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)
PKG_BUILD_DEPENDS:=luci-base

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-ekooneplstat
	CATEGORY:=LuCI
	SUBMENU:=3. Applications
	TITLE:=LuCI Support for eko.one.pl services
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	DEPENDS:=+ekooneplstat
	PKGARCH:=all
endef

define Build/Compile
endef

define Package/luci-app-ekooneplstat/install
	$(CP) ./files/* $(1)
	if [ -e $(STAGING_DIR_HOSTPKG)/bin/po2lmo ]; then \
		$(STAGING_DIR_HOSTPKG)/bin/po2lmo $(1)/usr/lib/lua/luci/i18n/ekooneplstat.po $(1)/usr/lib/lua/luci/i18n/ekooneplstat.pl.lmo; \
	fi
	rm $(1)/usr/lib/lua/luci/i18n/*.po

	$(FIND) $(1) -type f -name '*.js' | while read src; do \
		if $(STAGING_DIR_HOSTPKG)/bin/jsmin < "$$$$src" > "$$$$src.o"; \
		then mv "$$$$src.o" "$$$$src"; fi; \
	done
endef

define Package/luci-app-ekooneplstat/postinst
[ -n "$${IPKG_INSTROOT}" ] || {
	rm -f /tmp/luci-indexcache
	rm -rf /tmp/luci-modulecache/
	killall -HUP rpcd 2>/dev/null
	exit 0
}
endef

$(eval $(call BuildPackage,luci-app-ekooneplstat))
