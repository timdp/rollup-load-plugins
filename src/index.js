import {camelCase} from 'change-case'
import defaults from 'defaults'
import mem from 'mem'
import mm from 'micromatch'
import readPkg from 'read-pkg-up'
import resolve from 'resolve'
import {dirname} from 'path'

const defaultOptions = {
  pattern: ['rollup-plugin-*'],
  scope: ['dependencies', 'devDependencies', 'peerDependencies'],
  replaceString: /^rollup-plugin-/,
  camelize: true
}

const getDependencies = (pkg, scope) => {
  return Array.prototype.concat.apply([], scope.map((key) => {
    return Object.keys(pkg[key] || {})
  }))
}

const getKey = (plugin, {replaceString, camelize}) => {
  const replaced = plugin.replace(replaceString, '')
  return camelize ? camelCase(replaced) : replaced
}

const defineProperty = (result, key, plugin, resolveOptions) => {
  Object.defineProperty(result, key, {
    get: mem(() => require(resolve.sync(plugin, resolveOptions))),
    enumerable: true
  })
}

export default (options = {}) => {
  const {pattern, scope, replaceString, camelize} = defaults(defaultOptions, options)
  const {pkg, path: config} = readPkg.sync()
  const resolveOptions = {basedir: dirname(config)}
  const deps = getDependencies(pkg, scope)
  const plugins = mm(deps, pattern)
  const result = {}
  for (const plugin of plugins) {
    const key = getKey(plugin, {replaceString, camelize})
    defineProperty(result, key, plugin, resolveOptions)
  }
  return result
}

delete require.cache[__filename]
