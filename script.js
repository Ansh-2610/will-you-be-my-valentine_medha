const noBtn = document.getElementById("no-btn");
const yesBtn = document.getElementById("yes-btn");
const buttonsBox = document.querySelector(".buttons");
const heartsContainer = document.querySelector(".hearts");

/* --- SMART DODGE (stays inside card) --- */
function moveNoButton() {
  const boxRect = buttonsBox.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = boxRect.width - btnRect.width;
  const maxY = boxRect.height - btnRect.height;

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

/* Desktop hover */
noBtn.addEventListener("mouseenter", moveNoButton);

/* Mobile touch */
noBtn.addEventListener("touchstart", moveNoButton);

/* YES click */
yesBtn.addEventListener("click", () => {
  alert("YAYYY 💖 I knew you’d say YES 😍");
});

/* --- HEART ANIMATION --- */
function createHeart() {
  const heart = document.createElement("span");
  heart.innerText = "❤️";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = 3 + Math.random() * 3 + "s";
  heartsContainer.appendChild(heart);

  setTimeout(() => heart.remove(), 6000);
}

setInterval(createHeart, 400);
