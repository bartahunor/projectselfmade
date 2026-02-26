import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sql from './db.js'
import bcrypt from 'bcryptjs'

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
  const { tantargy_id } = req.query

  const rows = tantargy_id
    ? await sql`
        select temakorok.*, tantargyak.nev as tantargy
        from temakorok
        join tantargyak on tantargyak.id = temakorok.tantargy_id
        where temakorok.tantargy_id = ${tantargy_id}
        order by temakorok.nev
      `
    : await sql`
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

app.get('/api/temakorok/szuro_tantargyossz', async (req, res) => {
  const rows = await sql`
    select 
      tantargyak.nev as tantargy,
      count(*) as darab
    from temakorok
    join tantargyak on tantargyak.id = temakorok.tantargy_id
    group by tantargyak.id, tantargyak.nev
    order by tantargyak.nev
  `
  res.json(rows)
})
/* =========================
   ÉVEK
========================= */
app.get('/api/ev', async (req, res) => {
  try {
    const rows = await sql`
      SELECT DISTINCT ev
      FROM ev
      ORDER BY ev
    `
    res.json(rows)
  } catch (error) {
    console.error('❌ Év lekérési hiba:', error)
    res.status(500).json({ success: false, message: 'Szerver hiba!' })
  }
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

app.get('/api/feladatok/szuro_tanfel', async (req, res) => {
  const rows = await sql`
    select 
      tantargyak.nev as tantargy,
      count(*) as darab
    from feladatok
    join temakorok on temakorok.id = feladatok.temakor_id
    join tantargyak on tantargyak.id = temakorok.tantargy_id
    group by tantargyak.id, tantargyak.nev
    order by tantargyak.nev
  `
  res.json(rows)
})

//kombinált szűrés: év + szint + tantárgy és annak a visszahívása
let lastFilterResult = null

app.get('/api/feladatok/szuro_ev', async (req, res) => {
  const { tantargy_id, szint, ev } = req.query

  if (!tantargy_id || !szint || !ev) {
    return res.status(400).json({ error: 'tantargy_id, szint és ev paraméterek kötelezők' })
  }

  const rows = await sql`
    select
      feladatok.*,
      forrasok.szoveg as forras_szoveg,
      forrasok.kep as forras_kep,
      temakorok.nev as temakor,
      tantargyak.nev as tantargy,
      ev.ev as ev,
      ev.szint as szint
    from feladatok
    left join forrasok on forrasok.id = feladatok.forras_id
    join temakorok on temakorok.id = feladatok.temakor_id
    join tantargyak on tantargyak.id = temakorok.tantargy_id
    join ev on ev.id = feladatok.ev_id
    where tantargyak.id = ${tantargy_id}
      and ev.szint = ${szint}
      and ev.ev = ${ev}
    order by feladatok.id asc
    `

  // Eltároljuk az eredményt a cache-be
  lastFilterResult = {
    timestamp: new Date().toISOString(),
    params: { tantargy_id, szint, ev },
    data: rows
  }

  res.json(rows)
})

app.get('/api/feladatok/szuro_temakor', async (req, res) => {
  const { tantargy_id, szint, temakor_id } = req.query

  if (!tantargy_id || !szint || !temakor_id) {
    return res.status(400).json({ error: 'tantargy_id, szint és temakor_id paraméterek kötelezők' })
  }

  const rows = await sql`
    select
      feladatok.*,
      forrasok.szoveg as forras_szoveg,
      forrasok.kep as forras_kep,
      temakorok.nev as temakor,
      tantargyak.nev as tantargy,
      ev.ev as ev,
      ev.szint as szint
    from feladatok
    left join forrasok on forrasok.id = feladatok.forras_id
    join temakorok on temakorok.id = feladatok.temakor_id
    join tantargyak on tantargyak.id = temakorok.tantargy_id
    join ev on ev.id = feladatok.ev_id
    where tantargyak.id = ${tantargy_id}
      and ev.szint = ${szint}
      and temakorok.id = ${temakor_id}
    order by feladatok.id asc
  `

  lastFilterResult = {
    timestamp: new Date().toISOString(),
    params: { tantargy_id, szint, temakor_id },
    data: rows
  }

  res.json(rows)
})

// Utolsó szűrési eredmény visszaadása
app.get('/api/feladatok/utolso', (req, res) => {
  if (!lastFilterResult) {
    return res.status(404).json({ error: 'Még nincs eltárolt szűrési eredmény' })
  }

  res.json(lastFilterResult)
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


/* ======================= 
   LOGIN ÉS REGISTER
========================== */

// REGISZTRÁCIÓ
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    console.log('📥 Regisztráció kérés érkezett:', { username, email, password })

    // Validációk
    if (!username || !email || !password) {
      console.log('❌ Hiányzó mezők')
      return res.status(400).json({
        success: false,
        message: 'Minden mező kitöltése kötelező!'
      })
    }

    // Email már létezik?
    const existingEmail = await sql`
      SELECT * FROM felhasznalok WHERE email = ${email}
    `
    
    if (existingEmail.length > 0) {
      console.log('❌ Email már létezik')
      return res.status(400).json({
        success: false,
        message: 'Ez az email cím már használatban van!'
      })
    }

    // Username már létezik?
    const existingUsername = await sql`
      SELECT * FROM felhasznalok WHERE felhasznalonev = ${username}
    `
    
    if (existingUsername.length > 0) {
      console.log('❌ Username már létezik')
      return res.status(400).json({
        success: false,
        message: 'Ez a felhasználónév már foglalt!'
      })
    }

    // ✅ Jelszó hashelése
    console.log('🔒 Jelszó hashelése elkezdődött...')
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    console.log('✅ Hashelt jelszó:', hashedPassword)

    // Most a hashelt verzió kerül az adatbázisba
    const newUser = await sql`
      INSERT INTO felhasznalok (felhasznalonev, email, jelszo_hash)
      VALUES (${username}, ${email}, ${hashedPassword})
      RETURNING id, felhasznalonev, email
    `

    console.log('✅ Felhasználó létrehozva az adatbázisban!')

    res.status(201).json({
      success: true,
      message: 'Sikeres regisztráció!',
      user: {
        id: newUser[0].id,
        username: newUser[0].felhasznalonev,
        email: newUser[0].email
      }
    })

  } catch (error) {
    console.error('❌ Regisztrációs hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba történt!'
    })
  }
})

// BEJELENTKEZÉS
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    console.log('🔑 Bejelentkezési kísérlet:', email)

    // Ellenőrzés
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email és jelszó megadása kötelező!'
      })
    }

    // Felhasználó lekérése
    const users = await sql`
      SELECT * FROM felhasznalok WHERE email = ${email}
    `

    if (users.length === 0) {
      console.log('❌ Felhasználó nem található')
      return res.status(401).json({
        success: false,
        message: 'Hibás email vagy jelszó!'
      })
    }

    const user = users[0]

    // ✅ Jelszó összehasonlítása a hashelt verzióval
    console.log('🔒 Jelszó ellenőrzése...')
    const isPasswordValid = await bcrypt.compare(password, user.jelszo_hash)
    console.log(user.hash)

    if (!isPasswordValid) {
      console.log('❌ Hibás jelszó')
      return res.status(401).json({
        success: false,
        message: 'Hibás email vagy jelszó!'
      })
    }

    console.log('✅ Sikeres bejelentkezés!')

    // Sikeres bejelentkezés
    res.status(200).json({
      success: true,
      message: 'Sikeres bejelentkezés!',
      user: {
        id: user.id,
        username: user.felhasznalonev,
        email: user.email
      }
    })

  } catch (error) {
    console.error('❌ Bejelentkezési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba történt!'
    })
  }
})

/* ========================= 
   SZERVER INDÍTÁS - MINDIG A VÉGÉN!
========================= */

app.listen(3000, () => {
  console.log('Server fut: http://localhost:3000')
})