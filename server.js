const express = require('express');
const app = express();
const http = require('http').Server(app);
const nunjucks = require('nunjucks');
const io = require('socket.io')(http);

nunjucks.configure('src/views', {
    autoescape: true,
    express: app,
    watch: true
});

app.use(express.static(__dirname + '/src/assets'));

app.get('/', function(req, res) {
    res.render('index.html', {

    })
});

const polls = [];

function setVotes(poll) {
    const currentPoll = polls[poll.index];
    let currentOption = currentPoll.options[poll.choice];
    currentOption.votes++;

    return currentPoll
}

function getOptions(msg) {
    let options = msg.split(" ");
    options.shift();

    optionsObjs = [];

    options.forEach(function (option) {
        optionsObjs.push({
            index: optionsObjs.length,
            value: option,
            votes: 0
        })
    });

    return optionsObjs;
}

function makePoll(message) {
    const poll = {
        index: polls.length,
        options: getOptions(message)
    };

    polls.push(poll);

    return poll
}

io.on('connection', function(socket){
    socket.on('chat vote', function(msg){
        let poll = setVotes(msg);
        io.emit('chat vote', poll);
    });

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });

    socket.on('chat poll', function(msg){
        let poll = makePoll(msg);
        io.emit('chat poll', poll);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});