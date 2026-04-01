// @ts-check
/* eslint-env node */
const appJson = require("./app.json");
const iosExtra = require("./config/expo.ios");
const androidExtra = require("./config/expo.android");

function deepMergeInfoPlist(base, extra) {
  return {
    ...(base && base.infoPlist),
    ...(extra && extra.infoPlist),
  };
}

module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      ...iosExtra,
      infoPlist: deepMergeInfoPlist(appJson.expo.ios, iosExtra),
    },
    android: {
      ...appJson.expo.android,
      ...androidExtra,
      adaptiveIcon: {
        ...appJson.expo.android?.adaptiveIcon,
        ...androidExtra.adaptiveIcon,
      },
      permissions:
        androidExtra.permissions ??
        appJson.expo.android?.permissions ??
        [],
    },
  },
};
