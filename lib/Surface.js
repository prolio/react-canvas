'use strict';

var React = require('react');
var ReactUpdates = require('react-dom/lib/ReactUpdates');
var invariant = require('fbjs/lib/invariant');
var ContainerMixin = require('./ContainerMixin');
var RenderLayer = require('./RenderLayer');
var FrameUtils = require('./FrameUtils');
var DrawingUtils = require('./DrawingUtils');
var _hitTest = require('./hitTest');
var layoutNode = require('./layoutNode');

/**
 * Surface is a standard React component and acts as the main drawing canvas.
 * ReactCanvas components cannot be rendered outside a Surface.
 */

var Surface = React.createClass({
  displayName: 'Surface',


  mixins: [ContainerMixin],

  propTypes: {
    className: React.PropTypes.string,
    id: React.PropTypes.string,
    top: React.PropTypes.number.isRequired,
    left: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    scale: React.PropTypes.number.isRequired,
    enableCSSLayout: React.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      scale: window.devicePixelRatio || 1
    };
  },

  componentDidMount: function componentDidMount() {
    // Prepare the <canvas> for drawing.
    this.scale();

    // ContainerMixin expects `this.node` to be set prior to mounting children.
    // `this.node` is injected into child components and represents the current
    // render tree.
    this.node = new RenderLayer();
    this.node.frame = FrameUtils.make(this.props.left, this.props.top, this.props.width, this.props.height);
    this.node.draw = this.batchedTick;

    // This is the integration point between custom canvas components and React
    var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
    transaction.perform(this.mountAndInjectChildrenAtRoot, this, this.props.children, transaction);
    ReactUpdates.ReactReconcileTransaction.release(transaction);

    // Execute initial draw on mount.
    this.node.draw();
  },

  componentWillUnmount: function componentWillUnmount() {
    // Implemented in ReactMultiChild.Mixin
    this.unmountChildren();
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    // We have to manually apply child reconciliation since child are not
    // declared in render().
    var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
    transaction.perform(this.updateChildrenAtRoot, this, this.props.children, transaction);
    ReactUpdates.ReactReconcileTransaction.release(transaction);

    // Re-scale the <canvas> when changing size.
    if (prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
      this.scale();
    }

    // Redraw updated render tree to <canvas>.
    if (this.node) {
      this.node.draw();
    }
  },

  render: function render() {
    // Scale the drawing area to match DPI.
    var width = this.props.width * this.props.scale;
    var height = this.props.height * this.props.scale;
    var style = {
      width: this.props.width,
      height: this.props.height
    };

    return React.createElement('canvas', {
      ref: 'canvas',
      className: this.props.className,
      id: this.props.id,
      width: width,
      height: height,
      style: style,
      onTouchStart: this.handleTouchStart,
      onTouchMove: this.handleTouchMove,
      onTouchEnd: this.handleTouchEnd,
      onTouchCancel: this.handleTouchEnd,
      onClick: this.handleClick,
      onContextMenu: this.handleContextMenu,
      onDoubleClick: this.handleDoubleClick });
  },

  // Drawing
  // =======

  getContext: function getContext() {
    'production' !== process.env.NODE_ENV ? invariant(this.isMounted(), 'Tried to access drawing context on an unmounted Surface.') : invariant(this.isMounted());
    return this.refs.canvas.getContext('2d');
  },

  scale: function scale() {
    this.getContext().scale(this.props.scale, this.props.scale);
  },

  batchedTick: function batchedTick() {
    if (this._frameReady === false) {
      this._pendingTick = true;
      return;
    }
    this.tick();
  },

  tick: function tick() {
    // Block updates until next animation frame.
    this._frameReady = false;
    this.clear();
    this.draw();
    requestAnimationFrame(this.afterTick);
  },

  afterTick: function afterTick() {
    // Execute pending draw that may have been scheduled during previous frame
    this._frameReady = true;
    if (this._pendingTick) {
      this._pendingTick = false;
      this.batchedTick();
    }
  },

  clear: function clear() {
    this.getContext().clearRect(0, 0, this.props.width, this.props.height);
  },

  draw: function draw() {
    var layout;
    if (this.node) {
      if (this.props.enableCSSLayout) {
        layout = layoutNode(this.node);
      }
      DrawingUtils.drawRenderLayer(this.getContext(), this.node);
    }
  },

  // Events
  // ======

  hitTest: function hitTest(e) {
    var hitTarget = _hitTest(e, this.node, this.refs.canvas);
    if (hitTarget) {
      hitTarget[_hitTest.getHitHandle(e.type)](e);
    }
  },

  handleTouchStart: function handleTouchStart(e) {
    var hitTarget = _hitTest(e, this.node, this.refs.canvas);
    var touch;
    if (hitTarget) {
      // On touchstart: capture the current hit target for the given touch.
      this._touches = this._touches || {};
      for (var i = 0, len = e.touches.length; i < len; i++) {
        touch = e.touches[i];
        this._touches[touch.identifier] = hitTarget;
      }
      hitTarget[_hitTest.getHitHandle(e.type)](e);
    }
  },

  handleTouchMove: function handleTouchMove(e) {
    this.hitTest(e);
  },

  handleTouchEnd: function handleTouchEnd(e) {
    // touchend events do not generate a pageX/pageY so we rely
    // on the currently captured touch targets.
    if (!this._touches) {
      return;
    }

    var hitTarget;
    var hitHandle = _hitTest.getHitHandle(e.type);
    for (var i = 0, len = e.changedTouches.length; i < len; i++) {
      hitTarget = this._touches[e.changedTouches[i].identifier];
      if (hitTarget && hitTarget[hitHandle]) {
        hitTarget[hitHandle](e);
      }
      delete this._touches[e.changedTouches[i].identifier];
    }
  },

  handleClick: function handleClick(e) {
    this.hitTest(e);
  },

  handleContextMenu: function handleContextMenu(e) {
    this.hitTest(e);
  },

  handleDoubleClick: function handleDoubleClick(e) {
    this.hitTest(e);
  }

});

module.exports = Surface;