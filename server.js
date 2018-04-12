const express = require('express');
const app = express();
const http = require('http').Server(app);
const nunjucks = require('nunjucks');
const io = require('socket.io')(http);

// set the port of our application
// process.env.PORT lets the port be set by Heroku
let port = process.env.PORT || 3000;

nunjucks.configure('src/views', {
    autoescape: true,
    express: app,
    watch: true
});

app.use(express.static(__dirname + '/src/assets'));

const log = {
    polls: [],
    messages: []
};

function setVotes(poll, client) {
    const currentPoll = log.polls[poll.index];
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
        index: log.polls.length,
        options: getOptions(message)
    };

    log.polls.push(poll);

    return poll
}

io.on('connection', function(socket){

    socket.on('chat vote', function(msg){
        let poll = setVotes(msg, socket.id);
        io.emit('chat vote', poll);
    });

    socket.on('chat message', function(msg){
        log.messages.push({
            type: "chat",
            msg: msg
        });

        io.emit('chat message', msg);
    });

    socket.on('chat poll', function(msg){
        let poll = makePoll(msg);

        log.messages.push({
            type: "poll",
            pollIndex: poll.index
        });

        io.emit('chat poll', poll);
    });
});

app.get('/', function(req, res) {
    res.render('index.html', {
        log: log
    })
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});