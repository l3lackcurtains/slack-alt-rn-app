// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getTeam} from 'bulletin-redux/selectors/entities/teams';
import {getTheme} from 'bulletin-redux/selectors/entities/preferences';

import TeamIcon from './team_icon';

function mapStateToProps(state, ownProps) {
    const team = getTeam(state, ownProps.teamId);
    const lastIconUpdate = team.last_team_icon_update;

    return {
        displayName: team.display_name,
        lastIconUpdate,
        theme: getTheme(state),
    };
}

export default connect(mapStateToProps)(TeamIcon);
