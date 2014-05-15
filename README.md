# Base

---

[![spm package](http://spmjs.io/badge/arale-base)](http://spmjs.io/package/arale-base)
[![Build Status](https://travis-ci.org/aralejs/base.png)](https://travis-ci.org/aralejs/base) [![Coverage Status](https://coveralls.io/repos/aralejs/base/badge.png?branch=master)](https://coveralls.io/r/aralejs/base)

Base 是一个基础类，提供 [Class](http://aralejs.org/class/)、[Events](http://aralejs.org/events/)、Attribute 和 Aspect 支持。

---

## 使用说明

### extend `Base.extend(properties)`

基于 Base 创建子类。例子：

```js
/* pig.js */
define(function(require, exports, module) {
    var Base = require('base');

    var Pig = Base.extend({
        attrs: {
            name: ''
        },
        talk: function() {
            alert('我是' + this.get('name'));
        }
    });

    module.exports = Pig;
});
```

继承 Base 可覆盖 initialize 构造函数， **但需要调用父类构造函数**，如 arale 的 widget 定义了组件的生命周期

```js
/* widget.js */
define(function(require, exports, module) {
    var Base = require('base');

    var Widget = Base.extend({
        initialize: function(config) {
            Widget.superclass.initialize.call(this, config);
            this.parseElement()
            this.initProps()
            this.delegateEvents()
            this.setup()
        },
        ...
    });

    module.exports = Widget;
});
```

Base 继承和混入了一下功能，可查看文档 ：

- [Class 使用文档](http://aralejs.org/class/)
- [Events 使用文档](http://aralejs.org/events/)
- [Attribute 使用文档](http://aralejs.org/base/docs/attribute.html)
- [Aspect 使用文档](http://aralejs.org/base/docs/aspect.html)


### Base 与 Class 的关系

Base 是使用 `Class` 创建的一个基础类，默认混入了 `Events`、`Attribute`、`Aspect` 模块：

```js
/* base.js */
define(function(require) {

    var Class = require('class');
    var Events = require('events');
    var Aspect = require('./aspect');
    var Attribute = require('./attribute');

    var Base = Class.create({
        Implements: [Events, Aspect, Attribute],

        initialize: function(config) {
            ...
        },

        ...
    });

    ...
});
```
