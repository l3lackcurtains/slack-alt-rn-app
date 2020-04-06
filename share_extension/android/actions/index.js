// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {fetchMyChannelsAndMembers} from 'bulletin-redux/actions/channels';
import {getRedirectChannelNameForTeam, getChannelsNameMapInTeam} from 'bulletin-redux/selectors/entities/channels';
import {getChannelByName} from 'bulletin-redux/utils/channel_utils';

import {loadProfilesAndTeamMembersForDMSidebar} from 'app/actions/views/channel';
import {ViewTypes} from 'app/constants';

export function getTeamChannels(teamId) {
    return async (dispatch, getState) => {
        await dispatch(fetchMyChannelsAndMembers(teamId));
        dispatch(loadProfilesAndTeamMembersForDMSidebar(teamId));

        const state = getState();
        const channelsInTeam = getChannelsNameMapInTeam(state, teamId);
        const redirectChannel = getChannelByName(channelsInTeam, getRedirectChannelNameForTeam(state, teamId));

        return redirectChannel.id;
    };
}

export function extensionSelectTeamId(teamId) {
    return {
        type: ViewTypes.EXTENSION_SELECTED_TEAM_ID,
        data: teamId,
    };
}
