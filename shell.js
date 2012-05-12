var repl = require('repl')
	, raven = require('./raven')
	, Future = require('fibers/future')
	, wait = Future.wait


var useStore = function(url) {
  r.context.store = raven.use(url)
  r.context.db = r.context.store.defaultDb
}

console.log('RavenDB shell')

var r = repl.start("> ")

r.defineCommand('store', {
	help: 'Use the RavenDB datastore at a url ".store <url>"',
  action: function(url) {
    useStore(url)
    console.log('Using datastore at: ' + url)
    r.displayPrompt()
  }
})

r.defineCommand('collections', {
  help: 'Show all collections in the current database',
  action: function() {
    try {
		  var getCollections = Future.wrap(r.context.db.getCollections) 
		  var c = Fiber(function() {
		    var collections = getCollections.call(r.context.db).wait()
      
		    if (!collections) console.log("No collections found.")
		    else {
		      for(var i=0; i < collections.length; i++) {
		        console.log(collections[i])
		      }
		    }
				r.displayPrompt()
		  }).run()
			
    } catch (e) {
      console.error(e)
	    r.displayPrompt()
    }
  }
})

useStore('http://localhost:8080')
