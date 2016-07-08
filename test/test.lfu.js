/**
 * Created by zhaofeng on 7/5/16.
 */
var assert = require('assert'),
    LfuXCache = require('../dist/xcache.common').LfuXCache;


function toString(c) {
    var result = '';
    c.forEach(function (k, v, entry) {
        result += k + ':' + v + ' ';
    });

    return result;
}

describe('LFU Cache', function () {
    var cache;

    before(function () {
        cache = new LfuXCache(4);
    });

    // test cases
    describe('#put(key, value)', function () {
        it('respond with matching records', function (done) {
            cache.put('tom', 11);
            cache.put('jerry', 22);
            cache.put('elwin', 33);
            cache.put('leon', 44);

            assert.equal(cache.getSize(), 4);
            assert.equal(toString(cache), 'tom:11 jerry:22 elwin:33 leon:44 ');
            done();
        });
    });

    describe('#get(key, returnEntry)', function () {
        it('respond with matching records', function (done) {
            assert.equal(cache.get('elwin'), 33);
            assert.equal(cache.get('jerry'), 22);
            assert.equal(toString(cache), 'jerry:22 elwin:33 tom:11 leon:44 ');
            assert.equal(cache.get('elwin'), 33);
            assert.equal(cache.get('elwin'), 33);
            assert.equal(toString(cache), 'elwin:33 jerry:22 tom:11 leon:44 ');
            assert.equal(cache.get('leon'), 44);
            assert.equal(cache.get('leon'), 44);
            assert.equal(cache.get('leon'), 44);
            assert.equal(cache.get('leon'), 44);
            assert.equal(toString(cache), 'leon:44 elwin:33 jerry:22 tom:11 ');
            assert.equal(cache.get('elwin'), 33);
            assert.equal(cache.get('elwin'), 33);
            assert.equal(toString(cache), 'elwin:33 leon:44 jerry:22 tom:11 ');
            done();
        });
    });

    describe('#put(key, value)', function () {
        it('respond with matching records', function (done) {
            cache.put('sam', 55);
            cache.put('test', 66);
            assert.equal(cache.getSize(), 4);
            assert.equal(toString(cache), 'elwin:33 leon:44 jerry:22 test:66 ');
            done();
        });
    });

    describe('#find(key)', function () {
        it('respond with matching records', function (done) {
            assert.equal(cache.find('leon'), true);
            assert.equal(cache.find('hello'), false);
            done();
        });
    });

    describe('#remove(key)', function () {
        it('respond with matching records', function (done) {
            assert.equal(cache.remove('leon'), true);
            assert.equal(cache.remove('hello'), false);
            assert.equal(cache.getSize(), 3);
            assert.equal(toString(cache), 'elwin:33 jerry:22 test:66 ');
            done();
        });
    });

    describe('#shift()', function () {
        it('respond with matching records', function (done) {
            cache.shift();
            assert.equal(cache.getSize(), 2);
            assert.equal(toString(cache), 'elwin:33 jerry:22 ');
            done();
        });
    });

    describe('#removeAll()', function () {
        it('respond with matching records', function (done) {
            cache.removeAll();
            assert.equal(cache.getSize(), 0);
            assert.equal(toString(cache), '');
            done();
        });
    });
});