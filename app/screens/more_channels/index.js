// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {isLandscape} from 'app/selectors/device';
import {General} from 'bulletin-redux/constants';
import {getArchivedChannels, getChannels, joinChannel, searchChannels} from 'bulletin-redux/actions/channels';
import {getChannelsInCurrentTeam, getMyChannelMemberships} from 'bulletin-redux/selectors/entities/channels';
import {getCurrentUserId, getCurrentUserRoles} from 'bulletin-redux/selectors/entities/users';
import {getCurrentTeamId} from 'bulletin-redux/selectors/entities/teams';
import {showCreateOption} from 'bulletin-redux/utils/channel_utils';
import {isAdmin, isSystemAdmin} from 'bulletin-redux/utils/user_utils';
import {getTheme} from 'bulletin-redux/selectors/entities/preferences';
import {getConfig, getLicense} from 'bulletin-redux/selectors/entities/general';

import {handleSelectChannel, setChannelDisplayName} from 'app/actions/views/channel';

import MoreChannels from './more_channels';

import {isMinimumServerVersion} from 'bulletin-redux/utils/helpers';

const joinablePublicChannels = createSelector(
    getChannelsInCurrentTeam,
    getMyChannelMemberships,
    (channels, myMembers) => {
        return channels.filter((c) => {
            return (!myMembers[c.id] && c.type === General.OPEN_CHANNEL && c.delete_at === 0);
        });
    },
);

const teamArchivedChannels = createSelector(
    getChannelsInCurrentTeam,
    (channels) => {
        return channels.filter((c) => c.delete_at !== 0);
    },
);

function mapStateToProps(state) {
    const config = getConfig(state);
    const license = getLicense(state);
    const roles = getCurrentUserRoles(state);
    const channels = joinablePublicChannels(state);
    const archivedChannels = teamArchivedChannels(state);
    const currentTeamId = getCurrentTeamId(state);
    const canShowArchivedChannels = config.ExperimentalViewArchivedChannels === 'true' &&
        isMinimumServerVersion(state.entities.general.serverVersion, 5, 18);

    return {
        canCreateChannels: showCreateOption(state, config, license, currentTeamId, General.OPEN_CHANNEL, isAdmin(roles), isSystemAdmin(roles)),
        currentUserId: getCurrentUserId(state),
        currentTeamId,
        channels,
        archivedChannels,
        theme: getTheme(state),
        isLandscape: isLandscape(state),
        canShowArchivedChannels,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getArchivedChannels,
            getChannels,
            handleSelectChannel,
            joinChannel,
            searchChannels,
            setChannelDisplayName,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoreChannels);
