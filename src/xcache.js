/**
 * Created by zhaofeng on 7/5/16.
 *
 */
export default class XCache {
    constructor(limit = 1000) {
        this.size = 0;
        this.limit = limit;
        this.head = this.tail = undefined;
        this._keymap = new Map();
    }

    shift() {}

    put(key, value) {}

    get(key, returnEntry) {}

    find(key) {}

    remove(key) {}

    removeAll() {}

    forEach(callback) {}

    getArray(){}

    getSize(){
        return this.size;
    }
}