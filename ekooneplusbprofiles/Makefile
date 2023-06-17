include $(TOPDIR)/rules.mk

PKG_NAME:=ekooneplusbprofiles
PKG_VERSION:=20230616

include $(INCLUDE_DIR)/package.mk


define Package/ekooneplusbprofiles/Default
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
		+kmod-fs-ntfs3 +kmod-fs-exfat
endef

define Package/ekooneplusbprofiles/description/Default
	eko.one.pl services
endef

# USB support, filesystems from template
define Package/ekooneplusb
	$(call Package/ekooneplusbprofiles/Default)
	TITLE+= USB
endef

define Package/ekooneplusb/description
	$(call Package/ekooneplusbprofiles/description/Default)
	.
	This meta package contains only the dependencies required for
	USB functionality.
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/ekooneplusb/install
	/bin/true
endef


$(eval $(call BuildPackage,ekooneplusb))
