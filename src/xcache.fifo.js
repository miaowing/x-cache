/**
 * First in First out cache
 *
 * Created by zhaofeng on 7/5/16.
 *
 */
import XCache from './xcache';

export default class FifoXCache extends XCache {
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

        if (entry !== undefined) {
            this.remove(key);
        }

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

        return entry;
    }

    get(key, returnEntry = false) {
        return returnEntry ? this._keymap.get(key) : (this._keymap.get(key) || {}).value;
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

    forEach(callback, fromHead = false) {
        let entry = fromHead ? this.head : this.tail;
        while (entry) {
            callback(entry.key, entry.value, entry);
            entry = fromHead ? entry.newer : entry.older;
        }
    }

    getArray(fromHead = false) {
        let array = [],
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
}