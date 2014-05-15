var expect = require('expect.js');
var sinon = require('sinon');
var Base = require('../base');
var Attribute = require('../src/attribute');
var $ = require('jquery');

describe('Base', function() {

  it('normal usage', function() {

    var Animal = Base.extend({
      initialize: function(name) {
        this.name = name;
      },
      getName: function() {
        return this.name;
      }
    });

    expect(new Animal('Tom').name).to.equal('Tom');
    expect(new Animal('Tom2').getName()).to.equal('Tom2');

    var Bird = Animal.extend({
      fly: function() {
        return 'I can fly';
      }
    });

    var bird = new Bird('Twitter');
    expect(bird.name).to.equal('Twitter');
    expect(bird.fly()).to.equal('I can fly');
  });

  it('events supporting', function() {
    var counter = 0;

    var Bird = Base.extend({
      initialize: function(name) {
        this.name = name;
      },
      fly: function() {
        this.trigger('fly');
      }
    });

    var bird = new Bird('Twitter');
    bird.on('fly', function() {
      counter++;
    });

    expect(counter).to.equal(0);
    bird.fly();
    expect(counter).to.equal(1);

    bird.off().fly();
    expect(counter).to.equal(1);
  });

  it('attrs merging', function() {

    var Widget = Base.extend({
      attrs: {
        color: '#fff',
        size: {
          width: 100,
          height: 100
        }                }
    });

    var myWidget = new Widget({
      color: '#f00',
      size: {
        width: 200
      },
      position: {
        top: 50,
        left: 100
      }
    });

    expect(myWidget.get('color')).to.equal('#f00');
    expect(myWidget.get('size').width).to.equal(200);
    expect(myWidget.get('size').height).to.equal(100);
    expect(myWidget.get('position').top).to.equal(50);
    expect(myWidget.get('position').left).to.equal(100);
  });

  it('attrs cloning', function() {

    var Widget = Base.extend({
      attrs: {
        color: '#fff',
        size: {
          width: 100,
          height: 100
        }
      }
    });

    // Deep copy example
    var mySize = {
      width: 50,
      height: 50
    };

    var myWidget = new Widget({
      size: mySize
    });

    expect(myWidget.get('color')).to.equal('#fff');
    expect(myWidget.get('size') === mySize).to.equal(false);
  });

  it('events declaration in config', function() {
    var counter = 0;

    var A = Base.extend({
      attrs: {
        color: '#fff',
        size: {
          width: 100,
          height: 100
        }
      },
      show: function() {
        // Do some cool stuff
        this.trigger('show');
      }
    });

    var a = new A({
      color: '#f00',
      size: {
        width: 200
      },
      onShow: function() {
        counter++;
      },
      afterShow: function() {
        counter++;
      },
      beforeShow: function() {
        counter++;
      },
      onChangeColor: function() {
        counter++;
      }
    });

    a.show();
    expect(counter).to.equal(3);

    counter = 0;
    a.set('color', '#0f0');
    expect(counter).to.equal(1);
  });

  it('attrs from ancestors', function() {

    var Person = Base.extend({
      attrs: {
        o1: 'p1',
        o2: 'p2',
        o3: 'p3'
      }
    });

    var Man = Person.extend({
      attrs: {
        o3: 'm1',
        o4: 'm2'
      },
      initialize: function() {
        Man.superclass.initialize.apply(this, arguments);
      }
    });

    var Child = Man.extend({
      attrs: {
        o4: 'c1',
        o5: 'c2'
      },
      initialize: function(config) {
        config.o6 = 'c6';
        Child.superclass.initialize.apply(this, arguments);
      }
    });

    var c = new Child({ o4: 'o4', o2: 'o2' });

    expect(c.get('o1')).to.equal('p1');
    expect(c.get('o2')).to.equal('o2');
    expect(c.get('o3')).to.equal('m1');
    expect(c.get('o4')).to.equal('o4');
    expect(c.get('o5')).to.equal('c2');
    expect(c.get('o6')).to.equal('c6');
  });

  it('alipay/arale#49: deep clone bug in initAttrs', function() {

    var A = Base.extend({
      attrs: {
        array: [1, 2, 3],
        element: null,
        point: null
      }
    });

    var a = new A({ element: document.body });
    var attrs = a.attrs;
    attrs.array.value.push(4);

    expect(attrs.array.value.length).to.equal(4);
    expect(A.prototype.attrs.array.length).to.equal(3);
    expect(attrs.element.value).to.equal(document.body);
    expect(attrs.point.value).to.equal(null);
  });

  it('attrs: normal usage', function() {

    var Overlay = Base.extend({
      attrs: {
        name: 'overlay',
        x: {
          value: 0
        },
        y: {
          value: 0,
          setter: function(val) {
            return parseInt(val, 10);
          }
        },
        xy: {
          getter: function() {
            return [this.get('x'), this.get('y')];
          }
        }
      }
    });

    var overlay = new Overlay({ x: 10 });

    expect(overlay.get('name')).to.equal('overlay');
    expect(overlay.get('x')).to.equal(10);

    overlay.set('y', '2px');
    expect(overlay.get('y')).to.equal(2);
    expect(overlay.get('xy')).to.eql([10, 2]);
  });

  it('attrs: inherited ones', function() {

    // userValue 优先
    var A = Base.extend({
      attrs: {
        x: 'x'
      }
    });

    var B = A.extend({
      attrs: {
        x: 'x2'
      }
    });

    var b = new B({ x: 'x3' });
    expect(b.get('x')).to.equal('x3');


    // 仅覆盖 setter
    var B2 = A.extend({
      attrs: {
        x: {
          setter: function() {
            return 'x2';
          }
        }
      }
    });

    var b2 = new B2();
    expect(b2.get('x')).to.equal('x');
    b2.set('x', 'x3');
    expect(b2.get('x')).to.equal('x2');

  });

  it('related attrs', function() {

    var O = Base.extend({
      attrs: {
        x: 0,
        y: 0,
        xy: {
          getter: function() {
            return [this.get('x'), this.get('y')];
          },
          setter: function(val) {
            this.set('x', val[0]);
            this.set('y', val[1]);
          }
        }
      }
    });

    var o = new O({
      xy: [10, 20]
    });

    expect(o.get('x')).to.equal(10);
    expect(o.get('y')).to.equal(20);
    expect(o.get('xy')).to.eql([10, 20]);

    o = new O({
      x: 30
    });

    expect(o.get('x')).to.equal(30);
    expect(o.get('y')).to.equal(0);
    expect(o.get('xy')).to.eql([30, 0]);

    // 同时设置时，以 xy 的为准
    o = new O({
      xy: [10, 20],
      x: 30,
      y: 30
    });

    expect(o.get('x')).to.equal(10);
    expect(o.get('y')).to.equal(20);
    expect(o.get('xy')).to.eql([10, 20]);
  });

  it('related attrs change events', function() {
    var counter = 0;

    function incr() {
      counter++;
    }

    var O = Base.extend({
      attrs: {
        x: 0,
        y: 0,
        xy: {
          getter: function() {
            return [this.get('x'), this.get('y')];
          },
          setter: function(val) {
            this.set('x', val[0]);
            this.set('y', val[1]);
          }
        }
      },

      _onChangeX: incr,
      _onChangeY: incr,
      _onChangeXy: incr
    });

    var o = new O({
      xy: [10, 20],
      x: 30,
      y: 30
    });

    expect(o.get('x')).to.equal(10);
    expect(o.get('y')).to.equal(20);
    expect(o.get('xy')).to.eql([10, 20]);

    o.change();
    expect(counter).to.equal(0);
  });

  it('attrs change events', function() {
    var counter = 0;
    var counterY = 0;

    var A = Base.extend({
      attrs: {
        x: 1,
        y: 1
      },

      _onChangeY: function(val, prev) {
        expect(prev).to.equal(1);
        expect(val).to.equal(2);
        counterY++;
      }

    });

    var a = new A({ x: 2 });

    a.on('change:x', function(val, prev, key) {
      if (counter === 0) {
        expect(prev).to.equal(2);
        expect(val).to.equal(3);
      }
      expect(key).to.equal('x');
      expect(this).to.equal(a);

      counter++;
    });

    a.set('x', 3);
    a.set('x', 3);

    expect(counter).to.equal(1);

    a.set('x', 4, { silent: true });
    expect(counter).to.equal(1);

    a.set('x', 5);
    expect(counter).to.equal(2);

    a.set('y', 2);
    expect(counterY).to.equal(1);
    a.set('y', 3, { silent: true });
    expect(counterY).to.equal(1);
  });

  it('example in attribute.md', function() {

    var Panel = Base.extend({
      attrs: {
        y: 0,
        size: {
          width: 100,
          height: 100
        }
      },

      initialize: function(config) {
        Panel.superclass.initialize.call(this, config);
        this.element = $(config.element).eq(0);
      },

      _onChangeY: function(val) {
        this.element.offset({ top: val });
      }
    });

    var panel = new Panel({
      element: '#test',
      y: 100,
      size: {
        width: 200
      }
    });

    expect(panel.get('y')).to.equal(100);
    expect(panel.get('size').width).to.equal(200);
    expect(panel.get('size').height).to.equal(100);
  });

  it('aspect', function() {
    var counter = 1;

    var A = Base.extend({
      xxx: function(n, m) {
        return counter += n + m;
      }
    });

    var a = new A();

    a.before('xxx', function(n, m) {
      expect(n).to.equal(1);
      expect(m).to.equal(2);
      expect(this).to.equal(a);
    });

    a.after('xxx', function(ret) {
      expect(ret).to.equal(4);
      expect(this).to.equal(a);
      counter++;
    });

    a.xxx(1, 2);
    expect(counter).to.equal(5);


    // invalid
    counter = 1;
    try {
      a.before('zzz', function() {
      });
    } catch (e) {
      counter++;
    }

    expect(counter).to.equal(2);
  });

  it('prevent before event', function() {
    var spy = sinon.spy();
    var afterSpy = sinon.spy();
    var stub = sinon.stub();
    var A = Base.extend({
      fn: spy
    });

    var a = new A()
      .before('fn', stub)
      .after('fn', afterSpy);

    stub.returns(false);
    a.fn();
    expect(spy.called).not.to.be.ok();
    expect(afterSpy.called).not.to.be.ok();
    spy.reset();
    stub.reset();

    stub.returns(true);
    a.fn();
    expect(spy.called).to.be.ok();
    spy.reset();
    stub.reset();

    stub.returns(undefined);
    a.fn();
    expect(spy.called).to.be.ok();
    spy.reset();
    stub.reset();

    stub.returns('');
    a.fn();
    expect(spy.called).to.be.ok();
    spy.reset();
    stub.reset();
  });

  it('test change method', function() {
    var counter = 0;

    var A = Base.extend({

      attrs: {
        a: 1,
        b: 1,
        c: 1
      },

      _onChangeA: function() {
        counter++;
      },

      _onChangeB: function() {
        counter++;
      },

      _onChangeC: function() {
        counter++;
      }
    });

    counter = 0;
    var a = new A();
    expect(counter).to.equal(0);

    // 初始化后，无 changedAttrs
    a.change();
    expect(counter).to.equal(0);


    counter = 0;
    var a2 = new A({ a: 2 });
    expect(counter).to.equal(0);

    counter = 0;
    a2.set('a', 2);
    expect(counter).to.equal(0);

    counter = 0;
    a2.set('a', 3);
    expect(counter).to.equal(1);

    counter = 0;
    var a3 = new A({ a: 1, b: 2, c: 3 });
    expect(counter).to.equal(0);

    counter = 0;
    a3.set({ a: 2, b: 3, c: 4 });
    expect(counter).to.equal(3);
  });

  it('after/before support binding multiple methodNames at once', function() {
    var counter = 0;

    function incr() {
      counter++;
    }

    var A = Base.extend({
      show: function() {
      },
      hide: function() {
      }
    });

    var a = new A();

    a.before('show hide', incr);
    a.after('hide show', incr);

    a.show();
    expect(counter).to.equal(2);
    a.hide();
    expect(counter).to.equal(4);
  });

  it('special properties getter', function() {

    var T = Base.extend({

      model: {
        getter: function(val) {
          return {
            a: 1,
            v: val
          };
        }
      },

      propsInAttrs: ['model']
    });

    var t = new T();

    expect(t.model.a).to.equal(1);
    expect(t.model.v).to.equal(undefined);

  });

  it('#2 share instance', function() {

    var M = Base.extend({

      attrs: {
        date: 2
      },

      initialize: function() {
        M.superclass.initialize.call(this);
        this.set('date', 2);
      }

    });

    var m1 = new M();
    var m2 = new M();

    expect(m1.get('date')).to.equal(2);
    expect(m2.get('date')).to.equal(2);

    m1.set('date', 4);
    expect(m1.get('date')).to.equal(4);
    expect(m2.get('date')).to.equal(2);

  });

  it('#3 attrs can not be { value: 1 }', function() {

    var A = Base.extend({
      attrs: {
          source: null
      }
    });

    var a = new A({
      source: {
          value: 'a'
      }
    });

    expect(a.get('source')).to.eql({value: 'a'});
  });

  it('#4 the merging bug of jQuery-like object', function() {
    var T = Base.extend({
      attrs: {
        baseElement: { _id: 1 }
      }
    });

    var t = new T({
      baseElement: $({})
    });

    expect(t.get('baseElement')._id).to.equal(undefined);
  });

  it('#16 after callback should pass arguments from method', function() {
    var spy = sinon.spy();
    var T = Base.extend({
      show: function(){return 1}
    });

    var t = new T().after('show', spy);
    t.show('a', 'b');
    expect(spy.calledWith(1, 'a', 'b')).to.be.ok();
  });

  it('destroy', function() {
    var spy = sinon.spy();
    var T = Base.extend({
      initialize: function() {
        this.a = 1;
      }
    });

    var t = new T();
    t.on('a', spy);

    expect(t.a).to.be(1);
    t.trigger('a');
    expect(spy.called).to.be.ok();
    spy.reset();

    t.destroy();
    expect(t.a).to.be(undefined);
    t.trigger('a');
    expect(spy.called).not.to.be.ok();
    spy.reset();
  });

  it('can not set readOnly attr', function() {
    var T = Base.extend({
      attrs: {
        a: {
          value: 1,
          readOnly: true
        }
      }
    });

    var t = new T();
    expect(function() {
      t.set('a', 2);
    }).to.throwError();
  });

  it('attr can be overrided', function() {
    var T = Base.extend({
      attrs: {
        a: {
          b: 1,
          c: 2
        }
      }
    });

    var t = new T();
    t.set('a', {b:3});
    expect(t.get('a')).to.eql({b:3, c:2});

    t.set('a', {b:3}, {override: true});
    expect(t.get('a')).to.eql({b:3});
  });

  it('change silent attr manually', function() {
    var spy = sinon.spy();
    var T = Base.extend({
      attrs: {
        a: 1
      },

      _onChangeA: spy
    });

    var t = new T();

    t.set('a', 2, {silent: true});
    expect(spy.called).not.to.be.ok();

    t.change();
    expect(spy.called).to.be.ok();
  });

  it('other attr format', function() {
    var T = Base.extend({
      attrs: {
        a: true,
        b: /a/g
      }
    });

    var t = new T();
    t.set('a', false);
    t.set('b', /b/g);
    expect(t.get('a')).to.be(false);
    expect(t.get('b')).to.eql(/b/g);
  });

  it('attr moment', function() {
    var moment = require('moment');

    var T = Base.extend({
      attrs: {
        focus: ''
      }
    });
    var t = new T({focus: moment()});
    expect(moment.isMoment(t.get('focus'))).to.be.ok();
  });

  it('isPlainObject #19', function() {
    function Foo() {
      this['c'] = 'c';
      this['d'] = 'd';
    }
    Foo.prototype = {
      'a': 'a',
      'b': 'b'
    };
    expect(Attribute._isPlainObject(new Foo())).not.to.be.ok();
  });

  it('setter need userValue', function() {
    var spy = sinon.spy();
    var Position = {
      VIEWPORT: { _id: 'VIEWPORT', nodeType: 1 }
    };
    var T = Base.extend({
      attrs: {
        align: {
          selfXY: [0, 0],
          baseElement: Position.VIEWPORT,
          baseXY: [0, 0]
        }
      }
    });

    var S = T.extend({
      attrs: {
        align: {
          value: {
            baseXY: [0, '100%'],
            selfXY: [0, 0]
          },
          setter: function(val) {
            spy(val);
          }
        }
      }
    });

    var t = new S({
      align: {
        baseXY: [0, 0]
      }
    });

    expect(spy.calledWith({
        baseXY: [0, 0]
    })).to.be.ok();
  });

  it('destroy once', function() {
    var calledA = 0, calledB = 0;
    var A = Base.extend({
      destroy: function() {
        calledA++;
        A.superclass.destroy.call(this);
      }
    });

    var B = A.extend({
      destroy: function() {
        calledB++;
        B.superclass.destroy.call(this);
      }
    });

    var c = new B();
    c.destroy();
    c.destroy();

    expect(calledA).to.be(1);
    expect(calledB).to.be(1);
  });

  it("isEmptyObject #22", function () {
    $("<div id='test'></div>").appendTo("body");
    var T = Base.extend({
        attrs: {
            parentNode: document.body
        }
    });

    var t = new T();
    t.set('parentNode', $("#test")[0]);
    expect(t.get('parentNode')).to.eql($("#test")[0]);

    t.set('parentNode', document);
    expect(t.get('parentNode')).to.eql(document);

    t.set('parentNode', {});
    expect(t.get('parentNode')).to.eql({});

    t.set('parentNode', window);
    expect(t.get('parentNode')).to.eql(window);

    t.set('parentNode', undefined);
    expect(t.get('parentNode')).to.eql(undefined);

    t.set('parentNode', []);
    expect(t.get('parentNode')).to.eql([]);

    t.set('parentNode', {});
    expect(t.get('parentNode')).to.eql({});

    t.set('parentNode', null);
    expect(t.get('parentNode')).to.eql(null);

    t.set('parentNode', $('#test'));
    expect(t.get('parentNode')).to.eql($('#test'));

    t.set('parentNode', Number.MAX_VALUE);
    expect(t.get('parentNode')).to.eql(Number.MAX_VALUE);

    t.set('parentNode', location);
    expect(t.get('parentNode')).to.eql(location);

    var aString = new String();
    t.set('parentNode', aString);
    expect(t.get('parentNode')).to.eql(aString);

    var aArray = new Array();
    t.set('parentNode', aArray);
    expect(t.get('parentNode')).to.eql(aArray);

    var aObject = new Object();
    t.set('parentNode', aString);
    expect(t.get('parentNode')).to.eql(aObject);

    var aNumber = new Number();
    t.set('parentNode', aString);
    expect(t.get('parentNode')).to.eql(aNumber);

    t.set('parentNode', {});
    expect(t.get('parentNode')).to.eql({});

    var aFunction = function() {};
    t.set('parentNode', aFunction);
    expect(t.get('parentNode')).to.eql(aFunction);

    $("#test").remove();
  });

  it('attribuet start with _', function() {
    var spy = sinon.spy();
    var T = Base.extend({
      attrs: {
        _a: ''
      },
      _onChange_a: spy
    });

    var t = new T();
    t.set('_a', 'a');
    expect(t.get('_a')).to.be('a');
    expect(spy.calledOnce).to.be.ok();
  });
});
