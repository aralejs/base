# Base

---

[![Build Status](https://secure.travis-ci.org/aralejs/base.png)](https://travis-ci.org/aralejs/base)

Base 是一个基础类，提供 Class、Events、Attribute 和 Aspect 支持。

---


## 使用说明


### extend `Base.extend(properties)`

基于 Base 创建子类。例子：

```js
/* pig.js */
define(function(require, exports, module) {
   var Base = require('base');

   var Pig = Base.extend({
       initialize: function(name) {
           this.name = name;
       },
       talk: function() {
           alert('我是' + this.name);
       }
   });

   module.exports = Pig;
});
```

具体用法请参考：[Class 使用文档](http://aralejs.org/class/)


### Base 与 Class 的关系

Base 是使用 `Class` 创建的一个基础类，默认混入了 `Events`、`Attribute` 等模块：

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

具体用法请参考：

- [Events 使用文档](http://aralejs.org/events/)
- [Attribute 使用文档](http://aralejs.org/base/docs/attribute.html)
- [Aspect 使用文档](http://aralejs.org/base/docs/aspect.html)

