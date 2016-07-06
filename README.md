# X-cache

A finite key-value cache support multi cache algorithm (LRU, FIFO, LFU...).

## Support cache algorithm

* fifo      First in First out (FIFO)
* lru       Least Recently Used (LRU)
* lru-k     Least Recently Used K (LRU-K)      Todo
* 2q        Two queues (2Q)                    Todo
* lfu       Least Frequently Used (LFU)        Todo
* ...

## Usage

```
$ npm install x-cache --save
```

## Example
```javascript
import {LruXCache, XCache} from 'x-cache';
// or
var XCache = require('x-cache').XCache;

const cache = new LruXCache(1000);
cache.put('elwin', 1215);
cache.put('leon', 1233);
cache.put('tom', 1234);
cache.get('elwin'); // 1215
cache.find('elwin'); // true
cache.remove('elwin'); // true
cache.getSize(); // 2
cache.getArray(); // [1234, 1233]
cache.shift();
cache.forEach((v, k, obj) => console.log(v, k)); // tom, 1234
cache.removeAll();
```

## API

### new XCache(strategy, option)

Create a new cache instance.
* strategy: cache algorithm, such as lru, fifo..., you can see support cache algorithm for detail.
* option: it is not always same. if you use lru strategy, the option is {limit: 1000}.

### new LruXCache(limit)

Create a new cache instance using LRU cache algorithm.
* limit: limit the size of cache

### new FifoXCache(limit)

Create a new cache instance using FIFO cache algorithm.
* limit: limit the size of cache

### XCache.prototype.put(key, value): Object entry

Put the value into the cache associated with key.
* key:
* value:

### XCache.prototype.get(key): Object value

Returns the value associated with key or undefined if not in the cache.
* key:

### XCache.prototype.shift(): Object entry

### XCache.prototype.find(key): Boolean bool

Check the key is whether in cache or not.
* key:

### XCache.prototype.remove(key): Boolean bool

Remove the value associated with key, return true if remove successful.
* key:

### XCache.prototype.removeAll()

Clear the cache.

### XCache.prototype.getSize(): Number size

Returns the current size of the cache.

### XCache.prototype.getArray(fromHead): Array array

Returns array {key, value}.
* fromHead: default false

### XCache.prototype.forEach(callback, fromHead)

Iterator, callback(key, value, obj).
* fromHead: default false