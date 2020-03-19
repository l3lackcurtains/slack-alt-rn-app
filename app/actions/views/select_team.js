// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {ChannelTypes, TeamTypes} from 'app/redux/action_types';
import {getMyTeams} from 'app/redux/actions/teams';
import {RequestStatus} from 'app/redux/constants';
import {getConfig} from 'app/redux/selectors/entities/general';
import EventEmitter from 'app/redux/utils/event_emitter';

import {NavigationTypes} from 'app/constants';
import {selectFirstAvailableTeam} from 'app/utils/teams';

export function handleTeamChange(teamId) {
    return async (dispatch, getState) => {
        const state = getState();
        const {currentTeamId} = state.entities.teams;
        if (currentTeamId === teamId) {
            return;
        }

        dispatch(batchActions([
            {type: TeamTypes.SELECT_TEAM, data: teamId},
            {type: ChannelTypes.SELECT_CHANNEL, data: '', extra: {}},
        ]));
    };
}

export function selectDefaultTeam() {
    return async (dispatch, getState) => {
        const state = getState();

        const {ExperimentalPrimaryTeam} = getConfig(state);
        const {teams: allTeams, myMembers} = state.entities.teams;
        const teams = Object.keys(myMembers).map((key) => allTeams[key]);

        let defaultTeam = selectFirstAvailableTeam(teams, ExperimentalPrimaryTeam);

        if (defaultTeam) {
            dispatch(handleTeamChange(defaultTeam.id));
        } else if (state.requests.teams.getTeams.status === RequestStatus.FAILURE || state.requests.teams.getMyTeams.status === RequestStatus.FAILURE) {
            EventEmitter.emit(NavigationTypes.NAVIGATION_ERROR_TEAMS);
        } else {
            // If for some reason we reached this point cause of a failure in rehydration or something
            // lets fetch the teams one more time to make sure the user does not belong to any team
            const {data, error} = await dispatch(getMyTeams());
            if (error) {
                EventEmitter.emit(NavigationTypes.NAVIGATION_ERROR_TEAMS);
                return;
            }

            if (data) {
                defaultTeam = selectFirstAvailableTeam(data, ExperimentalPrimaryTeam);
            }

            if (defaultTeam) {
                dispatch(handleTeamChange(defaultTeam.id));
            } else {
                EventEmitter.emit(NavigationTypes.NAVIGATION_NO_TEAMS);
            }
        }
    };
}

export default {
    handleTeamChange,
    selectDefaultTeam,
};
