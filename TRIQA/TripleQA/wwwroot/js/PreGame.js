var gameCode = '';
var gameActive = false;
var active_games = [];

function CreateGame() {
    var player_name = document.getElementById("nickname").value;
    if (player_name.length < 3) {
        alert("Please enter a name 3 or more characters")
        return;
    }

    var code = createNewGame();
    //alert("Your code is " + code + " Please share your game code with your friends. Joining game now.");
    gameActive = true;
    active_games.push(code);
    addHost(player_name);
    SendActiveCodes(code);
    joinGame(code, player_name);
}

function addHost(player_name) {
    $.ajax({
        url: '/Home/AddHost',
        type: "POST",
        contentType: "application/json",
        async: false,
        data: JSON.stringify({
            playerName: player_name
        }),
        success: function (data) {
            console.log(data)
        },
        error: function (msg) {
            console.log(msg)
        }
    })
}

function addPlayer(player_name) {
    $.ajax({
        url: '/Home/AddPlayer',
        type: "POST",
        contentType: "application/json",
        async: true,
        data: JSON.stringify({
            playerName: player_name
        }),
        success: function (data) {
            console.log(data)
        },
        error: function (msg) {
            console.log(msg)
        }
    })
}

function SendActiveCodes(activegames) {
    console.log(activegames)
    $.ajax({
        url: '/Home/SendActiveCode',
        type: "POST",
        contentType: "application/json",
        async: true,
        data: JSON.stringify({
            Activegames: activegames
        }),
        success: function (data) {
            console.log(data)
        },
        error: function (msg) {
            console.log(msg)
        }
    })
}



function createNewGame() {
    //create new game code and ask to share with friends
    var text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (var i = 0; i < 6; i++) {
        gameCode += text.charAt(Math.floor(Math.random() * text.length));
    }
    return gameCode;
}

function checkGameCode() {
    var getcode;
    var parsedcode = '';
    var input_div = document.getElementById("game_code");
    var player_name = document.getElementById("nickname").value;
    if (player_name.length < 3) {
        alert("Please enter a name 3 or more characters");
        return;
    }
    $.ajax({
        url: '/Home/GetActiveCode',
        type: "GET",
        contentType: "application/json",
        async: true,

        success: function (data) {
            getcode = data.active_games;
            parsedcode = getcode.toString().split(',');
            for (var i = 0; i < parsedcode.length; i++) {
                if (parsedcode[i] == input_div.value) {
                    addPlayer(player_name);
                    joinGame(input_div.value, player_name);
                }
            }
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}

function joinGame(code, player_name) {
    var url = "/Home/Game?gameCode=" + code + "&name=" + player_name;
    window.location.href = url;
}