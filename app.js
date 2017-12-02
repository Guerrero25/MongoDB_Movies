var express = require('express'),
    engines = require('consolidate'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var app = express();
app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

MongoClient.connect('mongodb://localhost:27017/quiz', function (err, db) {
    if (err) throw err;

    app.get('/', function (req, res) {
        db.collection('movies').find({}).toArray(function (err, docs) {
            if (err) throw err;

            return res.render('index', {'movies': docs});
        });
    });

    app.get('/new', function (err, res) {
        res.render('new', {});
    });

    app.use(function(req, res){
        res.sendStatus(404);
    });

    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log("Express server listening on port %s.", port);
    });
});

