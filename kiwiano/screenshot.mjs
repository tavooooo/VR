import { chromium } from 'playwright'
import { resolve } from 'path'

const HTML = 'file://' + resolve('/home/user/VR/kiwiano-test.html')
const OUT = '/home/user/VR/screenshots'
const PLAYERS = ['Carlos','Andrés','Marcos','Felipe','Diego','Sebastián','Tomás','Ignacio']

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

await page.goto(HTML)
await page.waitForTimeout(600)

// 1. Home
await page.screenshot({ path: `${OUT}/1-home.png` })
console.log('1 home')

// 2. Click Nuevo Torneo → config screen
await page.click('button:has-text("Nuevo Torneo")')
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/2-setup-config.png` })
console.log('2 setup config')

// 3. Click Ingresar jugadores → players screen
await page.click('button:has-text("Ingresar jugadores")')
await page.waitForTimeout(300)

// Fill in player names
const inputs = await page.locator('input[type="text"]').all()
for (let i = 0; i < Math.min(inputs.length, PLAYERS.length); i++) {
  await inputs[i].fill(PLAYERS[i])
}
await page.waitForTimeout(200)
await page.screenshot({ path: `${OUT}/3-setup-players.png` })
console.log('3 setup players')

// 4. Click Sortear → draw/revealing screen
await page.click('button:has-text("Sortear")')
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/4-draw-revealing.png` })
console.log('4 draw revealing')

// 5. Wait for pairs screen
await page.waitForTimeout(3500)
await page.screenshot({ path: `${OUT}/5-draw-pairs.png` })
console.log('5 draw pairs')

// 6. Click Ver partidos
await page.click('button:has-text("Ver partidos")')
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/6-matches-preview.png` })
console.log('6 matches preview')

// 7. Start tournament
await page.click('button:has-text("Comenzar")')
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/7-round-view.png` })
console.log('7 round view')

// 8. Fill in 2 match results
const matchCards = await page.locator('.match-card').all()
for (let i = 0; i < Math.min(matchCards.length, 2); i++) {
  const inputs = await matchCards[i].locator('input.inp-score').all()
  if (inputs.length >= 2) {
    await inputs[0].fill(String(6 + i))
    await inputs[1].fill(String(3 - i))
    await matchCards[i].locator('button:has-text("OK")').click()
    await page.waitForTimeout(200)
  }
}
await page.screenshot({ path: `${OUT}/8-round-results.png` })
console.log('8 round with results')

// 9. Click Finalizar torneo
await page.click('button:has-text("Finalizar")')
await page.waitForTimeout(600)
await page.screenshot({ path: `${OUT}/9-final-results.png` })
console.log('9 final results')

// 10. Scroll down for full table
await page.evaluate(() => window.scrollTo(0, 500))
await page.waitForTimeout(200)
await page.screenshot({ path: `${OUT}/10-final-table.png` })
console.log('10 final table')

await browser.close()
console.log('DONE')
