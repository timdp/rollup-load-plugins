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

const parseDependency = (name) => {
  const idx = name.indexOf('/')
  return {
    name,
    scope: (idx < 0) ? null : name.substring(1, idx),
    id: (idx < 0) ? name : name.substring(idx + 1)
  }
}

const getDependencies = (pkg, scope) => {
  return Array.prototype.concat.apply([], scope.map((key) => {
    return Object.keys(pkg[key] || {})
  })).map(parseDependency)
}

const filterDependencies = (pkg, {scope, pattern}) => {
  const matcher = mm.filter(pattern)
  return getDependencies(pkg, scope).filter(({id}) => matcher(id))
}

const getKey = (plugin, {replaceString, camelize}) => {
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

const buildResult = (plugins, {config, replaceString, camelize}) => {
  const resolveOptions = {basedir: dirname(config)}
  const result = {}
  for (const {name, scope, id} of plugins) {
    const parent = allocateParent(result, scope)
    const key = getKey(id, {replaceString, camelize})
    defineProperty(parent, key, name, resolveOptions)
  }
  return result
}

export default (options = {}) => {
  const {pattern, scope, replaceString, camelize} = defaults(options, defaultOptions)
  const {pkg, path: config} = readPkg.sync()
  const plugins = filterDependencies(pkg, {scope, pattern})
  return buildResult(plugins, {config, replaceString, camelize})
}

delete require.cache[__filename]
