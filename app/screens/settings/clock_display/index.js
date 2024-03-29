// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getTheme, get as getPreference} from 'bulletin-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'bulletin-redux/selectors/entities/users';
import {savePreferences} from 'bulletin-redux/actions/preferences';
import Preferences from 'bulletin-redux/constants/preferences';
import {isLandscape} from 'app/selectors/device';
import ClockDisplay from './clock_display';

function mapStateToProps(state) {
    const militaryTime = getPreference(state, Preferences.CATEGORY_DISPLAY_SETTINGS, 'use_military_time') || 'false';
    const currentUserId = getCurrentUserId(state);

    return {
        userId: currentUserId,
        theme: getTheme(state),
        militaryTime,
        isLandscape: isLandscape(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClockDisplay);
