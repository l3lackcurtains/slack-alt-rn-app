// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {Preferences} from 'bulletin-redux/constants';
import {makeGetCommentCountForPost} from 'bulletin-redux/selectors/entities/posts';
import {getBool, getTeammateNameDisplaySetting, getTheme} from 'bulletin-redux/selectors/entities/preferences';
import {isTimezoneEnabled} from 'bulletin-redux/selectors/entities/timezone';
import {getUser, getCurrentUser} from 'bulletin-redux/selectors/entities/users';
import {isPostPendingOrFailed, isSystemMessage} from 'bulletin-redux/utils/post_utils';
import {getUserCurrentTimezone} from 'bulletin-redux/utils/timezone_utils';
import {displayUsername} from 'bulletin-redux/utils/user_utils';
import {getConfig} from 'bulletin-redux/selectors/entities/general';

import {fromAutoResponder} from 'app/utils/general';
import {isGuest} from 'app/utils/users';
import {isLandscape} from 'app/selectors/device';

import PostHeader from './post_header';

function makeMapStateToProps() {
    const getCommentCountForPost = makeGetCommentCountForPost();
    return function mapStateToProps(state, ownProps) {
        const config = getConfig(state);
        const post = ownProps.post;
        const commentedOnUser = getUser(state, ownProps.commentedOnUserId);
        const user = getUser(state, post.user_id) || {};
        const currentUser = getCurrentUser(state);
        const teammateNameDisplay = getTeammateNameDisplaySetting(state);
        const militaryTime = getBool(state, Preferences.CATEGORY_DISPLAY_SETTINGS, 'use_military_time');
        const enableTimezone = isTimezoneEnabled(state);
        const userTimezone = enableTimezone ? getUserCurrentTimezone(currentUser.timezone) : '';

        return {
            commentedOnDisplayName: ownProps.commentedOnUserId ? displayUsername(commentedOnUser, teammateNameDisplay) : '',
            commentCount: getCommentCountForPost(state, {post}),
            createAt: post.create_at,
            displayName: displayUsername(user, teammateNameDisplay),
            enablePostUsernameOverride: config.EnablePostUsernameOverride === 'true',
            fromWebHook: post?.props?.from_webhook === 'true', // eslint-disable-line camelcase
            militaryTime,
            isPendingOrFailedPost: isPostPendingOrFailed(post),
            isSystemMessage: isSystemMessage(post),
            fromAutoResponder: fromAutoResponder(post),
            overrideUsername: post?.props?.override_username, // eslint-disable-line camelcase
            theme: getTheme(state),
            username: user.username,
            isBot: user.is_bot || false,
            isGuest: isGuest(user),
            isLandscape: isLandscape(state),
            userTimezone,
        };
    };
}

export default connect(makeMapStateToProps)(PostHeader);
