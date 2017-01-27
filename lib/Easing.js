"use strict";

// Penner easing equations
// https://gist.github.com/gre/1650294

var Easing = {

  linear: function linear(t) {
    return t;
  },

  easeInQuad: function easeInQuad(t) {
    return Math.pow(t, 2);
  },

  easeOutQuad: function easeOutQuad(t) {
    return t * (2 - t);
  },

  easeInOutQuad: function easeInOutQuad(t) {
    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  easeInCubic: function easeInCubic(t) {
    return t * t * t;
  },

  easeOutCubic: function easeOutCubic(t) {
    return --t * t * t + 1;
  },

  easeInOutCubic: function easeInOutCubic(t) {
    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

};

module.exports = Easing;