const dice1 = Math.floor(Math.random() * 6) + 1;
const dice2 = Math.floor(Math.random() * 6) + 1;

let result;

if (dice1 == dice2) {
    result = "Draw!";
} else if (dice1 > dice2) {
    result = "Player 1 wins! 🎉";
} else {
    result = "Player 2 wins! 🥳";
}

document.querySelector(".img1").setAttribute("src", `images/dice${dice1}.png`);
document.querySelector(".img2").setAttribute("src", `images/dice${dice2}.png`);
document.querySelector("h1").innerText = result;
