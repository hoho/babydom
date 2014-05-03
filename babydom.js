/*!
 * babydom v0.0.0, https://github.com/hoho/babydom
 * (c) 2014 Marat Abdullin, MIT license
 */
var $B = (function(document, undefined) {
    'use strict';

    function API(node) {
        this._n = node;
    }

    var proto = API.prototype,
        properties = {checked: true, style: true},
        captureEvents = {focus: true, blur: true},
        emitByMethodCall = {focus: true, blur: true, reset: true},
        eventHandlers = {},
        whitespace = /[\x20\t\r\n\f]+/;


    function eventHandler(e) {
        var node,
            $b,
            h,
            i,
            next = 0,
            origStopPropagation = e.stopPropagation,
            origStopImmediatePropagation = e.stopImmediatePropagation;

        node = e.target;

        e.stopPropagation = function() {
            next |= 1;
            origStopPropagation.call(e);
        };

        e.stopImmediatePropagation = function() {
            next |= 2;
            origStopImmediatePropagation.call(e);
        };

        while (node) {
            if ((($b = node.$b)) && ((h = $b[e.type]))) {
                for (i = h.length; i--;) {
                    h[i].call(node, e);
                    if (next & 2) { return; }
                }
            }
            if (next & 1) { return; }
            node = node.parentNode;
        }
    }


    proto.attr = function(name, val) {
        var node = this._n,
            key,
            ret;

        if (val === undefined) {
            return name in properties ?
                (name === 'style' ? node.style.cssText : node[name])
                :
                node.getAttribute(name);
        } else {
            if (name in properties) {
                if (name === 'style') {
                    if (typeof val === 'object') {
                        ret = [];
                        for (key in val) {
                            ret.push(key + ': ' + val[key]);
                        }
                        val = ret.join('; ');
                    }

                    if (val !== undefined) {
                        node.style.cssText = val;
                    }
                } else {
                    node[name] = val;
                }
            } else {
                if (val === null) {
                    node.removeAttribute(name);
                } else {
                    node.setAttribute(name, val);
                }
            }
            return this;
        }
    };


    proto.on = function(event, handler) {
        var i,
            $b,
            h,
            self = this,
            node = self._n;

        if (event) {
            event = (event || '').split(whitespace);

            if (event.length === 1) {
                event += '';

                if (!(event in eventHandlers)) {
                    document.body.addEventListener(event, eventHandler, event in captureEvents);
                    eventHandlers[event] = true;
                }

                if (!(($b = node.$b))) {
                    $b = node.$b = {};
                }

                if (!((h = $b[event]))) {
                    h = $b[event] = [];
                }

                h.push(handler);
            } else {
                for (i = 0; i < event.length; i++) {
                    self.on(event[i], handler);
                }
            }
        }

        return self;
    };


    proto.off = function(event, handler) {
        var i,
            self = this,
            node = self._n,
            $b = node.$b,
            handlers;

        if (event && $b) {
            event = (event || '').split(whitespace);

            if (event.length === 1) {
                event += '';

                if (((handlers = $b[event])) && handler) {
                    i = 0;
                    while (i < handlers.length) {
                        if (handlers[i] === handler) {
                            handlers.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                }

                if (handlers && (!handlers.length || !handler)) {
                    delete $b[event];
                }
            } else {
                for (i = 0; i < event.length; i++) {
                    self.off(event[i], handler);
                }
            }
        }

        return self;
    };


    proto.text = function(val) {
        var node = this._n;

        if (val === undefined) {
            return node.textContent;
        } else {
            node.innerHTML = '';
            node.appendChild(document.createTextNode(val));
            return this;
        }
    };


    proto.emit = function(event, detail) {
        var node = this._n,
            e;

        if ((event in emitByMethodCall) && node[event]) {
            node[event]();
        } else {
            // TODO: It would probably be needed to distinguish event types.
            //       For now we're not trying to follow standards much.
            e = document.createEvent('HTMLEvents');
            e.initEvent(event, true, false);
            if (detail) { e.detail = detail; }
            node.dispatchEvent(e);
        }

        return this;
    };


    return function(node) {
        return new API(node);
    };
})(document);
