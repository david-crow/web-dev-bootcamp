for (let i = 0; i < document.querySelectorAll(".drum").length; i++) {
    document.querySelectorAll(".drum")[i].addEventListener("click", function() {
        handleButton(this.innerHTML);
    });
};

document.addEventListener("keydown", function (e) {
    handleButton(e.key);
});

function handleButton(key) {
    switch (key) {
        case "a":
            playSound("a", "tom1");
            break;
        case "s":
            playSound("s", "tom2");
            break;
        case "d":
            playSound("d", "tom3");
            break;
        case "f":
            playSound("f", "tom4");
            break;
        case "j":
            playSound("j", "snare");
            break;
        case "k":
            playSound("k", "kick");
            break;
        case "l":
            playSound("l", "cymbal");
            break;
        default:
            break;
    };
};

function playSound(key, drum) {
    const audio = new Audio(`sounds/${drum}.mp3`);
    audio.play();
    animateButton(key);
};

function animateButton(key) {
    const obj = `.${key}`;

    document.querySelector(obj).classList.add("pressed");
    setTimeout(function () {
        document.querySelector(obj).classList.remove("pressed");
    }, 100);
};
