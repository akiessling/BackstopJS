import React from 'react';
import styled from 'styled-components';

import Header from './ecosystems/Header';
import List from './ecosystems/List';
import ScrubberModal from './ecosystems/ScrubberModal';
import LogModal from './ecosystems/LogModal';

const Wrapper = styled.section`
  padding: 0 30px;
`;

export default class App extends React.Component {
  render () {
    return (
      <div>
        <Header />
        <Wrapper>
          <List />
        </Wrapper>
        <ScrubberModal />
        <LogModal />
      </div>
    );
  }
}
