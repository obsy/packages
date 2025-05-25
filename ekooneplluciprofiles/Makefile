include $(TOPDIR)/rules.mk

PKG_NAME:=ekooneplluciprofiles
PKG_VERSION:=20250123
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk


define Package/ekooneplluciprofiles/Default
	CATEGORY:=Administration
	SUBMENU:=eko.one.pl services
	SECTION:=admin
	TITLE:=eko.one.pl profile -
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
endef

define Package/ekooneplluciprofiles/description/Default
	eko.one.pl Services
endef


define Package/ekoonepl-luci
	$(call Package/ekooneplluciprofiles/Default)
	TITLE+= LuCI
endef

define Package/ekoonepl-luci/description
	$(call Package/ekooneplluciprofiles/description/Default)
endef

define Package/ekooneplmonitoring-luci
	$(call Package/ekooneplluciprofiles/Default)
	TITLE+= LuCI monitoring
	DEPENDS:=+luci-app-statistics +luci-i18n-statistics-pl +collectd-mod-sensors \
		+luci-app-nlbwmon +luci-i18n-nlbwmon-pl
endef

define Package/ekooneplmonitoring-luci/description
	$(call Package/ekooneplluciprofiles/description/Default)
	.
	This meta package contains only the dependencies required for
	monitoring functionality in LuCI.
endef

define Package/ekooneplnas-luci
	$(call Package/ekooneplluciprofiles/Default)
	TITLE+= LuCI NAS
	DEPENDS:=+luci-app-hd-idle +luci-i18n-hd-idle-pl \
		+luci-app-disks-info +luci-i18n-disks-info-pl
endef

define Package/ekooneplnas-luci/description
	$(call Package/ekooneplluciprofiles/description/Default)
	.
	This meta package contains only the dependencies required for
	NAS functionality in LuCI.
endef

define Package/ekooneplusb-luci
	$(call Package/ekooneplluciprofiles/Default)
	TITLE+= LuCI USB
	DEPENDS:=+ekooneplusb \
		+luci-app-p910nd +luci-i18n-p910nd-pl +kmod-usb-printer +p910nd \
		+luci-app-ksmbd +luci-i18n-ksmbd-pl +ksmbd-server +wsdd2 \
		+usb-modeswitch +kmod-usb-net +kmod-usb-net-rndis +kmod-usb-net-cdc-ether \
		+luci-proto-3g +comgt +kmod-usb-serial +kmod-usb-serial-option +kmod-usb-serial-sierrawireless +kmod-usb-serial-qualcomm +kmod-usb-acm \
		+luci-proto-ncm +comgt-ncm +kmod-usb-net-cdc-ncm +kmod-usb-net-huawei-cdc-ncm \
		+luci-proto-mbim +umbim +kmod-usb-net-cdc-mbim \
		+luci-proto-qmi +uqmi +kmod-usb-net-qmi-wwan
endef

define Package/ekooneplusb-luci/description
	$(call Package/ekooneplluciprofiles/description/Default)
	.
	This meta package contains only the dependencies required for
	USB functionality in LuCI.
endef


define Build/Configure
endef

define Build/Compile
endef


define Package/ekoonepl-luci/install
	/bin/true
endef

define Package/ekooneplmonitoring-luci/install
	/bin/true
endef

define Package/ekooneplnas-luci/install
	/bin/true
endef

define Package/ekooneplusb-luci/install
	/bin/true
endef


$(eval $(call BuildPackage,ekoonepl-luci))
$(eval $(call BuildPackage,ekooneplmonitoring-luci))
$(eval $(call BuildPackage,ekooneplnas-luci))
$(eval $(call BuildPackage,ekooneplusb-luci))
