const { expect } = require('chai')
const path = require('path')
const loadPlugins = require('./')

const FIXTURES = path.resolve(__dirname, 'fixtures')

const load = function (name, options = {}) {
  const oldCwd = process.cwd()
  if (options != null && options.cwd == null) {
    const dir = path.join(FIXTURES, name)
    process.chdir(dir)
  }
  try {
    return options === false ? loadPlugins() : loadPlugins(options)
  } catch (err) {
    throw err
  } finally {
    if (options != null && options.cwd == null) {
      process.chdir(oldCwd)
    }
  }
}

describe('basic use', function () {
  it('loads the plugin from dependencies', function () {
    const p = load('basic-deps')
    expect(p).to.have.all.keys('foo')
  })

  it('loads the plugins from dependencies and devDependencies', function () {
    const p = load('basic-dev-deps')
    expect(p).to.have.all.keys('foo', 'bar')
  })

  it('lazy-loads the plugin', function () {
    const p = load('basic-deps')
    expect(p.foo).to.deep.equal({ name: 'foo' })
  })
})

describe('multiple plugins', function () {
  it('loads every plugin', function () {
    const p = load('multiple')
    expect(p).to.contain.all.keys('foo', 'bar')
  })

  it('does not load other dependencies', function () {
    const p = load('multiple')
    expect(p).to.have.all.keys('foo', 'bar')
  })
})

describe('scopes', function () {
  it('turns a scope into a nested object', function () {
    const p = load('scope')
    expect(p.scope).to.be.an('object')
  })

  it('does not load other scoped dependencies', function () {
    const p = load('scope')
    expect(p.scope).to.have.all.keys('foo', 'bar')
  })

  it('mixes scoped and unscoped plugins')
})

describe('options object', function () {
  it('can be omitted', function () {
    expect(function () {
      load('basic-deps', false)
    }).to.not.throw(Error)
  })

  it('can be null', function () {
    expect(function () {
      load('basic-deps', null)
    }).to.not.throw(Error)
  })
})

describe('pattern option', function () {
  it('applies the custom pattern', function () {
    const p = load('multiple', { pattern: '*' })
    expect(p).to.have.all.keys('foo', 'bar', 'baz')
  })
})

describe('scope option', function () {
  it('loads the plugins from the scope', function () {
    const p = load('basic-dev-deps', { scope: ['dependencies'] })
    expect(p).to.have.all.keys('foo')
    expect(p).to.not.have.all.keys('bar')
  })
})

describe('replaceString option', function () {
  it('replaces a string', function () {
    const p = load('basic-deps', { replaceString: '-plugin' })
    expect(p).to.have.all.keys('rollupFoo')
  })

  it('replaces a regexp', function () {
    const p = load('basic-deps', { replaceString: /l+/g })
    expect(p).to.have.all.keys('roupPuginFoo')
  })
})

describe('camelize option', function () {
  it('camelizes the plugin name', function () {
    const p = load('camelize')
    expect(p).to.contain.all.keys('fooBar')
  })

  it('does not camelize the plugin name if disabled', function () {
    const p = load('camelize', { camelize: false })
    expect(p).to.contain.all.keys('foo-bar')
  })

  it('camelizes the scoped plugin name', function () {
    const p = load('scope-camelize')
    expect(p.scope).to.have.all.keys('fooBar')
  })

  it('does not camelize the scoped plugin name if option disabled', function () {
    const p = load('scope-camelize', { camelize: false })
    expect(p.scope).to.have.all.keys('foo-bar')
  })
})

describe('cwd option', function () {
  it('overrides cwd', function () {
    const p = load('basic-deps', {
      cwd: path.join(FIXTURES, 'basic-deps')
    })
    expect(p).to.have.all.keys('foo')
  })
})

describe('maintainScope option', function () {
  it('removes scope when disabled', function () {
    const p = load('scope-mix', {
      maintainScope: false
    })
    expect(p).to.have.all.keys('foo', 'bar', 'baz')
  })
})
