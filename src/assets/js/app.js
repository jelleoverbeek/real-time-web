(function () {
    const socket = io();

    document.querySelector("form").addEventListener("submit", function(ev) {
        ev.preventDefault();
        const message = this.querySelector("input").value;
        socket.emit('chat message', message);
        this.querySelector("input").value = "";
    });

    socket.on('chat message', function(message){
        document.querySelector("#messages").insertAdjacentHTML('beforeend', `<li>${message}</li>`)
    });

})();