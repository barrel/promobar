(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.promo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function () {
  var o = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var listeners = {};

  var on = function on(e) {
    var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (!cb) return;
    listeners[e] = listeners[e] || { queue: [] };
    listeners[e].queue.push(cb);
  };

  var emit = function emit(e) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    var items = listeners[e] ? listeners[e].queue : false;
    items && items.forEach(function (i) {
      return i(data);
    });
  };

  return _extends({}, o, {
    emit: emit,
    on: on
  });
};

},{}],2:[function(require,module,exports){
/*!
 * Stockpile.js 1.2.0 - A tiny localStorage wrapper providing namespacing and typed values.
 * Copyright (c) 2016 Michael Cavalea - https://github.com/callmecavs/stockpile.js
 * License: MIT
 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.Stockpile=t()}(this,function(){"use strict";var e=function(e){function t(){l.setItem(e,c(s))}function n(e){return s[e]||null}function o(e,n){s[e]=n,t()}function i(e){delete s[e],t()}function u(){l.removeItem(e)}function r(e){return null!==n(e)}var f=JSON.parse,c=JSON.stringify,l=window.localStorage,s=f(l.getItem(e))||{};return{get:n,set:o,remove:i,clear:u,exists:r}};return e});
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _stockpile = require('stockpile.js');

var _stockpile2 = _interopRequireDefault(_stockpile);

var _loop = require('loop.js');

var _loop2 = _interopRequireDefault(_loop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storage = (0, _stockpile2.default)('__promo__');

var height = function height(el) {
  return Math.max(el.offsetHeight, el.scrollHeight, el.clientHeight);
};

var merge = function merge(target) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  args.forEach(function (a) {
    return Object.keys(a).forEach(function (k) {
      return target[k] = a[k];
    });
  });
  return target;
};

var store = function store(content) {
  return storage.set('content', {
    timestamp: new Date().getTime(),
    body: content
  });
};

var isEnabled = function isEnabled(time, lifespan, body) {
  var store = storage.get('promo');
  var day = 1000 * 60 * 60 * 24;
  var daysPassed = (time - store.timestamp) / day;

  return !store || store.body !== body || daysPassed >= lifespan ? true : false;
};

var css = function css(target, height) {
  console.log(target, height);
};

var createPlaceholder = function createPlaceholder() {
  var div = document.createElement('div');
  document.body.insertBefore(div, document.body.children[0]);
  return div;
};

/**
 * Apply transforms to all 
 * specified elements
 *
 * @param {array} nodes DOM nodes to apply transforms to
 * @param {number} height Distance to displace elements
 */
var displace = function displace(targets, height) {
  return targets.forEach(function (t) {
    if (Array.isArray(t)) {
      css(t[0], !!t[1]() ? height : null);
    } else {
      css(t, height);
    }
  });
};

var offset = function offset(target, check, height) {
  check = 'function' === typeof check ? check() : check;
  target.style.height = check ? height + 'px' : '';
};

exports.default = function (promo) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var state = {
    active: false,
    enabled: true,
    height: 0
  };
  var content = promo.querySelector('.js-content').innerHTML;
  var placeholder = createPlaceholder();
  var events = (0, _loop2.default)();
  var config = merge({
    resize: true,
    offset: true,
    displace: [],
    close: Array.prototype.slice.call(document.querySelectorAll('.js-promo-close')),
    lifespan: 1
  }, opts);

  var hide = function hide(target) {
    if (!state.enabled) {
      return;
    }

    state.active = false;
    target.classList.remove('is-enabled');
    document.body.classList.remove('promo-is-active');
    events.emit('hide', state);
  };

  var show = function show(target) {
    if (!state.enabled) {
      return;
    }

    state.active = true;
    instance.element.classList.add('is-enabled');
    document.body.classList.add('promo-is-active');
    events.emit('show', state);
  };

  var update = function update() {
    var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    if (!state.enabled) {
      return;
    }

    var height = height(promo);

    if (force || height !== state.height) {
      state.height = height;
      offset(placeholder, config.offset, state.height);
      displace(config.displace, state.height);
      instance.emit('update', state);
    }
  };

  config.resize ? window.addEventListener('resize', function (e) {
    return update();
  }) : null;

  config.close.forEach(function (t) {
    return t.addEventListener('click', function (e) {
      e.preventDefault();
      store(content);
    });
  });

  state.enabled = isEnabled(new Date().getTime(), config.lifespan, content);

  return _extends({}, events, {
    hide: hide,
    show: show,
    update: update,
    getState: function getState() {
      return state;
    }
  });
};

},{"loop.js":1,"stockpile.js":2}]},{},[3])(3)
});