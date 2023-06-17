include $(TOPDIR)/rules.mk

PKG_NAME:=ekooneplusbluciprofiles
PKG_VERSION:=20230616

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
		+kmod-nf-nathelper-extra \
		+luci-app-p910nd +kmod-usb-printer +p910nd \
		+luci-app-ksmbd +ksmbd-server +wsdd2 \
		+usb-modeswitch +kmod-usb-net +kmod-usb-net-rndis +kmod-usb-net-cdc-ether \
		+luci-proto-3g +comgt +kmod-usb-serial +kmod-usb-serial-option +kmod-usb-serial-sierrawireless +kmod-usb-serial-qualcomm +kmod-usb-acm \
		+luci-proto-ncm +comgt-ncm +kmod-usb-net-cdc-ncm +kmod-usb-net-huawei-cdc-ncm \
		+luci-proto-mbim +umbim +kmod-usb-net-cdc-mbim +kmod-usb-net-cdc-ncm +kmod-usb-net-huawei-cdc-ncm \
		+luci-proto-qmi +uqmi +kmod-usb-net-qmi-wwan
endef

define Package/ekooneplusbluciprofiles/description/Default
	eko.one.pl Services
	.
	This meta package contains only the dependencies required for
	USB functionality in LuCI.
endef


define Package/ekooneplusb-lucimini
	$(call Package/ekooneplusbluciprofiles/Default)
	TITLE+= LuCI USB mini
endef

define Package/ekooneplusb-lucimini/description
	$(call Package/ekooneplusbluciprofiles/description/Default)
endef


define Package/ekooneplusb-lucifull
	$(call Package/ekooneplusbluciprofiles/Default)
	TITLE+= LuCI USB full
	DEPENDS+= +luci-app-openvpn +openvpn-openssl +openvpn-easy-rsa
endef

define Package/ekooneplusb-lucifull/description
	$(call Package/ekooneplusbluciprofiles/description/Default)
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/ekooneplusb-lucimini/install
	/bin/true
endef

define Package/ekooneplusb-lucifull/install
	/bin/true
endef


$(eval $(call BuildPackage,ekooneplusb-lucimini))
$(eval $(call BuildPackage,ekooneplusb-lucifull))
