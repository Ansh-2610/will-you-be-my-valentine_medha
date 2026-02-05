const noBtn = document.getElementById("no-btn");
const yesBtn = document.getElementById("yes-btn");
const buttonsBox = document.querySelector(".buttons");
const heartsContainer = document.getElementById("hearts");

const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("close-modal");

const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

// ----- Helpers -----
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ----- NO button dodge (smooth + stays inside box) -----
function moveNoButton() {
  const boxRect = buttonsBox.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  // padding inside the buttons container
  const pad = 10;

  const maxX = boxRect.width - btnRect.width - pad * 2;
  const maxY = boxRect.height - btnRect.height - pad * 2;

  const x = pad + Math.random() * maxX;
  const y = pad + Math.random() * maxY;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;

  // micro-wiggle
  noBtn.animate(
    [{ transform: "translateY(0)" }, { transform: "translateY(-2px)" }, { transform: "translateY(0)" }],
    { duration: 220, easing: "ease-out" }
  );
}

// Desktop hover / Mobile touch
noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); moveNoButton(); }, { passive: false });

// Optional: If someone tabs to NO, dodge too (fun + accessible)
noBtn.addEventListener("focus", moveNoButton);

// ----- Floating hearts (prettier, varied drift/size) -----
function createHeart() {
  const heart = document.createElement("span");
  heart.textContent = Math.random() > 0.5 ? "❤️" : "💗";

  const left = Math.random() * 100;
  const size = 14 + Math.random() * 14;
  const duration = 3.2 + Math.random() * 2.6;
  const drift = (Math.random() * 160 - 80).toFixed(0) + "px";

  heart.style.left = left + "vw";
  heart.style.fontSize = size + "px";
  heart.style.animationDuration = duration + "s";
  heart.style.setProperty("--drift", drift);

  heartsContainer.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000 + 200);
}
setInterval(createHeart, 420);

// ----- Modal controls -----
function openModal() {
  modal.setAttribute("aria-hidden", "false");
  closeModalBtn.focus();
}
function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  yesBtn.focus();
}

modal.addEventListener("click", (e) => {
  if (e.target && e.target.dataset && e.target.dataset.close) closeModal();
});
closeModalBtn.addEventListener("click", closeModal);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeModal();
});

// ----- Confetti (lightweight) -----
let confetti = [];
let confettiRunning = false;

function spawnConfetti() {
  const count = 160;
  for (let i = 0; i < count; i++) {
    confetti.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 2.4,
      vy: 2.2 + Math.random() * 3.2,
      r: 2 + Math.random() * 4,
      a: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.25,
      life: 160 + Math.random() * 80
    });
  }
}

function drawConfetti() {
  if (!confettiRunning) return;
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confetti.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.a += p.va;
    p.life -= 1;

    // no hardcoded colors: use gradients from current theme (soft)
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    ctx.globalAlpha = clamp(p.life / 220, 0, 1);

    ctx.beginPath();
    ctx.roundRect(-p.r, -p.r, p.r * 2.2, p.r * 1.6, 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(-p.r, -p.r, p.r * 2.0, p.r * 1.4, 2);
    ctx.fillStyle = "rgba(255, 77, 109, 0.35)";
    ctx.fill();
    ctx.restore();
  });

  confetti = confetti.filter((p) => p.life > 0 && p.y < confettiCanvas.height + 40);
  if (confetti.length === 0) {
    confettiRunning = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    return;
  }

  requestAnimationFrame(drawConfetti);
}

// ----- YES action -----
yesBtn.addEventListener("click", () => {
  openModal();

  // confetti burst
  spawnConfetti();
  confettiRunning = true;
  drawConfetti();

  // gentle “pulse” on card
  document.querySelector(".card").animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.015)" }, { transform: "scale(1)" }],
    { duration: 520, easing: "ease-out" }
  );
});
