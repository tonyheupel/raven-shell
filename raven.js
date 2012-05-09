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

Database.prototype.save = function(collection, doc, cb) {
	request.put({ 
    headers: {'Raven-Entity-Name': collection}, // TODO: skip this if no collection string passed in?
                                                // TODO: Add 'www-authenticate': 'NTLM' back into headers?
    uri: this.getUrl() + '/docs/' + doc.id,     // TODO: Autogenerate id if not passed in?
    json: doc 
    }, function(error, response, body) {

	  if (!error && response.statusCode == 201) { // 201 - Created
	    if (cb) cb(null, JSON.parse(body))
	  }
    else {
      if (cb) {
        if (error) cb(error)
        else cb(new Error('Unable to create document: ' + response.statusCode + ' - ' + response.body))
      }
    }
	})
}

Database.prototype.find = function(collection, doc, cb) {
  var url = this.getUrl() + '/indexes/Raven/DocumentsByEntityName?query=Tag%253A' + collection + '&start=0&pageSize=0&aggregation=None'
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (cb) cb(null, JSON.parse(body))
    }
    else {
      if (cb) {
        if (error) cb(error)
        else cb(new Error('Error: ' + response.statusCode + ' - ' + body))
      }
    }
  })
}
module.exports.use = function(url) {
  return new Datastore(url)
}
