import EventEmitter from 'eventemitter3';
import logger from './logger';
import Quill from './quill';

let debug = logger('quill:events');

const EVENTS = ['selectionchange', 'mousedown', 'mouseup', 'click'];

let initialized = false;

class Emitter extends EventEmitter {
  static initialize() {
    if (initialized) return;

    EVENTS.forEach(function(eventName) {
      Quill.getDocument().addEventListener(eventName, (...args) => {
        [].slice.call(Quill.getDocument().querySelectorAll('.ql-container')).forEach((node) => {
          // TODO use WeakMap
          if (node.__quill && node.__quill.emitter) {
            node.__quill.emitter.handleDOM(...args);
          }
        });
      });
    });

    initialized = true;
  }


  constructor() {
    super();

    Emitter.initialize();
    this.listeners = {};
    this.on('error', debug.error);
  }

  emit() {
    debug.log.apply(debug, arguments);
    super.emit.apply(this, arguments);
  }

  handleDOM(event, ...args) {
    (this.listeners[event.type] || []).forEach(function({ node, handler }) {
      if (event.target === node || node.contains(event.target)) {
        handler(event, ...args);
      }
    });
  }

  listenDOM(eventName, node, handler) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push({ node, handler })
  }
}

Emitter.events = {
  EDITOR_CHANGE        : 'editor-change',
  SCROLL_BEFORE_UPDATE : 'scroll-before-update',
  SCROLL_OPTIMIZE      : 'scroll-optimize',
  SCROLL_UPDATE        : 'scroll-update',
  SELECTION_CHANGE     : 'selection-change',
  TEXT_CHANGE          : 'text-change'
};
Emitter.sources = {
  API    : 'api',
  SILENT : 'silent',
  USER   : 'user'
};


export default Emitter;
