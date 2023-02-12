const colors = ["red", "blue", "green", "yellow"];
let gameStarted = false;
let sequence = [];
let userSequence = [];
let level = 1;

function nextSequence() {
    const nextColor = colors[Math.floor(Math.random() * 4)];
    sequence.push(nextColor);
    userSequence = [];
    playSound(nextColor);
    $(`#${nextColor}`).fadeIn(100).fadeOut(100).fadeIn(100);
    $("#level-title").text(`Level ${level++}`);
};

function checkAnswer(currentLevel) {
    if (sequence[currentLevel] === userSequence[currentLevel]) {
        if (sequence.length === userSequence.length) {
            setTimeout(function () {
                nextSequence();
            }, 1000);
        }
    } else {
        gameOver();
    }
};

function gameOver() {
    playSound("wrong");
    $("#level-title").text("Game over!");
    $("#restart-title").css("opacity", 100);
    $("body").addClass("game-over");
    setTimeout(function () {
        $("body").removeClass("game-over");
    }, 200);

    startOver();
};

function startOver() {
    sequence = [];
    gameStarted = false;
    level = 1;
}

function playSound(name) {
    const audio = new Audio(`sounds/${name}.mp3`);
    audio.play();
};

function animatePress(color) {
    $(`#${color}`).addClass("pressed");
    setTimeout(function () {
        $(`#${color}`).removeClass("pressed");
    }, 100);
};

$(document).keypress(function () {
    if (!gameStarted) {
        gameStarted = true;
        $("#level-title").text(`Level ${level}`);
        $("#restart-title").css("opacity", 0);
        setTimeout(function() {
            nextSequence();
        }, 200);
    }
});

$(".btn").click(function () {
    const userColor = $(this).attr("id");
    userSequence.push(userColor);
    playSound(userColor);
    animatePress(userColor);
    checkAnswer(userSequence.length - 1);
});
