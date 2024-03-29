// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {General} from 'bulletin-redux/constants';
import {getChannel} from 'bulletin-redux/selectors/entities/channels';
import {getTheme} from 'bulletin-redux/selectors/entities/preferences';
import {getUser} from 'bulletin-redux/selectors/entities/users';

import {getChannelNameForSearchAutocomplete} from 'app/selectors/channel';
import {isLandscape} from 'app/selectors/device';
import {isGuest as isGuestUser} from 'app/utils/users';

import ChannelMentionItem from './channel_mention_item';

function mapStateToProps(state, ownProps) {
    const channel = getChannel(state, ownProps.channelId);
    let displayName = getChannelNameForSearchAutocomplete(state, ownProps.channelId);

    let isBot = false;
    let isGuest = false;
    if (channel?.type === General.DM_CHANNEL) {
        const teammate = getUser(state, channel.teammate_id);
        if (teammate) {
            displayName = teammate.username;
            isBot = teammate.is_bot || false;
            isGuest = isGuestUser(teammate) || false;
        }
    }

    return {
        displayName,
        name: channel?.name,
        type: channel?.type,
        isBot,
        isGuest,
        theme: getTheme(state),
        isLandscape: isLandscape(state),
    };
}

export default connect(mapStateToProps)(ChannelMentionItem);
