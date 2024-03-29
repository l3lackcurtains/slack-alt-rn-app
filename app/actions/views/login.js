// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import moment from 'moment-timezone';

import {getDataRetentionPolicy} from 'bulletin-redux/actions/general';
import {GeneralTypes} from 'bulletin-redux/action_types';
import {getSessions} from 'bulletin-redux/actions/users';
import {autoUpdateTimezone} from 'bulletin-redux/actions/timezone';
import {Client4} from 'bulletin-redux/client';
import {getConfig, getLicense} from 'bulletin-redux/selectors/entities/general';
import {isTimezoneEnabled} from 'bulletin-redux/selectors/entities/timezone';
import {getCurrentUserId} from 'bulletin-redux/selectors/entities/users';

import {ViewTypes} from 'app/constants';
import {setAppCredentials} from 'app/init/credentials';
import PushNotifications from 'app/push_notifications';
import {getDeviceTimezoneAsync} from 'app/utils/timezone';
import {setCSRFFromCookie} from 'app/utils/security';
import {loadConfigAndLicense} from 'app/actions/views/root';

export function handleLoginIdChanged(loginId) {
    return {
        type: ViewTypes.LOGIN_ID_CHANGED,
        loginId,
    };
}

export function handlePasswordChanged(password) {
    return {
        type: ViewTypes.PASSWORD_CHANGED,
        password,
    };
}

export function handleSuccessfulLogin() {
    return async (dispatch, getState) => {
        await dispatch(loadConfigAndLicense());

        const state = getState();
        const config = getConfig(state);
        const license = getLicense(state);
        const token = Client4.getToken();
        const url = Client4.getUrl();
        const deviceToken = state.entities.general.deviceToken;
        const currentUserId = getCurrentUserId(state);

        await setCSRFFromCookie(url);
        setAppCredentials(deviceToken, currentUserId, token, url);

        const enableTimezone = isTimezoneEnabled(state);
        if (enableTimezone) {
            const timezone = await getDeviceTimezoneAsync();
            dispatch(autoUpdateTimezone(timezone));
        }

        dispatch({
            type: GeneralTypes.RECEIVED_APP_CREDENTIALS,
            data: {
                url,
            },
        });

        if (config.DataRetentionEnableMessageDeletion && config.DataRetentionEnableMessageDeletion === 'true' &&
            license.IsLicensed === 'true' && license.DataRetention === 'true') {
            dispatch(getDataRetentionPolicy());
        } else {
            dispatch({type: GeneralTypes.RECEIVED_DATA_RETENTION_POLICY, data: {}});
        }

        return true;
    };
}

export function scheduleExpiredNotification(intl) {
    return (dispatch, getState) => {
        const state = getState();
        const {currentUserId} = state.entities.users;
        const {deviceToken} = state.entities.general;
        const config = getConfig(state);

        // Once the user logs in we are going to wait for 10 seconds
        // before retrieving the session that belongs to this device
        // to ensure that we get the actual session without issues
        // then we can schedule the local notification for the session expired
        setTimeout(async () => {
            let sessions;
            try {
                sessions = await dispatch(getSessions(currentUserId));
            } catch (e) {
                console.warn('Failed to get current session', e); // eslint-disable-line no-console
                return;
            }

            if (!Array.isArray(sessions.data)) {
                return;
            }

            const session = sessions.data.find((s) => s.device_id === deviceToken);
            const expiresAt = session?.expires_at || 0; //eslint-disable-line camelcase
            const expiresInDays = parseInt(Math.ceil(Math.abs(moment.duration(moment().diff(expiresAt)).asDays())), 10);

            const message = intl.formatMessage({
                id: 'mobile.session_expired',
                defaultMessage: 'Session Expired: Please log in to continue receiving notifications. Sessions for {siteName} are configured to expire every {daysCount, number} {daysCount, plural, one {day} other {days}}.',
            }, {
                siteName: config.SiteName,
                daysCount: expiresInDays,
            });

            if (expiresAt) {
                PushNotifications.localNotificationSchedule({
                    date: new Date(expiresAt),
                    message,
                    userInfo: {
                        localNotification: true,
                    },
                });
            }
        }, 10000);
    };
}

export default {
    handleLoginIdChanged,
    handlePasswordChanged,
    handleSuccessfulLogin,
    scheduleExpiredNotification,
};
