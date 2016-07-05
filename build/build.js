/**
 * Created by zhaofeng on 7/5/16.
 */
var fs = require('fs');
var zlib = require('zlib');
var rollup = require('rollup');
var uglify = require('uglify-js');
var babel = require('rollup-plugin-babel');
var replace = require('rollup-plugin-replace');
var version = process.env.VERSION || require('../package.json').version;

var banner =
    '/*!\n' +
    ' * X-cache v' + version + '\n' +
    ' * (c) ' + new Date().getFullYear() + ' Elwin-赵小峰\n' +
    ' * Released under the MIT License.\n' +
    ' */';

// CommonJS build.
// this is used as the "main" field in package.json
// and used by bundlers like Webpack and Browserify.
rollup.rollup({
    entry: 'src/index.js',
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
}).then(function (bundle) {
    return write('dist/xcache.common.js', bundle.generate({
        format: 'cjs',
        banner: banner
    }).code)
}).then(function () {
    return rollup.rollup({
        entry: 'src/index.js',
        plugins: [
            replace({
                'process.env.NODE_ENV': "'development'"
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    }).then(function (bundle) {
        return write('dist/xcache.js', bundle.generate({
            format: 'umd',
            banner: banner,
            moduleName: 'Xcache'
        }).code)
    })
}).then(function () {
    // Standalone Production Build
    return rollup.rollup({
        entry: 'src/index.js',
        plugins: [
            replace({
                'process.env.NODE_ENV': "'production'"
            }),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    }).then(function (bundle) {
        var code = bundle.generate({
            format: 'umd',
            moduleName: 'Xcache',
            banner: banner
        }).code;

        var res = uglify.minify(code, {
            fromString: true,
            outSourceMap: 'xcache.min.js.map',
            output: {
                preamble: banner,
                ascii_only: true
            }
        });

        // fix uglifyjs sourcemap
        var map = JSON.parse(res.map);
        map.sources = ['xcache.js'];
        map.sourcesContent = [code];
        map.file = 'xcache.min.js';

        return [
            write('dist/xcache.min.js', res.code),
            write('dist/xcache.min.js.map', JSON.stringify(map))
        ]
    }).then(zip)
}).catch(logError);

function write(dest, code) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(dest, code, function (err) {
            if (err) return reject(err);
            console.log(blue(dest) + ' ' + getSize(code));
            resolve()
        })
    })
}

function zip() {
    return new Promise(function (resolve, reject) {
        fs.readFile('dist/xcache.min.js', function (err, buf) {
            if (err) return reject(err);
            zlib.gzip(buf, function (err, buf) {
                if (err) return reject(err);
                write('dist/xcache.min.js.gz', buf).then(resolve)
            })
        })
    })
}

function getSize(code) {
    return (code.length / 1024).toFixed(2) + 'kb';
}

function logError(e) {
    console.log(e);
}

function blue(str) {
    return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m';
}
