import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { updateSettings, toggleAllImages, updateImageWidth, updateImageHeight } from '../../actions';
import { fonts } from '../../styles';

import { colors, shadows } from '../../styles';

import SettingOption from '../atoms/SettingOption';

const PopupWrapper = styled.div`
  display: block;
  position: absolute;
  width: auto;
  min-height: 100px;
  background-color: ${colors.lightGray};
  box-shadow: ${shadows.shadow01};
  right: 38px;
  margin-top: 20px;
  border-radius: 3px;
  padding: 10px 25px;
  z-index: 10;

  /* @TODO: shadow on arrow */
  &:before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    position: absolute;

    border-top: 8px solid transparent;
    border-bottom: 8px solid ${colors.lightGray};
    border-right: 8px solid transparent;
    border-left: 8px solid transparent;
    right: 30px;
    top: -16px;
  }
`;

const WrapperOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;

  span {
    padding-right: 10px;
    text-align: left;
    font-family: ${fonts.latoRegular};
    color: ${colors.primaryText};
    font-size: 14px;
  }
`;

const Input = styled.input`
  width: 50px;
  border: 1px solid ${colors.borderGray};
  border-radius: 3px;
  padding: 2px 5px;
  font-family: ${fonts.latoRegular};
  font-size: 14px;
`;

class SettingsPopup extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      hideAll: false
    };
  }

  toggleAll (val) {
    this.setState({
      hideAll: !val
    });

    this.props.toggleAll(val);
  }

  onToggle (id, val) {
    if (!val) {
      this.setState({
        hideAll: false
      });
    }

    this.props.onToggle(id);
  }

  render () {
    const { settings } = this.props;

    return (
      <PopupWrapper>
        <SettingOption
          id="textInfo"
          label="Text info"
          value={settings.textInfo}
          onToggle={this.onToggle.bind(this, 'textInfo')}
        />
        <SettingOption
          id="hideAll"
          label="Hide all images"
          value={this.state.hideAll}
          onToggle={this.toggleAll.bind(this)}
        />
        <SettingOption
          id="refImage"
          label="Reference image"
          value={settings.refImage}
          onToggle={this.onToggle.bind(this, 'refImage')}
        />
        <SettingOption
          id="testImage"
          label="Test image"
          value={settings.testImage}
          onToggle={this.onToggle.bind(this, 'testImage')}
        />
        <SettingOption
          id="diffImage"
          label="Diff image"
          value={settings.diffImage}
          onToggle={this.onToggle.bind(this, 'diffImage')}
        />
        <WrapperOption>
          <span>Max width</span>
          <Input
            type="number"
            value={settings.imageWidth}
            onChange={(e) => this.props.onUpdateImageWidth(e.target.value)}
          />
        </WrapperOption>
        <WrapperOption>
          <span>Max height</span>
          <Input
            type="number"
            value={settings.imageHeight}
            onChange={(e) => this.props.onUpdateImageHeight(e.target.value)}
          />
        </WrapperOption>
      </PopupWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    settings: state.layoutSettings
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onToggle: id => {
      dispatch(updateSettings(id));
    },
    toggleAll: value => {
      dispatch(toggleAllImages(value));
    },
    onUpdateImageWidth: value => {
      dispatch(updateImageWidth(value));
    },
    onUpdateImageHeight: value => {
      dispatch(updateImageHeight(value));
    }
  };
};

const PopupContainer = connect(mapStateToProps, mapDispatchToProps)(
  SettingsPopup
);

export default PopupContainer;
