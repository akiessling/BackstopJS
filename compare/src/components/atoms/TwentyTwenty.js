import { Children, Component, createRef } from 'react';

export default class TwentyTwenty extends Component {
  constructor (props) {
    super(props);
    this.state = {
      dragging: false,
      position: props.initialPosition
    };
    this.container = createRef();
    this.onPointerMove = this.onPointerMove.bind(this);
    this.stopDragging = this.stopDragging.bind(this);
  }

  componentDidUpdate (previousProps) {
    if (previousProps.newPosition !== this.props.newPosition) {
      this.setState({ position: this.props.newPosition });
    }
  }

  componentWillUnmount () {
    this.removePointerListeners();
  }

  removePointerListeners () {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.stopDragging);
    document.removeEventListener('pointercancel', this.stopDragging);
  }

  onPointerMove (event) {
    if (!this.state.dragging || !this.container.current) return;

    const { left, width } = this.container.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(100, 100 * (event.pageX - left) / width));
    this.setState({ position });
  }

  startDragging (event) {
    event.preventDefault();
    this.setState({ dragging: true });
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.stopDragging);
    document.addEventListener('pointercancel', this.stopDragging);
  }

  stopDragging () {
    this.removePointerListeners();
    this.setState({ dragging: false });
  }

  render () {
    const children = Children.toArray(this.props.children);
    const { position } = this.state;

    if (children.length !== 2 && children.length !== 3) {
      console.warn('Expected exactly two or three children');
      return null;
    }

    return (
      <div
        ref={this.container}
        style={{ position: 'relative', overflow: 'hidden', whiteSpace: 'nowrap', touchAction: 'pan-y' }}
        onPointerDown={event => this.startDragging(event)}
      >
        <div style={{ position: 'absolute', left: `${position}%`, height: '100%', width: 0, zIndex: 1 }}>
          {children[2]}
        </div>
        <div style={{ display: 'inline-block', width: '100%', position: 'relative', verticalAlign: 'top', left: `${position - 100}%`, overflow: 'hidden' }}>
          <div style={{ position: 'relative', right: `${position - 100}%`, textAlign: 'center' }}>
            {children[0]}
          </div>
        </div>
        <div style={{ display: 'inline-block', width: '100%', position: 'relative', verticalAlign: 'top', left: `${position - 100}%`, overflow: 'hidden' }}>
          <div style={{ position: 'relative', right: `${position}%`, textAlign: 'center' }}>
            {children[1]}
          </div>
        </div>
      </div>
    );
  }
}
