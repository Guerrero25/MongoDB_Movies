var express = require('express'),
    engines = require('consolidate'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    app = express();;

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.json());
app.use(express.urlencoded());

MongoClient.connect('mongodb://localhost:27017/quiz', function (err, db) {
    if (err) throw err;

    app.get('/', function (req, res) {
        db.collection('movies').find({}).toArray(function (err, docs) {
            if (err) throw err;

            return res.render('index', {'movies': docs});
        });
    });

    app.get('/movies/new', function (req, res) {
        res.render('new', {});
    });

    app.post('/movies', function (req, res) {
        var movie = {
            title: req.body.title, 
            year: parseInt(req.body.year),
            imdb: req.body.imdb
        }

        db.collection('movies').insertOne(movie, function (err, result) {
            if (err) throw err
            res.render('show', {message: 'Movie added saccessfully', movie: movie});
        })
    });

    app.get('/movies/:title', function (req, res) {
        var title = req.params.title;

        db.collection('movies').find({title: title}).toArray(function (err, result) {
            var movie = result[0];
            res.render('edit', {movie: movie});
        })
    });

    app.post('/movies/:title', function (req, res) {
        var title = req.params.title,
            ntitle = req.body.title,
            nyear = parseInt(req.body.year),
            nimdb = req.body.imdb;

        db.collection('movies').findAndModify(
            {title: title},
            [['_id', 'asc']],
            {
                $set: {
                    title: ntitle,
                    year: nyear,
                    imdb: nimdb
                },
                $currentDate: {
                    lastModified: true
                }
            },
            function (err, result) {
                console.log(result)
                res.render('show', {message: 'Movie update succesfully', movie: result.value})
            }
        )
    })

    app.get('/movies/delete/:title', function (req, res) {
        var title = req.params.title;

        db.collection('movies').deleteOne({
            title: title
        }, function (result) {
            res.redirect('/');
        })
    });

    app.use(function(req, res){
        res.sendStatus(404);
    });

    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log("Express server listening on port %s.", port);
    });
});

