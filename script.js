const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');

noBtn.addEventListener('mouseenter', () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Random position, with padding so button stays on screen
    const x = 50 + Math.random() * (vw - 150); 
    const y = 50 + Math.random() * (vh - 100);

    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
});

// Optional: click YES
yesBtn.addEventListener('click', () => {
    alert("Yay! 💖 I'm your Valentine!");
});
