include $(TOPDIR)/rules.mk
include $(INCLUDE_DIR)/kernel.mk

PKG_NAME:=huawei-hw-cdc
PKG_VERSION:=2.07.00.00

include $(INCLUDE_DIR)/package.mk

define KernelPackage/huawei-hw-cdc
  SUBMENU:=USB Support
  DEPENDS:=+kmod-usb-core +kmod-mii
  TITLE:=Huawei ether driver for 3G data card ether device
  FILES:= \
  	$(PKG_BUILD_DIR)/hw_cdc_driver.ko
  AUTOLOAD:=$(call AutoLoad,60,hw_cdc_driver)
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) ./src/* $(PKG_BUILD_DIR)/
	$(Build/Patch)
endef

define Build/Compile
	$(MAKE) -C "$(LINUX_DIR)" \
		CROSS_COMPILE="$(TARGET_CROSS)" \
		ARCH="$(LINUX_KARCH)" \
		SUBDIRS="$(PKG_BUILD_DIR)" \
		EXTRA_CFLAGS="$(BUILDFLAGS)" \
		modules
endef

$(eval $(call KernelPackage,huawei-hw-cdc))
