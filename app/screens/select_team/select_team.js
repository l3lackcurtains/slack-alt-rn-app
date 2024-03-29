// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    Alert,
    InteractionManager,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {Navigation} from 'react-native-navigation';

import {RequestStatus} from 'bulletin-redux/constants';
import EventEmitter from 'bulletin-redux/utils/event_emitter';
import {isMinimumServerVersion} from 'bulletin-redux/utils/helpers';

import FormattedText from 'app/components/formatted_text';
import Loading from 'app/components/loading';
import StatusBar from 'app/components/status_bar';
import CustomList from 'app/components/custom_list';
import {paddingHorizontal as padding} from 'app/components/safe_area_view/iphone_x_spacing';
import TeamIcon from 'app/components/team_icon';
import {NavigationTypes} from 'app/constants';
import {resetToChannel, dismissModal} from 'app/actions/navigation';
import {preventDoubleTap} from 'app/utils/tap';
import {changeOpacity, makeStyleSheetFromTheme} from 'app/utils/theme';
import {t} from 'app/utils/i18n';

const TEAMS_PER_PAGE = 50;

export default class SelectTeam extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            getTeams: PropTypes.func.isRequired,
            handleTeamChange: PropTypes.func.isRequired,
            joinTeam: PropTypes.func.isRequired,
            addUserToTeam: PropTypes.func.isRequired,
            logout: PropTypes.func.isRequired,
        }).isRequired,
        currentUrl: PropTypes.string.isRequired,
        currentUserIsGuest: PropTypes.bool.isRequired,
        currentUserId: PropTypes.string.isRequired,
        userWithoutTeams: PropTypes.bool,
        teams: PropTypes.array.isRequired,
        theme: PropTypes.object,
        teamsRequest: PropTypes.object.isRequired,
        isLandscape: PropTypes.bool.isRequired,
        serverVersion: PropTypes.string,
    };

    static defaultProps = {
        teams: [],
    };

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            joining: false,
            teams: [],
            page: 0,
            refreshing: false,
        };
    }

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this);

        this.getTeams();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.teams !== nextProps.teams) {
            this.buildData(nextProps);
        }
    }

    navigationButtonPressed({buttonId}) {
        const {logout} = this.props.actions;

        switch (buttonId) {
        case 'close-teams':
            this.close();
            break;
        case 'logout':
            InteractionManager.runAfterInteractions(logout);
            break;
        }
    }

    getTeams = () => {
        this.setState({loading: true});
        this.props.actions.getTeams(this.state.page, TEAMS_PER_PAGE).then(() => {
            this.setState((state) => ({
                loading: false,
                refreshing: false,
                page: state.page + 1,
            }));
        });
    }

    buildData = (props) => {
        if (props.teams.length) {
            this.setState({teams: props.teams});
        } else {
            const teams = [{
                id: t('mobile.select_team.no_teams'),
                defaultMessage: 'There are no available teams for you to join.',
            }];
            this.setState({teams});
        }
    };

    close = () => {
        dismissModal();
    };

    goToChannelView = () => {
        const passProps = {
            disableTermsModal: true,
        };

        resetToChannel(passProps);
    };

    onSelectTeam = async (team) => {
        this.setState({joining: true});
        const {userWithoutTeams, currentUserId, serverVersion} = this.props;
        const {
            joinTeam,
            addUserToTeam,
            handleTeamChange,
        } = this.props.actions;

        let error;
        if (isMinimumServerVersion(serverVersion, 5, 18)) {
            const result = await addUserToTeam(team.id, currentUserId);
            error = result.error;
        } else {
            const result = await joinTeam(team.invite_id, team.id);
            error = result.error;
        }
        if (error) {
            Alert.alert(error.message);
            this.setState({joining: false});
            return;
        }

        handleTeamChange(team.id);

        if (userWithoutTeams) {
            this.goToChannelView();
        } else {
            EventEmitter.emit(NavigationTypes.CLOSE_MAIN_SIDEBAR);
            InteractionManager.runAfterInteractions(() => {
                this.close();
            });
        }
    };

    onRefresh = () => {
        this.setState({page: 0, refreshing: true}, () => {
            this.getTeams();
        });
    }

    renderItem = ({item}) => {
        const {currentUrl, theme, isLandscape} = this.props;
        const style = getStyleFromTheme(theme);

        if (item.id === 'mobile.select_team.no_teams') {
            return (
                <View style={style.teamWrapper}>
                    <View style={style.teamContainer}>
                        <FormattedText
                            id={item.id}
                            defaultMessage={item.defaultMessage}
                            style={style.noTeam}
                        />
                    </View>
                </View>
            );
        }

        return (
            <View style={[style.teamWrapper, padding(isLandscape)]}>
                <TouchableOpacity
                    onPress={preventDoubleTap(() => this.onSelectTeam(item))}
                >
                    <View style={style.teamContainer}>
                        <TeamIcon
                            teamId={item.id}
                            styleContainer={style.teamIconContainer}
                            styleText={style.teamIconText}
                            styleImage={style.imageContainer}
                        />
                        <View style={style.teamNameContainer}>
                            <Text
                                numberOfLines={1}
                                ellipsizeMode='tail'
                                style={style.teamName}
                            >
                                {item.display_name}
                            </Text>
                            <Text
                                numberOfLines={1}
                                ellipsizeMode='tail'
                                style={style.teamUrl}
                            >
                                {`${currentUrl}/${item.name}`}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    render() {
        const {theme, isLandscape} = this.props;
        const {teams} = this.state;
        const style = getStyleFromTheme(theme);

        if (this.state.joining) {
            return <Loading color={theme.centerChannelColor}/>;
        }

        if (this.props.teamsRequest.status === RequestStatus.FAILURE) {
            const FailedNetworkAction = require('app/components/failed_network_action').default;

            return (
                <FailedNetworkAction
                    onRetry={this.getTeams}
                    theme={theme}
                />
            );
        }

        if (this.props.currentUserIsGuest) {
            return (
                <View style={style.container}>
                    <StatusBar/>
                    <View style={style.headingContainer}>
                        <FormattedText
                            id='mobile.select_team.guest_cant_join_team'
                            defaultMessage='Your guest account has no teams or channels assigned. Please contact an administrator.'
                            style={style.heading}
                        />
                    </View>
                </View>
            );
        }

        return (
            <View style={style.container}>
                <StatusBar/>
                <View style={style.headingContainer}>
                    <View style={[style.headingWrapper, padding(isLandscape)]}>
                        <FormattedText
                            id='mobile.select_team.join_open'
                            defaultMessage='Open teams you can join'
                            style={style.heading}
                        />
                    </View>
                    <View style={style.line}/>
                </View>
                <CustomList
                    data={teams}
                    loading={this.state.loading}
                    loadingComponent={
                        <View style={style.footer}>
                            <Loading
                                color={theme.centerChannelColor}
                                size='small'
                            />
                        </View>
                    }
                    refreshing={this.state.refreshing}
                    onRefresh={this.onRefresh}
                    onLoadMore={this.getTeams}
                    renderItem={this.renderItem}
                    theme={theme}
                    extraData={this.state.loading}
                    shouldRenderSeparator={false}
                />
            </View>
        );
    }
}

const getStyleFromTheme = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flex: 1,
        },
        headingContainer: {
            alignItems: 'center',
            flexDirection: 'row',
            marginHorizontal: 16,
            marginTop: 20,
        },
        headingWrapper: {
            marginRight: 15,
        },
        heading: {
            color: changeOpacity(theme.centerChannelColor, 0.5),
            fontSize: 13,
        },
        line: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.2),
            width: '100%',
            height: 1,
        },
        footer: {
            marginVertical: 10,
        },
        teamWrapper: {
            marginTop: 20,
        },
        teamContainer: {
            alignItems: 'center',
            flex: 1,
            flexDirection: 'row',
            marginHorizontal: 16,
        },
        teamIconContainer: {
            width: 40,
            height: 40,
            backgroundColor: theme.sidebarBg,
        },
        teamIconText: {
            color: theme.sidebarText,
            fontSize: 18,
        },
        imageContainer: {
            backgroundColor: '#FFF',
        },
        noTeam: {
            color: theme.centerChannelColor,
            fontSize: 14,
        },
        teamNameContainer: {
            flex: 1,
            flexDirection: 'column',
            marginLeft: 10,
        },
        teamName: {
            color: theme.centerChannelColor,
            fontSize: 18,
        },
        teamUrl: {
            color: changeOpacity(theme.centerChannelColor, 0.5),
            fontSize: 12,
        },
    };
});
