/**
 * Génère les icônes de l'application (manifeste PWA + favicon), sans aucune
 * dépendance de dessin ni ressource externe : aucun outil de design n'est
 * disponible pour ce projet. Le motif est un monogramme géométrique minimal —
 * une hampe et une base évoquant un « L », dans les couleurs de la charte
 * définie par src/styles/index.css.
 *
 *   node scripts/generer-icones.mjs
 *
 * Écrit dans public/icons/ :
 *   - icon-192.png, icon-512.png       (icônes standard, coins vifs)
 *   - icon-maskable-192.png / -512.png (même motif, marge de sécurité 40 %
 *     pour le masquage adaptatif Android — https://web.dev/maskable-icon/)
 *   - apple-touch-icon.png (180×180, fond opaque : iOS ignore la transparence)
 *
 * L'encodage PNG est écrit à la main (chunks IHDR/IDAT/IEND, compression via
 * zlib du cœur de Node) : c'est peu de code pour un aplat + quelques
 * rectangles, et cela évite une dépendance native (sharp, canvas) uniquement
 * pour produire six fichiers statiques figés une fois pour toutes.
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ICI = dirname(fileURLToPath(import.meta.url))
const DEST = join(ICI, '..', 'public', 'icons')
mkdirSync(DEST, { recursive: true })

// Couleurs reprises de src/styles/index.css (thème clair).
const FOND = [0x8a, 0x3d, 0x2e] // --accent
const TRAIT = [0xfa, 0xf7, 0xf2] // --fond (clair), utilisé comme encre du monogramme

/** Crée un buffer RGBA de taille w×h, initialisé à `couleur` (+ alpha 255). */
function toile(w, h, couleur) {
  const px = new Uint8Array(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    px[i * 4] = couleur[0]
    px[i * 4 + 1] = couleur[1]
    px[i * 4 + 2] = couleur[2]
    px[i * 4 + 3] = 255
  }
  return px
}

function rect(px, w, x0, y0, x1, y1, couleur, alpha = 255) {
  for (let y = Math.max(0, y0); y < Math.min(w, y1); y++) {
    for (let x = Math.max(0, x0); x < Math.min(w, x1); x++) {
      const i = (y * w + x) * 4
      px[i] = couleur[0]
      px[i + 1] = couleur[1]
      px[i + 2] = couleur[2]
      px[i + 3] = alpha
    }
  }
}

/** Monogramme « L » : une hampe verticale et une base horizontale, épaisses. */
function dessinerMonogramme(px, w, marge) {
  const zone = w - marge * 2
  const epaisseur = Math.round(zone * 0.22)
  const hampeX = marge + Math.round(zone * 0.12)
  rect(px, w, hampeX, marge, hampeX + epaisseur, w - marge, TRAIT)
  rect(px, w, hampeX, w - marge - epaisseur, marge + zone, w - marge, TRAIT)
}

function png(w, h, px) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const typeBuf = Buffer.from(type, 'ascii')
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
    return Buffer.concat([len, typeBuf, data, crcBuf])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // profondeur : 8 bits par canal
  ihdr[9] = 6 // type couleur : RVBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  // Chaque ligne est préfixée d'un octet de filtre (0 = aucun filtre).
  const raw = Buffer.alloc(h * (1 + w * 4))
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0
    Buffer.from(px.buffer, y * w * 4, w * 4).copy(raw, y * (1 + w * 4) + 1)
  }
  const idat = deflateSync(raw)

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// CRC-32 standard (table calculée une fois), nécessaire à chaque chunk PNG.
const TABLE_CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = TABLE_CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function icone(taille, { maskable = false, opaque = false } = {}) {
  const px = toile(taille, taille, FOND)
  const marge = Math.round(taille * (maskable ? 0.28 : 0.16))
  dessinerMonogramme(px, taille, marge)
  if (!opaque) return png(taille, taille, px)
  return png(taille, taille, px) // le fond est déjà opaque (alpha 255 partout)
}

writeFileSync(join(DEST, 'icon-192.png'), icone(192))
writeFileSync(join(DEST, 'icon-512.png'), icone(512))
writeFileSync(join(DEST, 'icon-maskable-192.png'), icone(192, { maskable: true }))
writeFileSync(join(DEST, 'icon-maskable-512.png'), icone(512, { maskable: true }))
writeFileSync(join(DEST, 'apple-touch-icon.png'), icone(180, { opaque: true }))

console.log('Icônes écrites dans', DEST)
