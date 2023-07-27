include $(TOPDIR)/rules.mk

PKG_NAME:=ekooneplusbluciprofiles
PKG_VERSION:=20230727

include $(INCLUDE_DIR)/package.mk


define Package/ekooneplusbluciprofiles/Default
	CATEGORY:=Administration
	SUBMENU:=eko.one.pl services
	SECTION:=admin
	TITLE:=eko.one.pl profile -
	MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>
	PKGARCH:=all
	DEPENDS:=+block-mount +kmod-usb-storage +kmod-usb-storage-uas \
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

define Package/ekooneplusbluciprofiles/description/Default
	eko.one.pl Services
endef


define Package/ekoonepl-luci
	$(call Package/ekooneplusbluciprofiles/Default)
	TITLE+= LuCI
	DEPENDS:=+luci-app-openvpn +luci-i18n-openvpn-pl +openvpn-openssl +openvpn-easy-rsa
endef

define Package/ekoonepl-luci/description
	$(call Package/ekooneplusbluciprofiles/description/Default)
endef

define Package/ekooneplusb-luci
	$(call Package/ekooneplusbluciprofiles/Default)
	TITLE+= LuCI USB
	DEPENDS+= +luci-app-openvpn +luci-i18n-openvpn-pl +openvpn-openssl +openvpn-easy-rsa
endef

define Package/ekooneplusb-luci/description
	$(call Package/ekooneplusbluciprofiles/description/Default)
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

define Package/ekooneplusb-luci/install
	/bin/true
endef


$(eval $(call BuildPackage,ekoonepl-luci))
$(eval $(call BuildPackage,ekooneplusb-luci))