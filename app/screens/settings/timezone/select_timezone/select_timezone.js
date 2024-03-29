// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {
    View,
    FlatList,
    Platform,
} from 'react-native';
import {getTimezoneRegion} from 'bulletin-redux/utils/timezone_utils';
import {intlShape} from 'react-intl';

import SearchBar from 'app/components/search_bar';
import StatusBar from 'app/components/status_bar';
import {paddingHorizontal as padding} from 'app/components/safe_area_view/iphone_x_spacing';

import {ListTypes} from 'app/constants';
import {
    changeOpacity,
    makeStyleSheetFromTheme,
    getKeyboardAppearanceFromTheme,
} from 'app/utils/theme';
import {popTopScreen} from 'app/actions/navigation';

import SelectTimezoneRow from './select_timezone_row';

const ITEM_HEIGHT = 45;
const VIEWABILITY_CONFIG = ListTypes.VISIBILITY_CONFIG_DEFAULTS;

export default class Timezone extends PureComponent {
    static propTypes = {
        selectedTimezone: PropTypes.string.isRequired,
        initialScrollIndex: PropTypes.number.isRequired,
        timezones: PropTypes.array.isRequired,
        onBack: PropTypes.func.isRequired,
        theme: PropTypes.object.isRequired,
        isLandscape: PropTypes.bool.isRequired,
    };

    static contextTypes = {
        intl: intlShape,
    };

    constructor(props) {
        super(props);

        this.state = {
            value: '',
            timezones: props.timezones,
        };
    }

    setSearchBarRef = (ref) => {
        this.searchBarRef = ref;
    }

    filteredTimezones = (timezonePrefix) => {
        if (timezonePrefix.length === 0) {
            return this.state.timezones;
        }

        const lowerCasePrefix = timezonePrefix.toLowerCase();

        return this.state.timezones.filter((t) => (
            getTimezoneRegion(t).toLowerCase().indexOf(lowerCasePrefix) >= 0 ||
            t.toLowerCase().indexOf(lowerCasePrefix) >= 0
        ));
    };

    timezoneSelected = (timezone) => {
        this.props.onBack(timezone);
        popTopScreen();
    };

    handleTextChanged = (value) => {
        this.setState({value});
    };

    keyExtractor = (item) => item;

    getItemLayout = (data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
    });

    renderItem = ({item: timezone}) => {
        return (
            <SelectTimezoneRow
                theme={this.props.theme}
                timezone={timezone}
                selectedTimezone={this.props.selectedTimezone}
                onPress={this.timezoneSelected}
                isLandscape={this.props.isLandscape}
            />
        );
    };

    render() {
        const {theme, initialScrollIndex, isLandscape} = this.props;
        const {value} = this.state;
        const {intl} = this.context;
        const style = getStyleSheet(theme);

        const searchBarInput = {
            backgroundColor: changeOpacity(theme.sidebarHeaderTextColor, 0.2),
            color: theme.sidebarHeaderTextColor,
            fontSize: 15,
        };

        return (
            <View style={style.container}>
                <StatusBar/>
                <View style={[style.header, padding(isLandscape)]}>
                    <SearchBar
                        ref={this.setSearchBarRef}
                        placeholder={intl.formatMessage({id: 'search_bar.search', defaultMessage: 'Search'})}
                        cancelTitle={intl.formatMessage({id: 'mobile.post.cancel', defaultMessage: 'Cancel'})}
                        backgroundColor='transparent'
                        inputHeight={Platform.OS === 'ios' ? 33 : 46}
                        inputStyle={searchBarInput}
                        placeholderTextColor={changeOpacity(theme.sidebarHeaderTextColor, 0.5)}
                        selectionColor={changeOpacity(theme.sidebarHeaderTextColor, 0.5)}
                        tintColorSearch={changeOpacity(theme.sidebarHeaderTextColor, 0.5)}
                        tintColorDelete={changeOpacity(theme.sidebarHeaderTextColor, 0.5)}
                        titleCancelColor={theme.sidebarHeaderTextColor}
                        onChangeText={this.handleTextChanged}
                        autoCapitalize='none'
                        value={value}
                        containerStyle={style.searchBarContainer}
                        showArrow={false}
                        keyboardAppearance={getKeyboardAppearanceFromTheme(theme)}
                    />
                </View>
                <FlatList
                    data={this.filteredTimezones(value)}
                    renderItem={this.renderItem}
                    keyExtractor={this.keyExtractor}
                    getItemLayout={this.getItemLayout}
                    keyboardShouldPersistTaps='always'
                    keyboardDismissMode='on-drag'
                    maxToRenderPerBatch={15}
                    initialScrollIndex={initialScrollIndex}
                    viewabilityConfig={VIEWABILITY_CONFIG}
                />
            </View>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flex: 1,
            backgroundColor: theme.centerChannelBg,
        },
        header: {
            backgroundColor: theme.sidebarHeaderBg,
            width: '100%',
            ...Platform.select({
                android: {
                    height: 46,
                    justifyContent: 'center',
                },
                ios: {
                    height: 44,
                },
            }),
        },
    };
});
