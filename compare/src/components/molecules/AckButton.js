import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { acknowledgeTest, filterTests } from '../../actions';
import { colors, fonts } from '../../styles';

import jump from 'jump.js';

const REMOTE_HOST = 'http://127.0.0.1';
const REMOTE_PORT = location.port;

const Button = styled.button`
  font-size: 12px;
  font-family: ${fonts.latoRegular};
  background-color: ${props => props.acknowledged ? colors.yellow : colors.secondaryText};
  border: none;
  height: 32px;
  border-radius: 3px;
  color: ${colors.white};
  padding: 5px 10px;
  margin-left: 10px;

  &:hover {
    cursor: pointer;
    background-color: ${props => props.acknowledged ? colors.medGray : colors.yellow};
  }

  &:disabled {
    background-color: ${colors.bodyColor};
    color: ${colors.secondaryText};
    cursor: default;
  }
`;

class AckButton extends React.Component {
  constructor (props) {
    super(props);
    this.toggleAck = this.toggleAck.bind(this);
    this.state = {
      status: 'INITIAL'
    };
  }

  resetScroll () {
    setTimeout(() => {
      let target = document.getElementById(this.props.testId);
      if (!target) {
        target = document.getElementById(`test${this.props.numId - 1}`);
      }
      if (target) {
        jump(target, { duration: 0, offset: -100 });
      } else {
        window.scrollTo(0, 0);
      }
    }, 50);
  }

  async toggleAck () {
    const { fileName, currentStatus } = this.props;
    const nextStatus = currentStatus === 'acknowledged' ? 'fail' : 'acknowledged';
    const url = `${REMOTE_HOST}:${REMOTE_PORT}/acknowledge?filter=${fileName}&status=${nextStatus}`;

    this.setState({ status: 'PENDING' });

    try {
      const response = await fetch(url, {
        method: 'POST'
      });

      if (response.ok) {
        this.setState({ status: 'INITIAL' });
        this.props.acknowledgeTest(fileName, nextStatus, this.props.filterStatus);
        this.resetScroll();
      } else {
        const body = await response.json();
        alert(`Failed to update status: ${body.error}`);
        this.setState({ status: 'FAILED' });
      }
    } catch (err) {
      alert(`Error communicating with server: ${err.message}`);
      this.setState({ status: 'FAILED' });
    }
  }

  render () {
    const { currentStatus } = this.props;
    const isAck = currentStatus === 'acknowledged';

    return (
      <Button
        onClick={this.toggleAck}
        acknowledged={isAck}
        disabled={this.state.status === 'PENDING'}
      >
        {this.state.status === 'PENDING' ? 'Updating...' : (isAck ? 'Un-acknowledge' : 'Acknowledge')}
      </Button>
    );
  }
}

const mapStateToProps = state => {
  return {
    filterStatus: state.tests.filterStatus
  };
};

const mapDispatchToProps = dispatch => {
  return {
    acknowledgeTest: (id, status, filterStatus) => {
      dispatch(acknowledgeTest(id, status));
      dispatch(filterTests(filterStatus));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AckButton);
