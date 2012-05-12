var repl = require('repl')
	, raven = require('./raven')

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
			r.context.db.getCollections(function(error, collections) {
      	if (error) throw error
				
		    if (!collections) console.log("No collections found.")
		    else {
		      for(var i=0; i < collections.length; i++) {
		        console.log(collections[i])
		      }
		    }
				
				r.displayPrompt()
		  })
    } catch (e) {
      console.error(e)
	    r.displayPrompt()
    }
  }
})

r.defineCommand('save', {
	help: 'Save a document to a collection (e.g., .save CollectionName { id: "users/tony", firstName: "Tony" })',
	action: function(collection, doc) {
		console.log("collection: " + collection)
		try {
			r.context.db.save(collection, doc, function(error, result) {
				if (error) throw error
				
				if (result) console.log(result)
				r.displayPrompt()
			})
			
		} catch (e) {
			console.error(e)
			r.displayPrompt()
		}
	}
})

useStore('http://localhost:8080')
