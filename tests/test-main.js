var alias = {
   "class":"arale/class/1.1.0/class",
    "events":"arale/events/1.1.0/events",
    "$":"jquery/jquery/1.7.2/jquery",
    expect: "gallery/expect/0.2.0/expect",
    puerh: "popomore/puerh/0.1.0/puerh",
    handlebars: "gallery/handlebars/1.0.2/handlebars",
    sinon: "gallery/sinon/1.6.0/sinon"
}

for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/\/src\//.test(file)) {
        var name = file.match(/\/src\/([^.]+)\.js/)[1]
        alias[name] = file
    }
  }
}

seajs.config({
    alias: alias
})

window.__karma__.start = function() {

    seajs.use(["./base/tests/base-spec.js"], function() {
        mocha.run()
    })
}
