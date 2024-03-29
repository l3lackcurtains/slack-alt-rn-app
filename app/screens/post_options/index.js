// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {
    deletePost,
    flagPost,
    pinPost,
    unflagPost,
    unpinPost,
    removePost,
    setUnreadPost,
} from 'bulletin-redux/actions/posts';
import {General, Permissions} from 'bulletin-redux/constants';
import {makeGetReactionsForPost} from 'bulletin-redux/selectors/entities/posts';
import {getChannel, getCurrentChannelId} from 'bulletin-redux/selectors/entities/channels';
import {getCurrentUserId} from 'bulletin-redux/selectors/entities/users';
import {getConfig, getLicense, hasNewPermissions} from 'bulletin-redux/selectors/entities/general';
import {getTheme} from 'bulletin-redux/selectors/entities/preferences';
import {haveIChannelPermission} from 'bulletin-redux/selectors/entities/roles';
import {getCurrentTeamId, getCurrentTeamUrl} from 'bulletin-redux/selectors/entities/teams';
import {canEditPost} from 'bulletin-redux/utils/post_utils';
import {isMinimumServerVersion} from 'bulletin-redux/utils/helpers';

import {MAX_ALLOWED_REACTIONS} from 'app/constants/emoji';
import {THREAD} from 'app/constants/screen';
import {addReaction} from 'app/actions/views/emoji';
import {getDimensions, isLandscape} from 'app/selectors/device';

import PostOptions from './post_options';

export function makeMapStateToProps() {
    const getReactionsForPostSelector = makeGetReactionsForPost();

    return (state, ownProps) => {
        const post = ownProps.post;
        const channel = getChannel(state, post.channel_id) || {};
        const config = getConfig(state);
        const license = getLicense(state);
        const currentUserId = getCurrentUserId(state);
        const currentTeamId = getCurrentTeamId(state);
        const currentChannelId = getCurrentChannelId(state);
        const reactions = getReactionsForPostSelector(state, post.id);
        const channelIsArchived = channel.delete_at !== 0;
        const {serverVersion} = state.entities.general;

        let canMarkAsUnread = true;
        let canAddReaction = true;
        let canReply = true;
        let canCopyPermalink = true;
        let canCopyText = false;
        let canEdit = false;
        let canEditUntil = -1;
        let {canDelete} = ownProps;
        let canFlag = true;
        let canPin = true;
        const canPost = haveIChannelPermission(
            state,
            {
                channel: post.channel_id,
                team: channel.team_id,
                permission: Permissions.CREATE_POST,
            },
        );

        if (hasNewPermissions(state)) {
            canAddReaction = haveIChannelPermission(state, {
                team: currentTeamId,
                channel: post.channel_id,
                permission: Permissions.ADD_REACTION,
            });
        }

        if (ownProps.location === THREAD) {
            canReply = false;
        }

        if (channelIsArchived || ownProps.channelIsReadOnly) {
            canAddReaction = false;
            canReply = false;
            canDelete = false;
            canPin = false;
        } else {
            canEdit = canEditPost(state, config, license, currentTeamId, currentChannelId, currentUserId, post);
            if (canEdit && license.IsLicensed === 'true' &&
                (config.AllowEditPost === General.ALLOW_EDIT_POST_TIME_LIMIT || (config.PostEditTimeLimit !== -1 && config.PostEditTimeLimit !== '-1'))
            ) {
                canEditUntil = post.create_at + (config.PostEditTimeLimit * 1000);
            }
        }

        if (!canPost) {
            canReply = false;
        }

        if (ownProps.isSystemMessage) {
            canAddReaction = false;
            canReply = false;
            canCopyPermalink = false;
            canEdit = false;
            canPin = false;
            canFlag = false;
        }
        if (ownProps.hasBeenDeleted) {
            canDelete = false;
        }

        if (!ownProps.showAddReaction) {
            canAddReaction = false;
        }

        if (!ownProps.isSystemMessage && ownProps.managedConfig?.copyAndPasteProtection !== 'true' && post.message) {
            canCopyText = true;
        }

        if (reactions && Object.values(reactions).length >= MAX_ALLOWED_REACTIONS) {
            canAddReaction = false;
        }

        if (!isMinimumServerVersion(serverVersion, 5, 18) || channelIsArchived) {
            canMarkAsUnread = false;
        }

        return {
            ...getDimensions(state),
            canAddReaction,
            canReply,
            canCopyPermalink,
            canCopyText,
            canEdit,
            canEditUntil,
            canDelete,
            canFlag,
            canPin,
            canMarkAsUnread,
            currentTeamUrl: getCurrentTeamUrl(state),
            currentUserId,
            theme: getTheme(state),
            isLandscape: isLandscape(state),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addReaction,
            deletePost,
            flagPost,
            pinPost,
            removePost,
            unflagPost,
            unpinPost,
            setUnreadPost,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PostOptions);
