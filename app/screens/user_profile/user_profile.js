// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    ScrollView,
    Text,
    View,
    Linking,
} from 'react-native';
import {intlShape} from 'react-intl';
import {Navigation} from 'react-native-navigation';

import {displayUsername} from 'bulletin-redux/utils/user_utils';
import {getUserCurrentTimezone} from 'bulletin-redux/utils/timezone_utils';

import {paddingHorizontal as padding} from 'app/components/safe_area_view/iphone_x_spacing';
import ProfilePicture from 'app/components/profile_picture';
import FormattedText from 'app/components/formatted_text';
import FormattedTime from 'app/components/formatted_time';
import StatusBar from 'app/components/status_bar';
import {BotTag, GuestTag} from 'app/components/tag';

import {alertErrorWithFallback} from 'app/utils/general';
import {changeOpacity, makeStyleSheetFromTheme} from 'app/utils/theme';
import {t} from 'app/utils/i18n';
import {isGuest} from 'app/utils/users';

import {
    goToScreen,
    popToRoot,
    dismissModal,
    dismissAllModals,
    setButtons,
} from 'app/actions/navigation';

import UserProfileRow from './user_profile_row';
import Config from 'assets/config';

export default class UserProfile extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            makeDirectChannel: PropTypes.func.isRequired,
            setChannelDisplayName: PropTypes.func.isRequired,
            loadBot: PropTypes.func.isRequired,
        }).isRequired,
        componentId: PropTypes.string,
        config: PropTypes.object.isRequired,
        currentDisplayName: PropTypes.string,
        teammateNameDisplay: PropTypes.string,
        theme: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
        bot: PropTypes.object,
        militaryTime: PropTypes.bool.isRequired,
        enableTimezone: PropTypes.bool.isRequired,
        isMyUser: PropTypes.bool.isRequired,
        fromSettings: PropTypes.bool,
        isLandscape: PropTypes.bool.isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    rightButton = {
        id: 'edit-profile',
        showAsAction: 'always',
    };

    constructor(props, context) {
        super(props);

        if (props.isMyUser) {
            this.rightButton.color = props.theme.sidebarHeaderTextColor;
            this.rightButton.text = context.intl.formatMessage({id: 'mobile.routes.user_profile.edit', defaultMessage: 'Edit'});

            const buttons = {
                rightButtons: [this.rightButton],
            };

            setButtons(props.componentId, buttons);
        }
    }

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this);

        if (this.props.user && this.props.user.is_bot) {
            this.props.actions.loadBot(this.props.user.id);
        }
    }

    navigationButtonPressed({buttonId}) {
        switch (buttonId) {
        case this.rightButton.id:
            this.goToEditProfile();
            break;
        case 'close-settings':
            this.close();
            break;
        }
    }

    close = async () => {
        const {fromSettings} = this.props;

        if (fromSettings) {
            dismissModal();
            return;
        }

        await dismissAllModals();
        await popToRoot();
    };

    getDisplayName = () => {
        const {theme, teammateNameDisplay, user} = this.props;
        const style = createStyleSheet(theme);

        const displayName = displayUsername(user, teammateNameDisplay);

        if (displayName) {
            return (
                <View style={style.indicatorContainer}>
                    <Text style={style.displayName}>
                        {displayName}
                    </Text>
                    <BotTag
                        show={Boolean(user.is_bot)}
                        theme={theme}
                    />
                    <GuestTag
                        show={isGuest(user)}
                        theme={theme}
                    />
                </View>
            );
        }

        return null;
    };

    buildDisplayBlock = (property) => {
        const {theme, user, isLandscape} = this.props;
        const style = createStyleSheet(theme);

        if (user.hasOwnProperty(property) && user[property].length > 0) {
            return (
                <View>
                    <Text style={[style.header, padding(isLandscape)]}>{property.toUpperCase()}</Text>
                    <Text style={[style.text, padding(isLandscape)]}>{user[property]}</Text>
                </View>
            );
        }

        return null;
    };

    buildTimezoneBlock = () => {
        const {theme, user, militaryTime, isLandscape} = this.props;
        const style = createStyleSheet(theme);

        const currentTimezone = getUserCurrentTimezone(user.timezone);
        if (!currentTimezone) {
            return null;
        }
        const nowDate = new Date();

        return (
            <View>
                <FormattedText
                    id='mobile.routes.user_profile.local_time'
                    defaultMessage='LOCAL TIME'
                    style={[style.header, padding(isLandscape)]}
                />
                <Text style={[style.text, padding(isLandscape)]}>
                    <FormattedTime
                        timeZone={currentTimezone}
                        hour12={!militaryTime}
                        value={nowDate}
                    />
                </Text>
            </View>
        );
    };

    sendMessage = async () => {
        const {intl} = this.context;
        const {actions, currentDisplayName, teammateNameDisplay, user} = this.props;

        // save the current channel display name in case it fails
        const currentChannelDisplayName = currentDisplayName;

        const userDisplayName = displayUsername(user, teammateNameDisplay);
        actions.setChannelDisplayName(userDisplayName);

        const result = await actions.makeDirectChannel(user.id);
        if (result.error) {
            actions.setChannelDisplayName(currentChannelDisplayName);
            alertErrorWithFallback(
                intl,
                result.error,
                {
                    id: t('mobile.open_dm.error'),
                    defaultMessage: "We couldn't open a direct message with {displayName}. Please check your connection and try again.",
                },
                {
                    displayName: userDisplayName,
                },
            );
        } else {
            this.close();
        }
    };

    handleLinkPress = (link) => {
        const username = this.props.user.username;
        const email = this.props.user.email;

        return () => {
            var hydrated = link.replace(/{email}/, email);
            hydrated = hydrated.replace(/{username}/, username);
            Linking.openURL(hydrated);
        };
    };

    goToEditProfile = () => {
        const {user: currentUser} = this.props;
        const {formatMessage} = this.context.intl;
        const commandType = 'Push';
        const screen = 'EditProfile';
        const title = formatMessage({id: 'mobile.routes.edit_profile', defaultMessage: 'Edit Profile'});
        const passProps = {currentUser, commandType};

        requestAnimationFrame(() => {
            goToScreen(screen, title, passProps);
        });
    };

    renderAdditionalOptions = () => {
        if (!Config.ExperimentalProfileLinks) {
            return null;
        }

        const profileLinks = Config.ExperimentalProfileLinks;

        const additionalOptions = profileLinks.map((l) => {
            var action;
            if (l.type === 'link') {
                action = this.handleLinkPress(l.url);
            }

            return (
                <UserProfileRow
                    key={l.defaultMessage}
                    action={action}
                    defaultMessage={l.defaultMessage}
                    textId={l.textId}
                    icon={l.icon}
                    iconType={l.iconType}
                    theme={this.props.theme}
                    iconSize={l.iconSize}
                />
            );
        });

        return additionalOptions;
    };

    renderDetailsBlock = (style) => {
        if (this.props.user.is_bot) {
            if (!this.props.bot) {
                return null;
            }

            return (
                <View style={[style.content, padding(this.props.isLandscape)]}>
                    <View>
                        <Text style={style.header}>{'DESCRIPTION'}</Text>
                        <Text style={style.text}>{this.props.bot.description || ''}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={style.content}>
                {this.props.enableTimezone && this.buildTimezoneBlock()}
                {this.buildDisplayBlock('username')}
                {this.props.config.ShowEmailAddress === 'true' && this.buildDisplayBlock('email')}
                {this.buildDisplayBlock('nickname')}
                {this.buildDisplayBlock('position')}
            </View>
        );
    }

    render() {
        const {theme, user, isLandscape} = this.props;
        const style = createStyleSheet(theme);

        if (!user) {
            return null;
        }

        return (
            <View style={style.container}>
                <StatusBar/>
                <ScrollView
                    style={style.scrollView}
                >
                    <View style={style.top}>
                        <ProfilePicture
                            userId={user.id}
                            size={150}
                            statusBorderWidth={6}
                            statusSize={40}
                        />
                        {this.getDisplayName()}
                        <Text style={style.username}>{`@${user.username}`}</Text>
                    </View>
                    {this.renderDetailsBlock(style)}
                    <UserProfileRow
                        action={this.sendMessage}
                        defaultMessage='Send Message'
                        icon='paper-plane-o'
                        iconType='fontawesome'
                        textId={t('mobile.routes.user_profile.send_message')}
                        theme={theme}
                        isLandscape={isLandscape}
                    />
                    {this.renderAdditionalOptions()}
                </ScrollView>
            </View>
        );
    }
}

const createStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flex: 1,
        },
        content: {
            marginBottom: 25,
            marginHorizontal: 15,
        },
        displayName: {
            color: theme.centerChannelColor,
            fontSize: 17,
            fontWeight: '600',
        },
        header: {
            fontSize: 13,
            fontWeight: '600',
            color: changeOpacity(theme.centerChannelColor, 0.5),
            marginTop: 25,
            marginBottom: 10,
        },
        scrollView: {
            flex: 1,
            backgroundColor: theme.centerChannelBg,
        },
        text: {
            fontSize: 15,
            color: theme.centerChannelColor,
        },
        top: {
            padding: 25,
            alignItems: 'center',
            justifyContent: 'center',
        },
        username: {
            marginTop: 15,
            color: theme.centerChannelColor,
            fontSize: 15,
        },
        indicatorContainer: {
            marginTop: 15,
            flexDirection: 'row',
        },
    };
});

