include $(TOPDIR)/rules.mk

PKG_NAME:=repo-4iceg
PKG_VERSION:=20250122
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/repo-4iceg
  SECTION:=utils
  CATEGORY:=Base system
  TITLE:=Repository - https://github.com/4iceg
  PKGARCH:=all
endef

define Package/repo-4iceg/description
	Repository - https://github.com/4iceg
endef

define Build/Compile
endef

define Build/Configure
endef

define Package/repo-4iceg/postinst
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
    grep -q "4IceG/Modem-extras" /etc/opkg/customfeeds.conf || echo 'src/gz repo-4iceg https://github.com/4IceG/Modem-extras/raw/main/myrepo' >> /etc/opkg/customfeeds.conf
fi
exit 0
endef

define Package/repo-4iceg/postrm
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
    grep -q "4IceG/Modem-extras" /etc/opkg/customfeeds.conf && sed -i '/4IceG/d' /etc/opkg/customfeeds.conf
fi
exit 0
endef

define Package/repo-4iceg/install
	$(INSTALL_DIR) $(1)/etc/opkg/keys
	wget https://github.com/4IceG/Modem-extras/raw/main/myrepo/IceG-repo.pub -O $(1)/etc/opkg/keys/0a0f903b916f6cb5
endef

$(eval $(call BuildPackage,repo-4iceg))
