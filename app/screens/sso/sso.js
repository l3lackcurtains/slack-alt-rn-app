// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {injectIntl, intlShape} from 'react-intl';
import {
    Text,
    View,
    Platform,
} from 'react-native';
import {WebView} from 'react-native-webview';
import CookieManager from 'react-native-cookies';
import urlParse from 'url-parse';

import {Client4} from 'bulletin-redux/client';

import {ViewTypes} from 'app/constants';
import Loading from 'app/components/loading';
import {paddingHorizontal as padding} from 'app/components/safe_area_view/iphone_x_spacing';
import StatusBar from 'app/components/status_bar';
import {resetToChannel} from 'app/actions/navigation';
import {changeOpacity, makeStyleSheetFromTheme} from 'app/utils/theme';
import tracker from 'app/utils/time_tracker';

const HEADERS = {
    'X-Mobile-App': 'mattermost',
};

const postMessageJS = "window.postMessage(document.body.innerText, '*');";

// Used to make sure that OneLogin forms scale appropriately on both platforms.
const oneLoginFormScalingJS = `
    (function() {
        var loginPage = document.getElementById('login-page');
        var submitButton = document.getElementById('user_submit');

        if (loginPage) {
            loginPage.setAttribute('style', 'background-repeat: repeat-y;');
        }
        
        function resetPadding() {
            var mainBody = document.getElementById('body-main');
            
            if (mainBody) {
                mainBody.setAttribute('style', 'height: auto; padding: 10px 0;');
            }

            if (submitButton) {
                submitButton.removeEventListener('click', resetPadding);
            }
        }

        resetPadding();
        
        if (submitButton) {
            submitButton.addEventListener('click', resetPadding);
        }
    })();
`;

class SSO extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            scheduleExpiredNotification: PropTypes.func.isRequired,
            ssoLogin: PropTypes.func.isRequired,
        }).isRequired,
        intl: intlShape.isRequired,
        isLandscape: PropTypes.bool.isRequired,
        serverUrl: PropTypes.string.isRequired,
        ssoType: PropTypes.string.isRequired,
        theme: PropTypes.object,
    };

    useWebkit = true;

    constructor(props) {
        super(props);

        this.state = {
            error: null,
            renderWebView: true,
            jsCode: '',
            messagingEnabled: false,
        };

        switch (props.ssoType) {
        case ViewTypes.GITLAB:
            this.loginUrl = `${props.serverUrl}/oauth/gitlab/mobile_login`;
            this.completedUrl = '/signup/gitlab/complete';
            break;
        case ViewTypes.SAML:
            this.loginUrl = `${props.serverUrl}/login/sso/saml?action=mobile`;
            this.completedUrl = '/login/sso/saml';
            break;
        case ViewTypes.OFFICE365:
            this.loginUrl = `${props.serverUrl}/oauth/office365/mobile_login`;
            this.completedUrl = '/signup/office365/complete';
            break;
        }

        if (Platform.OS === 'ios') {
            this.useWebkit = parseInt(Platform.Version, 10) >= 11;
        }
    }

    goToChannel = () => {
        tracker.initialLoad = Date.now();

        this.scheduleSessionExpiredNotification();

        resetToChannel();
    };

    onMessage = (event) => {
        try {
            const response = JSON.parse(event.nativeEvent.data);
            if (response) {
                const {
                    id,
                    message,
                    status_code: statusCode,
                } = response;
                if (id && message && statusCode !== 200) {
                    this.setState({error: message});
                }
            }
        } catch (e) {
            // do nothing
        }
    };

    onNavigationStateChange = (navState) => {
        const {url} = navState;
        const nextState = {
            messagingEnabled: false,
        };
        const parsed = urlParse(url);

        if (parsed.host.includes('.onelogin.com')) {
            nextState.jsCode = oneLoginFormScalingJS;
        } else if (parsed.pathname === this.completedUrl) {
            // To avoid `window.postMessage` conflicts in any of the SSO flows
            // we enable the onMessage handler only When the webView navigates to the final SSO URL.
            nextState.messagingEnabled = true;
        }

        this.setState(nextState);
    };

    onLoadEnd = (event) => {
        const url = event.nativeEvent.url;
        if (url.includes(this.completedUrl)) {
            CookieManager.get(this.props.serverUrl, this.useWebkit).then((res) => {
                const token = res.MMAUTHTOKEN;

                if (token) {
                    this.setState({renderWebView: false});
                    const {
                        ssoLogin,
                    } = this.props.actions;

                    Client4.setToken(token);
                    ssoLogin(token).then((result) => {
                        if (result.error) {
                            this.onLoadEndError(result.error);
                            return;
                        }
                        this.goToChannel();
                    });
                } else if (this.webView && !this.state.error) {
                    this.webView.injectJavaScript(postMessageJS);
                }
            });
        }
    };

    onLoadEndError = (e) => {
        console.warn('Failed to set store from local data', e); // eslint-disable-line no-console
        this.setState({error: e.message});
    };

    scheduleSessionExpiredNotification = () => {
        const {actions, intl} = this.props;

        actions.scheduleExpiredNotification(intl);
    };

    renderLoading = () => {
        return <Loading/>;
    };

    webViewRef = (ref) => {
        this.webView = ref;
    };

    render() {
        const {theme, isLandscape} = this.props;
        const {error, messagingEnabled, renderWebView, jsCode} = this.state;
        const style = getStyleSheet(theme);

        let content;
        if (!renderWebView) {
            content = this.renderLoading();
        } else if (error) {
            content = (
                <View style={style.errorContainer}>
                    <Text style={style.errorText}>{error}</Text>
                </View>
            );
        } else {
            content = (
                <WebView
                    ref={this.webViewRef}
                    source={{uri: this.loginUrl, headers: HEADERS}}
                    javaScriptEnabledAndroid={true}
                    automaticallyAdjustContentInsets={false}
                    startInLoadingState={true}
                    onNavigationStateChange={this.onNavigationStateChange}
                    onShouldStartLoadWithRequest={() => true}
                    injectedJavaScript={jsCode}
                    onLoadEnd={this.onLoadEnd}
                    onMessage={messagingEnabled ? this.onMessage : null}
                    useSharedProcessPool={true}
                    cacheEnabled={false}
                />
            );
        }

        return (
            <View style={[style.container, padding(isLandscape)]}>
                <StatusBar/>
                {content}
            </View>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flex: 1,
        },
        errorContainer: {
            alignItems: 'center',
            flex: 1,
            marginTop: 40,
        },
        errorText: {
            color: changeOpacity(theme.centerChannelColor, 0.4),
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 23,
            paddingHorizontal: 30,
        },
    };
});

export default injectIntl(SSO);
