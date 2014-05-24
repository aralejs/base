
# Attribute 使用文档

- order: 1

---

提供基本的属性添加、获取、移除等功能。

---

## 使用说明

基于 `Base.extend` 创建的类，会自动添加上 `Attribute` 提供的功能。例子：

```js
/* panel.js */
var Base = require('base');
var $ = require('$');

var Panel = Base.extend({
    attrs: {
        element: {
            value: '#test',
            readOnly: true
        },
        color: '#fff',
        size: {
            width: 100,
            height: 100
        },
        x: 200,
        y: 200,
        xy: {
            getter: function() {
                return this.get('x') + this.get('y');
            },
            setter: function(val) {
                this.set('x', val[0]);
                this.set('y', val[1]);
            }
        }
    },

    initialize: function(config) {
        Panel.superclass.initialize.call(this, config);
        this.element = $(config.element).eq(0);
    },

    _onChangeColor: function(val) {
        this.element.css('backgroundColor', val);
    }
});

exports.Panel = Panel;
```

**在 `initialize` 方法中，调用 `superclass.initialize` 方法，就可以自动设置好实例的属性。**

```js
/* test.js */
var Panel = require('./panel').Panel;

var panel = new Panel({
    element: '#test',
    color: '#f00',
    size: {
        width: 200
    }
});

console.log(panel.get('color')); // '#f00'
console.log(panel.get('size')); // { width: 200, height: 100 }
```

在初始化时，实例中的 `_onChangeX` 方法会自动注册到 `change:x` 事件的回调队列中：

```js
/* test2.js */
var Panel = require('./panel').Panel;

var panel = new Panel({ element: '#test' });
panel.set('color', '#00f'); // this.element 的背景色自动变为 '#00f'
```

虽然在组件实例化的时候也会设置属性，但不会触发 `change:x` 事件，即不会执行 `_onChangeX`。

## API

### attrs 的设置

类定义时, 通过设置 attrs 来定义该类有哪些属性, 每个属性是通过如下方式定义的:

```js
{
    // 方式一: 直接设置默认值
    attr1: "aString",

    // 方式二: 通过对象的 value 设置默认值, 相当于方式一
    attr2: {
        value: "bString"
    },

    // 方式三: 设置 setter
    attr3: {
        value: "cString",
        // setter 会在对象调用 set() 时触发, 可以在此时做些处理,
        // 比如强制类型转换
        // 即当 obj.set('attr3', 1) 后, 会调用 setter, 转换成 '1'
        // setter 的 this 为当前实例对象
        setter: function(v) {
            return v + ""
        }
    },

    // 方式四: 设置 getter
    attr4: {
        value: 10,
        // getter 会在对象调用 get() 时触发, 同样可以在此时做些处理,
        // 比如存的是美元, 转成人民币
        // 即当 obj.get('attr4') 后, 会调用 getter
        // getter 的 this 为当前实例对象
        getter: function(v) {
            // 美元 * 汇率 = 人民币
            return v * 6.8
        }
    },

    // 方式五: readonly
    attr5: {
        value: 0,
        // 设置 readOnly 之后, 没法通过 obj.set() 的方式设置值, 即不可更改
        // 可以同时设置 getter 来调整
        // 默认 readOnly 为 false
        readOnly: true,
        getter: function() {
            return Math.ceil(this.get('panels').length / this.get('step'));
        }
    }
}

```

### set `.set(key, value, options)`

设置某个值的属性，如果有定义 setter，会先调用 setter。

#### options.silent

`silent=true` 时不会触发 change 事件。

```
var panel = new Panel({ element: '#test' });
panel.set('color', '#00f', {silent: true}); // this.element 的背景色不会改变
```

#### options.override

如果属性值为一个简单对象，默认的方式是混合，但 `override=true` 会覆盖原来的属性。

### get `.get(key)`

获取某个属性值，如果有定义 getter，会返回 getter 的返回值。

## 交流讨论

- [after / before 与 on 的含义冲突](https://github.com/aralejs/aralejs.org/issues/74)

