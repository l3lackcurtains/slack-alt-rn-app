// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getTermsOfService, logout, updateMyTermsOfServiceStatus} from 'bulletin-redux/actions/users';
import {getConfig} from 'bulletin-redux/selectors/entities/general';
import {getTheme} from 'bulletin-redux/selectors/entities/preferences';

import TermsOfService from './terms_of_service.js';

function mapStateToProps(state) {
    const config = getConfig(state);

    return {
        siteName: config.SiteName,
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTermsOfService,
            logout,
            updateMyTermsOfServiceStatus,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TermsOfService);
