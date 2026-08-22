import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { colors, fonts } from '../../styles';

const BASE64_PNG_STUB =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const Image = styled.img`
  width: auto;
  max-width: ${props => (props.settings.imageWidth && props.settings.imageWidth > 0 ? `${props.settings.imageWidth}px` : '100%')};
  max-height: ${props => (props.settings.imageHeight && props.settings.imageHeight > 0 ? `${props.settings.imageHeight}px` : 'none')};

  &:hover {
    cursor: pointer;
  }
`;

const Wrapper = styled.div`
  flex: 1 1 auto;
  padding: 0 25px;
  padding-top: ${props => (props.withText ? '10px' : '20px')};
  text-align: center;
`;

const Label = styled.span`
  text-align: center;
  font-family: ${fonts.latoRegular};
  color: ${colors.secondaryText};
  display: block;
  margin: 0 auto;
  text-transform: uppercase;
  padding: 5px 0;
  padding-bottom: 15px;
  font-size: 12px;
`;

const Placeholder = styled.div`
  display: ${props => (props.hidden ? 'none' : 'block')};
  flex: 1 1 auto;
  padding: 0 25px;
  padding-top: ${props => (props.withText ? '10px' : '20px')};
  width: auto;
  max-width: ${props => (props.settings.imageWidth && props.settings.imageWidth > 0 ? `${props.settings.imageWidth}px` : '100%')};
  min-height: ${props => (props.settings.imageHeight && props.settings.imageHeight > 0 ? `${props.settings.imageHeight}px` : '400px')};
  background-color: ${colors.cardWhite};
`;

class ImagePreview extends React.Component {
  constructor (props) {
    super(props);
    this.previewRef = React.createRef();
    this.state = {
      imgLoadError: false,
      isVisible: false
    };
    this.onLoadError = this.onLoadError.bind(this);
  }

  componentDidMount () {
    if (!('IntersectionObserver' in window)) {
      this.setState({ isVisible: true });
      return;
    }

    this.visibilityObserver = new window.IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.setState({ isVisible: true });
        this.visibilityObserver.disconnect();
      }
    }, { rootMargin: '0px 0px 400px 0px' });
    this.visibilityObserver.observe(this.previewRef.current);
  }

  componentWillUnmount () {
    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect();
    }
  }

  onLoadError () {
    this.setState({
      imgLoadError: true
    });
  }

  render () {
    let { hidden, settings, label, src } = this.props;
    if (!src || src === '../..' || this.state.imgLoadError) {
      src = BASE64_PNG_STUB;
    }
    return this.state.isVisible
      ? (
        <Wrapper ref={this.previewRef} hidden={hidden} withText={settings.textInfo}>
          <Label>{label}</Label>
          <Image {...this.props} src={src} onError={this.onLoadError} />
        </Wrapper>
        )
      : (
        <Placeholder ref={this.previewRef} hidden={hidden} settings={settings} withText={settings.textInfo} />
        );
  }
}

const mapStateToProps = state => {
  return {
    settings: state.layoutSettings
  };
};

const ImagePreviewContainer = connect(mapStateToProps)(ImagePreview);

export default ImagePreviewContainer;
