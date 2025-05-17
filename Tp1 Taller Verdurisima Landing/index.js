// Elementos
const modal = document.getElementById("form-modal");
const form = document.getElementById("popup-form");
const thankYou = document.getElementById("thank-you");
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const userDiet = document.getElementById("user-diet");
const discountMsg = document.getElementById("discount-msg");
const closeButton = document.querySelector(".close-button");

let confettiInterval = null;

// Mostrar modal
document.querySelectorAll("button").forEach(btn => {
  if (/(quiero|dale)/i.test(btn.innerText)) {
    btn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      form.classList.remove("hidden");
      thankYou.classList.add("hidden");
    });
  }
});

// Cerrar modal
closeButton.addEventListener("click", () => {
  modal.classList.add("hidden");
  form.reset();
  // El confeti se detiene y se limpia el intervalo
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
});

// Función para lanzar confeti de verduras
function launchVeggieConfetti() {
  const veggies = ["🥦", "🥕", "🥬", "🍅", "🌽"];
  for (let i = 0; i < 5; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("veggie");
    confetti.textContent = veggies[Math.floor(Math.random() * veggies.length)];
    // Comienzo encima de la pantalla
    confetti.style.top = "-2rem";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDuration = (Math.random() * 2 + 1) + "s";
    document.body.appendChild(confetti);

    // Cuando termine la animación, se auto‐elimina
    confetti.addEventListener("animationend", () => {
      confetti.remove();
    });
  }
}

// Funcion que arranca el lanzamiento continuo de confeti
function startConfettiLoop() {
  if (!confettiInterval) {
    // Cada medio segundo lanza otra tanda
    confettiInterval = setInterval(launchVeggieConfetti, 500);
  }
}

// Manejo del formulario
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const diet = document.getElementById("diet").value;
  const descuentos = document.querySelector('input[name="descuentos"]:checked').value;

  userName.textContent = name;
  userEmail.textContent = email;
  userDiet.textContent = diet;
  discountMsg.textContent = descuentos === "sí"
    ? "¡También te van a llegar alertas de futuros descuentos!"
    : "No recibirás alertas de descuentos.";

  form.classList.add("hidden");
  thankYou.classList.remove("hidden");

  // Llamo a la funcion que inicia el confeti continuo 🎉
  startConfettiLoop();
});
