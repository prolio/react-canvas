'use strict';

var createComponent = require('./createComponent');
var LayerMixin = require('./LayerMixin');

var Layer = createComponent('Layer', LayerMixin, {

  mountComponent: function mountComponent(transaction, nativeParent, nativeContainerInfo, context) {
    var props = this._currentElement.props;
    var layer = this.node;
    this.applyLayerProps({}, props);
    return layer;
  },

  receiveComponent: function receiveComponent(nextComponent, transaction, context) {
    var prevProps = this._currentElement.props;
    var props = nextComponent.props;
    this.applyLayerProps(prevProps, props);
    this._currentElement = nextComponent;
    this.node.invalidateLayout();
  }

});

module.exports = Layer;