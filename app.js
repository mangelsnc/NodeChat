
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var _ = require('underscore');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);

var io = require('socket.io').listen(server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//Bindings de sockets
var totalUsers = 0;
var nicknames = [];
io.sockets.on('connection', function(socket){
	totalUsers++;
	socket.emit('totalUsers', {'totalUsers': totalUsers});
	socket.broadcast.emit('totalUsers', {'totalUsers': totalUsers});
    socket.broadcast.emit("userList",{'userList': nicknames});
	console.log("Otro pollo en el corral");

	socket.on('disconnect', function(){
		totalUsers--;
		socket.broadcast.emit('totalUsers', {'totalUsers': totalUsers});
		console.log("Un pollo abandona en el corral");
        socket.broadcast.emit("userList",{'userList': nicknames});
	});

    socket.on("set-nickname", function(data){
        var exist = _.find(nicknames, function(nick){ return nick == data.nick; });
        if(exist){
            socket.emit("nick-exists", { 'msg': 'Nick already exists'});
        }else{
            nicknames.push(data.nick);
            socket.set('nick', data.nick, function(){
                socket.emit("nick-saved",{'nick': data.nick});
                socket.broadcast.emit("userList",{'userList': nicknames});  
            });
            
        }
    });

    socket.on('message-sent', function(data){
        var d = new Date();
        var formatTime =  d.toLocaleTimeString();
        //socket.emit('message-broadcast', {'message': data.message, 'time': formatTime });
        socket.get('nick',function(error, nick){
            console.log("Error: " + error);
            socket.broadcast.emit('message-broadcast', {'message': data.message, 'nick': nick, 'time': formatTime });
        })
        
    });

});
