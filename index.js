const camelCase = require('camelcase')
const mem = require('mem')
const micromatch = require('micromatch')
const readPkgUp = require('read-pkg-up')
const resolve = require('resolve')
const { dirname } = require('path')

const defaultOptions = {
  pattern: ['rollup-plugin-*'],
  scope: ['dependencies', 'devDependencies', 'peerDependencies'],
  replaceString: /^rollup-plugin-/,
  camelize: true
}

const parseDependency = name => {
  const idx = name.indexOf('/')
  return {
    name,
    scope: idx < 0 ? null : name.substring(1, idx),
    id: idx < 0 ? name : name.substring(idx + 1)
  }
}

const getDependencies = (pkg, scope) => {
  return Array.prototype.concat
    .apply(
      [],
      scope.map(key => {
        return Object.keys(pkg[key] || {})
      })
    )
    .map(parseDependency)
}

const filterDependencies = (pkg, { scope, pattern }) =>
  getDependencies(pkg, scope).filter(
    ({ id }) => micromatch(id, pattern).length > 0
  )

const getKey = (plugin, { replaceString, camelize }) => {
  const replaced = plugin.replace(replaceString, '')
  return camelize ? camelCase(replaced) : replaced
}

const allocateParent = (result, scope) => {
  if (scope != null) {
    if (result[scope] == null) {
      result[scope] = {}
    }
    return result[scope]
  } else {
    return result
  }
}

const defineProperty = (result, key, plugin, resolveOptions) => {
  Object.defineProperty(result, key, {
    get: mem(() => require(resolve.sync(plugin, resolveOptions))),
    enumerable: true
  })
}

const buildResult = (plugins, { config, replaceString, camelize }) => {
  const resolveOptions = { basedir: dirname(config) }
  const result = {}
  for (let i = 0; i < plugins.length; ++i) {
    const { name, scope, id } = plugins[i]
    const parent = allocateParent(result, scope)
    const key = getKey(id, { replaceString, camelize })
    defineProperty(parent, key, name, resolveOptions)
  }
  return result
}

const loadPlugins = (options = {}) => {
  const { pattern, scope, replaceString, camelize, cwd } = Object.assign(
    {},
    defaultOptions,
    options
  )
  const { pkg, path: config } = readPkgUp.sync({ cwd })
  const plugins = filterDependencies(pkg, { scope, pattern })
  return buildResult(plugins, { config, replaceString, camelize })
}

delete require.cache[__filename]

module.exports = loadPlugins
