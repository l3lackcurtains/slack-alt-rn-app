// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCustomEmojisByName} from 'bulletin-redux/selectors/entities/emojis';
import {getCurrentUserId} from 'bulletin-redux/selectors/entities/users';
import {getConfig} from 'bulletin-redux/selectors/entities/general';
import {Client4} from 'bulletin-redux/client';
import {isMinimumServerVersion} from 'bulletin-redux/utils/helpers';

import {BuiltInEmojis, EmojiIndicesByAlias, Emojis} from 'app/utils/emojis';

import Emoji from './emoji';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const emojiName = ownProps.emojiName;
    const customEmojis = getCustomEmojisByName(state);

    let imageUrl = '';
    let unicode;
    let isCustomEmoji = false;
    let displayTextOnly = false;
    if (EmojiIndicesByAlias.has(emojiName) || BuiltInEmojis.includes(emojiName)) {
        const emoji = Emojis[EmojiIndicesByAlias.get(emojiName)];
        unicode = emoji.filename;
        if (BuiltInEmojis.includes(emojiName)) {
            imageUrl = Client4.getSystemEmojiImageUrl(emoji.filename);
        }
    } else if (customEmojis.has(emojiName)) {
        const emoji = customEmojis.get(emojiName);
        imageUrl = Client4.getCustomEmojiImageUrl(emoji.id);
        isCustomEmoji = true;
    } else {
        displayTextOnly = state.entities.emojis.nonExistentEmoji.has(emojiName) ||
            config.EnableCustomEmoji !== 'true' ||
            config.ExperimentalEnablePostMetadata === 'true' ||
            getCurrentUserId(state) === '' ||
            isMinimumServerVersion(Client4.getServerVersion(), 5, 12);
    }

    return {
        imageUrl,
        isCustomEmoji,
        displayTextOnly,
        unicode,
    };
}

export default connect(mapStateToProps)(Emoji);
