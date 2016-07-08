/**
 * Created by zhaofeng on 7/5/16.
 *
 */
import XCache from './xcache';

export default class LfuXCache extends XCache {
    constructor(limit = 1000) {
        super(limit);
    }

    _remove(currentEntry) {
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

    _sort(currentEntry) {
        let entry = currentEntry.newer;
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
            entry = {key, value, count: 0};

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

    get(key, returnEntry = false) {
        let entry = this._keymap.get(key);
        if (entry === undefined) return;

        entry.count++;
        this._sort(entry);

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