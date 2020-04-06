// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {UserTypes} from 'bulletin-redux/action_types';

import {ViewTypes} from 'app/constants';

function emojiPickerCustomPage(state = 0, action) {
    switch (action.type) {
    case ViewTypes.INCREMENT_EMOJI_PICKER_PAGE:
        return state + 1;
    case UserTypes.LOGOUT_SUCCESS:
        return 0;
    default:
        return state;
    }
}

export default combineReducers({
    emojiPickerCustomPage,
});

