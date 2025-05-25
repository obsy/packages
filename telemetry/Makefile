include $(TOPDIR)/rules.mk

PKG_NAME:=telemetry
PKG_VERSION:=20230408
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/telemetry
	SECTION:=net
	CATEGORY:=Network
	TITLE:=telemetry
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/telemetry/install
	$(CP) ./files/* $(1)
endef

$(eval $(call BuildPackage,telemetry))
