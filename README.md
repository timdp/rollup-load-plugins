# rollup-load-plugins

[![npm](https://img.shields.io/npm/v/rollup-load-plugins.svg)](https://www.npmjs.com/package/rollup-load-plugins) [![Dependencies](https://img.shields.io/david/timdp/rollup-load-plugins.svg)](https://david-dm.org/timdp/rollup-load-plugins) [![Build Status](https://img.shields.io/travis/timdp/rollup-load-plugins/master.svg)](https://travis-ci.org/timdp/rollup-load-plugins) [![Coverage Status](https://img.shields.io/coveralls/timdp/rollup-load-plugins/master.svg)](https://coveralls.io/r/timdp/rollup-load-plugins) [![JavaScript Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

Loads Rollup plugins listed in package.json. Like
[gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins), but for
Rollup.

## Installation

```bash
npm i --save-dev rollup-load-plugins
```

## Usage

```js
import loadPlugins from 'rollup-load-plugins'
import {rollup} from 'rollup'

const plugins = loadPlugins()

// Then, if you have rollup-plugin-node-resolve and rollup-plugin-commonjs ...
rollup({
  plugins: [
    plugins.nodeResolve({jsnext: true, main: true}),
    plugins.commonjs({include: 'node_modules/**'})
  ]
})
```

## Options

This is a subset of
[gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins)'s options.
The behavior should be identical.

### `pattern`

Default: `['rollup-plugin-*']`

### `scope`

Default: `['dependencies', 'devDependencies', 'peerDependencies']`

### `replaceString`

Default: `/^rollup-plugin-/`

### `camelize`

Default: `true`

## TODO

- @scope support
- `config` option
- `renameFn` option
- `renameFn` option

PRs welcome!

## Author

[Tim De Pauw](https://tmdpw.eu/)

## License

MIT
