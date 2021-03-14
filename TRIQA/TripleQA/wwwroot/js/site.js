// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

//import { makeNewCanvas } from "~/js/Draw.js";
//import 'jQuery'

/****************************** Global Variables ******************************/

var round = 0;
var timer = 0;
var interval;
var timeout;
var nextState = "";
var player_count = 0;
var current_player = '';
var round1Question = '';
var round2Title = '';
var round3Titles = [];
var next_count = 0;
var r2_answer_list = [];
var r2_index_count = 0;
var draws = null;
var r3_answer_list = [];
var r3_playerList = []

/****************************** Pregame Functions ******************************/

function getHost() {
    $.ajax({
        url: '/Home/GetHost',
        type: "GET",
        contentType: "application/json",
        async: true,
        success: function (data) {
            if (data.host == current_player) {
                document.getElementById('next_round').innerHTML = 'Start Game';
            } else {
                document.getElementById('next_round').remove();
                document.getElementById('round_content').innerHTML = "Waiting for Host to Start Game..";
                waitForStart();
            }
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}

function getPlayers() {
    const urlString = window.location.search;
    const urlParams = new URLSearchParams(urlString);
    current_player = urlParams.get('name');
    $.ajax({
        url: '/Home/GetPlayers',
        type: "GET",
        contentType: "application/json",
        async: true,
        success: function (data) {
            getdata = data.playerList;
            playerList = getdata.toString().split(',')
            r3_playerList = playerList
            var list_elmt = document.getElementById("player_list");
            if (list_elmt != null) {
                list_elmt.innerHTML = "";
                for (var i = 0; i < playerList.length; i++) {
                    list_elmt.innerHTML += "<p>" + playerList[i] + "</p>";
                }
                player_count = playerList.length;
                timeout = setTimeout(getPlayers, 500);
            }
            else {
                console.log("player_list is null");
            }
           
        },
        error: function (msg) {
            console.log(msg)
        }
    })
}

function getGameCode() {
    const urlString = window.location.search;
    const urlParams = new URLSearchParams(urlString);
    var gameCode = urlParams.get('gameCode');
    document.getElementById("game_code").innerHTML = "Game Code: " + gameCode;
}

function waitForStart() {
    $.ajax({
        url: '/Home/WaitForStart',
        type: "GET",
        contentType: "application/json",
        async: true,
        success: function (data) {
            console.log(data.gameStarted);
            if (data.gameStarted) {

               changeGameState("round1Prompt");

            } else {
                setTimeout(waitForStart, 500);
            }  
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}

function startGame() {
    if (player_count >= 3) {

        $.ajax({
            url: '/Home/StartGame',
            type: "GET",
            contentType: "application/json",
            async: false,
            success: function (data) {

            },
            error: function (msg) {
                console.log(msg);
            }
        })
        document.getElementById('next_round').remove();
        changeGameState("round1Prompt");
    } else {
        alert("You need at least 3 players to start a game");
    }

    
   
    

}

/****************************** State Controller ******************************/

//Function that changes the game state based on state parameter
function changeGameState(state) {
    clearInterval(interval);
    clearTimeout(timeout);
    document.getElementById('timer').innerHTML = "";
    if (state == 'waitForStart') {
        waitForStart();
        nextState = "round1Prompt";
    }
    else if (state == "round1Prompt") {
        round1Prompt();
        startTimer(30);
        nextState = "round1PostAnswer";
    }
    else if (state == "round1PostAnswer") {
        round1PostAnswer();
        nextState = "round1Voting";
    }
    else if (state == "round1Voting") {
        round1Voting();
        startTimer(30);
        nextState = "displayScores";
    }
    else if (state == "round1ScoresWait") {
        round1ScoresWaiting();
        nextState = "displayScores";
    }
    else if (state == "round2Drawing") {
        round2Drawing();
        nextState = "round2PostCanvas";
        startTimer(60);
    }
    else if (state == "round2PostCanvas") {
        round2PostCanvas();
        nextState = "round2FakeAnswering";
    }
    else if (state == "round2FakeAnswering") {
        round2FakeAnswering();
        nextState = "round2PostFakeAnswer";
    }
    else if (state == "round2PostFakeAnswer") {
        round2PostFakeAnswer();
        nextState = "round2Voting";
    }
    else if (state == "round2Voting") {
        round2Voting();
        nextState = "displayScores";
    }
    else if (state == "round3Drawing") {
        round3Drawing();
        nextState = "round3PostCanvas";
        startTimer(60);

    }
    else if (state == "round3PostCanvas") {
        round3PostCanvas();
        nextState = "round3AnswerGuessing";
    }

    else if (state == "round3AnswerGuessing") {
        round3AnswerGuessing();
        nextState = "displayScores";
    }
    else if (state == "displayScores") {
        displayScores();
    }
}


/****************************** Utility Functions ******************************/

function startTimer(time) {
    clearInterval(interval);
    timer = time;
    interval = setInterval(updateTimer, 1000);
    document.getElementById('timer').innerHTML = timer;
}

function updateTimer() {
    timer -= 1;
    document.getElementById('timer').innerHTML = timer;
    if (timer == 0) {
        document.getElementById('timer').innerHTML = "";
        changeGameState(nextState);
    }
}

function displayScores() {
    $.ajax({
        url: '/Home/GetScores',
        type: "GET",
        contentType: "application/json",
        async: true,
        success: function (data) {
            console.log(data);
            var scores = eval(data.playerScores);
            if (round != 3) {
                var scores_HTML = `<h2>Current Scores</h2>`;
            }
            else {
                document.getElementById('round_id').remove();
                var scores_HTML = `<h2>Thanks For Playing!</h2><h3>Final Scores</h3>`;
            }

            for (var player in scores) {
                scores_HTML += `<p>` + player + `: ` + scores[player] + `</p>`;
            }
            if (round == 3) {
                scores_HTML += `<br><br><p>Click on TripleQA to Start a new game!</p>`;
            }
            document.getElementById('round_content').innerHTML = scores_HTML;
        },
        error: function (msg) {
            console.log(msg);
        }
    })

    if ( round == 1) {
        nextState = "round2Drawing";
        startTimer(10);
    }
    if (round == 2) {
        nextState = "round3Drawing";
        startTimer(10);
    }
    if (nextState == "displayScores"){
        console.log('The state is ' + nextState )
    }
}


/****************************** Round 1 functions ******************************/



//Show question prompt and accept answers 
function round1Prompt() {
    round = 1;
    document.getElementById('lobby').remove();
    document.getElementById('round_id').innerHTML = 'Round 1';
    getRound1Question();
    var round1_question_HTML =
                `
                <h3 id='question' style="text-align:center"></h3>
                    <label id="answer_label" for="answer">Answer: </label>
                    <input id="answer" class="dark" type="text" autocomplete="off" placeholder="Type Answer Here"/>
                    <input id="round1_submit" onclick = "changeGameState('round1PostAnswer')" type="button" value="Submit" />
                `;
    document.getElementById('round_content').innerHTML = round1_question_HTML;
    document.getElementById('question').innerHTML = round1Question;
}

function getRound1Question() {
    $.ajax({
        url: '/Home/getRound1Question',
        type: "GET",
        contentType: "application/json",
        async: false,
        success: function (data) {
            setRound1Question(data.round1Question);
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}

function setRound1Question(input) {
    round1Question = input;
}


//Round 1 send answer to server then display all answers 
var answer_list = [];

function round1PostAnswer() {
    
    var answer = document.getElementById('answer').value;
    if (answer == "") {
        answer = "N\A";
    }
    $.ajax({
        url: '/Home/AddRound1Answer',
        type: "POST",
        contentType: "application/json",
        async: true,
        data: JSON.stringify({
            playerName: current_player,
            round1Answer: answer
        }),
        success: function (data) {
            //console.log(data)
        },
        error: function (msg) {
            console.log(msg)
        }
    })
    document.getElementById('round_content').innerHTML = "Waiting for all answers to be submitted";
    round1AnswersWaiting();
}

function round1AnswersWaiting(){
    $.ajax({
        url: '/Home/Round1AnswerWait',
        type: "GET",
        contentType: "application/json",
        async: false,
        success: function (data) {
            if (data.round1AnswersDone) {
                changeGameState("round1Voting");
            } else {
                setTimeout(round1AnswersWaiting, 500);
            }
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}

function round1ScoresWaiting() {
    $.ajax({
        url: '/Home/Round1ScoreWait',
        type: "GET",
        contentType: "application/json",
        async: false,
        success: function (data) {
            if (data.round1ScoresDone) {
                changeGameState("displayScores");
            } else {
                setTimeout(round1ScoresWaiting, 1000);
            }
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}

function postScores(player, score) {
    document.getElementById('round_content').innerHTML = "Waiting for all players to vote";
    $.ajax({
        url: '/Home/AddScore',
        type: "POST",
        contentType: "application/json",
        async: true,
        data: JSON.stringify({
            playerName: player,
            playerScore: score
        }),
        success: function (data) {
            //console.log(data)
        },
        error: function (msg) {
            console.log(msg)
        }
    })
    changeGameState('round1ScoresWait');
}

//Round 1 voting
function round1Voting() {
    var question = round1Question;
    $.ajax({
        url: '/Home/GetRound1Answers',
        type: "GET",
        contentType: "application/json",
        async: true,

        success: function (data) {
            var answer_list = eval(data.round1Answers);
            var round1_answers_HTML = `<h2>` + question + `</h2><h3>Pick the best answer</h3>`;
            // Item 1 is player name, item 2 is answer
            for (var player in answer_list) {
                if (player != current_player) {
                    round1_answers_HTML += `<button  class="answerButton" onclick="postScores('` + player + `','100')">` + answer_list[player] + `</button><br><br>
                               `;
                }
            }
            document.getElementById('round_content').innerHTML = round1_answers_HTML;
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}

/****************************** Round 2 functions ******************************/

function round2Drawing() {
    round = 2;
    document.getElementById('round_id').innerHTML = 'Round 2';
    //TODO canvas HTML and JavaSscript
    var round2HTML =
        `
            <h3 id='round2_drawtitle' style="text-align:center"></h3>
            <br><br>
            <div onclick = "clearCanvas()" style="cursor:pointer;"><b> Clear Canvas </b> </div>
            <div id="canvas_relm"></div>
            <br><br>
            <input id="round2_submit" type="button" onclick="changeGameState('round2PostCanvas')" value="Submit" />
            `;
    document.getElementById('round_content').innerHTML = round2HTML;

    getRound2Title();
    document.getElementById('round2_drawtitle').innerHTML = round2Title;
    makeNewCanvas();

    canvas = document.getElementById("tempCanvas_0");
    context = canvas.getContext('2d');
    if (context.strokeStyle == "#000000") {
        context.strokeStyle = "#ffffff" ;
    }
}

function getRound2Title() {
    $.ajax({
        url: '/Home/getRound2Title',
        type: "GET",
        contentType: "application/json",
        async: false,
        success: function (data) {
            setRound2Title(data.round2Title);
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}

function setRound2Title(input) {
    round2Title = input;
}

//Round 2 send canvas to server
function round2PostCanvas() {
    //Start Displaying
    canvas = document.getElementById(cur_canvaso);
    canvas_to_img = canvas.toDataURL("image/webp");

    $.ajax({
        url: '/Home/AddRound2Draw',
        type: "POST",
        contentType: "application/json",
        async: true,
        data: JSON.stringify({
            playerName: current_player,
            canvasSource: canvas_to_img
        }),
        success: function (data) {
            //console.log(data)
        },
        error: function (msg) {
            console.log(msg)
        }
    })
    
    document.getElementById('round_content').innerHTML = "Waiting for all drawings to be submitted";
    round2DrawsWaiting();
}

function round2DrawsWaiting() {
    $.ajax({
        url: '/Home/Round2DrawWait',
        type: "GET",
        contentType: "application/json",
        async: false,
        success: function (data) {
            console.log(data);
            if (data.round2DrawsDone) {
                changeGameState("round2FakeAnswering");
            } else {
                setTimeout(round2DrawsWaiting, 1000);
            }
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}




//Display canvas and prompt for fake answers
function round2FakeAnswering() {
    
    $.ajax({
        url: '/Home/GetRound2Draws',
        type: "POST",
        contentType: "application/json",
        async: true,

        success: function (data) {
            draws = JSON.parse(data);
            
            if (draws != null) {
                displayDraw(draws)
            }
        },
        error: function (msg) {
            console.log(msg);
        }
    })

   


}
function displayDraw(draws) {

    
    
    var i = 0;

    if (draws[i].playerName == current_player) {
        next_count++;
        i = next_count;
        r2_answer_list.push("*"+round2Title);
    } 
    

    var fake_answers_HTML = `<h2>Enter a answer for what you think other people will guess for the image below</h2>
                            <br><br> 
                            <div id= "canvas_relm">
                                    
                            </div>
                            <br><br>
                            <label for="answer">Fake Answer: </label>
                            <input id="fake_answer" class="dark" type="text" placeholder="Type Answer Here"/>
                            <input id="round2_fake_answer_submit"  type="button" value="Submit">
                            `;
    document.getElementById('round_content').innerHTML = fake_answers_HTML;
    var canvas_div = document.createElement('div');
    canvas_div.style.height = "500px";
    canvas_div.style.width = "50%";

    var canvas = document.createElement("canvas");
    canvas_div.appendChild(canvas);
    var holder = document.getElementById("canvas_relm");
    holder.appendChild(canvas_div);
    canvas.height = canvas_div.clientHeight;;
    canvas.width = canvas_div.clientWidth;;
    canvas.style.position = "absolute";
    canvas.id = "canvas_round2";
    var context = canvas.getContext('2d');

    var submit_button = document.getElementById("round2_fake_answer_submit");
    submit_button.onclick = function () {
        var elmt = document.getElementById("fake_answer");
        r2_answer_list.push(elmt.value);
        elmt.value = '';
        rotateDraws(draws);

    }
    

    var image_for_canvas = document.createElement("img");
    image_for_canvas.src = draws[i].canvasSource;

    image_for_canvas.onload = function () {

        context.drawImage(image_for_canvas, 0, 0);
    }

}

function rotateDraws(draws) {
    next_count++;
    var i = next_count;
    if (i < draws.length && draws[i].playerName == current_player ) {
        next_count++;
        i = next_count;
        r2_answer_list.push("*"+round2Title);
    } 
    
    if (i >= draws.length) {
        document.getElementById('round_content').innerHTML = "Waiting for other players to submit fake titles";
        saveFakeAnswers();
        
    } else {

        canvas = document.getElementById("canvas_round2");
        var context = canvas.getContext('2d');

        var image_for_canvas = document.createElement("img");
        image_for_canvas.src = draws[i].canvasSource;

        image_for_canvas.onload = function () {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image_for_canvas, 0, 0);

        }
        
    }

    
}

function saveFakeAnswers() {
     $.ajax({
         url: '/Home/AddRound2Answer',
        type: "POST",
        contentType: "application/json",
        async: true,
        data: JSON.stringify({
            playerName: current_player,
            round2FakeAnswer: r2_answer_list
        }),
        success: function (data) {
            
            round2FakeAnswersWait();
        },
        error: function (msg) {
            console.log(msg)
        }
    })
}

function round2FakeAnswersWait() {
    $.ajax({
        url: '/Home/Round2FakeAnswerWait',
        type: "GET",
        contentType: "application/json",
        async: false,
        success: function (data) {
            
            if (data.round2AnswersDone) {
                changeGameState("round2Voting");
                
            } else {
                setTimeout(round2FakeAnswersWait, 1000);
            }
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}


function round2Voting() {

    //get drawing and fake answers from server 
    $.ajax({
        url: '/Home/GetRound2Answers',
        type: "GET",
        contentType: "application/json",
        async: true,

        success: function (data) {
            answer_list = eval(data.round2Answers);
            round2VotingTemplate(answer_list);
            
        },
        error: function (msg) {
            console.log(msg);
        }
    })
    

 
}

function round2VotingTemplate(answer_list) {
    var cur_players_draw = false;
    if (r2_index_count >= player_count) {
        document.getElementById('round_content').innerHTML = "Waiting for other players to select answers";
        round2ScoreWait();
    } else {

        var guessing_HTML = `<h2 id="round2heading"> Choose the real answer for this drawing! </h2>
                                <br><br> 
                                <div id= "canvas_relm">
                                    
                                </div>
                                <br><br>
                `;


        // Item 1 is player name, item 2 is answers list

        for (var player in answer_list) {
            
            //CHECK FOR IF IT IS THE PLAYERS DRAW
            if (answer_list[player][r2_index_count] != "*"+round2Title) {
                if (answer_list[player][r2_index_count][0] == "*") {
                    real_answer = answer_list[player][r2_index_count].substring(1);
                    guessing_HTML += `<button  class="answerButton" onclick="round2Voting();  round2Correct('` + player + `') ">` + real_answer + `</button><br><br> `;
                } else {
                    guessing_HTML += `<button  class="answerButton" onclick="round2Voting(); round2Incorrect('` + player + `') ">` + answer_list[player][r2_index_count] + `</button><br><br> `;
                }
               
            } else {
                cur_players_draw = true;
            }

            //guessing_HTML += `<button  class="answerButton" onclick="postScores('` + player + `','100')">` + answer_list[player][index] + `</button><br><br> `;



        }
        document.getElementById('round_content').innerHTML = guessing_HTML;
        if (cur_players_draw) {
            document.getElementById("round2heading").innerHTML = "This is your drawing, pick your favourite fake answer for your drawing";

        }
        var canvas_div = document.createElement('div');
        canvas_div.style.height = "500px";
        canvas_div.style.width = "50%";

        var canvas = document.createElement("canvas");
        canvas_div.appendChild(canvas);
        var holder = document.getElementById("canvas_relm");
        holder.appendChild(canvas_div);
        canvas.height = canvas_div.clientHeight;;
        canvas.width = canvas_div.clientWidth;;
        canvas.style.position = "absolute";
        canvas.id = "canvas_round2";
        var context = canvas.getContext('2d');

        var image_for_canvas = document.createElement("img");
        image_for_canvas.src = draws[r2_index_count].canvasSource;

        image_for_canvas.onload = function () {

            context.drawImage(image_for_canvas, 0, 0);
        }



        r2_index_count++


    }

}

function round2Correct(player) {
    alert("That was correct! You get 200 points.");
    postR2Scores(player, 200);
    postR2Scores(current_player, 200);
}

function round2Incorrect(player) {
    alert("That was a fake answer!");
    postR2Scores(player, 200);
    postR2Scores(current_player, 0);
}
function postR2Scores(player, score) {
    
    $.ajax({
        url: '/Home/AddR2Score',
        type: "POST",
        contentType: "application/json",
        async: true,
        data: JSON.stringify({
            playerName: player,
            playerScore: score
        }),
        success: function (data) {
            //console.log(data)
        },
        error: function (msg) {
            console.log(msg)
        }
    })
    
}

function round2ScoreWait() {
    $.ajax({
        url: '/Home/Round2ScoreWait',
        type: "GET",
        contentType: "application/json",
        async: false,
        success: function (data) {
            //console.log(data);
            if (data.round2ScoresDone) {
                changeGameState("displayScores");
            } else {
                setTimeout(round2ScoreWait, 1000);
            }
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}

/****************************** Round 3 functions ******************************/


//Live drawing and guesing 
function round3Drawing() {

    round = 3;
   

    document.getElementById('round_id').innerHTML = 'Round 3';
    
    var round3HTML =
        `
        <h3 id='round3_drawtitle' style="text-align:center"></h3>
        <p>You only get one line to draw, once you let go of the click thats it!</p>
        <br><br>
        <!--<div onclick = "clearCanvas()" style="cursor:pointer;"><b> Clear Canvas </b> </div>-->
        <div id="canvas_relm"></div>
        <br><br>
        
        <br>
        <p id="guess_status"><p>
        `;
    document.getElementById('round_content').innerHTML = round3HTML;

    
    //Query and change question
    for (player in r3_playerList) {
       // console.log("here")
        if (current_player == r3_playerList[player]) {
            
            getRound3Title();
            document.getElementById('round3_drawtitle').innerHTML = 'Draw ' + round3Title;

            console.log(round3Title)

            $.ajax({
                url: '/Home/AddRound3Answer',
                type: "POST",
                contentType: "application/json",
                async: true,
                data: JSON.stringify({
                    playerName: current_player,
                    round3Answer: round3Title
                }),
                success: function (data) {
                },
                error: function (msg) {
                    console.log(msg)
                }
            })

        }
        
       
    }
    
    
    makeNewCanvas();

    canvas = document.getElementById("tempCanvas_0");
    context = canvas.getContext('2d');
    if (context.strokeStyle == "#000000") {
        context.strokeStyle = "#ffffff";
    }
    
    window.addEventListener('mouseup', function (event) {
        
        if (drawtool.started == false) {
            
            changeGameState('round3PostCanvas')
        }
    })
    
}

function getRound3Title() {
    $.ajax({
        url: '/Home/getRound3Title',
        type: "GET",
        contentType: "application/json",
        async: false,
        success: function (data) {
            setRound3Title(data.round3Title);
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}

function setRound3Title(input) {
    round3Title = input;
}


//Round 3 send canvas to server
function round3PostCanvas() {
    //Start Displaying
    canvas = document.getElementById(cur_canvaso);
    
   canvas_to_img = canvas.toDataURL("image/webp");
    

    $.ajax({
        url: '/Home/AddRound3Draw',
        type: "POST",
        contentType: "application/json",
        async: true,
        data: JSON.stringify({
            playerName: current_player,
            canvasSource: canvas_to_img
        }),
        success: function (data) {
            //console.log(data)
        },
        error: function (msg) {
            console.log(msg)
        }
    })

    document.getElementById('round_content').innerHTML = "Waiting for all drawings to be submitted";
    round3DrawsWaiting();
}

function round3DrawsWaiting() {
    $.ajax({
        url: '/Home/Round3DrawWait',
        type: "GET",
        contentType: "application/json",
        async: false,
        success: function (data) {
            //console.log("helloo")
            //console.log(data);
            if (data.round3DrawsDone) {
                
                changeGameState("round3AnswerGuessing");
            } else {
                setTimeout(round3DrawsWaiting, 1000);
            }
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}

function round3AnswerGuessing() {

    $.ajax({
        url: '/Home/GetRound3Draws',
        type: "POST",
        contentType: "application/json",
        async: true,

        success: function (data) {
           // console.log(data)
            draws = JSON.parse(data);

            if (draws != null) {
                PickDrawing(draws)
                //displayRound3Draw(draws)
            }
        },
        error: function (msg) {
            console.log(msg);
        }
    })


    //Pick whose drawing you want tp guess
    function PickDrawing(draws) {


        var answers_HTML = `<h2>Pick whose drawing you want to guess</h2>
                            <br><br> 
                            
                            <br><br>
                            `;
        console.log(draws)
        for (var player in draws) {
           
            if (draws[player].playerName != current_player) {
                
                answers_HTML += `<button  id= "answer_button" class="answerButton" onclick="displayRound3Draw('` + draws[player].canvasSource + `','`+ draws[player].playerName + `')">` + draws[player].playerName + `</button><br><br>
                               `;


            }
        }
        document.getElementById('round_content').innerHTML = answers_HTML;

       





    }
}



function displayRound3Draw(drawingCanvas, pickedDrawerName) {

    var round3answerlist;
    var test;

    $.ajax({
        url: '/Home/GetRound3Answers',
        type: "GET",
        contentType: "application/json",
        async: true,

        success: function (data) {
           // alert("check")
            //console.log(data)
            test = data;
             round3answerlist = eval(data.round3Answers)

        },
        error: function (msg) {
            console.log(msg);
        }
    })
    console.log(drawingCanvas)
    console.log(pickedDrawerName)
    
   // console.log(r3_index_count)
   // console.log(r3_drawtitle)
    
   // PickedDrawer = drawingCanvas.playerName
    
    var i = 0;
    


    var answers_HTML = `<h2>Guess the Drawing</h2>
                            <br><br> 
                            <div id= "canvas_relm">
                                    
                            </div>
                            <br><br>
                            <label for="answer">Answer: </label> -->
                           <input id="answer3" class="dark" type="text" placeholder="Type Answer Here"/> 
                            <input id="round3_answer_submit"  type="button" value="Submit">
                            `;


    

    document.getElementById('round_content').innerHTML = answers_HTML;

   
    var canvas_div = document.createElement('div');
    canvas_div.style.height = "500px";
    canvas_div.style.width = "50%";

    var canvas = document.createElement("canvas");
    canvas_div.appendChild(canvas);
    var holder = document.getElementById("canvas_relm");
    holder.appendChild(canvas_div);
    canvas.height = canvas_div.clientHeight;;
    canvas.width = canvas_div.clientWidth;;
    canvas.style.position = "absolute";
    canvas.id = "canvas_round2";
    var context = canvas.getContext('2d');

    var submit_button = document.getElementById("round3_answer_submit");
    submit_button.onclick = function () {

        var elmt = document.getElementById("answer3");

       
        console.log(test.round3Answers[pickedDrawerName])
     

        if (elmt.value.toLowerCase() == (test.round3Answers[pickedDrawerName].toLowerCase())) {
            
            alert("Your Guess is correct! You will receive 300 points")
            postR3Scores(current_player, 300)
            postR3Scores(pickedDrawerName,300)
            
        }
        else {
            alert("Your Guess is incorrect!")
            postR3Scores(current_player, 0)
            postR3Scores(pickedDrawerName, 0)
            
        }
        
        

    }


    var image_for_canvas = document.createElement("img");
    //image_for_canvas.src = draws[0].canvasSource;
    image_for_canvas.src = drawingCanvas
    image_for_canvas.onload = function () {

        context.drawImage(image_for_canvas, 0, 0);
    }
}


function postR3Scores(player,score) {

    document.getElementById('round_content').innerHTML = "Waiting for all players to submit";
    $.ajax({
        url: '/Home/AddR3Score',
        type: "POST",
        contentType: "application/json",
        async: true,
        data: JSON.stringify({
            playerName: player,
            playerScore: score
        }),
        success: function (data) {
            
            //console.log(data)
        },
        error: function (msg) {
            console.log(msg)
        }
    })

    round3ScoreWait()


}

var lastRoundscoresDones = false;

function round3ScoreWait () {
    $.ajax({
        url: '/Home/Round3ScoreWait',
        type: "GET",
        contentType: "application/json",
        async: false,
        success: function (data) {
            console.log(data);
            if (data.round3ScoresDone) {
                 lastRoundscoresDones = true;

                changeGameState("displayScores");
            } else {
                setTimeout(round3ScoreWait, 1000);
            }
        },
        error: function (msg) {
            console.log(msg);
        }
    })
}

