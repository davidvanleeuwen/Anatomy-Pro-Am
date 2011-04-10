console.log('initializing');

window.Backbone = require('backbone@0.3.3');
window._ = require('underscore')._;
window.resources = require('./models/resources');
window.drawing = new resources.collections.Drawing;
window.em = require('events').EventEmitter.prototype;

var components = {};