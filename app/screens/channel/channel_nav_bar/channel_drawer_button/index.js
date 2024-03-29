// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getTheme} from 'bulletin-redux/selectors/entities/preferences';

import {getBadgeCount} from 'app/selectors/views';
import ChannelDrawerButton from './channel_drawer_button';

function mapStateToProps(state) {
    return {
        badgeCount: getBadgeCount(state),
        theme: getTheme(state),
    };
}

export default connect(mapStateToProps)(ChannelDrawerButton);
