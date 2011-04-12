console.log('initializing');

window.Backbone = require('backbone@0.3.3');
window._ = require('underscore')._;
window.resources = require('./models/resources');
window.drawing = new resources.collections.Drawing;
window.EventEmitter = require('events').EventEmitter;
window.em = new EventEmitter;
window.emit = em.emit.bind(em);


var components = {};
var util = {};