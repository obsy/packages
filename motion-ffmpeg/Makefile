#
# Copyright (C) 2008-2016 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=motion
PKG_VERSION=4.0.1-20170807-$(PKG_SOURCE_VERSION)
PKG_RELEASE:=1

PKG_MAINTAINER:=Roger D <rogerdammit@gmail.com>
PKG_LICENSE:=GPLv2
PKG_LICENSE_FILES:=COPYING

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/Mr-Dave/motion.git
PKG_SOURCE_VERSION:=6e08e951f81d07881f03eb524a237fa80f691b8d

PKG_SOURCE_SUBDIR:=$(PKG_NAME)-$(PKG_VERSION)
PKG_SOURCE:=$(PKG_SOURCE_SUBDIR).tar.gz
PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_SOURCE_SUBDIR)
PKG_BUILD_PARALLEL:=1

CMAKE_INSTALL:=1

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/motion-ffmpeg
  SECTION:=multimedia
  CATEGORY:=Multimedia
  DEPENDS:=+libjpeg +libpthread +libffmpeg-full
  TITLE:=webcam motion sensing and logging
  URL:=http://www.lavrsen.dk/twiki/bin/view/Motion/WebHome
endef

define Package/motion-ffmpeg/conffiles
/etc/motion.conf
endef

CONFIGURE_ARGS+= \
	--without-optimizecpu \
	--with-ffmpeg=$(STAGING_DIR)/usr \
	--without-jpeg-mmx \
	--without-sdl \
	--without-mysql \
	--without-pgsql \
	--without-sqlite3

CMAKE_OPTIONS += \
	-DWITH_FFMPEG=ON \
	-DWITH_MMAL=OFF \
	-DWITH_MYSQL=OFF \
	-DWITH_PGSQL=OFF \
	-DWITH_SQLITE3=OFF \
	-DWITH_V4L2=ON \
	-DWITH_BKTR=OFF

define Package/motion-ffmpeg/install
	$(INSTALL_DIR) $(1)/etc
	$(CP) $(PKG_BUILD_DIR)/motion-dist.conf $(1)/etc/motion.conf
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/motion $(1)/usr/bin/

endef

$(eval $(call BuildPackage,motion-ffmpeg))
