/*!
 * babydom v0.0.1, https://github.com/hoho/babydom
 * (c) 2014 Marat Abdullin, MIT license
 */
var $B = (function(document, undefined) {
    'use strict';

    function API(node) {
        this._n = node;
    }

    var proto = API.prototype,
        properties = {checked: false, style: null, value: ''},
        captureEvents = {focus: 1, blur: 1},
        emitByMethodCall = {focus: 1, blur: 1, reset: 1},
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


    function classToObject(val) {
        var ret = {},
            i,
            cls;

        val = (val || '').split(whitespace);

        for (i = 0; i < val.length; i++) {
            if ((cls = val[i])) {
                ret[cls] = 1; // `1` is shorter than `true` and we need just keys.
            }
        }

        return ret;
    }


    function modifyClass(self, val, addOrRemove, force) {
        var obj1 = classToObject(self.attr('class')),
            obj2 = classToObject(val),
            cls;

        if (force !== undefined) { force = !!force; }

        for (cls in obj2) {
            if (addOrRemove === true || force === true) {
                // Add class or toggle true.
                obj1[cls] = 1; // `1` is shorter than `true` and we need just keys.
            } else if (addOrRemove === false || force === false) {
                // Remove class or toggle false.
                delete obj1[cls];
            } else {
                // Toggle class.
                if (cls in obj1) {
                    delete obj1[cls];
                } else {
                    obj1[cls] = 1; // `1` is shorter than `true` and we need just keys.
                }
            }
        }

        self.attr('class', Object.keys(obj1).join(' ') || null);

        return self;
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
                        node.style.cssText = val || null;
                    }
                } else {
                    node[name] = val === null ? properties[name] : val;
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
        return val === undefined ?
            node.textContent
            :
            ((node.textContent = val), this); // Intentionally use comma expression here.
    };


    proto.addClass = function(val) {
        return modifyClass(this, val, true);
    };


    proto.removeClass = function(val) {
        return modifyClass(this, val, false);
    };


    proto.toggleClass = function(val, force) {
        return modifyClass(this, val, undefined, force);
    };


    proto.hasClass = function(val) {
        return val in classToObject(this.attr('class'));
    };


    return function(node) {
        return new API(node);
    };
})(document);
