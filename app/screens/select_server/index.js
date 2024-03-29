// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getPing, resetPing, setServerVersion} from 'bulletin-redux/actions/general';
import {login} from 'bulletin-redux/actions/users';
import {getConfig, getLicense} from 'bulletin-redux/selectors/entities/general';

import {setLastUpgradeCheck} from 'app/actions/views/client_upgrade';
import {handleSuccessfulLogin, scheduleExpiredNotification} from 'app/actions/views/login';
import {loadConfigAndLicense} from 'app/actions/views/root';
import {handleServerUrlChanged} from 'app/actions/views/select_server';
import getClientUpgrade from 'app/selectors/client_upgrade';

import SelectServer from './select_server';

function mapStateToProps(state) {
    const config = getConfig(state);
    const license = getLicense(state);
    const {currentVersion, latestVersion, minVersion} = getClientUpgrade(state);

    return {
        ...state.views.selectServer,
        config,
        currentVersion,
        hasConfigAndLicense: Object.keys(config).length > 0 && Object.keys(license).length > 0,
        latestVersion,
        license,
        minVersion,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            handleSuccessfulLogin,
            getPing,
            scheduleExpiredNotification,
            handleServerUrlChanged,
            loadConfigAndLicense,
            login,
            resetPing,
            setLastUpgradeCheck,
            setServerVersion,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectServer);
