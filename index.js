const camelCase = require('camelcase')
const mem = require('mem')
const micromatch = require('micromatch')
const readPkgUp = require('read-pkg-up')
const resolve = require('resolve')
const { dirname } = require('path')

const DEFAULT_OPTIONS = {
  pattern: ['rollup-plugin-*'],
  scope: ['dependencies', 'devDependencies', 'peerDependencies'],
  replaceString: /^rollup-plugin-/,
  camelize: true,
  maintainScope: true
}

const parseDependency = name => {
  const idx = name.indexOf('/')
  return {
    name,
    scope: idx < 0 ? null : name.substring(1, idx),
    id: idx < 0 ? name : name.substring(idx + 1)
  }
}

const getDependencies = (pkg, scope) =>
  scope.reduce((deps, key) => {
    if (pkg[key] != null) {
      deps.push(...Object.keys(pkg[key]).map(parseDependency))
    }
    return deps
  }, [])

const filterDependencies = (pkg, { pattern, scope }) =>
  getDependencies(pkg, scope).filter(
    ({ id }) => micromatch(id, pattern).length > 0
  )

const allocateParent = (result, scope, maintainScope) => {
  if (maintainScope && scope != null) {
    if (result[scope] == null) {
      result[scope] = {}
    }
    return result[scope]
  } else {
    return result
  }
}

const getKey = (plugin, { replaceString, camelize }) => {
  const replaced = plugin.replace(replaceString, '')
  return camelize ? camelCase(replaced) : replaced
}

const defineProperty = (result, key, plugin, resolveOptions) => {
  Object.defineProperty(result, key, {
    get: mem(() => require(resolve.sync(plugin, resolveOptions))),
    enumerable: true
  })
}

const buildResult = (
  plugins,
  { config, replaceString, camelize, maintainScope }
) => {
  const resolveOptions = { basedir: dirname(config) }
  const result = {}
  for (const { name, scope, id } of plugins) {
    const parent = allocateParent(result, scope, maintainScope)
    const key = getKey(id, { replaceString, camelize })
    defineProperty(parent, key, name, resolveOptions)
  }
  return result
}

const loadPlugins = (options = {}) => {
  const {
    pattern,
    scope,
    replaceString,
    camelize,
    cwd,
    maintainScope
  } = Object.assign({}, DEFAULT_OPTIONS, options)
  const { pkg, path: config } = readPkgUp.sync({ cwd })
  const plugins = filterDependencies(pkg, { pattern, scope })
  return buildResult(plugins, {
    config,
    replaceString,
    camelize,
    maintainScope
  })
}

delete require.cache[__filename]

module.exports = loadPlugins
