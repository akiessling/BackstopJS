import React from 'react';
import styled from 'styled-components';

import { colors, fonts } from '../../styles';

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

const ToggleButton = styled.button`
  width: 50px;
  height: 26px;
  padding: 3px;
  border: 0;
  border-radius: 13px;
  background: ${props => (props.$active ? colors.green : colors.secondaryText)};
  cursor: pointer;

  &::after {
    display: block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${colors.cardWhite};
    content: '';
    transform: translateX(${props => (props.$active ? '24px' : '0')});
    transition: transform 150ms ease-in-out;
  }
`;

export default class SettingOption extends React.Component {
  render () {
    const { label, value, onToggle } = this.props;

    return (
      <WrapperOption>
        <span>{label}</span>

        <ToggleButton
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          $active={Boolean(value)}
          onClick={() => onToggle(!value)}
        />
      </WrapperOption>
    );
  }
}
