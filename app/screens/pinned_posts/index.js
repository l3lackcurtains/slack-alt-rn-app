// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {selectFocusedPostId, selectPost} from 'bulletin-redux/actions/posts';
import {clearSearch, getPinnedPosts} from 'bulletin-redux/actions/search';
import {getTheme} from 'bulletin-redux/selectors/entities/preferences';

import {loadChannelsByTeamName, loadThreadIfNecessary} from 'app/actions/views/channel';
import {makePreparePostIdsForSearchPosts} from 'app/selectors/post_list';

import PinnedPosts from './pinned_posts';

function makeMapStateToProps() {
    const preparePostIds = makePreparePostIdsForSearchPosts();
    return (state, ownProps) => {
        const {pinned} = state.entities.search;
        const channelPinnedPosts = pinned[ownProps.currentChannelId] || [];
        const postIds = preparePostIds(state, channelPinnedPosts);

        return {
            postIds,
            theme: getTheme(state),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            clearSearch,
            loadChannelsByTeamName,
            loadThreadIfNecessary,
            getPinnedPosts,
            selectFocusedPostId,
            selectPost,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(PinnedPosts);
