// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import { resetToChannel, resetToSelectServer } from 'app/actions/navigation';
import { setDeepLinkURL } from 'app/actions/views/root';
import { loadMe } from 'app/actions/views/user';
import { NavigationTypes } from 'app/constants';
import { getAppCredentials } from 'app/init/credentials';
import 'app/init/device';
import emmProvider from 'app/init/emm_provider';
import 'app/init/fetch';
import globalEventHandler from 'app/init/global_event_handler';
import { registerScreens } from 'app/screens';
import store from 'app/store';
import EphemeralStore from 'app/store/ephemeral_store';
import { waitForHydration } from 'app/store/utils';
import telemetry from 'app/telemetry';
import pushNotificationsUtils from 'app/utils/push_notifications';
import EventEmitter from 'mattermost-redux/utils/event_emitter';
import { Linking } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { Provider } from 'react-redux';




const init = async () => {
    const credentials = await getAppCredentials();
    if (EphemeralStore.appStarted) {
        launchApp(credentials);
        return;
    }

    pushNotificationsUtils.configure(store);
    globalEventHandler.configure({
        store,
        launchApp,
    });

    registerScreens(store, Provider);

    if (!EphemeralStore.appStarted) {
        launchAppAndAuthenticateIfNeeded(credentials);
    }
};

const launchApp = (credentials) => {
    telemetry.start([
        'start:select_server_screen',
        'start:channel_screen',
    ]);

    if (credentials) {
        waitForHydration(store, async () => {
            store.dispatch(loadMe());
            resetToChannel({ skipMetrics: true });
        });
    } else {
        resetToSelectServer();
    }

    telemetry.startSinceLaunch(['start:splash_screen']);
    EphemeralStore.appStarted = true;

    Linking.getInitialURL().then((url) => {
        store.dispatch(setDeepLinkURL(url));
    });
};

const launchAppAndAuthenticateIfNeeded = async (credentials) => {
    await emmProvider.handleManagedConfig(store);
    await launchApp(credentials);

    if (emmProvider.enabled) {
        if (emmProvider.jailbreakProtection) {
            emmProvider.checkIfDeviceIsTrusted();
        }

        if (emmProvider.inAppPinCode) {
            await emmProvider.handleAuthentication(store);
        }
    }
};

Navigation.events().registerAppLaunchedListener(() => {
    init();

    // Keep track of the latest componentId to appear
    Navigation.events().registerComponentDidAppearListener(({ componentId }) => {
        EphemeralStore.addNavigationComponentId(componentId);

        switch (componentId) {
            case 'MainSidebar':
                EventEmitter.emit(NavigationTypes.MAIN_SIDEBAR_DID_OPEN, this.handleSidebarDidOpen);
                EventEmitter.emit(Navigation.BLUR_POST_TEXTBOX);
                break;
            case 'SettingsSidebar':
                EventEmitter.emit(NavigationTypes.BLUR_POST_TEXTBOX);
                break;
        }
    });

    Navigation.events().registerComponentDidDisappearListener(({ componentId }) => {
        EphemeralStore.removeNavigationComponentId(componentId);

        if (componentId === 'MainSidebar') {
            EventEmitter.emit(NavigationTypes.MAIN_SIDEBAR_DID_CLOSE);
        }
    });
});
