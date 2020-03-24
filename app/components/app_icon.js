// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Image } from 'react-native';

export default class AppIcon extends PureComponent {
    static propTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
    };

    render() {
        return (
            <Image
                style={{ width: this.props.height, height: this.props.width }}
                source={require('assets/images/logo.png')}
            />
        );
    }
}
