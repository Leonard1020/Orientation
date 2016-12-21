
/**
 * Module dependencies
 */
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var path = require('path');
var ip = require('ip');

// all environments
app.set('port', process.env.PORT || 45101);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

var clientID = '';

io.on('connection', function(socket) {
  if (socket.handshake.address == '::1') {
    clientID = socket.id;
  }

  socket.on('message', function(data) {
    io.to(clientID).emit('message', data);
  });
});

// serve index and view partials
app.get('/', function(req, res) {
  res.render('index', { ip: ip.address(), port: app.get('port') });
});

// Start Server
server.listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
});
