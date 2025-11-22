# Arthur Loodus - Isiklik Veebileht 🚀

Modern isiklik veebileht koos kakskeelse toega (EST/ENG), öörežiimiga ja admin paneliga.

## 📁 Failide struktuur

```
arthur-website/
├── pics/                    # Pildid kaust
│   ├── arthur logo.png      # Favicon
│   ├── arthurpfp.jpg        # Profiilipilt
│   ├── rocca.jpg            # About leht
│   ├── jouks.png            # Jõusaal
│   ├── arthur1.png          # Sõbrad
│   ├── arthurgamer.png      # Gaming
│   ├── aaa.png              # Trenn
│   ├── arthurkool.jpg       # Kool
│   └── trissujaarthur.jpg   # Väljakutsed
├── index.html               # Avaleht (EST)
├── index-en.html            # Home (ENG)
├── about.html               # Minust (EST)
├── about-en.html            # About (ENG)
├── projects.html            # Pildid (EST)
├── projects-en.html         # Photos (ENG)
├── contact.html             # Kontakt (EST)
├── contact-en.html          # Contact (ENG)
├── style.css                # Üldine disain
├── server.js                # Backend server
├── admin.html               # Admin paneel
├── package.json             # Node.js sõltuvused
└── README.md                # See fail
```

## ✨ Funktsioonid

- 🌍 **Kakskeelne** - Eesti ja inglise keel
- 🌙 **Öörežiim** - Tume teema (salvestab eelistuse)
- 📱 **Responsive** - Töötab kõigil seadmetel
- 📊 **Admin paneel** - Sõnumite ja külastajate haldamine
- 🎨 **Modern disain** - Glassmorphism, animatsioonid

---

## 🚀 SAMM-SAMMULT JUHEND

### VARIANT A: Ainult Frontend (Lihtne, ilma backendita)

Kui sa EI vaja kontaktvormi ega admin paneeli:

#### 1. Loo Netlify konto
Mine: https://netlify.com ja registreeru

#### 2. Deploy
1. Mine Netlify dashboardi
2. Vajuta "Add new site" → "Deploy manually"
3. **Lohista kogu oma projekti kaust** Netlify-sse
4. Oota kuni upload lõppeb
5. Valmis! Saad URL-i nagu: `https://arthur-loodus.netlify.app`

#### ⚠️ Märkus:
- Kontaktvorm EI TÖÖTA (vajab backend serverit)
- Admin paneel EI TÖÖTA
- Kõik muu töötab!

---

### VARIANT B: Täielik lahendus backendiga (Soovitatav)

Kasutame **Railway** - see on lihtne ja tasuta!

#### 1. Valmista projekt ette VS Code'is

Ava terminal (Terminal → New Terminal) ja käivita:

```bash
npm install
```

Testi lokaalset:
```bash
npm start
```

Mine brauseris: http://localhost:3000

#### 2. Loo GitHub repo

1. Mine: https://github.com
2. Loo konto või logi sisse
3. Vajuta "+" → "New repository"
4. Nimi: `arthur-website`
5. Jäta "Public" valituks
6. Vajuta "Create repository"

#### 3. Lae projekt GitHubi

VS Code terminalis:

```bash
git init
git add .
git commit -m "Esimene commit"
git branch -M main
git remote add origin https://github.com/SINU-KASUTAJANIMI/arthur-website.git
git push -u origin main
```

(Asenda SINU-KASUTAJANIMI oma GitHub kasutajanimega)

#### 4. Deploy Railway-sse

1. Mine: https://railway.app
2. Logi sisse GitHubiga
3. Vajuta "New Project"
4. Vali "Deploy from GitHub repo"
5. Vali oma `arthur-website` repo
6. Railway tunneb automaatselt ära Node.js projekti
7. Oota kuni deploy lõppeb (~2 min)
8. Vajuta "Settings" → "Generate Domain"
9. Saad URL-i nagu: `https://arthur-website.up.railway.app`

#### 5. Valmis! ✅

- **Veebileht**: https://SINU-URL.up.railway.app
- **Admin**: https://SINU-URL.up.railway.app/admin

---

## 🔐 Admin sisselogimine

**Vaikimisi:**
- Kasutajanimi: `arthur`
- Parool: `arthur2024`

⚠️ **TÄHTIS:** Vaheta parool pärast esimest sisselogimist!

Parooli vahetamiseks muuda `server.js` failis:
```javascript
const defaultPassword = 'SINU_UUS_PAROOL';
```

Seejärel kustuta `website.db` fail ja restart server.

---

## 📊 Admin paneeli funktsioonid

| Funktsioon | Kirjeldus |
|------------|-----------|
| 👁️ Praegu kohal | Külastajad viimase 5 min jooksul |
| 📅 Tänased | Tänased unikaalsed külastajad |
| 📧 Sõnumid | Kontaktvormist tulnud sõnumid |
| ⭐ Oluline | Märgi sõnum tähtsaks |
| ✅ Loetud | Märgi sõnum loetuks |
| 🗑️ Kustuta | Eemalda sõnum |
| 🔍 Filter | Kõik / Lugemata / Olulised |

---

## 🎨 Piltide muutmine

Kõik pildid on `pics/` kaustas. Asenda need oma piltidega:

| Fail | Kasutus |
|------|---------|
| `arthur logo.png` | Favicon (brauseri tab) |
| `arthurpfp.jpg` | Profiilipilt avalehel |
| `rocca.jpg` | About/Minust leht |
| `jouks.png` | Jõusaal kaart |
| `arthur1.png` | Sõbrad kaart |
| `arthurgamer.png` | Gaming kaart |
| `aaa.png` | Trenn kaart |
| `arthurkool.jpg` | Kool kaart |
| `trissujaarthur.jpg` | Väljakutsed kaart |

---

## 🔧 Probleemide lahendamine

### "npm install ei tööta"
```bash
npm cache clean --force
npm install
```

### "Port 3000 on kasutusel"
Muuda `server.js` failis:
```javascript
const PORT = 3001;
```

### "Andmebaasi viga"
Kustuta `website.db` fail ja käivita server uuesti.

### "Kontaktvorm ei tööta Netlify-s"
See on normaalne! Netlify ei toeta Node.js serverit tasuta. Kasuta Railway'd.

### "Emojid näitavad valesid sümboleid"
Veendu, et failid on salvestatud UTF-8 kodeeringus.

---

## 📱 Kontakt

- **Email**: arthur.loodus@gmail.com
- **Telefon**: +372 5389 3493
- **Instagram**: @arthur_loodus
- **TikTok**: @looduz
- **Discord**: rickgrimes3608

---

## 🛠️ Tehnoloogiad

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Andmebaas**: SQLite
- **Turvalisus**: bcrypt, express-session

---

**Loodud: 2024**
**Autor: Arthur Loodus** 🇪🇪