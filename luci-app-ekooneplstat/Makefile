include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-ekooneplstat
PKG_VERSION:=20190629

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)
PKG_BUILD_DEPENDS:=luci-base

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-ekooneplstat
	CATEGORY:=LuCI
	SUBMENU:=3. Applications
	TITLE:=eko.one.pl Services
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	DEPENDS:=+ekooneplstat
	PKGARCH:=all
endef

define Build/Compile
endef

define Package/luci-app-ekooneplstat/install
	$(CP) ./files/* $(1)
	if [ -e $(BUILD_DIR)/../../feeds/luci/modules/luci-base/src/po2lmo ]; then \
		$(BUILD_DIR)/../../feeds/luci/modules/luci-base/src/po2lmo $(1)/usr/lib/lua/luci/i18n/ekooneplstat.po $(1)/usr/lib/lua/luci/i18n/ekooneplstat.pl.lmo; \
	fi
	rm $(1)/usr/lib/lua/luci/i18n/*.po
	$(FIND) $(1) -type f -name '*.lua' | while read src; do \
		if $(STAGING_DIR_HOSTPKG)/bin/lua $(STAGING_DIR_HOSTPKG)/bin/LuaSrcDiet \
			--noopt-binequiv -o "$$$$src.o" "$$$$src"; \
		then mv "$$$$src.o" "$$$$src"; fi; \
	done
endef

define Package/luci-app-ekooneplstat/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
rm -f /var/luci-indexcache
}
exit 0
endef

$(eval $(call BuildPackage,luci-app-ekooneplstat))
