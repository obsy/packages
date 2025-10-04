include $(TOPDIR)/rules.mk

PKG_NAME:=ekooneplconfigs
PKG_VERSION:=20251004
PKG_RELEASE:=1
PKG_MAINTAINER:=Cezary Jackiewicz <cezary@eko.one.pl>

PKG_FLAGS:=nonshared

include $(INCLUDE_DIR)/package.mk

define Package/$(PKG_NAME)
  CATEGORY:=Administration
  SUBMENU:=eko.one.pl services
  SECTION:=admin
  TITLE:=eko.one.pl configs
endef

ifeq ($(CONFIG_TARGET_ipq806x_generic),y)
  FILE_PATH:=./files/ipq806x_generic
endif
ifeq ($(CONFIG_TARGET_mediatek_filogic),y)
  FILE_PATH:=./files/mediatek_filogic
endif
ifeq ($(CONFIG_TARGET_mvebu_cortexa53),y)
  FILE_PATH:=./files/mvebu_cortexa53
endif
ifeq ($(CONFIG_TARGET_mvebu_cortexa9),y)
  FILE_PATH:=./files/mvebu_cortexa9
endif
ifeq ($(CONFIG_TARGET_qualcommax_ipq807x),y)
  FILE_PATH:=./files/qualcommax_ipq807x
endif
ifeq ($(CONFIG_TARGET_x86_64),y)
  FILE_PATH:=./files/x86_64
endif

define Build/Compile
endef

define Package/$(PKG_NAME)/install
	$(CP) ./files/generic/* $(1)
ifdef FILE_PATH
	$(CP) $(FILE_PATH)/* $(1)
endif
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
