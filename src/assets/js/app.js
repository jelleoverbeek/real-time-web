(function () {
    const socket = io();

    function makePoll(message) {
        const options = getOptions(message);
        let html = "";

        options.forEach(function (option) {
            html += `<li><input type="radio" name="poll-1" id="optie-1">${option}</li>`
        });

        return html
    }

    function getOptions(msg) {
        let options = msg.split(" ");
        options.shift();

        return options;
    }

    document.querySelector("form").addEventListener("submit", function(ev) {
        ev.preventDefault();
        const message = this.querySelector("input").value;

        if(message.indexOf('/poll') === 0) {
            socket.emit('chat poll', message);
        } else {
            socket.emit('chat message', message);
        }

        this.querySelector("input").value = "";
    });

    socket.on('chat message', function(message){
        document.querySelector("#messages").insertAdjacentHTML('beforeend', `<li>${message}</li>`)
    });

    socket.on('chat poll', function(message){
        let html = makePoll(message);
        document.querySelector("#messages").insertAdjacentHTML('beforeend', html)
    });

})();