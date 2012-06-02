#!/usr/bin/env node

var repl = require('repl')
  , ravendb = require('ravendb')
  , ArgumentParser = require('argparse').ArgumentParser

var version = '0.0.7'  // Keep in sync with package.json

var createDatastore = function(r, url, databaseName) {
  r.context.db = ravendb(url, databaseName)
  r.context.store = r.context.db.datastore
}

var useDatabase = function(r, databaseName) {
  if (!r.context.store) throw new Error('The datastore must first be set')

  r.context.db = ravendb(r.context.store.url, databaseName)
}

var currentDatabaseString = function(r) {
  return 'Using database "' + r.context.db.name + '" in datastore at: "' + r.context.store.url + '"'
}

var defineCommands = function(r) {
  r.defineCommand('store', {
    help: 'Use the RavenDB datastore at a url ".store <url>"',
    action: function(url) {
      if (!url) url = r.context.store.url
      else createDatastore(r, url, r.context.db.name) // TODO: IS THIS A GOOD IDEA, TO USE THE SAME DB NAME?

      console.log(currentDatabaseString(r))
      r.displayPrompt()
    }
  })


 r.defineCommand('use', {
    help: 'Use the database with the given name ".use <database-name>"',
    action: function(name) {
      if (!name) name = r.context.db.name
      else useDatabase(r, name)

      console.log(currentDatabaseString(r))
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


    r.defineCommand('createDatabase', {
    help: 'Create a database tenant (e.g., .createDatabase Foobar)',
    action: function(args) {
      try {
        if (!args) throw Error('Wrong number of arguments; see .help for more information')

        var name = args
        r.context.store.createDatabase(name, function(error, result) {
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


  r.defineCommand('deleteDatabase', {
    help: 'Delete a database given its name (e.g., .deleteDatabase Foobar)',
    action: function(args) {
      try {
        if (!args) throw Error('Wrong number of arguments; see .help for more information')

        var name = args
        r.context.store.deleteDatabase(name, function(error, result) {
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

var startREPL = function(store, databaseName) {
  console.log('RavenDB shell version ' + version)

  var r = repl.start("> ")
  createDatastore(r, store, databaseName)
  defineCommands(r)

  console.log(currentDatabaseString(r))
  r.displayPrompt()
  return r
}
var startInteractiveREPL = function(store, databaseName) {
  return startREPL(store, databaseName)
}


var startEvalREPL = function(string, store, databaseName) {
  var r = startREPL(store, databaseName)

  var lines = string.split('\n')

  lines.forEach(function(line) {
    if (line) {
      r.rli.write(line + '\n')
    }
  })
  return r
}

var startFileREPL = function(filename, store, databaseName) {
  var r = startREPL(store, databaseName)
  r.rli.write('.load ' + filename + '\n')
  return r
}


var parser = new ArgumentParser({
  'version': version,
  addHelp: true,
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
  [ '-db', '--database'],
  {
    help: 'specify which database to use (defaults to "Default" if not specified)',
    defaultValue: 'Default',
    dest: 'database'
  }
)
parser.addArgument(
  [ '-ko', '--keep-open' ],
  {
    help: 'keep the shell open when the passed in file or eval is done executing',
    action: 'storeTrue',
    defaultValue: false,
    dest: 'keepOpen'
  }
)
var args = parser.parseArgs();

var shell
var keepOpen = args.keepOpen
var evalString = args.eval
var file = args.file
var store = args.store
var database = args.database

if (evalString) {
    shell = startEvalREPL(evalString, store, database)
} else if (file) {
    shell = startFileREPL(file, store, database)
}

if (!shell) {
  shell = startInteractiveREPL(store, database)
} else {
  if (!keepOpen) {
    shell.rli.close()
  }
}