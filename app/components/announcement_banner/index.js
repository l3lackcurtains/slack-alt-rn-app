// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getConfig, getLicense} from 'bulletin-redux/selectors/entities/general';
import {getTheme} from 'bulletin-redux/selectors/entities/preferences';

import {isLandscape} from 'app/selectors/device';

import AnnouncementBanner from './announcement_banner';

function mapStateToProps(state) {
    const config = getConfig(state);
    const license = getLicense(state);
    const {announcement} = state.views;

    return {
        bannerColor: config.BannerColor,
        bannerDismissed: config.BannerText === announcement,
        bannerEnabled: config.EnableBanner === 'true' && license.IsLicensed === 'true',
        bannerText: config.BannerText,
        bannerTextColor: config.BannerTextColor || '#000',
        theme: getTheme(state),
        isLandscape: isLandscape(state),
    };
}

export default connect(mapStateToProps)(AnnouncementBanner);
