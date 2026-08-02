// LOAD DEVELOPMENT STATUS
async function loadStatus() {
    try {
        const response = await fetch("status.json");
        const data = await response.json();
        document.getElementById("status-box").innerText = data.status;
    } catch (error) {
        document.getElementById("status-box").innerText = "Error loading status.";
    }
}
loadStatus();

// SHOOTING STAR LOGIC
const star = document.getElementById("shootingStar");

let mouseX = 0;
let mouseY = 0;
let starX = window.innerWidth / 2;
let starY = window.innerHeight / 2;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Smooth movement (lerp)
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Particle system
function createParticle(x, y) {
    const p = document.createElement("div");
    p.classList.add("particle");
    document.body.appendChild(p);

    let angle = Math.random() * Math.PI * 2;
    let speed = Math.random() * 3 + 1;

    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;

    let opacity = 1;

    function animate() {
        x += vx;
        y += vy;
        opacity -= 0.03;

        p.style.transform = `translate(${x}px, ${y}px)`;
        p.style.opacity = opacity;

        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            p.remove();
        }
    }

    animate();
}

// Animate shooting star
function animateStar() {
    starX = lerp(starX, mouseX, 0.15);
    starY = lerp(starY, mouseY, 0.15);

    const dx = mouseX - starX;
    const dy = mouseY - starY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    star.style.transform = `translate(${starX}px, ${starY}px) rotate(${angle}deg)`;

    // Emit particles
    createParticle(starX - 10, starY - 10);

    requestAnimationFrame(animateStar);
}
animateStar();

// STARFIELD CANVAS
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.onresize = resizeCanvas;

let stars = [];
for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.2
    });
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(star.x, star.y, star.size, star.size);

        star.y -= star.speed;
        if (star.y < 0) {
            star.y = canvas.height;
            star.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(animateStars);
}
animateStars();
