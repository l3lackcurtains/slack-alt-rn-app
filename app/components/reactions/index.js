// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getReactionsForPost, removeReaction} from 'app/redux/actions/posts';
import {makeGetReactionsForPost, getPost} from 'app/redux/selectors/entities/posts';
import {haveIChannelPermission} from 'app/redux/selectors/entities/roles';
import {hasNewPermissions} from 'app/redux/selectors/entities/general';
import Permissions from 'app/redux/constants/permissions';
import {getCurrentUserId} from 'app/redux/selectors/entities/users';
import {getTheme} from 'app/redux/selectors/entities/preferences';
import {getChannel, isChannelReadOnlyById} from 'app/redux/selectors/entities/channels';

import {addReaction} from 'app/actions/views/emoji';
import {MAX_ALLOWED_REACTIONS} from 'app/constants/emoji';

import Reactions from './reactions';

function makeMapStateToProps() {
    const getReactionsForPostSelector = makeGetReactionsForPost();
    return function mapStateToProps(state, ownProps) {
        const post = getPost(state, ownProps.postId);
        const channelId = post ? post.channel_id : '';
        const channel = getChannel(state, channelId) || {};
        const teamId = channel.team_id;
        const channelIsArchived = channel.delete_at !== 0;
        const channelIsReadOnly = isChannelReadOnlyById(state, channelId);

        const currentUserId = getCurrentUserId(state);
        const reactions = getReactionsForPostSelector(state, ownProps.postId);

        let canAddReaction = true;
        let canRemoveReaction = true;
        let canAddMoreReactions = true;
        if (channelIsArchived || channelIsReadOnly) {
            canAddReaction = false;
            canRemoveReaction = false;
            canAddMoreReactions = false;
        } else if (hasNewPermissions(state)) {
            canAddReaction = haveIChannelPermission(state, {
                team: teamId,
                channel: channelId,
                permission: Permissions.ADD_REACTION,
            });

            if (reactions) {
                // On servers without metadata reactions at this point can be undefined
                canAddMoreReactions = Object.values(reactions).length < MAX_ALLOWED_REACTIONS;
            }

            canRemoveReaction = haveIChannelPermission(state, {
                team: teamId,
                channel: channelId,
                permission: Permissions.REMOVE_REACTION,
            });
        }

        return {
            currentUserId,
            reactions,
            theme: getTheme(state),
            canAddReaction,
            canAddMoreReactions,
            canRemoveReaction,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addReaction,
            getReactionsForPost,
            removeReaction,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(Reactions);
