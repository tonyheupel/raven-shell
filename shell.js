#!/usr/bin/env node

var repl = require('repl')
  , ravendb = require('ravendb')

var useStore = function(r, url) {
  r.context.store = ravendb.use(url)
  r.context.db = r.context.store.defaultDb
}

var defineCommands = function(r) {
  r.defineCommand('store', {
    help: 'Use the RavenDB datastore at a url ".store <url>"',
    action: function(url) {
      if (!url) url = r.context.db.getUrl()
      else useStore(r, url)

      console.log('Using datastore at: ' + url)
      r.displayPrompt()
    }
  })


  r.defineCommand('stats', {
    help: 'Show statistics for the current database',
    action: function() {
      try {
        r.context.db.getStats(function(error, stats) {
          if (error) {
            console.error(error)
            r.displayPrompt()
            return
          }

          console.log(stats)
          r.context._ = stats
          r.displayPrompt()
        })
      } catch (e) {
        console.error(e)
        r.displayPrompt()
      }
    }
  })


  r.defineCommand('collections', {
    help: 'Show all collections in the current database',
    action: function() {
      try {
        r.context.db.getCollections(function(error, collections) {
          if (error) {
            console.error(error)
            r.displayPrompt()
            return
          }

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

  r.defineCommand('create', {
    help: 'Save a document to a collection (e.g., .create CollectionName { id: "users/tony", firstName: "Tony" })',
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

  r.defineCommand('read', {
    help: 'Get a document given its id (e.g., .read users/tony)',
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


  r.defineCommand('delete', {
    help: 'Delete a document given its id (e.g., .delete users/tony)',
    action: function(args) {
      try {
        if (!args) throw Error('Wrong number of arguments; see .help for more information')

        var id = args
        r.context.db.deleteDocument(id, function(error, result) {
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
        if (!args) throw Error('Wrong number of arguments; see .help for .find usage')

        eval('var argsDoc = ' + args)

        r.context.db.find(argsDoc, function(error, result) {
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

        var collection = (match && match.length == 2) ? match[1] : null

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
    help: 'Show the count of documents in a collection or in the database if left blank (e.g., .count Users)',
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


  r.defineCommand('createIndex', {
    help: "Create an index with a name, map, and optional reduce: .create-index foobar { map: 'from doc in docs.Albums\rwhere doc.Genre != null\rselect new { Genre = doc.Genre.Id }'}",
    action: function(args) {
      try {
        var name, index = null
        var match = /^(\w+)\s+(.*)$/.exec(args)

        if (match.length != 3) {
          console.error('Unable to craete index: wrong number of arguments.  Type ".help" to see usage')
          return
        }

        name = match[1]
        index = match[2]

        eval ('var createIndexIndex = ' + index )

        r.context.db.createIndex(name,
                                 createIndexIndex['map'],
                                 createIndexIndex['reduce'],
                                 function(error, result) {
          if (error) console.error(error)

          if (result) console.log(result)
          r.context._ = result
          r.displayPrompt()
        })
      } catch(e) {
        console.error(e)
        r.displayPrompt()
      }
    }
  })


  r.defineCommand('deleteIndex', {
    help: 'Delete an given its name (e.g., .delete AlbumsByGenre)',
    action: function(args) {
      try {
        if (!args) throw Error('Wrong number of arguments; see .help for more information')

        var name = args
        r.context.db.deleteIndex(name, function(error, result) {
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
}

var startInteractiveREPL = function(store) {
  console.log('RavenDB shell')

  var r = repl.start("> ")
  defineCommands(r)
  useStore(r, store)

  return r
}


var startEvalREPL = function(store, string) {
  var r = repl.start("> ")
  defineCommands(r)

  useStore(r, store)

  var lines = string.split('\n')

  r.displayPrompt()
  lines.forEach(function(line) {
    if (line) {
      r.rli.write(line + '\n')
    }
  })
  return r
}

var startFileREPL = function(store, filename) {
  // TODO: Copy the .load command code or just call .load
  var r = repl.start("> ")
  defineCommands(r)

  useStore(r, store)

  r.rli.write('.load ' + filename + '\n')

  return r
}

var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'RavenDB command line shell'
});
parser.addArgument(
  [ '-f', '--file' ],
  {
    help: 'load and execute a file of shell commands',
    dest: 'file'
  }
)
parser.addArgument(
  [ '-e', '--eval' ],
  {
    help: 'evaluate a single string of shell commands',
    dest: 'eval'
  }
)
parser.addArgument(
  [ '-s', '--store' ],
  {
    help: 'specify which data store to use (defaults to http://localhost:8080 if not specfied)',
    defaultValue: 'http://localhost:8080',
    dest: 'store'
  }
)
parser.addArgument(
  [ '--keep-open' ],
  {
    help: 'keep the shell open when the passed in file or eval is done executing',
    action: 'storeTrue',
    defaultValue: false,
    dest: 'keep-open'
  }
)
var args = parser.parseArgs();

var shell
var keepOpen = args['keep-open'] || false
var evalString = args['eval']
var file = args['file']
var store = args['store']

if (evalString) {
    shell = startEvalREPL(store, evalString)
} else if (file) {
    shell = startFileREPL(store, file)
}

if (!shell) {
  shell = startInteractiveREPL(store)
} else {
  if (!keepOpen) {
    shell.rli.close()
  }
}

