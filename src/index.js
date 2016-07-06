/**
 * Created by zhaofeng on 7/5/16.
 */
import LruXCache from './xcache.lru';
import FifoXCache from './xcache.fifo';

exports.LruXCache = LruXCache;

exports.FifoXCache = FifoXCache;

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
