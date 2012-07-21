child_process = require 'child_process'
exec = child_process.exec
spawn = child_process.spawn

add_shebang = ->
  exec 'echo "#!/usr/bin/env node" > raven-shell.js'
  exec 'cat ./lib/shell.js >> raven-shell.js'

task 'build', 'Build project from src/*.coffee to lib/*.js', ->
  exec 'coffee --compile --output lib/ src/', (err, stdout, stderr) ->
    throw err if err

    add_shebang()
    console.log stdout + stderr

task 'watch', 'Watch src/*.coffee files and build them to lib/*.js when they change', ->
  proc = spawn 'coffee', ['--compile', '--output', 'lib/', '--watch', 'src/']

  proc.stdout.on 'data', (data) ->
    add_shebang()
    console.log data.toString()

  proc.stderr.on 'data', (data) ->
    console.error data.toString()

  proc.on 'exit', (code) ->
    console.log "watch exited with code #{code}"
