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
				r.context._ = collections
				r.displayPrompt()
		  })
    } catch (e) {
      console.error(e)
	    r.displayPrompt()
    }
  }
})

r.defineCommand('savedoc', {
	help: 'Save a document to a collection (e.g., .savedoc CollectionName { id: "users/tony", firstName: "Tony" })',
	action: function(args) {
		try {
			var match = /(\w+)\s+(.*)/.exec(args)
			if (match.length != 3) throw Error('Wrong number of arguments; see .help for .savedoc usage')
			
			var collection = match[1]
			eval('var doc = ' + match[2])


			r.context.db.saveDocument(collection, doc, function(error, result) {
				if (error) console.error(error)
				
				if (result) console.log(result)
				r.context._ = result
				r.displayPrompt()
			})
			
		} catch (e) {
			console.error(e)
			r.displayPrompt()
		}
	}
})

r.defineCommand('getdoc', {
  help: 'Get a document given its id (e.g., .getdoc users/tony)',
  action: function(args) {
    try {
      if (!args) throw Error('Wrong number of arguments; see .help for more information')

      var id = args
      r.context.db.getDocument(id, function(error, result) {
        if (error) console.error(error)
        
        if (result) console.log(result)
        r.context._ = result
        r.displayPrompt()
      })
      
    } catch (e) {
      console.error(e)
      r.displayPrompt()
    }
  }
})



r.defineCommand('find', {
  help: 'Find documents (e.g., .find { firstName: "Tony" })',
  action: function(args) {
    try {
      var match = /(\w+)(\s+(.*))?/.exec(args)
      if (match.length < 2) throw Error('Wrong number of arguments; see .help for .savedoc usage')
      
      var collection = match[1]
      var doc = null
      if (match.length == 3) eval('doc = ' + match[2])


      r.context.db.find(doc, function(error, result) {
        if (error) console.error(error)
        
        if (result) console.log(result)
        r.context._ = result
        r.displayPrompt()
      })
      
    } catch (e) {
      console.error(e)
      r.displayPrompt()
    }
  }
})

r.defineCommand('docs', {
  help: 'Retrieve documents in a collection (e.g., .doc Users)',
  action: function(args) {
    try {
      var match = /(\w+)/.exec(args)
      if (match.length != 2) throw Error('Wrong number of arguments; see .help for .savedoc usage')
      
      var collection = match[1]

      r.context.db.getDocsInCollection(collection, function(error, result) {
        if (error) console.error(error)
        
        if (result) console.log(result)
        r.context._ = result
        r.displayPrompt()
      })
      
    } catch (e) {
      console.error(e)
      r.displayPrompt()
    }
  }
})

r.defineCommand('count', {
  help: 'Show the count of documents in a collection (or in the database if left blank/n(e.g., .count Users)',
  action: function(args) {
    try {
      r.context.db.getDocumentCount(args, function(error, result) {
        if (error) console.error(error)

        if (result) console.log(result)
        r.context._ = result
        r.displayPrompt()
      })
    } catch (e) {
      console.error(e)
      r.displayPrompt()
    }
  }
})

useStore('http://localhost:8080')
