// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getTeams, addUserToTeam, joinTeam} from 'bulletin-redux/actions/teams';
import {logout} from 'bulletin-redux/actions/users';
import {getTheme} from 'bulletin-redux/selectors/entities/preferences';
import {getJoinableTeams} from 'bulletin-redux/selectors/entities/teams';
import {getCurrentUser} from 'bulletin-redux/selectors/entities/users';

import {handleTeamChange} from 'app/actions/views/select_team';
import {isLandscape} from 'app/selectors/device';
import {isGuest} from 'app/utils/users';

import SelectTeam from './select_team.js';

function mapStateToProps(state) {
    const currentUser = getCurrentUser(state);
    const currentUserIsGuest = isGuest(currentUser);

    return {
        currentUserId: currentUser && currentUser.id,
        currentUserIsGuest,
        isLandscape: isLandscape(state),
        serverVersion: state.entities.general.serverVersion,
        teamsRequest: state.requests.teams.getTeams,
        teams: getJoinableTeams(state),
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeams,
            handleTeamChange,
            joinTeam,
            addUserToTeam,
            logout,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectTeam);
