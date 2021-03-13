include $(TOPDIR)/rules.mk

PKG_NAME:=sysinfo
PKG_VERSION:=20210313

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

$(eval $(call BuildPackage,sysinfo))

