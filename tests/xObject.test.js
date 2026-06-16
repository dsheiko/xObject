'use strict';

const vm = require('vm');
const fs = require('fs');
const path = require('path');

// Load source files into a shared vm context so the IIFEs attach to the
// context object (the top-level `this` inside vm.runInContext equals ctx).
function loadModules(...plugins) {
  // Pass Node.js built-ins so `instanceof` works across the context boundary.
  const ctx = vm.createContext({
    TypeError,
    RangeError,
    SyntaxError,
    Error,
    Object,
    Array,
    parseInt,
    undefined,
    console,
  });
  const src = path.join(__dirname, '..', 'js', 'source');
  const load = (f) => vm.runInContext(fs.readFileSync(path.join(src, f), 'utf8'), ctx);
  load('xObject.core.js');
  plugins.forEach(load);
  return ctx.xObject;
}

// ── Core ─────────────────────────────────────────────────────────────────────

describe('xObject.create — core', () => {
  let xObject;

  beforeEach(() => { xObject = loadModules(); });

  test('sets property via __constructor__', () => {
    const Super = function() { return { prop: null }; };
    const Sub = function() {
      return {
        __extends__: Super,
        __constructor__: function(arg) { this.prop = arg; },
      };
    };
    const obj = xObject.create(Sub, ['test']);
    expect(obj.prop).toBe('test');
  });

  test('creates instance from plain proto object', () => {
    const obj = xObject.create({ prop1: 1 }, { prop2: 2 });
    expect(obj.prop1).toBe(1);
    expect(obj.prop2).toBe(2);
  });

  test('throws when called with no arguments', () => {
    expect(() => xObject.create()).toThrow(Error);
  });

  test('throws TypeError for invalid first argument type', () => {
    expect(() => xObject.create(42)).toThrow(TypeError);
    expect(() => xObject.create('string')).toThrow(TypeError);
  });

  test('throws TypeError when second argument is not array or object', () => {
    const Ctor = function() { return {}; };
    expect(() => xObject.create(Ctor, 'bad')).toThrow(TypeError);
    expect(() => xObject.create(Ctor, 42)).toThrow(TypeError);
  });

  test('throws TypeError when third argument is not an object', () => {
    const Ctor = function() { return {}; };
    expect(() => xObject.create(Ctor, [], 'bad')).toThrow(TypeError);
  });
});

// ── Mixin ─────────────────────────────────────────────────────────────────────

describe('xObject mixin plugin', () => {
  let xObject;

  beforeEach(() => { xObject = loadModules('xObject.mixin.js'); });

  test('copies all trait properties onto the instance', () => {
    const MixinA = { propertyA: 'a' };
    const MixinB = { propertyB: 'b' };
    const Silo = function() {
      return { __mixin__: [MixinA, MixinB], own: 'own' };
    };
    const obj = xObject.create(Silo);
    expect(obj.own).toBe('own');
    expect(obj.propertyA).toBe('a');
    expect(obj.propertyB).toBe('b');
  });

  test('ignores __mixin__ when not an array', () => {
    const Silo = function() { return { __mixin__: null, own: 'own' }; };
    const obj = xObject.create(Silo);
    expect(obj.own).toBe('own');
  });
});

// ── Interface ─────────────────────────────────────────────────────────────────

describe('xObject interface plugin', () => {
  let xObject;

  beforeEach(() => { xObject = loadModules('xObject.interface.js'); });

  test('throws SyntaxError when required method is absent', () => {
    const IFace = { requiredMethod: ['string'] };
    const Missing = function() { return { __implements__: IFace }; };
    expect(() => xObject.create(Missing)).toThrow(SyntaxError);
  });

  test('does not throw when method signature matches type hints', () => {
    const IFace = { greet: ['string'] };
    const Impl = function() {
      return { __implements__: IFace, greet: function(s) { return s; } };
    };
    const obj = xObject.create(Impl);
    expect(() => obj.greet('hello')).not.toThrow();
  });

  test('throws TypeError when primitive type hint is violated', () => {
    const IFace = { greet: ['string'] };
    const Impl = function() {
      return { __implements__: IFace, greet: function(s) { return s; } };
    };
    const obj = xObject.create(Impl);
    expect(() => obj.greet(42)).toThrow(TypeError);
    expect(() => obj.greet(true)).toThrow(TypeError);
  });

  test('throws TypeError when instanceof type hint is violated', () => {
    const Dep = function() { return {}; };
    const IFace = { work: ['string', Dep] };
    const Impl = function() {
      return { __implements__: IFace, work: function() {} };
    };
    const dep = xObject.create(Dep);
    const obj = xObject.create(Impl);
    expect(() => obj.work('ok', dep)).not.toThrow();
    expect(() => obj.work('ok', {})).toThrow(TypeError);
  });
});

// ── Design by Contract ────────────────────────────────────────────────────────

describe('xObject dbc plugin', () => {
  let xObject;

  beforeEach(() => { xObject = loadModules('xObject.dbc.js'); });

  test('enforces interface-style onEntry type hints', () => {
    const contract = { methodA: ['number'] };
    const M = function() {
      return { __contract__: contract, methodA: function() {} };
    };
    const obj = xObject.create(M);
    expect(() => obj.methodA(42)).not.toThrow();
    expect(() => obj.methodA('string')).toThrow(TypeError);
  });

  test('enforces instanceof onEntry type hints', () => {
    const Dep = function() { return {}; };
    const contract = { methodA: ['number', Dep] };
    const M = function() {
      return { __contract__: contract, methodA: function() {} };
    };
    const dep = xObject.create(Dep);
    const obj = xObject.create(M);
    expect(() => obj.methodA(42, dep)).not.toThrow();
    expect(() => obj.methodA(42, {})).toThrow(TypeError);
  });

  test('throws RangeError when validator fails', () => {
    const contract = {
      methodB: {
        onEntry: ['number'],
        validators: [function(n) { return n > 10; }],
        onExit: 'string',
      },
    };
    const M = function() {
      return { __contract__: contract, methodB: function() { return 'ok'; } };
    };
    const obj = xObject.create(M);
    expect(() => obj.methodB(20)).not.toThrow();
    expect(() => obj.methodB(1)).toThrow(RangeError);
  });

  test('throws TypeError when onExit type hint is violated', () => {
    const contract = { methodC: { onExit: 'string' } };
    const M = function() {
      return { __contract__: contract, methodC: function() { return []; } };
    };
    const obj = xObject.create(M);
    expect(() => obj.methodC()).toThrow(TypeError);
  });

  test('throws SyntaxError when contracted method is missing', () => {
    const contract = { missing: ['string'] };
    const M = function() { return { __contract__: contract }; };
    expect(() => xObject.create(M)).toThrow(SyntaxError);
  });
});

// ── Widget / inheritance ──────────────────────────────────────────────────────

describe('xObject widget plugin', () => {
  let xObject;

  beforeEach(() => {
    xObject = loadModules('xObject.widget.js');
    // Replace DOM-dependent querySelectorFn with a simple mock.
    xObject.querySelectorFn = (sel, ctx) => typeof sel === 'object' ? sel : {};
  });

  test('throws TypeError when boundingBox is not provided', () => {
    const W = function() { return { __extends__: xObject.WidgetAbstract }; };
    expect(() => xObject.create(W)).toThrow(TypeError);
  });

  test('calls lifecycle methods in order: init, renderUi, bindUi, syncUi', () => {
    const calls = [];
    const W = function() {
      return {
        __extends__: xObject.WidgetAbstract,
        init:     function() { calls.push('init'); },
        renderUi: function() { calls.push('renderUi'); },
        bindUi:   function() { calls.push('bindUi'); },
        syncUi:   function() { calls.push('syncUi'); },
      };
    };
    xObject.create(W, { boundingBox: {} });
    expect(calls).toEqual(['init', 'renderUi', 'bindUi', 'syncUi']);
  });

  test('populates node.boundingBox and HTML_PARSER entries', () => {
    const mockBB = {};
    const mockChild = {};
    xObject.querySelectorFn = (sel, ctx) => {
      if (typeof sel === 'object') return sel;
      return mockChild;
    };
    const W = function() {
      return {
        __extends__: xObject.WidgetAbstract,
        HTML_PARSER: { toolbar: '.toolbar' },
      };
    };
    const obj = xObject.create(W, { boundingBox: mockBB });
    expect(obj.node.boundingBox).toBe(mockBB);
    expect(obj.node.toolbar).toBe(mockChild);
  });
});

// ── Inheritance chain ─────────────────────────────────────────────────────────

describe('xObject prototype chain', () => {
  let xObject;

  beforeEach(() => {
    xObject = loadModules('xObject.widget.js');
    xObject.querySelectorFn = (sel) => typeof sel === 'object' ? sel : {};
  });

  test('instanceof resolves correctly through multi-level chain', () => {
    const Abstract = function() { return { __extends__: xObject.WidgetAbstract }; };
    const Concrete = function() { return { __extends__: Abstract }; };
    const obj = xObject.create(Concrete, { boundingBox: {} });
    expect(obj instanceof Concrete).toBe(true);
    expect(obj instanceof Abstract).toBe(true);
    expect(obj instanceof xObject.WidgetAbstract).toBe(true);
    expect(obj instanceof xObject.BaseAbstract).toBe(true);
  });

  test('inherits public properties and privileged methods from parent', () => {
    const Abstract = function() {
      const secret = 'private-value';
      return {
        __extends__: xObject.WidgetAbstract,
        inheritedProp: 'inherited',
        privileged: function() { return secret; },
      };
    };
    const Concrete = function() { return { __extends__: Abstract }; };
    const obj = xObject.create(Concrete, { boundingBox: {} });
    expect(obj.inheritedProp).toBe('inherited');
    expect(obj.privileged()).toBe('private-value');
  });

  test('subclass lifecycle methods are invoked, not the parent overrides', () => {
    const calls = [];
    const Abstract = function() {
      return {
        __extends__: xObject.WidgetAbstract,
        init: function() { calls.push('abstract-init'); },
      };
    };
    const Concrete = function() {
      return {
        __extends__: Abstract,
        init:     function() { calls.push('concrete-init'); },
        renderUi: function() { calls.push('renderUi'); },
        bindUi:   function() { calls.push('bindUi'); },
        syncUi:   function() { calls.push('syncUi'); },
      };
    };
    xObject.create(Concrete, { boundingBox: {} });
    expect(calls).toContain('concrete-init');
    expect(calls).not.toContain('abstract-init');
    expect(calls).toContain('renderUi');
    expect(calls).toContain('bindUi');
    expect(calls).toContain('syncUi');
  });

  test('instances have independent member arrays', () => {
    const M = function() {
      return { __extends__: xObject.WidgetAbstract, arr: [] };
    };
    const a = xObject.create(M, { boundingBox: {} });
    const b = xObject.create(M, { boundingBox: {} });
    expect(a.arr.length).toBe(0);
    a.arr = [1];
    expect(a.arr.length).toBe(1);
    expect(b.arr.length).toBe(0);
  });
});
