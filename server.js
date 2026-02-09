import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sql from './db.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

/* =========================
   TANTÁRGYAK - lekérés és létrehozás
========================= */

app.get('/api/tantargyak', async (req, res) => {
  const rows = await sql`select * from tantargyak order by nev`
  res.json(rows)
})

app.post('/api/tantargyak', async (req, res) => {
  const { nev } = req.body

  const result = await sql`
    insert into tantargyak (nev)
    values (${nev})
    returning *
  `

  res.json(result[0])
})

/* =========================
   TÉMAKÖRÖK
========================= */

app.get('/api/temakorok', async (req, res) => {
  const rows = await sql`
    select temakorok.*, tantargyak.nev as tantargy
    from temakorok
    join tantargyak on tantargyak.id = temakorok.tantargy_id
    order by temakorok.nev
  `
  res.json(rows)
})

app.post('/api/temakorok', async (req, res) => {
  const { tantargy_id, nev } = req.body

  const result = await sql`
    insert into temakorok (tantargy_id, nev)
    values (${tantargy_id}, ${nev})
    returning *
  `

  res.json(result[0])
})

/* =========================
   FORRÁSOK
========================= */

app.get('/api/forrasok', async (req, res) => {
  const rows = await sql`
    select forrasok.*
    from forrasok
    order by forrasok.id desc
  `
  res.json(rows)
})

app.post('/api/forrasok', async (req, res) => {
  const { szoveg, megjegyzes } = req.body

  const result = await sql`
    insert into forrasok (szoveg, megjegyzes)
    values (${szoveg}, ${megjegyzes})
    returning *
  `

  res.json(result[0])
})

/* =========================
   FELADATOK
========================= */

app.post('/api/feladatok', async (req, res) => {
  const {
    temakor_id,
    forras_id,
    ev,
    szint,  // új mező
    feladat_tipus,
    tipus,
    kerdes,
    valaszok,
    helyes_valasz,
    pont
  } = req.body

  const result = await sql`
    insert into feladatok
    (temakor_id, forras_id, ev, szint, feladat_tipus, tipus, kerdes, valaszok, helyes_valasz, pont)
    values (
      ${temakor_id},
      ${forras_id},
      ${ev},
      ${szint},
      ${feladat_tipus},
      ${tipus},
      ${kerdes},
      ${valaszok},
      ${helyes_valasz},
      ${pont}
    )
    returning *
  `

  res.json(result[0])
})

// Szűrés szint szerint
app.get('/api/feladatok/szint/:szint', async (req, res) => {
  const { szint } = req.params

  const rows = await sql`
    select
      feladatok.*,
      forrasok.szoveg as forras_szoveg,
      temakorok.nev as temakor,
      tantargyak.nev as tantargy
    from feladatok
    left join forrasok on forrasok.id = feladatok.forras_id
    join temakorok on temakorok.id = feladatok.temakor_id
    join tantargyak on tantargyak.id = temakorok.tantargy_id
    where feladatok.szint = ${szint}
    order by feladatok.id desc
  `

  res.json(rows)
})

// Kombinált szűrés: év + szint + témakör
app.get('/api/feladatok/ev/:ev/szint/:szint/temakor/:temakor_id', async (req, res) => {
  const { ev, szint, temakor_id } = req.params

  const rows = await sql`
    select
      feladatok.*,
      forrasok.szoveg as forras_szoveg,
      temakorok.nev as temakor,
      tantargyak.nev as tantargy
    from feladatok
    left join forrasok on forrasok.id = feladatok.forras_id
    join temakorok on temakorok.id = feladatok.temakor_id
    join tantargyak on tantargyak.id = temakorok.tantargy_id
    where feladatok.ev = ${ev} 
      and feladatok.szint = ${szint}
      and feladatok.temakor_id = ${temakor_id}
    order by feladatok.id desc
  `

  res.json(rows)
})

/* =========================
   DELETE
========================= */

app.delete('/api/feladatok/:id', async (req, res) => {
  const { id } = req.params

  await sql`delete from feladatok where id = ${id}`

  res.json({ success: true })
})

app.delete('/api/forrasok/:id', async (req, res) => {
  const { id } = req.params

  await sql`delete from forrasok where id = ${id}`

  res.json({ success: true })
})

/* ========================= */

app.listen(3000, () => {
  console.log('Server fut: http://localhost:3000')
})