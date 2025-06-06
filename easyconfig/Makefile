include $(TOPDIR)/rules.mk

define findrev
	 $(shell \
		if git log -1 >/dev/null 2>/dev/null; then \
			git log -1 --format=%ad --date=format:'%Y%m%d' -- .; \
		else \
			find . -type f -printf '%T@\n' 2>/dev/null | sort -rn | head -n1 | cut -d. -f1 | awk '{print strftime("%Y%m%d", $1)}'; \
		fi \
	)
endef

PKG_NAME:=easyconfig
PKG_VERSION:=$(strip $(call findrev))
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/easyconfig
	SECTION:=admin
	CATEGORY:=Administration
	TITLE:=Easyconfig - prosty system konfiguracji
	DEPENDS:=+iw +iwinfo +jshn +jsonfilter +rpcd +rpcd-mod-file +uhttpd +uhttpd-mod-ubus +@BUSYBOX_DEFAULT_AWK
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Package/easyconfig/description
  Easyconfig - prosty system konfiguracji
endef

define Package/easyconfig/conffiles
/etc/config/easyconfig
/etc/easyconfig_watchdog.user
/usr/lib/easyconfig/easyconfig_statistics.json.gz
endef

define Build/Compile
endef

define Package/easyconfig/postinst
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
	[ -e /etc/uci-defaults/zz-easyconfig.sh ] && /etc/uci-defaults/zz-easyconfig.sh
	/etc/init.d/rpcd restart
	/etc/init.d/cron restart
fi
exit 0
endef

define Package/easyconfig/postrm
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
	/etc/init.d/rpcd restart
	sed -i '/easyconfig_logs.sh/d' /etc/crontabs/root
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

	for src in $(1)/www/easyconfig/dns.js $(1)/www/easyconfig/easyconfig.js; do \
		uglifyjs "$$$$src" -o "$$$$src".1 && \
		mv "$$$$src".1 "$$$$src" || true; \
	done

	for src in $(1)/www/easyconfig/easyconfig.css; do \
		cleancss "$$$$src" -o "$$$$src".1 && \
		mv "$$$$src".1 "$$$$src" || true; \
	done
endef

$(eval $(call BuildPackage,easyconfig))
