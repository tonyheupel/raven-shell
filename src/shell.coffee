#!/usr/bin/env coffee

repl = require('repl')
ravendb = require('ravendb')
ArgumentParser = require('argparse').ArgumentParser

version = '0.0.10'  # Keep in sync with package.json

createDatastore = (r, url, databaseName) ->
  r.context.db = ravendb(url, databaseName)
  r.context.store = r.context.db.datastore


useDatabase = (r, databaseName) ->
  throw new Error('The datastore must first be set') unless r?.context?.store?

  r.context.db = ravendb(r.context.store.url, databaseName)


currentDatabaseString = (r) ->
  'Using database "' + r.context.db.name + '" in datastore at: "' + r.context.store.url + '"'


defineCommands = (r) ->
  r.defineCommand 'store',
    help: 'Use the RavenDB datastore at a url ".store <url>"'
    action: (url) ->
      if url?
        createDatastore(r, url, r.context.db.name) # TODO: IS THIS A GOOD IDEA, TO USE THE SAME DB NAME?
      else
        url = r.context.store.url

      console.log currentDatabaseString(r)
      r.displayPrompt()


  r.defineCommand 'use',
    help: 'Use the database with the given name ".use <database-name>"'
    action: (name) ->
      if name? 
        useDatabase(r, name)
      else 
        name = r.context.db.name

      console.log currentDatabaseString(r)
      r.displayPrompt()


  r.defineCommand 'stats',
    help: 'Show statistics for the current database'
    action: ->
      try
        r.context.db.getStats (error, stats) ->
          if error?
            console.error error
            r.displayPrompt()
            return

          console.log stats
          r.context._ = stats
          r.displayPrompt()

      catch e
        console.error e
        r.displayPrompt()


  r.defineCommand 'collections',
    help: 'Show all collections in the current database'
    action: ->
      try
        r.context.db.getCollections (error, collections) ->
          if error?
            console.error error
            r.displayPrompt()
            return

          if collections?.length?
            console.log collection for collection in collections
          else
            console.log "No collections found."

          r.context._ = collections
          r.displayPrompt()

      catch e
        console.error e
        r.displayPrompt()


  r.defineCommand 'create',
    help: 'Save a document to a collection (e.g., .create CollectionName { id: "users/tony", firstName: "Tony" })'
    action: (args) ->
      try
        match = /(\w+)\s+(.*)/.exec(args)
        throw Error('Wrong number of arguments; see .help for .savedoc usage') if match.length != 3

        collection = match[1]
        eval('doc = ' + match[2])


        r.context.db.saveDocument collection, doc, (error, result) ->
          console.error error if error?

          console.log result if result?
          r.context._ = result
          r.displayPrompt()

      catch e
        console.error e
        r.displayPrompt()


  r.defineCommand 'read',
    help: 'Get a document given its id (e.g., .read users/tony)',
    action: (args) ->
      try
        throw Error('Wrong number of arguments; see .help for more information') unless args?

        id = args
        r.context.db.getDocument id, (error, result) ->
          console.error error if error?

          console.log result if result?
          r.context._ = result
          r.displayPrompt()

      catch e
        console.error e
        r.displayPrompt()


  r.defineCommand 'delete',
    help: 'Delete a document given its id (e.g., .delete users/tony)'
    action: (args) ->
      try
        throw Error('Wrong number of arguments; see .help for more information') unless args?

        id = args
        r.context.db.deleteDocument id, (error, result) ->
          console.error error if error?

          console.log result if result?
          r.context._ = result
          r.displayPrompt()

      catch e
        console.error e
        r.displayPrompt()


  r.defineCommand 'find',
    help: 'Find documents ".find <JSON object> [start [count]]" (e.g., .find { firstName: "Tony" } 20 100)'
    action: (args) ->
      try
        throw Error('Wrong number of arguments; see .help for .find usage') unless args?

        # Parse args: { attr: value } [start [count]]
        # .find { some: 'thing'} 20 100
        #       ^-------1------^^--2--^
        #                         3  5
        #                          ^4-^
        # match[0] = "{ some: 'thing'} 20 100"
        # match[1] = "{ some: 'thing'}"
        # match[2] = " 20 100"
        # match[3] = "20"
        # match[4] = " 100"
        # match[5] = "100"
        match = /(\{.*\})(\s+(\d+)(\s+(\d+))?)?/.exec(args)
        eval('doc = ' + match[1])
        start = if match[3]? then parseInt(match[3]) else null
        count = if match[5]? then parseInt(match[5]) else null

        r.context.db.find doc, start, count, (error, result) ->
          console.error error if error?

          console.log result if result?
          r.context._ = result
          r.displayPrompt()

      catch e
        console.error e
        r.displayPrompt()


  r.defineCommand 'docs',
    help: 'Retrieve documents in a collection (e.g., .doc Users)'
    action: (args) ->
      try
        # Parse args: [collection [start [count]]]
        # .count Users 50 100
        #        ^-1-^^--2--^
        #               3  5
        #                ^4-^
        # match[0] = "Users 50 100"
        # match[1] = "Users"
        # match[2] = " 50 100"
        # match[3] = "50"
        # match[4] = " 100"
        # match[5] = "100"

        match = /(\w+)(\s+(\d+)(\s+(\d+))?)?/.exec(args)

        collection = start = count = null

        if match?
          collection = match[1]
          start = if match[3]? then parseInt(match[3]) else null
          count = if match[5]? then parseInt(match[5]) else null

        r.context.db.getDocsInCollection collection, start, count, (error, result) ->
          console.error error if error?

          console.log result if result?
          r.context._ = result
          r.displayPrompt()

      catch e
        console.error e
        r.displayPrompt()


  r.defineCommand 'count',
    help: 'Show the count of documents in a collection or in the database if left blank (e.g., .count Users)'
    action: (args) ->
      try
        r.context.db.getDocumentCount args, (error, result) ->
          console.error error if error?

          console.log result if result?
          r.context._ = result
          r.displayPrompt()

      catch e
        console.error e
        r.displayPrompt()


  r.defineCommand 'createIndex',
    help: "Create an index with a name, map, and optional reduce: .create-index foobar { map: 'from doc in docs.Albums\rwhere doc.Genre != null\rselect new { Genre = doc.Genre.Id }'}"
    action: (args) ->
      try
        name = index = null
        match = /^(\w+)\s+(.*)$/.exec(args)

        if match.length != 3
          console.error 'Unable to craete index: wrong number of arguments.  Type ".help" to see usage'
          return

        name = match[1]
        index = match[2]

        eval ('createIndexIndex = ' + index )

        r.context.db.createIndex name, createIndexIndex['map'], createIndexIndex['reduce'], (error, result) ->
          console.error error if error?

          console.log result if result?
          r.context._ = result
          r.displayPrompt()

      catch e
        console.error e
        r.displayPrompt()


  r.defineCommand 'deleteIndex',
    help: 'Delete an given its name (e.g., .delete AlbumsByGenre)'
    action: (args) ->
      try
        throw Error('Wrong number of arguments; see .help for more information') unless args?

        name = args
        r.context.db.deleteIndex name, (error, result) ->
          console.error error if error?

          console.log result if result?
          r.context._ = result
          r.displayPrompt()

      catch e
        console.error e
        r.displayPrompt()


  r.defineCommand 'createDatabase',
    help: 'Create a database tenant (e.g., .createDatabase Foobar)'
    action: (args) ->
      try
        throw Error('Wrong number of arguments; see .help for more information') unless args?

        name = args
        r.context.store.createDatabase name, (error, result) ->
          console.error error if error?

          console.log result if result?
          r.context._ = result
          r.displayPrompt()

      catch e
        console.error e
        r.displayPrompt()


  r.defineCommand 'deleteDatabase',
    help: 'Delete a database given its name (e.g., .deleteDatabase Foobar)'
    action: (args) ->
      try
        throw Error('Wrong number of arguments; see .help for more information') unless args?

        name = args
        r.context.store.deleteDatabase name, (error, result) ->
          console.error error if error?

          console.log result if result?
          r.context._ = result
          r.displayPrompt()

      catch e
        console.error e
        r.displayPrompt()



startREPL = (store, databaseName) ->
  console.log "RavenDB shell version #{version}"

  r = repl.start "> "
  createDatastore(r, store, databaseName)
  defineCommands(r)

  console.log currentDatabaseString(r)
  r.displayPrompt()
  r


startInteractiveREPL = (store, databaseName) ->
  startREPL(store, databaseName)


startEvalREPL = (string, store, databaseName) ->
  r = startREPL(store, databaseName)

  lines = string.split('\n')

  lines.forEach (line) ->
    if line?
      r.rli.write(line + '\n')

  r


startFileREPL = (filename, store, databaseName) ->
  r = startREPL(store, databaseName)
  r.rli.write ".load #{filename}\n"
  r


parser = new ArgumentParser(
  'version': version
  addHelp: true
  description: 'RavenDB command line shell'
)

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
args = parser.parseArgs()

shell = null
keepOpen = args.keepOpen
evalString = args.eval
file = args.file
store = args.store
database = args.database

if evalString?
  shell = startEvalREPL(evalString, store, database)
else if file?
  shell = startFileREPL(file, store, database)

unless shell?
  shell = startInteractiveREPL(store, database)
else
  unless keepOpen?
    shell.rli.close()
