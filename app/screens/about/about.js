// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import AppIcon from 'app/components/app_icon';
import FormattedText from 'app/components/formatted_text';
import { paddingHorizontal as padding } from 'app/components/safe_area_view/iphone_x_spacing';
import StatusBar from 'app/components/status_bar';
import AboutLinks from 'app/constants/about_links';
import { changeOpacity, makeStyleSheetFromTheme } from 'app/utils/theme';
import Config from 'assets/config';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';


const MATTERMOST_BUNDLE_IDS = ['com.bulletin.schools', 'com.mattermost.rn'];

export default class About extends PureComponent {
    static propTypes = {
        config: PropTypes.object.isRequired,
        license: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        isLandscape: PropTypes.bool.isRequired,
    };

    handleAboutTeam = () => {
        Linking.openURL(Config.AboutTeamURL);
    };

    handleAboutEnterprise = () => {
        Linking.openURL(Config.AboutEnterpriseURL);
    };

    handlePlatformNotice = () => {
        Linking.openURL(Config.PlatformNoticeURL);
    };

    handleMobileNotice = () => {
        Linking.openURL(Config.MobileNoticeURL);
    };

    handleTermsOfService = () => {
        Linking.openURL(AboutLinks.TERMS_OF_SERVICE);
    };

    handlePrivacyPolicy = () => {
        Linking.openURL(AboutLinks.PRIVACY_POLICY);
    }

    render() {
        const { theme, config, license, isLandscape } = this.props;
        const style = getStyleSheet(theme);

        let title = (
            <FormattedText
                id='about.teamEditiont0'
                defaultMessage='Team Edition'
                style={style.title}
            />
        );

        let subTitle = (
            <FormattedText
                id='about.teamEditionSt'
                defaultMessage='All your team communication in one place, instantly searchable and accessible anywhere.'
                style={style.subtitle}
            />
        );

        let learnMore = (
            <View style={style.learnContainer}>
                <FormattedText
                    id='about.teamEditionLearn'
                    defaultMessage='Join the Bulletin community at '
                    style={style.learn}
                />
                <TouchableOpacity
                    onPress={this.handleAboutTeam}
                >
                    <Text style={style.learnLink}>
                        {Config.TeamEditionLearnURL}
                    </Text>
                </TouchableOpacity>
            </View>
        );

        let licensee;
        if (config.BuildEnterpriseReady === 'true') {
            title = (
                <FormattedText
                    id='about.teamEditiont1'
                    defaultMessage='Enterprise Edition'
                    style={style.title}
                />
            );

            subTitle = (
                <FormattedText
                    id='about.enterpriseEditionSt'
                    defaultMessage='Modern communication from behind your firewall.'
                    style={style.subtitle}
                />
            );

            learnMore = (
                <View style={style.learnContainer}>
                    <FormattedText
                        id='about.enterpriseEditionLearn'
                        defaultMessage='Learn more about Enterprise Edition at '
                        style={style.learn}
                    />
                    <TouchableOpacity
                        onPress={this.handleAboutEnterprise}
                    >
                        <Text style={style.learnLink}>
                            {Config.EELearnURL}
                        </Text>
                    </TouchableOpacity>
                </View>
            );

            if (license.IsLicensed === 'true') {
                title = (
                    <FormattedText
                        id='about.enterpriseEditione1'
                        defaultMessage='Enterprise Edition'
                        style={style.title}
                    />
                );

                licensee = (
                    <View style={style.licenseContainer}>
                        <FormattedText
                            id='mobile.about.licensed'
                            defaultMessage='Licensed to: {company}'
                            style={style.info}
                            values={{
                                company: license.Company,
                            }}
                        />
                    </View>
                );
            }
        }

        let serverVersion;
        if (config.BuildNumber === config.Version) {
            serverVersion = (
                <FormattedText
                    id='mobile.about.serverVersionNoBuild'
                    defaultMessage='Server Version: {version}'
                    style={style.info}
                    values={{
                        version: config.Version,
                    }}
                />
            );
        } else {
            serverVersion = (
                <FormattedText
                    id='mobile.about.serverVersion'
                    defaultMessage='Server Version: {version} (Build {number})'
                    style={style.info}
                    values={{
                        version: config.Version,
                        number: config.BuildNumber,
                    }}
                />
            );
        }

        let termsOfService;
        if (config.TermsOfServiceLink) {
            termsOfService = (
                <FormattedText
                    id='mobile.tos_link'
                    defaultMessage='Terms of Service'
                    style={style.noticeLink}
                    onPress={this.handleTermsOfService}
                />
            );
        }

        let privacyPolicy;
        if (config.PrivacyPolicyLink) {
            privacyPolicy = (
                <FormattedText
                    id='mobile.privacy_link'
                    defaultMessage='Privacy Policy'
                    style={style.noticeLink}
                    onPress={this.handlePrivacyPolicy}
                />
            );
        }

        let tosPrivacyHyphen;
        if (termsOfService && privacyPolicy) {
            tosPrivacyHyphen = (
                <Text style={[style.footerText, style.hyphenText]}>
                    {' - '}
                </Text>
            );
        }

        return (
            <View style={style.wrapper}>
                <StatusBar />
                <ScrollView
                    style={[style.scrollView, padding(isLandscape)]}
                    contentContainerStyle={style.scrollViewContent}
                >
                    <View style={style.logoContainer}>
                        <AppIcon
                            color={theme.centerChannelColor}
                            height={120}
                            width={120}
                        />
                    </View>
                    <View style={style.infoContainer}>
                        <View style={style.titleContainer}>
                            <Text style={style.title}>
                                {'Bulletin'}
                            </Text>
                        </View>
                        {subTitle}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        wrapper: {
            flex: 1,
        },
        scrollView: {
            flex: 1,
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.06),
        },
        scrollViewContent: {
            paddingBottom: 30,
        },
        logoContainer: {
            alignItems: 'center',
            flex: 1,
            height: 200,
            paddingVertical: 40,
        },
        infoContainer: {
            flex: 1,
            flexDirection: 'column',
            paddingHorizontal: 20,
        },
        titleContainer: {
            flex: 1,
            marginBottom: 20,
        },
        title: {
            fontSize: 22,
            color: theme.centerChannelColor,
        },
        subtitle: {
            color: changeOpacity(theme.centerChannelColor, 0.5),
            fontSize: 19,
            marginBottom: 15,
        },
        learnContainer: {
            flex: 1,
            flexDirection: 'column',
            marginVertical: 20,
        },
        learn: {
            color: theme.centerChannelColor,
            fontSize: 16,
        },
        learnLink: {
            color: theme.linkColor,
            fontSize: 16,
        },
        info: {
            color: theme.centerChannelColor,
            fontSize: 16,
            lineHeight: 19,
        },
        licenseContainer: {
            flex: 1,
            flexDirection: 'row',
            marginTop: 20,
        },
        noticeContainer: {
            flex: 1,
            flexDirection: 'column',
        },
        noticeLink: {
            color: theme.linkColor,
            fontSize: 11,
            lineHeight: 13,
        },
        hashContainer: {
            flex: 1,
            flexDirection: 'column',
        },
        footerGroup: {
            flex: 1,
        },
        footerTitleText: {
            color: changeOpacity(theme.centerChannelColor, 0.5),
            fontSize: 11,
            fontWeight: '600',
            lineHeight: 13,
        },
        footerText: {
            color: changeOpacity(theme.centerChannelColor, 0.5),
            fontSize: 11,
            lineHeight: 13,
            marginBottom: 10,
        },
        copyrightText: {
            marginBottom: 0,
        },
        hyphenText: {
            marginBottom: 0,
        },
        tosPrivacyContainer: {
            flex: 1,
            flexDirection: 'row',
            marginBottom: 10,
        },
    };
});
