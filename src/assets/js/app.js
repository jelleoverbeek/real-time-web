(function () {
    const socket = io();

    function updatePoll(poll) {
        let pollEl = document.getElementById("poll-" + poll.obj.index);

        poll.obj.options.forEach(function (option) {
            const votesEl = pollEl.querySelector(`#poll${poll.obj.index}-item${option.index} + label .votes`);
            votesEl.innerText = option.votes.length;
        });
    }

    function addEventToPoll(poll) {
        let pollEl = document.getElementById("poll-" + poll.index);
        let pollOptions = pollEl.querySelectorAll(".poll-option");

        pollOptions.forEach(function (pollOption) {
            pollOption.addEventListener("change", function (ev) {
                vote(poll.index, this)
            })
        });
    }

    function getPollTemplate(poll) {
        let html = "";

        poll.options.forEach(function (option) {
            html += `<li>
                        <input id="poll${poll.index}-item${option.index}" type="radio" class="poll-option" name="poll-${poll.index}" value="${option.value}">
                        <label for="poll${poll.index}-item${option.index}">
                            ${option.value}
                            <span class="votes">${option.votes.length}</span>
                        </label>
                    </li>`
        });

        html = `<ul>
                    <form id="poll-${poll.index}">
                        <ol>${html}</ol>
                    </form>
                </ul>`;

        return html
    }

    function vote(pollIndex, pollEl) {
        let optionIndex = pollEl.id.split("item");
        optionIndex = optionIndex[1] * 1;

        const obj = {
            index: pollIndex,
            choice: optionIndex
        };

        socket.emit('chat vote', obj);
    }

    document.querySelector("form").addEventListener("submit", function(ev) {
        ev.preventDefault();
        const message = this.querySelector("input").value;

        if (message.indexOf('/poll') === 0) {
            socket.emit('chat poll', message);
        } else {
            socket.emit('chat message', message);
        }

        //this.querySelector("input").value = "";
    });

    socket.on('chat vote', function(poll){
        updatePoll(poll);
    });

    socket.on('chat message', function(message){
        document.querySelector("#messages").insertAdjacentHTML('beforeend', `<li>${message}</li>`)
    });

    socket.on('chat poll', function(poll){
        const message = "<li>" + getPollTemplate(poll) + "</li>";
        document.querySelector("#messages").insertAdjacentHTML('beforeend', message);
        addEventToPoll(poll);
    });

})();