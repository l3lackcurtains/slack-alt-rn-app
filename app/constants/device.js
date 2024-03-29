// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import DeviceInfo from 'react-native-device-info';
import RNFetchBlobFS from 'rn-fetch-blob/fs';
import keyMirror from 'bulletin-redux/utils/key_mirror';

const deviceTypes = keyMirror({
    CONNECTION_CHANGED: null,
    DEVICE_DIMENSIONS_CHANGED: null,
    DEVICE_TYPE_CHANGED: null,
    DEVICE_ORIENTATION_CHANGED: null,
    STATUSBAR_HEIGHT_CHANGED: null,
});

export default {
    ...deviceTypes,
    DOCUMENTS_PATH: `${RNFetchBlobFS.dirs.CacheDir}/Documents`,
    IMAGES_PATH: `${RNFetchBlobFS.dirs.CacheDir}/Images`,
    IS_IPHONE_WITH_INSETS: DeviceInfo.getModel().includes('iPhone X') || DeviceInfo.getModel().includes('iPhone 11'),
    IS_TABLET: DeviceInfo.isTablet(),
    VIDEOS_PATH: `${RNFetchBlobFS.dirs.CacheDir}/Videos`,
    PERMANENT_SIDEBAR_SETTINGS: '@PERMANENT_SIDEBAR_SETTINGS',
};
