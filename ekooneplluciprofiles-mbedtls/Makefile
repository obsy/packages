include $(TOPDIR)/rules.mk

PKG_NAME:=ekooneplluciprofiles-mbedtls
PKG_VERSION:=20241104

include $(INCLUDE_DIR)/package.mk


define Package/ekooneplluciprofiles-mbedtls/Default
	CATEGORY:=Administration
	SUBMENU:=eko.one.pl services
	SECTION:=admin
	TITLE:=eko.one.pl profile -
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
	DEPENDS:=+luci-app-openvpn +luci-i18n-openvpn-pl +openvpn-mbedtls
endef

define Package/ekooneplluciprofiles-mbedtls/description/Default
	eko.one.pl Services
endef


define Package/ekoonepl-luci-mbedtls
	$(call Package/ekooneplluciprofiles-mbedtls/Default)
	TITLE+= LuCI
endef

define Package/ekoonepl-luci-mbedtls/description
	$(call Package/ekooneplluciprofiles-mbedtls/description/Default)
endef

define Package/ekooneplmonitoring-luci-mbedtls
	$(call Package/ekooneplluciprofiles-mbedtls/Default)
	TITLE+= LuCI monitoring
	DEPENDS:=+luci-app-statistics +luci-i18n-statistics-pl +collectd-mod-sensors \
		+luci-app-nlbwmon +luci-i18n-nlbwmon-pl
endef

define Package/ekooneplmonitoring-luci-mbedtls/description
	$(call Package/ekooneplluciprofiles-mbedtls/description/Default)
	.
	This meta package contains only the dependencies required for
	monitoring functionality in LuCI.
endef

define Package/ekooneplnas-luci-mbedtls
	$(call Package/ekooneplluciprofiles-mbedtls/Default)
	TITLE+= LuCI NAS
	DEPENDS:=+luci-app-hd-idle +luci-i18n-hd-idle-pl \
		+luci-app-disks-info +luci-i18n-disks-info-pl
endef

define Package/ekooneplnas-luci-mbedtls/description
	$(call Package/ekooneplluciprofiles-mbedtls/description/Default)
	.
	This meta package contains only the dependencies required for
	NAS functionality in LuCI.
endef

define Package/ekooneplusb-luci-mbedtls
	$(call Package/ekooneplluciprofiles-mbedtls/Default)
	TITLE+= LuCI USB
	DEPENDS+=+block-mount +kmod-usb-storage +kmod-usb-storage-uas \
		+kmod-fs-f2fs +mkf2fs +f2fsck \
		+kmod-fs-ext4 +e2fsprogs \
		+kmod-fs-vfat +kmod-nls-cp437 +kmod-nls-iso8859-1 \
		+kmod-fs-ntfs3 +kmod-fs-exfat \
		+luci-app-p910nd +luci-i18n-p910nd-pl +kmod-usb-printer +p910nd \
		+luci-app-ksmbd +luci-i18n-ksmbd-pl +ksmbd-server +wsdd2 \
		+usb-modeswitch +kmod-usb-net +kmod-usb-net-rndis +kmod-usb-net-cdc-ether \
		+luci-proto-3g +comgt +kmod-usb-serial +kmod-usb-serial-option +kmod-usb-serial-sierrawireless +kmod-usb-serial-qualcomm +kmod-usb-acm \
		+luci-proto-ncm +comgt-ncm +kmod-usb-net-cdc-ncm +kmod-usb-net-huawei-cdc-ncm \
		+luci-proto-mbim +umbim +kmod-usb-net-cdc-mbim \
		+luci-proto-qmi +uqmi +kmod-usb-net-qmi-wwan
endef

define Package/ekooneplusb-luci-mbedtls/description
	$(call Package/ekooneplluciprofiles-mbedtls/description/Default)
	.
	This meta package contains only the dependencies required for
	USB functionality in LuCI.
endef


define Build/Configure
endef

define Build/Compile
endef


define Package/ekoonepl-luci-mbedtls/install
	/bin/true
endef

define Package/ekooneplmonitoring-luci-mbedtls/install
	/bin/true
endef

define Package/ekooneplnas-luci-mbedtls/install
	/bin/true
endef

define Package/ekooneplusb-luci-mbedtls/install
	/bin/true
endef


$(eval $(call BuildPackage,ekoonepl-luci-mbedtls))
$(eval $(call BuildPackage,ekooneplmonitoring-luci-mbedtls))
$(eval $(call BuildPackage,ekooneplnas-luci-mbedtls))
$(eval $(call BuildPackage,ekooneplusb-luci-mbedtls))
