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

const polls = [];
const log = [
    { type: 'chat', msg: 'test' },
    { type: 'poll', pollIndex: 0 },
    { type: 'poll', pollIndex: 1 }
];

function setVotes(poll, client) {
    const currentPoll = polls[poll.index];
    let currentOption = currentPoll.options[poll.choice];

    currentPoll.options.forEach(function (option) {
        const voteIndex = option.votes.indexOf(client);
        if (voteIndex >= 0) {
            option.votes.splice(voteIndex, 1);
        }
    });

    currentOption.votes.push(client);

    return {
        obj: currentPoll,
        choice: poll.choice
    }
}

function getOptions(msg) {
    let options = msg.split(" ");
    options.shift();

    optionsObjs = [];

    options.forEach(function (option) {
        optionsObjs.push({
            index: optionsObjs.length,
            value: option,
            votes: []
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

    console.log('client connected');

    socket.on('disconnect', function () {
        console.log('client disconnected');
    });

    socket.on('chat vote', function(msg){
        let poll = setVotes(msg, socket.id);
        io.emit('chat vote', poll);
    });

    socket.on('chat message', function(msg){

        log.push({
            type: "chat",
            msg: msg
        });

        console.log(log);

        io.emit('chat message', msg);
    });

    socket.on('chat poll', function(msg){
        let poll = makePoll(msg);

        log.push({
            type: "poll",
            pollIndex: poll.index
        });

        console.log(log);

        io.emit('chat poll', poll);
    });
});

app.get('/', function(req, res) {
    res.render('index.html', {
        log: log,
        polls: polls
    })
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});