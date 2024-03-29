// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {selectPost} from 'bulletin-redux/actions/posts';
import {makeGetChannel} from 'bulletin-redux/selectors/entities/channels';
import {getPost} from 'bulletin-redux/selectors/entities/posts';
import {getTheme} from 'bulletin-redux/selectors/entities/preferences';

import {loadThreadIfNecessary} from 'app/actions/views/channel';
import {isLandscape} from 'app/selectors/device';
import LongPost from './long_post';

function makeMapStateToProps() {
    const getChannel = makeGetChannel();

    return function mapStateToProps(state, ownProps) {
        const post = getPost(state, ownProps.postId);
        const channel = post ? getChannel(state, {id: post.channel_id}) : null;

        return {
            channelName: channel ? channel.display_name : '',
            inThreadView: Boolean(state.entities.posts.selectedPostId),
            theme: getTheme(state),
            isLandscape: isLandscape(state),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadThreadIfNecessary,
            selectPost,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(LongPost);
