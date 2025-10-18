/* =======================================
   Script principal - Analyse linguistique SDL
   ======================================= */

let proxyURL = localStorage.getItem("proxyURL") || "";

document.getElementById("save-proxy").addEventListener("click", () => {
  const url = document.getElementById("proxy-url").value.trim();
  if (url) {
    proxyURL = url;
    localStorage.setItem("proxyURL", url);
    document.getElementById("status").textContent = "✅ Proxy sauvegardé avec succès !";
  } else {
    document.getElementById("status").textContent = "⚠️ Veuillez entrer une URL valide.";
  }
});

document.getElementById("send-btn").addEventListener("click", async () => {
  const input = document.getElementById("user-input").value.trim();
  const output = document.getElementById("chat-output");

  if (!input) return;
  if (!proxyURL) {
    output.innerHTML += `<p style="color:red;">⚠️ Configurez d'abord le Proxy dans la section support.</p>`;
    return;
  }

  output.innerHTML += `<p><strong>Vous :</strong> ${input}</p>`;
  document.getElementById("user-input").value = "";

  try {
    const response = await fetch(proxyURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await response.json();
    if (data && data.reply) {
      output.innerHTML += `<p><strong>IA :</strong> ${data.reply}</p>`;
    } else {
      output.innerHTML += `<p style="color:orange;">⚠️ Pas de réponse valide du serveur.</p>`;
    }

  } catch (err) {
    console.error(err);
    output.innerHTML += `<p style="color:red;">❌ Erreur de connexion au serveur Proxy.</p>`;
  }

  output.scrollTop = output.scrollHeight;
});
