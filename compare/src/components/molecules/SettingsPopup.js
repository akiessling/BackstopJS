import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { updateSettings, toggleAllImages, updateImageWidth, updateImageHeight, sortTests, filterByDiff, toggleViewport } from '../../actions';
import { fonts, colors, shadows } from '../../styles';

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

const ViewportWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 0;

  span {
    text-align: left;
    font-family: ${fonts.latoBold};
    color: ${colors.primaryText};
    font-size: 14px;
    margin-bottom: 5px;
  }
`;

const ViewportOption = styled.label`
  display: flex;
  align-items: center;
  padding: 2px 0;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};

  input {
    margin-right: 10px;
  }

  span {
    font-family: ${fonts.latoRegular};
    color: ${colors.primaryText};
    font-size: 13px;
    padding-right: 0;
    margin-bottom: 0;
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

const Select = styled.select`
  border: 1px solid ${colors.borderGray};
  border-radius: 3px;
  padding: 2px 5px;
  font-family: ${fonts.latoRegular};
  font-size: 14px;
  max-width: 140px;
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
        <hr style={{ border: 'none', borderBottom: `1px solid ${colors.borderGray}`, margin: '10px 0' }} />
        <WrapperOption>
          <span>Sort by</span>
          <Select value={this.props.tests.sortMethod || 'default'} onChange={(e) => this.props.onSort(e.target.value)}>
            <option value="default">Default</option>
            <option value="diffAsc">Diff % (Asc)</option>
            <option value="diffDesc">Diff % (Desc)</option>
            <option value="labelAsc">Label (Asc)</option>
            <option value="labelDesc">Label (Desc)</option>
          </Select>
        </WrapperOption>
        <WrapperOption>
          <span>Min Diff %</span>
          <Input
            type="number"
            step="0.1"
            value={this.props.tests.minDiff || 0}
            onChange={(e) => this.props.onFilterByDiff(e.target.value)}
          />
        </WrapperOption>
        {this.props.tests.all && [...new Set(this.props.tests.all.map(t => t.pair && t.pair.viewportLabel).filter(Boolean))].length > 1 && (
          <>
            <hr style={{ border: 'none', borderBottom: `1px solid ${colors.borderGray}`, margin: '10px 0' }} />
            <ViewportWrapper>
              <span>Viewports</span>
              {[...new Set(this.props.tests.all.map(t => t.pair && t.pair.viewportLabel).filter(Boolean))].map(viewport => {
                const selectedViewports = this.props.tests.selectedViewports || [];
                const isSelected = selectedViewports.includes(viewport);
                const canToggle = !isSelected || selectedViewports.length > 1;
                return (
                  <ViewportOption key={viewport} disabled={!canToggle}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!canToggle}
                      onChange={() => canToggle && this.props.onToggleViewport(viewport)}
                    />
                    <span>{viewport}</span>
                  </ViewportOption>
                );
              })}
            </ViewportWrapper>
          </>
        )}
      </PopupWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    settings: state.layoutSettings,
    tests: state.tests
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
    },
    onSort: method => {
      dispatch(sortTests(method));
    },
    onFilterByDiff: percent => {
      dispatch(filterByDiff(percent));
    },
    onToggleViewport: viewportLabel => {
      dispatch(toggleViewport(viewportLabel));
    }
  };
};

const PopupContainer = connect(mapStateToProps, mapDispatchToProps)(
  SettingsPopup
);

export default PopupContainer;
