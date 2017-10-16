include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_management
PKG_VERSION:=20140402
PKG_RELEASE:=2

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-management
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=Management buttons on login page
	DEPENDS:=+gargoyle
	PKGARCH:=all
endef

define Package/plugin-gargoyle-management/description
	Management buttons on login page
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-management/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
	[ -n "$$$$(which uglifyjs)" ] && uglifyjs -nc ./files/www/hooks/login/091-management.js > $(1)/www/hooks/login/091-management.js || true
endef

$(eval $(call BuildPackage,plugin-gargoyle-management))
