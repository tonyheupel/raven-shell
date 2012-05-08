var request = require("request");

var Datastore = function(url) {
  this.url = url
  this.defaultDb = new Database(this)
}

var Database = function(datastore, name) {
  this.datastore = datastore
  this.name = name
}

Database.prototype.getUrl = function() { return this.datastore.url }

Database.prototype.getCollections = function(cb) {
  request(this.getUrl() + '/terms/Raven/DocumentsByEntityName?field=Tag', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      if (cb) cb(null, JSON.parse(body))
    }
    else {
      if (cb) cb(error)
    }
  })
}

module.exports.use = function(url) {
  return new Datastore(url)
}