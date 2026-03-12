const pool = [
  "chicken",
  "pasta",
  "spinach",
  "heavy cream",
  "mushrooms",
  "tofu",
  "soy sauce",
  "ginger",
  "garlic",
  "shrimp",
  "potatoes",
  "rosemary",
  "lemon",
  "honey",
  "salmon",
  "avocado",
  "black beans",
  "tortillas",
  "lime",
  "cilantro",
];

function randomize() {
  const count = Math.floor(Math.random() * 3) + 3;
  const shuffled = pool.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  document.getElementById("ingredients").value = selected.join(", ");
}

// ... keep pool and randomize() as they are ...

async function generate() {
  const input = document.getElementById("ingredients").value;
  if (!input) return alert("Please list some ingredients first!");

  const loader = document.getElementById("loader");
  const output = document.getElementById("output");
  const pantryInfo = document.getElementById("pantry-info");

  loader.style.display = "block";
  output.innerHTML = "";
  pantryInfo.innerText = "";

  try {
    const res = await fetch("/api/architect-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: input }),
    });
    const data = await res.json();

    pantryInfo.innerText = data.pantry_summary;
    output.innerHTML = data.recipes
      .map(
        (r) => `
      <div class="card">
        <div class="badge">${r.difficulty.toUpperCase()}</div>
        <h3>${r.name}</h3>
        <div class="time-tag">⏱ Ready in ${r.time}</div>
        
        <div class="missing-tags">
          ${
            r.missing.length > 0
              ? r.missing
                  .map((m) => `<span class="missing-item">✕ ${m}</span>`)
                  .join("")
              : '<span style="color:var(--accent); font-size: 0.8rem;">✓ All ingredients in stock</span>'
          }
        </div>
        
        <p class="instructions">${r.instructions}</p>
      </div>
    `,
      )
      .join("");
  } catch (e) {
    console.error(e);
    alert("The Chef is overwhelmed! Try again.");
  } finally {
    loader.style.display = "none";
  }
}
