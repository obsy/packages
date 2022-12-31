include $(TOPDIR)/rules.mk

PKG_NAME:=ugps-helper
PKG_VERSION:=20221231

include $(INCLUDE_DIR)/package.mk

define Package/ugps-helper
	SECTION:=utils
	CATEGORY:=Utils
	TITLE:=ugps helper
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
	DEPENDS:=+sms-tool +ugps
endef

define Build/Compile
endef

define Package/ugps-helper/install
	$(CP) ./files/* $(1)
endef

$(eval $(call BuildPackage,ugps-helper))
