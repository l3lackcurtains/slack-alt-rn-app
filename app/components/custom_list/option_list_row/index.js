// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getTheme} from 'bulletin-redux/selectors/entities/preferences';
import {isLandscape} from 'app/selectors/device';
import OptionListRow from './option_list_row';

function mapStateToProps(state) {
    return {
        theme: getTheme(state),
        isLandscape: isLandscape(state),
    };
}

export default connect(mapStateToProps)(OptionListRow);
