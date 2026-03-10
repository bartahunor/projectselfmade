import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sql from './db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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

    // Sikeres bejelentkezés - ÚJ:
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    )

    res.status(200).json({
        success: true,
        message: 'Sikeres bejelentkezés!',
        token: token,
        user: { id: user.id, username: user.felhasznalonev, email: user.email }
    })

  } catch (error) {
    console.error('❌ Bejelentkezési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba történt!'
    })
  }
})

app.get('/api/auth/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ valid: false, message: 'Nincs token!' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        res.json({ valid: true, user: decoded })
    } catch (error) {
        res.json({ valid: false, message: 'Lejárt vagy érvénytelen token!' })
    }
})

/* =========================
   EREDMÉNYEK MENTÉSE
========================= */
let lastEredmenyek = null

function ertekelesTasks(tasks) {
  return tasks.map(({ feladat, valasz }) => {
    let ertek = 'hibas' // 'helyes', 'reszben_helyes', 'hibas'
    let pont = 0
    const maxPont = feladat.pont ?? 1

    switch (feladat.tipus) {
      case 'rovid_valasz':
      case 'hosszu_valasz':
      case 'szamossag': {
        // helyes_valasz lehet "muzulmán/muszlim/iszlám" formátumú
        const elfogadott = String(feladat.helyes_valasz)
          .split('/')
          .map(v => v.toLowerCase().trim())
        
        const valaszNormalt = valasz?.toLowerCase().trim() ?? ''
        
        if (elfogadott.some(e => valaszNormalt.includes(e))) {
          ertek = 'helyes'
          pont = maxPont
        }
        break
      }

      case 'harom_opcio':
      case 'feleletvalasztos':
      case 'igaz_hamis': {
        if (valasz === String(feladat.helyes_valasz)) {
          ertek = 'helyes'
          pont = maxPont
        }
        break
      }

      case 'tobb_valasz': {
        if (Array.isArray(valasz) && Array.isArray(feladat.helyes_valaszok)) {
          const helyesSet = feladat.helyes_valaszok.map(String)
          const valaszSet = valasz.map(String)

          const helyesDb = valaszSet.filter(v => helyesSet.includes(v)).length
          const hibásDb = valaszSet.filter(v => !helyesSet.includes(v)).length
          const osszHelyes = helyesSet.length

          
          pont = helyesDb;

          if (pont === maxPont) {
            ertek = 'helyes'
          } else if (pont > 0) {
            ertek = 'reszben_helyes'
          } else {
            ertek = 'hibas'
          }
        }
        break
      }

      case 'parosito': {
        if (valasz && typeof valasz === 'object' && feladat.helyes_valasz && typeof feladat.helyes_valasz === 'object') {
          const parok = Object.entries(feladat.helyes_valasz)
          const helyesDb = parok.filter(([key, val]) => valasz[key] === String(val)).length
          const osszDb = parok.length

          if (helyesDb === osszDb) {
            ertek = 'helyes'
            pont = maxPont
          } else if (helyesDb > 0) {
            ertek = 'reszben_helyes'
            pont = Math.round((helyesDb / osszDb) * maxPont * 10) / 10
          }
        }
        break
      }

      default:
        ertek = 'hibas'
        pont = 0
    }

    return {
      feladat_id: feladat.id,
      kerdes: feladat.kerdes,
      temakor: feladat.temakor,
      tantargy: feladat.tantargy,
      tipus: feladat.tipus,
      valasz,
      helyes_valasz: feladat.helyes_valasz ?? feladat.helyes_valaszok,
      ertek,   // 'helyes' | 'reszben_helyes' | 'hibas'
      pont,
      max_pont: maxPont
    }
  })
}

app.post('/api/eredmenyek', (req, res) => {
  const { tasks } = req.body

  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ success: false, message: 'Hiányzó tasks adat!' })
  }

  const eredmenyek = ertekelesTasks(tasks)
  const osszpont = eredmenyek.reduce((sum, e) => sum + e.pont, 0)
  const maxpont = tasks.reduce((sum, { feladat }) => sum + (feladat.pont ?? 1), 0)

  lastEredmenyek = { eredmenyek, osszpont, maxpont }
  console.log('✅ Eredmények értékelve és eltárolva:', lastEredmenyek)

  res.json({ success: true })
})

app.get('/api/eredmenyek', (req, res) => {
  if (!lastEredmenyek) {
    return res.status(404).json({ success: false, message: 'Még nincs eredmény!' })
  }

  res.json({ success: true, ...lastEredmenyek })
})

/* =========================
   TESZTEK MENTÉSE
========================= */

app.post('/api/tesztek', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ success: false, message: 'Nincs token!' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const felhasznalo_id = decoded.userId

        const { tantargy_id, nev, osszpont, maxpont } = req.body

        if (!tantargy_id || !nev || osszpont == null || maxpont == null) {
            return res.status(400).json({ success: false, message: 'Hiányzó adatok!' })
        }

        const result = await sql`
            INSERT INTO tesztek (felhasznalo_id, tantargy_id, nev, osszpont, maxpont)
            VALUES (${felhasznalo_id}, ${tantargy_id}, ${nev}, ${osszpont}, ${maxpont})
            RETURNING *
        `

        res.status(201).json({ success: true, teszt: result[0] })

    } catch (error) {
        console.error('❌ Teszt mentési hiba:', error)
        res.status(500).json({ success: false, message: 'Szerver hiba!' })
    }
})
/* ========================= 
   PROFIL STATISZTIKÁK
========================= */
//FELHASZNÁLÓ PONTJAINAK LEKÉRÉSE
app.get('/api/tesztek/stats', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ success: false, message: 'Nincs token!' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const felhasznalo_id = decoded.userId

        // Összes pont
        const osszes = await sql`
            SELECT 
                COALESCE(SUM(osszpont), 0) as osszes_pont,
                COALESCE(SUM(maxpont), 0) as osszes_maxpont,
                COUNT(*) as teszt_szam
            FROM tesztek
            WHERE felhasznalo_id = ${felhasznalo_id}
        `

        // Mai pontok
        const mai = await sql`
            SELECT 
                COALESCE(SUM(osszpont), 0) as mai_pont,
                COALESCE(SUM(maxpont), 0) as mai_maxpont,
                COUNT(*) as mai_teszt_szam
            FROM tesztek
            WHERE felhasznalo_id = ${felhasznalo_id}
              AND datum::date = CURRENT_DATE
        `

        res.json({
            success: true,
            osszes: {
                pont: osszes[0].osszes_pont,
                maxpont: osszes[0].osszes_maxpont,
                teszt_szam: osszes[0].teszt_szam
            },
            mai: {
                pont: mai[0].mai_pont,
                maxpont: mai[0].mai_maxpont,
                teszt_szam: mai[0].mai_teszt_szam
            }
        })

    } catch (error) {
        console.error('❌ Statisztika lekérési hiba:', error)
        res.status(500).json({ success: false, message: 'Szerver hiba!' })
    }
})

// RANGLISTA HELYEZÉS
app.get('/api/tesztek/ranglista', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ success: false, message: 'Nincs token!' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const felhasznalo_id = decoded.userId

        const result = await sql`
            SELECT helyezes, osszes_pont, teszt_szam FROM (
                SELECT 
                    felhasznalo_id,
                    SUM(osszpont) as osszes_pont,
                    COUNT(*) as teszt_szam,
                    RANK() OVER (ORDER BY SUM(osszpont) DESC) as helyezes
                FROM tesztek
                GROUP BY felhasznalo_id
            ) as ranglista
            WHERE felhasznalo_id = ${felhasznalo_id}
        `

        // Ha még nincs tesztje
        if (result.length === 0) {
            return res.json({ success: true, helyezes: null, osszes_pont: 0, teszt_szam: 0 })
        }

        res.json({
            success: true,
            helyezes: result[0].helyezes,
            osszes_pont: result[0].osszes_pont,
            teszt_szam: result[0].teszt_szam
        })

    } catch (error) {
        console.error('❌ Ranglista hiba:', error)
        res.status(500).json({ success: false, message: 'Szerver hiba!' })
    }
})


// FELHASZNÁLÓ TESZTJEINEK ADATAI
app.get('/api/tesztek/elozmenyek', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ success: false, message: 'Nincs token!' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const felhasznalo_id = decoded.userId

        const result = await sql`
            SELECT 
                tesztek.id,
                tesztek.nev,
                tesztek.osszpont,
                tesztek.maxpont,
                ROUND((tesztek.osszpont / tesztek.maxpont) * 100) as szazalek,
                tesztek.datum,
                tantargyak.nev as tantargy
            FROM tesztek
            JOIN tantargyak ON tantargyak.id = tesztek.tantargy_id
            WHERE tesztek.felhasznalo_id = ${felhasznalo_id}
            ORDER BY tesztek.datum DESC
        `

        res.json({ success: true, tesztek: result })

    } catch (error) {
        console.error('❌ Előzmények lekérési hiba:', error)
        res.status(500).json({ success: false, message: 'Szerver hiba!' })
    }
})

// AKTÍV NAPOK LEKÉRÉSE
app.get('/api/tesztek/aktivnapok', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const felhasznalo_id = decoded.userId

        const result = await sql`
            SELECT DISTINCT datum::date as nap
            FROM tesztek
            WHERE felhasznalo_id = ${felhasznalo_id}
            ORDER BY nap DESC
        `

        res.json({ success: true, napok: result.map(r => r.nap) })
    } catch (error) {
        res.status(500).json({ success: false })
    }
})
/* ========================= 
   SZERVER INDÍTÁS - MINDIG A VÉGÉN!
========================= */

app.listen(3000, () => {
  console.log('Server fut: http://localhost:3000')
})