import puppeteer from 'puppeteer'
import { logger } from '../../config/logger.js'

function buildHtml(plan) {
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 40px; line-height: 1.6; }
  header { border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
  h1 { font-size: 26px; color: #4f46e5; margin-bottom: 8px; }
  .meta { display: flex; gap: 20px; flex-wrap: wrap; font-size: 14px; color: #64748b; margin-top: 8px; }
  .meta span { background: #f1f5f9; padding: 4px 10px; border-radius: 99px; }
  section { margin-bottom: 24px; }
  h2 { font-size: 16px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; border-left: 4px solid #4f46e5; padding-left: 10px; }
  p { font-size: 14px; white-space: pre-wrap; color: #374151; }
  .tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
  .tag { background: #ede9fe; color: #5b21b6; font-size: 12px; padding: 3px 10px; border-radius: 99px; font-weight: 500; }
  footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<header>
  <h1>${plan.title}</h1>
  <div class="meta">
    <span>📚 ${plan.discipline}</span>
    <span>📅 ${formatDate(plan.scheduledAt)}</span>
  </div>
</header>

<section>
  <h2>Objetivo</h2>
  <p>${plan.objective}</p>
</section>

<section>
  <h2>Ementa</h2>
  <p>${plan.summary}</p>
</section>

<section>
  <h2>Conteúdos</h2>
  <p>${plan.contents}</p>
</section>

<section>
  <h2>Recursos</h2>
  <p>${plan.resources || 'Não informado'}</p>
</section>

${plan.tags?.length ? `
<section>
  <h2>Tags</h2>
  <div class="tags">${plan.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
</section>` : ''}

<footer>Gerado em ${new Date().toLocaleString('pt-BR')} — Sistema de Planos de Aula</footer>
</body>
</html>`
}

export async function generatePDF(plan) {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })
    const page = await browser.newPage()
    await page.setContent(buildHtml(plan), { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    })
    logger.info({ id: plan.id }, 'PDF exported')
    return pdf
  } finally {
    if (browser) await browser.close()
  }
}
