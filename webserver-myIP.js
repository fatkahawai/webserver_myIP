/**
 * webserver-myIP.js
 *
 * @version 1.0
 *
 * DESCRIPTION:
 * a server-side application running a node/express Webserver and a mongo DB
 * Uses the Express and Mongoose node packages.
 *
 * test a POST using curl -X POST "<my EC2 webserver URL>:8080/activity?activity=101"
 * test a GET using browser - open <URL>:8080 to get all records
 *                            open <URL>:8080/activity to get most recently stored record
 *
 * @throws none
 * @see nodejs.org
 * @see express.org
 * @see mongoosejs.com
 *
 * @author Ceeb
 * (C) 2016 Pink Pelican Ltd
 */

// var http = require('http');
var mongoose = require('mongoose');
var express = require('express');

var app = express();

var dbPath = 'mongodb://localhost/mydb';

var db;              // our MongoDb database

var mySchema;  // our mongoose Schema
var MyModel;        // our mongoose Model

// create our schema
mySchema = mongoose.Schema({
    timestamp: {type: Date, default: Date.now},
    ipAddress: String,
    activity: String,
    code: {type: Number, default: 0}
});
// create our model using this schema
MyModel = mongoose.model('MyModel', mySchema);

// ------------------------------------------------------------------------
// Connect to our Mongo Database
//
console.log('\nattempting to connect to MongoDB');

db = mongoose.connect(dbPath);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongo connection open to ' + dbPath);
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
  console.log('Mongo connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongo connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('\nMongo connection disconnected through manual app termination');
    process.exit(0);
  });
});

// connection successful event handler:
// check if the Db already contains a record and display status on console
mongoose.connection.once('open', function () {
  var records;

  console.log('database is now open. verifying..');

  // search if a MyModel has already been saved in our db
  MyModel.find( function(err, records){
    if( err ){
      console.log('error searching for records in Db '+ err );
    }
    else if( records.length>0 ){ // at least one MyModel records already exists in our db. we can use that
      console.log(records.length+' records already exist in DB' );
    }
    else { // no records found
      // console.log('no records in DB yet, creating one' );
      console.log('no records exist in Db');
    } // if no records
  }); // MyModel.find()

}); // mongoose.connection.once()

// ------------------------------------------------------------------------
// set up Express routes to handle incoming requests
//
// Express route for all incoming requests
//
// -----------------------------
// GET all records as json dump
app.get('/', function(req, res){
  var records;

  console.log('\nreceived client GET request for all records from '+req.connection.remoteAddress);
  if( !MyModel ){
    console.log('Database not ready');
  }
  // look up all records in our DB
  MyModel.find(function (err, records) {
    if (err) {
       console.log('couldnt find any records in DB. error '+err);
       res.send(err);
       next(err);
    }
    else {
      if(records){
        console.log('found '+records.length+' records in DB. sending as json');
        res.json(records);
      }
      else {
        res.send(501, 'application find error');
      }
    }
  });
}); // apt.get()


// -----------------------------
// GET most recent saved record
app.get('/activity', function(req, res){
  var record;

  console.log('\nreceived client GET request for most recently saved record from '+req.connection.remoteAddress);
  if( !MyModel ) {
    console.log('Database not ready');
  }
  // find newest record in db, based on timestamp field
  MyModel.findOne({}, {}, { sort: { timestamp : -1 } }, function (err, record) {
    if (err) {
       console.log('couldnt find any records in DB. error '+err);
       res.send(err);
       next(err);
    }
    else {
      if(record){
        console.log('found record in DB');
        console.log('sending record to client');
        res.json(record);
      }
      else {
        res.send(501, 'application find error');
      }
    }
  });
}); // apt.get()

// ------------------------------
// POST a new entry
app.post('/activity', function(req, res){
  var records;

  console.log('\nreceived client POST request from '+req.connection.remoteAddress+' with activity '+req.query.activity);
  console.log('URL:\n'+req.originalUrl);
  console.log('params:\n'+JSON.stringify(req.params));
  console.log('query:\n'+JSON.stringify(req.query));
//  console.log('body:\n'+JSON.stringify(req.body));

  if ( !MyModel ) {
    console.log('Database not ready');
  }
  newEntry = new MyModel({ ipAddress: req.connection.remoteAddress, activity: req.query.activity, code: req.query.code });
  console.log('creating new Db entry '+ JSON.stringify(newEntry));

  newEntry.save (function (err) {
        if ( err ){ //  handle the error
          res.send(501,'application save error');
          console('couldnt save a new record to the Db');
        }
        else{
          console.log('new record from '+newEntry.ipAddress+' was successfully saved to Db' );
          res.send(JSON.stringify(newEntry));

          MyModel.find( function(err, records){
            if( records ) {
              console.log('checked after save: found now '+records.length+' records in DB' );
            }
          }); // MyModel.find()
        } // else
  }); // MyModel.save()
}); // apt.post()

// ------------------------------
// POST a new entry
app.post('/ip', function(req, res){
  var records;

  console.log('\nreceived client POST request from '+req.connection.remoteAddress+' with local ip address '+req.query.address);
  console.log('URL:\n'+req.originalUrl);
  console.log('params:\n'+JSON.stringify(req.params));
  console.log('query:\n'+JSON.stringify(req.query));  

  res.sendStatus(200);
}); // apt.post()

//
// Express route to handle errors
//
app.use(function(err, req, res, next){
  if (req.xhr) {
    res.send(500, 'Something went wrong!');
  } else {
    next(err);
  }
}); // apt.use()

// ------------------------------------------------------------------------
// Start Express Webserver
//
console.log('starting the Express (NodeJS) Web server');
app.listen(8080);
console.log('Webserver is listening on port 8080');
