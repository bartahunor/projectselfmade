window.addEventListener("DOMContentLoaded", async () => {
  await includeHTML("header", "/Pieces/header.html");
  await includeHTML("footer", "/Pieces/footer.html");

});

async function includeHTML(id, file) {  
  const response = await fetch(file);
  if (response.ok) {
    document.getElementById(id).innerHTML = await response.text();
  } else {
    console.error(`Nem sikerült betölteni: ${file}`);
  }
};