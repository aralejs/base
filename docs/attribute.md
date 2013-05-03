
# Attribute 使用文档

- order: 1

---

提供基本的属性添加、获取、移除等功能。

---

## 使用说明

基于 `Base.extend` 创建的类，会自动添加上 `Attribute` 提供的功能。例子：

```
/* panel.js */
define(function(require, exports, module) {
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
});
```

在 `initialize` 方法中，调用 `superclass.initialize` 方法，就可以自动设置好实例的属性。

```
/* test.js */
define(function(require, exports, module) {
    var Panel = require('./panel');

    var panel = new Panel({
        element: '#test',
        color: '#f00',
        size: {
            width: 200
        }
    });

    console.log(panel.get('color')); // '#f00'
    console.log(panel.get('size')); // { width: 200, height: 100 }
});
```

使用 `extend` 创建类时，如果混入了 `Events` 模块，则在初始化时，实例中的 `_onChangeX`
方法会自动注册到 `change:x` 事件的回调队列中：

```
/* test2.js */
define(function(require, exports, module) {
    var Panel = require('./panel');

    var panel = new Panel({ element: '#test' });
    panel.set('color', '#00f'); // this.element 的背景色自动变为 '#00f'
});
```

虽然在组件实例化的时候也会设置属性，但不会触发 `change:x` 事件，即不会执行 `_onChangeX`。

## API

### set `.set(key, value, options)`

设置某个值的属性，如果有定义 setter，会先调用 setter。

#### options.silent

设置属性时不会触发 change 事件。

```
var panel = new Panel({ element: '#test' });
panel.set('color', '#00f', {silent: true}); // this.element 的背景色不会改变
```

#### options.override

如果属性值为一个简单对象，默认的方式是混合，但指定 `override` 会覆盖原来的属性。

### get `.get(key)`

获取某个属性值，如果有定义 getter，会返回 getter 的返回值。

## 交流讨论

- [after / before 与 on 的含义冲突](https://github.com/aralejs/aralejs.org/issues/74)

