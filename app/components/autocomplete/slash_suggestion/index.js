// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';

import {getAutocompleteCommands} from 'bulletin-redux/actions/integrations';
import {getAutocompleteCommandsList} from 'bulletin-redux/selectors/entities/integrations';
import {getTheme} from 'bulletin-redux/selectors/entities/preferences';
import {getCurrentTeamId} from 'bulletin-redux/selectors/entities/teams';
import {isLandscape} from 'app/selectors/device';

import SlashSuggestion from './slash_suggestion';

// TODO: Remove when all below commands have been implemented
const COMMANDS_TO_IMPLEMENT_LATER = ['collapse', 'expand', 'join', 'open', 'leave', 'logout', 'msg', 'grpmsg'];
const NON_MOBILE_COMMANDS = ['rename', 'invite_people', 'shortcuts', 'search', 'help', 'settings', 'remove'];

const COMMANDS_TO_HIDE_ON_MOBILE = [...COMMANDS_TO_IMPLEMENT_LATER, ...NON_MOBILE_COMMANDS];

const mobileCommandsSelector = createSelector(
    getAutocompleteCommandsList,
    (commands) => {
        return commands.filter((command) => !COMMANDS_TO_HIDE_ON_MOBILE.includes(command.trigger));
    },
);

function mapStateToProps(state) {
    return {
        commands: mobileCommandsSelector(state),
        currentTeamId: getCurrentTeamId(state),
        theme: getTheme(state),
        isLandscape: isLandscape(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getAutocompleteCommands,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SlashSuggestion);