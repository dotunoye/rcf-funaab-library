# 📚 RCF FUNAAB Digital Library (v2)

A clean, responsive, SEO-optimised digital library portal for departments at  
**Federal University of Agriculture, Abeokuta** — built by **Redeemed Christian Fellowship (RCF), FUNAAB**.

---

## 📁 Project Structure

```
funaab-library/
├── index.html              ← Main HTML (SEO, WhatsApp number here)
├── css/
│   └── style.css           ← All styles
├── js/
│   └── app.js              ← All logic (loads from JSON)
├── data/
│   └── departments.json    ← ⭐ YOUR DATABASE — edit this file
└── README.md
```

---

## 🚀 Running Locally in VSCode

1. Open the `funaab-library/` folder in VSCode.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` → **"Open with Live Server"**.
4. Your site opens at `http://127.0.0.1:5500`.

> ⚠️ **Important:** The site loads `departments.json` via `fetch()`.
> This requires a local server (Live Server) — it won't work if you just
> double-click `index.html` in your file manager.

---

## ✏️ Editing departments.json

This is the only file you need to edit to manage departments and libraries.

### Department structure

```json
{
  "name":    "Mechanical Engineering",
  "faculty": "College of Engineering",
  "icon":    "⚙️",
  "color":   "#4ade80",
  "live":    true,
  "levels": [
    { "level": "100", "url": "https://drive.google.com/drive/folders/FOLDER_ID" },
    { "level": "200", "url": "https://drive.google.com/drive/folders/FOLDER_ID" },
    { "level": "300", "url": "https://drive.google.com/drive/folders/FOLDER_ID" },
    { "level": "400", "url": "https://drive.google.com/drive/folders/FOLDER_ID" },
    { "level": "500", "url": "https://drive.google.com/drive/folders/FOLDER_ID" }
  ]
}
```

### Common tasks

| Task | What to do |
|------|-----------|
| **Activate a department** | Set `"live": true` and make sure all `"url"` fields have real links |
| **Add a new department** | Copy any block, update the fields, add to the array |
| **Add a level** | Add `{ "level": "600", "url": "..." }` inside the `"levels"` array |
| **Placeholder URL** | Leave `"url": ""` — the level button will appear greyed out |
| **Coming soon** | Set `"live": false` — clicking shows the coming soon screen |

### Getting a Google Drive folder link
1. Open the folder in Google Drive
2. Click **Share** → set to **"Anyone with the link"**
3. Copy the link — it looks like:  
   `https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWx`

---

## 📞 Setting Your WhatsApp Number

In `index.html`, find:
```html
href="https://wa.me/2348000000000?text=..."
```
Replace `2348000000000` with your number in international format (no `+`, no spaces):  
**Example:** +234 801 234 5678 → `2348012345678`

---

## 🌐 Deploying

| Platform | Steps |
|----------|-------|
| **GitHub Pages** | Push to GitHub → Settings → Pages → Deploy from `main` branch |
| **Netlify** | Drag & drop the whole folder at [netlify.com/drop](https://netlify.com/drop) |
| **Vercel** | Connect your GitHub repo at vercel.com |

After deploying, update the `canonical` URL and Open Graph URLs in `index.html`:
```html
<link rel="canonical" href="https://YOUR-REAL-DOMAIN.com/" />
<meta property="og:url" content="https://YOUR-REAL-DOMAIN.com/" />
```

---

## 🎨 Changing Colours

All colours are CSS variables in `css/style.css` under `:root {}`:

| Variable | Default | Role |
|---------|---------|------|
| `--accent` | `#4ade80` | Green highlights |
| `--accent2` | `#22d3ee` | Cyan gradient |
| `--bg` | `#0a0b0f` | Page background |
| `--card` | `#161820` | Card background |

---

Built with ❤️ by RCF FUNAAB
