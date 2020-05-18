include $(TOPDIR)/rules.mk

PKG_NAME:=easyconfig
PKG_VERSION:=20200425

include $(INCLUDE_DIR)/package.mk

define Package/easyconfig
	SECTION:=admin
	CATEGORY:=Administration
	TITLE:=Easyconfig - prosty system konfiguracji
	DEPENDS:=+uhttpd +uhttpd-mod-ubus +rpcd +rpcd-mod-file +iw +3ginfo-lite +jshn +jsonfilter
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Package/easyconfig/description
  Easyconfig - prosty system konfiguracji
endef

define Package/easyconfig/conffiles
/etc/config/easyconfig
/usr/lib/easyconfig/easyconfig_statistics.json.gz
endef

define Build/Compile
endef

define Package/easyconfig/postinst
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
	/etc/uci-defaults/zz-easyconfig.sh
	/etc/init.d/rpcd restart
	/etc/init.d/cron restart
fi
exit 0
endef

define Package/easyconfig/postrm
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
	/etc/init.d/rpcd restart
	sed -i '/easyconfig_wlanlogs.sh/d' /etc/crontabs/root
	sed -i '/easyconfig_statistics.sh/d' /etc/crontabs/root
	/etc/init.d/cron restart
fi
exit 0
endef

define Package/easyconfig/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)

	$(SED) 's/?v=1/?v='${PKG_VERSION}'/g' $(1)/www/easyconfig.html
	$(SED) 's/GUI_VERSION="-devel-"/GUI_VERSION="'${PKG_VERSION}'"/g' $(1)/usr/libexec/rpcd/easyconfig

	$(SED) 's/^\t*//g;s/^\s*//g;/^$$$$/d' $(1)/www/easyconfig.html

	$(FIND) $(1) -type f -name '*.js' | while read src; do \
		uglifyjs "$$$$src" -o "$$$$src".1 && \
		mv "$$$$src".1 "$$$$src" || true; \
	done

	$(FIND) $(1) -type f -name '*.css' | while read src; do \
		cleancss "$$$$src" -o "$$$$src".1 && \
		mv "$$$$src".1 "$$$$src" || true; \
	done
endef

$(eval $(call BuildPackage,easyconfig))
