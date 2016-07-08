/*!
 * X-cache v0.0.1
 * (c) 2016 Elwin-赵小峰
 * Released under the MIT License.
 */
'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/**
 * Created by zhaofeng on 7/5/16.
 *
 */

var XCache = function () {
    function XCache() {
        var limit = arguments.length <= 0 || arguments[0] === undefined ? 1000 : arguments[0];
        classCallCheck(this, XCache);

        this.size = 0;
        this.limit = limit;
        this.head = this.tail = undefined;
        this._keymap = new Map();
    }

    createClass(XCache, [{
        key: "shift",
        value: function shift() {}
    }, {
        key: "put",
        value: function put(key, value) {}
    }, {
        key: "get",
        value: function get(key, returnEntry) {}
    }, {
        key: "find",
        value: function find(key) {}
    }, {
        key: "remove",
        value: function remove(key) {}
    }, {
        key: "removeAll",
        value: function removeAll() {}
    }, {
        key: "forEach",
        value: function forEach(callback, fromHead) {}
    }, {
        key: "getArray",
        value: function getArray(fromHead) {}
    }, {
        key: "getSize",
        value: function getSize() {
            return this.size;
        }
    }]);
    return XCache;
}();

var LruXCache = function (_XCache) {
    inherits(LruXCache, _XCache);

    function LruXCache() {
        var limit = arguments.length <= 0 || arguments[0] === undefined ? 1000 : arguments[0];
        classCallCheck(this, LruXCache);
        return possibleConstructorReturn(this, Object.getPrototypeOf(LruXCache).call(this, limit));
    }

    createClass(LruXCache, [{
        key: 'shift',
        value: function shift() {
            var entry = this.head;

            if (entry) {
                if (this.head.newer) {
                    this.head = this.head.newer;
                    this.head.older = undefined;
                } else {
                    this.head = undefined;
                }

                entry.newer = entry.older = undefined;
                this._keymap.delete(entry.key);
                this.size--;
            }

            return entry;
        }
    }, {
        key: 'put',
        value: function put(key, value) {
            var entry = this.get(key, true);

            if (entry === undefined) {
                entry = { key: key, value: value };

                this._keymap.set(key, entry);

                if (this.size == this.limit) {
                    this.shift();
                }

                if (this.tail) {
                    this.tail.newer = entry;
                    entry.older = this.tail;
                } else {
                    this.head = entry;
                }

                this.tail = entry;
                this.size++;
            } else {
                entry.value = value;
            }

            return entry;
        }
    }, {
        key: 'get',
        value: function get(key) {
            var returnEntry = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var entry = this._keymap.get(key);
            if (entry === undefined) return;
            if (entry === this.tail) {
                return returnEntry ? entry : entry.value;
            }

            if (entry.newer) {
                if (entry.head) {
                    this.head = entry.newer;
                }
                entry.newer.older = entry.older;
            }

            if (entry.older) {
                entry.older.newer = entry.newer;
            }

            entry.newer = undefined;
            entry.older = this.tail;

            if (this.tail) {
                this.tail.newer = entry;
            }
            this.tail = entry;

            return returnEntry ? entry : entry.value;
        }
    }, {
        key: 'find',
        value: function find(key) {
            return !!this._keymap.get(key);
        }
    }, {
        key: 'remove',
        value: function remove(key) {
            var entry = this._keymap.get(key);

            if (entry !== undefined) {
                delete this._keymap[entry.key];
                this.size--;

                if (entry.newer && entry.older) {
                    entry.older.newer = entry.newer;
                    entry.newer.older = entry.older;
                } else if (entry.newer) {
                    entry.newer.older = undefined;
                    this.head = entry.newer;
                } else if (entry.older) {
                    entry.older.newer = undefined;
                    this.tail = entry.older;
                } else {
                    this.head = this.tail = undefined;
                }

                return true;
            }

            return false;
        }
    }, {
        key: 'removeAll',
        value: function removeAll() {
            this.head = this.tail = undefined;
            this.size = 0;
            this._keymap = new Map();
        }
    }, {
        key: 'forEach',
        value: function forEach(callback) {
            var fromHead = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var entry = fromHead ? this.head : this.tail;
            while (entry) {
                callback(entry.key, entry.value, entry);
                entry = fromHead ? entry.newer : entry.older;
            }
        }
    }, {
        key: 'getArray',
        value: function getArray() {
            var fromHead = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var array = [],
                entry = fromHead ? this.head : this.tail;
            while (entry) {
                array.push({
                    key: entry.key,
                    value: entry.value
                });
                entry = fromHead ? entry.newer : entry.older;
            }

            return array;
        }
    }]);
    return LruXCache;
}(XCache);

var FifoXCache = function (_XCache) {
    inherits(FifoXCache, _XCache);

    function FifoXCache() {
        var limit = arguments.length <= 0 || arguments[0] === undefined ? 1000 : arguments[0];
        classCallCheck(this, FifoXCache);
        return possibleConstructorReturn(this, Object.getPrototypeOf(FifoXCache).call(this, limit));
    }

    createClass(FifoXCache, [{
        key: 'shift',
        value: function shift() {
            var entry = this.head;

            if (entry) {
                if (this.head.newer) {
                    this.head = this.head.newer;
                    this.head.older = undefined;
                } else {
                    this.head = undefined;
                }

                entry.newer = entry.older = undefined;
                this._keymap.delete(entry.key);
                this.size--;
            }

            return entry;
        }
    }, {
        key: 'put',
        value: function put(key, value) {
            var entry = this.get(key, true);

            if (entry !== undefined) {
                this.remove(key);
            }

            entry = { key: key, value: value };

            this._keymap.set(key, entry);

            if (this.size == this.limit) {
                this.shift();
            }

            if (this.tail) {
                this.tail.newer = entry;
                entry.older = this.tail;
            } else {
                this.head = entry;
            }

            this.tail = entry;
            this.size++;

            return entry;
        }
    }, {
        key: 'get',
        value: function get(key) {
            var returnEntry = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            return returnEntry ? this._keymap.get(key) : (this._keymap.get(key) || {}).value;
        }
    }, {
        key: 'find',
        value: function find(key) {
            return !!this._keymap.get(key);
        }
    }, {
        key: 'remove',
        value: function remove(key) {
            var entry = this._keymap.get(key);
            if (entry !== undefined) {
                delete this._keymap[entry.key];
                this.size--;

                if (entry.newer && entry.older) {
                    entry.older.newer = entry.newer;
                    entry.newer.older = entry.older;
                } else if (entry.newer) {
                    entry.newer.older = undefined;
                    this.head = entry.newer;
                } else if (entry.older) {
                    entry.older.newer = undefined;
                    this.tail = entry.older;
                } else {
                    this.head = this.tail = undefined;
                }

                return true;
            }

            return false;
        }
    }, {
        key: 'removeAll',
        value: function removeAll() {
            this.head = this.tail = undefined;
            this.size = 0;
            this._keymap = new Map();
        }
    }, {
        key: 'forEach',
        value: function forEach(callback) {
            var fromHead = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var entry = fromHead ? this.head : this.tail;
            while (entry) {
                callback(entry.key, entry.value, entry);
                entry = fromHead ? entry.newer : entry.older;
            }
        }
    }, {
        key: 'getArray',
        value: function getArray() {
            var fromHead = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var array = [],
                entry = fromHead ? this.head : this.tail;
            while (entry) {
                array.push({
                    key: entry.key,
                    value: entry.value
                });
                entry = fromHead ? entry.newer : entry.older;
            }

            return array;
        }
    }]);
    return FifoXCache;
}(XCache);

var LfuXCache = function (_XCache) {
    inherits(LfuXCache, _XCache);

    function LfuXCache() {
        var limit = arguments.length <= 0 || arguments[0] === undefined ? 1000 : arguments[0];
        classCallCheck(this, LfuXCache);
        return possibleConstructorReturn(this, Object.getPrototypeOf(LfuXCache).call(this, limit));
    }

    createClass(LfuXCache, [{
        key: '_remove',
        value: function _remove(currentEntry) {
            if (currentEntry.newer && currentEntry.older) {
                currentEntry.older.newer = currentEntry.newer;
                currentEntry.newer.older = currentEntry.older;
            } else if (currentEntry.newer) {
                this.head = currentEntry.newer;
                currentEntry.newer.older = undefined;
            } else if (currentEntry.older) {
                this.tail = currentEntry.older;
                currentEntry.older.newer = undefined;
            }

            currentEntry.newer = undefined;
            currentEntry.older = undefined;

            return currentEntry;
        }
    }, {
        key: '_sort',
        value: function _sort(currentEntry) {
            var entry = currentEntry.newer;
            entry && this._remove(currentEntry);

            while (entry) {
                if (currentEntry.count < entry.count) {
                    currentEntry.older = entry.older;
                    currentEntry.newer = entry;
                    entry.older.newer = currentEntry;
                    entry.older = currentEntry;
                    break;
                }

                if (entry === this.tail) {
                    currentEntry.older = this.tail;
                    this.tail.newer = currentEntry;
                    this.tail = currentEntry;
                    break;
                }

                entry = entry.newer;
            }
        }
    }, {
        key: 'shift',
        value: function shift() {
            var entry = this.head;

            if (entry) {
                if (this.head.newer) {
                    this.head = this.head.newer;
                    this.head.older = undefined;
                } else {
                    this.head = undefined;
                }

                entry.newer = entry.older = undefined;
                this._keymap.delete(entry.key);
                this.size--;
            }

            return entry;
        }
    }, {
        key: 'put',
        value: function put(key, value) {
            var entry = this.get(key, true);

            if (entry === undefined) {
                entry = { key: key, value: value, count: 0 };

                this._keymap.set(key, entry);

                if (this.size == this.limit) {
                    this.shift();
                }

                if (this.head === undefined) {
                    this.head = this.tail = entry;
                } else {
                    entry.newer = this.head;
                    this.head.older = entry;
                    this.head = entry;
                }
                this.size++;
            } else {
                this.size--;
                entry.value = value;
            }

            return entry;
        }
    }, {
        key: 'get',
        value: function get(key) {
            var returnEntry = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var entry = this._keymap.get(key);
            if (entry === undefined) return;

            entry.count++;
            this._sort(entry);

            return returnEntry ? entry : entry.value;
        }
    }, {
        key: 'find',
        value: function find(key) {
            return !!this._keymap.get(key);
        }
    }, {
        key: 'remove',
        value: function remove(key) {
            var entry = this._keymap.get(key);

            if (entry !== undefined) {
                delete this._keymap[entry.key];
                this.size--;

                if (entry.newer && entry.older) {
                    entry.older.newer = entry.newer;
                    entry.newer.older = entry.older;
                } else if (entry.newer) {
                    entry.newer.older = undefined;
                    this.head = entry.newer;
                } else if (entry.older) {
                    entry.older.newer = undefined;
                    this.tail = entry.older;
                } else {
                    this.head = this.tail = undefined;
                }

                return true;
            }

            return false;
        }
    }, {
        key: 'removeAll',
        value: function removeAll() {
            this.head = this.tail = undefined;
            this.size = 0;
            this._keymap = new Map();
        }
    }, {
        key: 'forEach',
        value: function forEach(callback) {
            var fromHead = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            var entry = fromHead ? this.head : this.tail;
            while (entry) {
                callback(entry.key, entry.value, entry);
                entry = fromHead ? entry.newer : entry.older;
            }
        }
    }, {
        key: 'getArray',
        value: function getArray() {
            var fromHead = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var array = [],
                entry = fromHead ? this.head : this.tail;
            while (entry) {
                array.push({
                    key: entry.key,
                    value: entry.value
                });
                entry = fromHead ? entry.newer : entry.older;
            }

            return array;
        }
    }]);
    return LfuXCache;
}(XCache);

exports.LruXCache = LruXCache;

exports.FifoXCache = FifoXCache;

exports.LfuXCache = LfuXCache;

exports.XCache = function (strategy, option) {
    strategy = strategy || 'lru';
    option = option || {};

    switch (strategy) {
        case 'lru':
            return new LruXCache(option.limit);
            break;
        case 'fifo':
            return new FifoXCache(option.limit);
            break;
    }
};