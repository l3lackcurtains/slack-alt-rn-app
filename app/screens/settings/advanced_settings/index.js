// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {purgeOfflineStore} from 'app/actions/views/root';
import {getTheme} from 'bulletin-redux/selectors/entities/preferences';
import {isLandscape} from 'app/selectors/device';
import AdvancedSettings from './advanced_settings';

function mapStateToProps(state) {
    return {
        theme: getTheme(state),
        isLandscape: isLandscape(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            purgeOfflineStore,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedSettings);
