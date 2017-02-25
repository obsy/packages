include $(TOPDIR)/rules.mk

PKG_NAME:=easyconfig
PKG_VERSION:=20170212

include $(INCLUDE_DIR)/package.mk

define Package/easyconfig
	SECTION:=admin
	CATEGORY:=Administration
	TITLE:=Easyconfig - prosty system konfiguracji
	DEPENDS:=+uhttpd +uhttpd-mod-ubus +rpcd +rpcd-mod-file +iw +3ginfo-lite
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Package/easyconfig/description
  Easyconfig - prosty system konfiguracji
endef

define Build/Compile
endef

define Package/easyconfig/postinst
#!/bin/sh
/etc/uci-defaults/zz-easyconfig.sh
exit 0
endef

define Package/easyconfig/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)
	echo ${PKG_VERSION} > $(1)/www/easyconfig/version.txt

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
