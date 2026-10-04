const gameArea = document.getElementById("gameArea");
const movingDonut = document.getElementById("movingDonut");
const stack = document.getElementById("stack");

const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");

const message = document.getElementById("message");
const startButton = document.getElementById("startButton");
const dropButton = document.getElementById("dropButton");


// =========================
// GAME SETTINGS
// =========================

const donutWidth = 105;
const donutHeight = 86;

const stackGap = 76;

let donuts = [];

let score = 0;
let best = Number(localStorage.getItem("donutBest")) || 0;

let movingX = 0;
let movingY = 20;

let movingDirection = 1;
let movingSpeed = 2.5;

let isMoving = false;
let isDropping = false;
let gameRunning = false;

let cameraOffset = 0;


// =========================
// INITIAL BEST SCORE
// =========================

bestText.textContent = best;


// =========================
// START GAME
// =========================

function startGame() {

    donuts = [];

    stack.innerHTML = "";

    score = 0;

    scoreText.textContent = "0";

    movingSpeed = 2.5;

    movingDirection = 1;

    movingX = 0;
    movingY = 20;

    cameraOffset = 0;

    stack.style.transform = "translateY(0px)";

    isDropping = false;
    gameRunning = true;
    isMoving = true;

    message.style.display = "none";

    createBaseDonut();

    movingX =
        gameArea.clientWidth / 2 -
        donutWidth / 2;

    movingDonut.style.left = `${movingX}px`;
    movingDonut.style.top = `${movingY}px`;

    updateMovingDonut();
}


// =========================
// CREATE BASE DONUT
// =========================

function createBaseDonut() {

    const baseY =
        gameArea.clientHeight - 100;

    const baseX =
        gameArea.clientWidth / 2 -
        donutWidth / 2;

    createDonut(baseX, baseY);

    donuts.push({
        x: baseX,
        y: baseY
    });
}


// =========================
// CREATE DONUT
// =========================

function createDonut(x, y) {

    const img =
        document.createElement("img");

    img.src = "donut_game_cropped.png";

    img.className = "donut";

    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    stack.appendChild(img);
}


// =========================
// MOVING DONUT
// =========================

function updateMovingDonut() {

    if (!gameRunning || !isMoving) {
        return;
    }

    movingX +=
        movingDirection * movingSpeed;

    const maxX =
        gameArea.clientWidth - donutWidth;

    if (movingX <= 0) {

        movingX = 0;

        movingDirection = 1;
    }

    if (movingX >= maxX) {

        movingX = maxX;

        movingDirection = -1;
    }

    movingDonut.style.left =
        `${movingX}px`;

    movingDonut.style.top =
        `${movingY}px`;

    requestAnimationFrame(
        updateMovingDonut
    );
}


// =========================
// DROP DONUT
// =========================

function dropDonut() {

    if (
        !gameRunning ||
        isDropping
    ) {
        return;
    }

    isDropping = true;

    isMoving = false;

    const previous =
        donuts[donuts.length - 1];


    // Check horizontal overlap

    const overlap =
        calculateOverlap(
            movingX,
            previous.x
        );


    // Missed completely

    if (overlap <= 10) {

        fallAndLose();

        return;
    }


    // Keep the donut where it is
    // horizontally.

    const newX = movingX;


    // Place it directly above
    // the previous donut.

    const targetY =
        previous.y -
        stackGap;


    animateDrop(
        movingX,
        movingY,
        newX,
        targetY
    );
}


// =========================
// CALCULATE OVERLAP
// =========================

function calculateOverlap(x1, x2) {

    const left =
        Math.max(x1, x2);

    const right =
        Math.min(
            x1 + donutWidth,
            x2 + donutWidth
        );

    return right - left;
}


// =========================
// DROP ANIMATION
// =========================

function animateDrop(
    startX,
    startY,
    endX,
    endY
) {

    const duration = 450;

    const startTime =
        performance.now();


    function animate(currentTime) {

        const progress =
            Math.min(
                (currentTime - startTime) /
                duration,
                1
            );


        // Smooth falling motion

        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const y =
            startY +
            (endY - startY) *
            eased;


        movingDonut.style.left =
            `${endX}px`;

        movingDonut.style.top =
            `${y}px`;


        if (progress < 1) {

            requestAnimationFrame(
                animate
            );

        } else {

            placeDonut(
                endX,
                endY
            );
        }
    }


    requestAnimationFrame(
        animate
    );
}


// =========================
// PLACE DONUT
// =========================

function placeDonut(x, y) {

    createDonut(x, y);

    donuts.push({
        x: x,
        y: y
    });


    score++;

    scoreText.textContent =
        score;


    // Best score

    if (score > best) {

        best = score;

        bestText.textContent =
            best;

        localStorage.setItem(
            "donutBest",
            best
        );
    }


    // Increase difficulty

    movingSpeed += 0.15;


    // Move the camera

    updateCamera();


    // New moving donut

    movingX =
        Math.random() *
        (
            gameArea.clientWidth -
            donutWidth
        );

    movingY = 20;


    movingDirection =
        Math.random() > 0.5
            ? 1
            : -1;


    isDropping = false;

    isMoving = true;


    updateMovingDonut();
}


// =========================
// CAMERA / STACK FOLLOW
// =========================

function updateCamera() {

    if (donuts.length === 0) {

        cameraOffset = 0;

        stack.style.transform =
            "translateY(0px)";

        return;
    }


    const topDonut =
        donuts[donuts.length - 1];


    /*
        This is the important part.

        The top donut should stay around
        120px from the top of the screen.
    */

    const desiredTop = 120;


    const actualTop =
        topDonut.y +
        cameraOffset;


    if (actualTop < desiredTop) {

        cameraOffset +=
            desiredTop -
            actualTop;
    }


    /*
        Never move the stack downward.
    */

    if (cameraOffset < 0) {

        cameraOffset = 0;
    }


    stack.style.transform =
        `translateY(${cameraOffset}px)`;
}


// =========================
// DONUT MISSED
// =========================

function fallAndLose() {

    const startY = movingY;

    const endY =
        gameArea.clientHeight +
        100;

    const startTime =
        performance.now();


    function animateFall(currentTime) {

        const progress =
            Math.min(
                (currentTime - startTime) /
                600,
                1
            );


        const y =
            startY +
            (endY - startY) *
            progress;


        movingDonut.style.top =
            `${y}px`;


        if (progress < 1) {

            requestAnimationFrame(
                animateFall
            );

        } else {

            gameOver();
        }
    }


    requestAnimationFrame(
        animateFall
    );
}


// =========================
// GAME OVER
// =========================

function gameOver() {

    gameRunning = false;

    isMoving = false;

    isDropping = false;


    message.innerHTML = `
        <h1>OH NO! 🍩</h1>

        <p>
            You stacked
            <strong>${score}</strong>
            donuts!
        </p>

        <button id="startButton">
            STACK AGAIN
        </button>
    `;


    message.style.display = "flex";


    document
        .getElementById("startButton")
        .addEventListener(
            "click",
            startGame
        );
}


// =========================
// START BUTTON
// =========================

startButton.addEventListener(
    "click",
    startGame
);


// =========================
// DROP BUTTON
// =========================

dropButton.addEventListener(
    "click",
    dropDonut
);


// =========================
// CLICK / TAP GAME AREA
// =========================

gameArea.addEventListener(
    "pointerdown",
    function(event) {

        if (
            gameRunning &&
            !isDropping &&
            !message.contains(event.target)
        ) {

            dropDonut();
        }
    }
);


// =========================
// SPACEBAR
// =========================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.code === "Space" &&
            gameRunning
        ) {

            event.preventDefault();

            dropDonut();
        }
    }
);