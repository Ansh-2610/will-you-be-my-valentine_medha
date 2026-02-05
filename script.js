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

// =====================================================
//  NO BUTTON: REPULSOR FIELD (desktop + mobile)
// =====================================================
let lastMove = 0;

// You can tweak these two for “feel”
const REPEL_RADIUS = 95;    // px: how close the pointer can get
const MOVE_COOLDOWN = 120;  // ms: prevents jitter

function getBtnCenter(rect) {
  return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
}

function ensureNoBtnInitialized() {
  // If the button never got positioned yet, set a good starting point
  const left = parseFloat(noBtn.style.left);
  const top = parseFloat(noBtn.style.top);
  if (Number.isFinite(left) && Number.isFinite(top)) return;

  const boxRect = buttonsBox.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const pad = 10;

  const maxX = boxRect.width - btnRect.width - pad * 2;
  const maxY = boxRect.height - btnRect.height - pad * 2;

  noBtn.style.left = `${pad + maxX * 0.62}px`;
  noBtn.style.top = `${pad + maxY * 0.20}px`;
}

function moveNoButtonAwayFrom(pointerX, pointerY) {
  const now = Date.now();
  if (now - lastMove < MOVE_COOLDOWN) return;
  lastMove = now;

  ensureNoBtnInitialized();

  const boxRect = buttonsBox.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const pad = 10;
  const maxX = boxRect.width - btnRect.width - pad * 2;
  const maxY = boxRect.height - btnRect.height - pad * 2;

  // current NO button center
  const { cx: btnCx, cy: btnCy } = getBtnCenter(btnRect);

  // direction away from pointer (normalized)
  let dx = btnCx - pointerX;
  let dy = btnCy - pointerY;
  const len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;

  // Jump away
  const jump = REPEL_RADIUS + 30;

  const currentLeft = parseFloat(noBtn.style.left);
  const currentTop = parseFloat(noBtn.style.top);

  let newLeft = currentLeft + dx * jump;
  let newTop = currentTop + dy * jump;

  // If still too near, teleport randomly
  const dist = Math.hypot(btnCx - pointerX, btnCy - pointerY);
  if (dist < REPEL_RADIUS + 6) {
    newLeft = pad + Math.random() * maxX;
    newTop = pad + Math.random() * maxY;
  }

  newLeft = clamp(newLeft, pad, pad + maxX);
  newTop = clamp(newTop, pad, pad + maxY);

  noBtn.style.left = `${newLeft}px`;
  noBtn.style.top = `${newTop}px`;

  // micro polish
  noBtn.animate(
    [{ transform: "translateY(0)" }, { transform: "translateY(-3px)" }, { transform: "translateY(0)" }],
    { duration: 180, easing: "ease-out" }
  );
}

function handlePointer(clientX, clientY) {
  ensureNoBtnInitialized();
  const rect = noBtn.getBoundingClientRect();
  const { cx, cy } = getBtnCenter(rect);
  const dist = Math.hypot(cx - clientX, cy - clientY);

  if (dist < REPEL_RADIUS) {
    moveNoButtonAwayFrom(clientX, clientY);
  }
}

// Use Pointer Events where supported (covers mouse + touch + pen)
buttonsBox.addEventListener("pointermove", (e) => {
  handlePointer(e.clientX, e.clientY);
});

// Extra safety: if somehow hovered/focused, still escape
noBtn.addEventListener("pointerenter", (e) => moveNoButtonAwayFrom(e.clientX, e.clientY));
noBtn.addEventListener("focus", () => {
  const boxRect = buttonsBox.getBoundingClientRect();
  moveNoButtonAwayFrom(boxRect.left + boxRect.width / 2, boxRect.top + boxRect.height / 2);
});

// ----- Floating hearts -----
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

// ----- Confetti -----
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

  spawnConfetti();
  confettiRunning = true;
  drawConfetti();

  document.querySelector(".card").animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.015)" }, { transform: "scale(1)" }],
    { duration: 520, easing: "ease-out" }
  );
});
