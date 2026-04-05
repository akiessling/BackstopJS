import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import DiffDetails from './DiffDetails';
import UrlDetails from './UrlDetails';
import LogDetails from './LogDetails';

import { colors, fonts } from '../../styles';

// styled

const Row = styled.div`
  padding: 5px 0;
  ${props => props.sticky && `
    position: sticky;
    top: 70px;
    z-index: 10;
    background-color: ${colors.cardWhite};
    box-shadow: 0 2px 2px -1px rgba(0,0,0,0.1);
    margin: 0 -30px;
    padding: 10px 30px;
  `}
`;

const Label = styled.span`
  font-family: ${fonts.latoRegular};
  color: ${colors.secondaryText};
  font-size: 14px;
  padding-right: 8px;
`;

const Value = styled.span`
  font-family: ${fonts.latoBold};
  color: ${colors.primaryText};
  font-size: 14px;
  padding-right: 20px;
`;

const DetailsPanel = styled.div`
  display: ${props => (props.showPanel ? 'block' : 'none')};
  position: absolute;
  background-color: ${colors.white};
  padding: 10px;
  top: -28px;
  left: 20px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
  z-index: 999;
`;

class TextDetails extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      showPanel: false
    };

    this.showPanel = this.showPanel.bind(this);
    this.hidePanel = this.hidePanel.bind(this);
  }

  showPanel () {
    const { settings } = this.props;
    if (!settings.textInfo) {
      this.setState({
        showPanel: true
      });
    }
  }

  hidePanel () {
    this.setState({
      showPanel: false
    });
  }

  render () {
    const {
      label,
      fileName,
      selector,
      diff,
      url,
      referenceUrl,
      referenceLog,
      testLog
    } = this.props.info;
    const { settings, numId, lastId } = this.props;
    const { showPanel } = this.state;

    const counter = `${numId + 1} / ${lastId + 1}`;

    return (
      <>
        <Row hidden={!settings.textInfo} sticky={settings.textInfo}>
          <Label>#</Label>
          <Value>{counter}</Value>
          <Label>label: </Label>
          <Value>{label}</Value>
          <Label>selector: </Label>
          <Value>{selector}</Value>
          <UrlDetails url={url} referenceUrl={referenceUrl} />
        </Row>
        <Row>
          <Label>#</Label>
          <Value>{counter}</Value>
          <Label>filename: </Label>
          <Value onMouseOver={this.showPanel}>{fileName}</Value>
        </Row>
        <DiffDetails suppress={!settings.textInfo} diff={diff} />

        <DetailsPanel {...{ showPanel }} onMouseLeave={this.hidePanel}>
          <Row>
            <Label>label: </Label>
            <Value>{label} </Value>
            <Label>selector: </Label>
            <Value>{selector} </Value>
          </Row>
          <Row>
            <Label>filename: </Label>
            <Value>{fileName} </Value>
          </Row>
          <Row>
            {
              ((referenceLog || testLog) &&
                <LogDetails referenceLog={referenceLog} testLog={testLog} />
              )
            }
            <UrlDetails url={url} referenceUrl={referenceUrl} />
            <DiffDetails diff={diff} />
          </Row>
        </DetailsPanel>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    settings: state.layoutSettings
  };
};

const TextDetailsContainer = connect(mapStateToProps)(TextDetails);

export default TextDetailsContainer;
