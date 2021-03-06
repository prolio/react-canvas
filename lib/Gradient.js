'use strict';

var React = require('react');
var createComponent = require('./createComponent');
var LayerMixin = require('./LayerMixin');

var Gradient = createComponent('Gradient', LayerMixin, {

  applyGradientProps: function applyGradientProps(prevProps, props) {
    var layer = this.node;
    layer.type = 'gradient';
    layer.colorStops = props.colorStops || [];
    this.applyLayerProps(prevProps, props);
  },

  mountComponent: function mountComponent(transaction, nativeParent, nativeContainerInfo, context) {
    var props = this._currentElement.props;
    var layer = this.node;
    this.applyGradientProps({}, props);
    return layer;
  },

  receiveComponent: function receiveComponent(nextComponent, transaction, context) {
    var prevProps = this._currentElement.props;
    var props = nextComponent.props;
    this.applyGradientProps({}, props);
    this._currentElement = nextComponent;
    this.node.invalidateLayout();
  }

});

module.exports = Gradient;