// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getTheme} from 'bulletin-redux/selectors/entities/preferences';
import {getSupportedTimezones} from 'bulletin-redux/selectors/entities/general';

import {isLandscape} from 'app/selectors/device';
import SelectTimezone from './select_timezone';

function mapStateToProps(state, props) {
    const {selectedTimezone} = props;
    const supportedTimezones = getSupportedTimezones(state);

    let index = 0;

    const timezoneIndex = supportedTimezones.findIndex((timezone) => timezone === selectedTimezone);
    if (timezoneIndex > 0) {
        index = timezoneIndex;
    }

    return {
        theme: getTheme(state),
        timezones: supportedTimezones,
        initialScrollIndex: index,
        isLandscape: isLandscape(state),
    };
}

export default connect(mapStateToProps)(SelectTimezone);
