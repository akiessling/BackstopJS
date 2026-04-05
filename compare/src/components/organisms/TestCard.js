import React from 'react';
import styled from 'styled-components';

import { colors, shadows } from '../../styles';

// atoms
import ErrorMessages from '../atoms/ErrorMessages';
import TextDetails from '../atoms/TextDetails';
import NavButtons from '../atoms/NavButtons';

// molecules
import TestImages from '../molecules/TestImages';
import ApproveButton from '../molecules/ApproveButton';
import AckButton from '../molecules/AckButton';

const CardWrapper = styled.div`
  position: relative;
  margin: 5px auto;
  padding: 10px 30px;
  background-color: ${colors.cardWhite};
  box-shadow: ${shadows.shadow01};
  min-height: 40px;
  break-inside: avoid;

  &:before {
    content: '';
    display: block;
    width: 8px;
    height: 100%;
    background-color: ${props => {
      if (props.status === 'pass') return colors.green;
      if (props.status === 'acknowledged') return colors.yellow;
      return colors.red;
    }};
    position: absolute;
    top: 0;
    left: 0;
  }
  @media print {
    box-shadow: none;
  }
`;

const ButtonsWrapper = styled.div`
  margin-left: auto;
  display: flex;
`;

// only show the diverged option if remote option is found
function isRemoteOption () {
  return /remote/.test(location.search);
}

export default class TestCard extends React.Component {
  render () {
    const { pair: info, status } = this.props.test;
    const onlyText = this.props.onlyText;

    return (
      <CardWrapper id={this.props.id} status={status}>
        <TextDetails info={info} numId={this.props.numId} lastId={this.props.lastId}>
          <ButtonsWrapper>
            {status === 'fail' && isRemoteOption() && <ApproveButton fileName={info.fileName}/>}
            {(status === 'fail' || status === 'acknowledged') && isRemoteOption() && <AckButton fileName={info.fileName} currentStatus={status} />}
            {!onlyText && (
              <NavButtons currentId={this.props.numId} lastId={this.props.lastId} />
            )}
          </ButtonsWrapper>
        </TextDetails>
        <TestImages info={info} status={status} />
        <ErrorMessages info={info} status={status} />
      </CardWrapper>
    );
  }
}
