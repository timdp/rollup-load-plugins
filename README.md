# rollup-load-plugins

[![npm](https://img.shields.io/npm/v/rollup-load-plugins.svg)](https://www.npmjs.com/package/rollup-load-plugins) [![Dependencies](https://img.shields.io/david/timdp/rollup-load-plugins.svg)](https://david-dm.org/timdp/rollup-load-plugins) [![Build Status](https://img.shields.io/circleci/project/github/timdp/rollup-load-plugins/master.svg)](https://circleci.com/gh/timdp/rollup-load-plugins) [![Coverage Status](https://img.shields.io/coveralls/timdp/rollup-load-plugins/master.svg)](https://coveralls.io/r/timdp/rollup-load-plugins) [![JavaScript Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://standardjs.com/)

Loads Rollup plugins listed in package.json. Like
[gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins), but for
Rollup.

## Installation

```bash
npm install --save-dev rollup-load-plugins
```

## Usage

```js
import loadPlugins from 'rollup-load-plugins'
import { rollup } from 'rollup'

const plugins = loadPlugins()

// Then, if you have rollup-plugin-node-resolve and rollup-plugin-commonjs ...
rollup({
  plugins: [
    plugins.nodeResolve({ jsnext: true, main: true }),
    plugins.commonjs({ include: 'node_modules/**' })
  ]
})
```

## Options

This is a subset of
[gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins)'s options.
The behavior should be identical.

### `pattern`

The glob(s) against which to match package names.

Default: `['rollup-plugin-*']`

### `scope`

The keys from `package.json` in which to discover plugins.

Default: `['dependencies', 'devDependencies', 'peerDependencies']`

### `replaceString`

The string or regexp to replace in the plugin name.

Default: `/^rollup-plugin-/`

### `camelize`

Transform hyphenated plugin names to camelCase.

Default: `true`

### `cwd`

The path to the package depending on the plugin. This option does not exist in
gulp-load-plugins.

Default: `process.cwd()`

## TODO

[gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins) contains a
few more useful options that this package does not implement. Pull requests that
implement those are appreciated.

## Author

[Tim De Pauw](https://tmdpw.eu/)

## License

MIT
