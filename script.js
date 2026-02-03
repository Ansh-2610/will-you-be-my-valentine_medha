const noBtn = document.getElementById("no");

document.addEventListener("mousemove", (e) => {
  const btnRect = noBtn.getBoundingClientRect();
  const distance = 80;

  const dx = e.clientX - (btnRect.left + btnRect.width / 2);
  const dy = e.clientY - (btnRect.top + btnRect.height / 2);

  if (Math.abs(dx) < distance && Math.abs(dy) < distance) {
    const x = Math.random() * (window.innerWidth - btnRect.width);
    const y = Math.random() * (window.innerHeight - btnRect.height);

    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
  }
});

document.getElementById("yes").addEventListener("click", () => {
  alert("YAY!!! 💕 I knew it 😍");
});
