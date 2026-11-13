/** Generates responsive AVIF/WebP/JPEG variants of source images into public/img (plan §6.2). */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const jobs = [
  { src: 'assets-src/portrait/himanshu-portrait.jpg', out: 'public/img/portrait', name: 'himanshu', widths: [640, 1024, 1600, 2400] },
]
for (const j of jobs) {
  mkdirSync(j.out, { recursive: true })
  for (const w of j.widths) {
    const img = sharp(j.src).rotate().resize({ width: w, withoutEnlargement: true })
    await img.clone().avif({ quality: 50 }).toFile(`${j.out}/${j.name}-${w}.avif`)
    await img.clone().webp({ quality: 72 }).toFile(`${j.out}/${j.name}-${w}.webp`)
    if (w === 1600) await img.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(`${j.out}/${j.name}-${w}.jpg`)
  }
}
console.log('images ok')
