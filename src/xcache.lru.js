/**
 * Least Recently Used (LRU) cache.
 * This is a bare-bone version of
 * Rasmus Andersson's js-lru:
 *
 *   https://github.com/rsms/js-lru
 *
 *       entry             entry             entry             entry
 *       ______            ______            ______            ______
 *      | head |.newer => |      |.newer => |      |.newer => | tail |
 *      |  A   |          |  B   |          |  C   |          |  D   |
 *      |______| <= older.|______| <= older.|______| <= older.|______|
 *
 *  removed  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  added
 *
 *  Created by zhaofeng on 7/5/16.
 */
import XCache from './xcache';

export default class LruXCache extends XCache {
    constructor(limit = 1000) {
        super(limit);
    }

    shift() {
        let entry = this.head;

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

    put(key, value) {
        let entry = this.get(key, true);

        if (entry === undefined) {
            entry = {key, value};

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

    get(key, returnEntry = false) {
        let entry = this._keymap.get(key);
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

    find(key) {
        return !!this._keymap.get(key);
    }

    remove(key) {
        let entry = this._keymap.get(key);

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

    removeAll() {
        this.head = this.tail = undefined;
        this.size = 0;
        this._keymap = new Map();
    }

    forEach(callback) {
        let entry = this.tail;
        while (entry) {
            callback(entry.key, entry.value, entry);
            entry = entry.older;
        }
    }

    getArray() {
        let array = [],
            entry = this.tail;
        while (entry) {
            array.push({
                key: entry.key,
                value: entry.value
            });
            entry = entry.older;
        }

        return array;
    }
}