async function loadTantargyak() {
  const res = await fetch('/api/tantargyak')
  const data = await res.json()

  const ul = document.getElementById('lista')
  ul.innerHTML = ''

  data.forEach(t => {
    const li = document.createElement('li')
    li.textContent = t.nev
    console.log(t)
    ul.appendChild(li)
  })
}
loadTantargyak();