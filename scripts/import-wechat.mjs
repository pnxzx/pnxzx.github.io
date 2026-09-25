#!/usr/bin/env node
// scripts/import-wechat.mjs
// 公众号文章导入工具：
//   yarn node scripts/import-wechat.mjs <文章URL> [--dry-run] [--no-images] [--category 名称] [--tags a,b]
// 产出：src/content/news/<年>/<月>/<日期>-<标题>.md + 本地化的正文图片
import { JSDOM } from 'jsdom'
import TurndownService from 'turndown'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const WX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

function parseArgs(argv) {
  const args = { images: true, dryRun: false }
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--no-images') args.images = false
    else if (a === '--category') args.category = argv[++i]
    else if (a === '--tags') args.tags = argv[++i].split(',').map(s => s.trim()).filter(Boolean)
    else if (a === '--help' || a === '-h') args.help = true
    else positional.push(a)
  }
  return { args, positional }
}

function usage() {
  console.log(`用法: yarn node scripts/import-wechat.mjs <公众号文章URL> [选项]

选项:
  --dry-run       仅解析并预览结果，不写文件
  --no-images     不下载图片，保留 mmbiz.qpic.cn 外链（有防盗链风险）
  --category X    新闻分类（默认: 转载）
  --tags a,b      逗号分隔的标签`)
}

function assertWechatUrl(url) {
  let parsed
  try { parsed = new URL(url) } catch { throw new Error(`URL 无法解析: ${url}`) }
  if (parsed.hostname !== 'mp.weixin.qq.com') {
    throw new Error(`仅支持公众号文章（mp.weixin.qq.com），收到: ${parsed.hostname}`)
  }
  return parsed
}

async function fetchArticle(url) {
  const res = await fetch(url, { headers: { 'User-Agent': WX_UA } })
  if (!res.ok) throw new Error(`抓取失败: HTTP ${res.status}`)
  return res.text()
}

function decodeEntities(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
          .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
}

/** 从页面 HTML 与内联脚本中提取元数据 */
function extractMeta(html) {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const meta = (prop) => doc.querySelector(`meta[property="${prop}"]`)?.getAttribute('content')?.trim() || ''

  const title = meta('og:title') || doc.title.trim()
  if (!title) throw new Error('未能提取标题：文章可能已被删除，或触发环境验证')

  // 公众号名：var nickname = htmlDecode("...")
  const nicknameMatch = /var\s+nickname\s*=\s*htmlDecode\("([^"]*)"\)/.exec(html)
  const author = nicknameMatch ? decodeEntities(nicknameMatch[1]) : meta('og:article:author')

  // 时间：var ct = "unix秒"；回退 create_time: '...' * 1
  const ctMatch = /var\s+ct\s*=\s*"(\d{10})"/.exec(html)
  const ct2Match = /create_time:\s*'(\d{10})'\s*\*\s*1/.exec(html)
  const ts = ctMatch ? Number(ctMatch[1]) : ct2Match ? Number(ct2Match[1]) : null
  const date = ts ? new Date(ts * 1000) : null

  const description = meta('og:description') || ''
  const cover = meta('og:image') || ''

  return { title, author, date, description, cover }
}

/** 清理正文 DOM：懒加载图、占位 SVG、隐藏元素、空段落 */
function cleanContentDom(html) {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const content = doc.querySelector('#js_content')
  if (!content) throw new Error('未找到正文 #js_content：文章可能需要验证或已被删除')

  // 1) 图片：真实地址在 data-src，src 是占位
  content.querySelectorAll('img').forEach(img => {
    const real = img.getAttribute('data-src') || img.getAttribute('src') || ''
    if (real) img.setAttribute('src', real)
    img.removeAttribute('data-src')
    img.removeAttribute('data-lazy-bgimg')
    img.removeAttribute('data-ratio')
    img.removeAttribute('data-w')
  })

  // 2) SVG 占位块（公众号常用 <svg> 做背景图占位）
  content.querySelectorAll('svg').forEach(svg => svg.remove())

  // 3) 隐藏元素与交互残留
  content.querySelectorAll('[style*="display: none"], [style*="display:none"], script, style, iframe[src*="qq.com"] script').forEach(el => el.remove())
  content.querySelectorAll('section, p, span').forEach(el => {
    if (!el.textContent.trim() && !el.querySelector('img, video')) el.remove()
  })

  return { dom, doc, content }
}

/** turndown：HTML -> Markdown，图片节点收集到 pendingImages */
function buildTurndown(pendingImages) {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
  })
  td.addRule('wechat-image', {
    filter: 'img',
    replacement: (content, node) => {
      const src = node.getAttribute('src') || ''
      const alt = (node.getAttribute('alt') || '').replace(/[\[\]]/g, '')
      if (!src) return ''
      pendingImages.push({ src, alt })
      // 先用外链占位，下载完成后统一替换为本地路径
      return `![${alt}](${src})`
    }
  })
  // 公众号正文没有真正的代码/表格场景，保留默认规则即可
  return td
}

// \u4ec5\u7528\u4e8e\u6587\u4ef6/\u76ee\u5f55\u547d\u540d\uff1a\u5f3a\u5236 ASCII\uff0c\u907f\u514d Windows \u7f16\u7801\u4e0e URL \u7f16\u7801\u95ee\u9898
function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'import'
}

/** 下载图片到 public/assets/news/<slug>/，返回 外链->本地路径 映射 */
async function localizeImages(pendingImages, slugBase) {
  const unique = [...new Map(pendingImages.filter(i => i.src.startsWith('http')).map(i => [i.src, i])).values()]
  const dir = path.join('public', 'assets', 'news', slugBase)
  await mkdir(dir, { recursive: true })
  const mapping = new Map()
  let index = 1
  for (const item of unique) {
    const ext = (() => {
      const m = /\.(jpe?g|png|gif|webp)(\?|$)/i.exec(new URL(item.src).pathname)
      return m ? `.${m[1].toLowerCase()}` : '.jpg'
    })()
    const filename = `img-${String(index).padStart(2, '0')}${ext}`
    const target = path.join(dir, filename)
    process.stdout.write(`  下载图片 ${index}/${unique.length} ... `)
    try {
      const res = await fetch(item.src, { headers: { 'User-Agent': WX_UA, Referer: 'https://mp.weixin.qq.com/' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 1024) throw new Error('文件过小，疑似防盗链占位图')
      await writeFile(target, buf)
      const publicPath = `/assets/news/${slugBase}/${filename}`
      mapping.set(item.src, publicPath)
      console.log(`ok (${(buf.length / 1024).toFixed(0)}KB) -> ${publicPath}`)
    } catch (e) {
      console.log(`失败(${e.message})，保留外链`)
    }
    index++
  }
  return mapping
}

function buildFrontmatter(meta, category, tags) {
  const lines = [
    '---',
    `title: "${meta.title.replace(/"/g, '\\"')}"`,
    `date: "${meta.date.toISOString().slice(0, 10)}"`,
    `author: "${(meta.author || '佚名').replace(/"/g, '\\"')}"`,
    `category: "${category}"`,
    `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
    'featured: false',
    `summary: "${meta.description.slice(0, 120).replace(/"/g, '\\"')}"`,
    `source: "${meta.sourceUrl.replace(/"/g, '\\"')}"`,
    '---',
    '',
  ]
  return lines.join('\n')
}

async function main() {
  const { args, positional } = parseArgs(process.argv.slice(2))
  if (args.help || positional.length === 0) { usage(); process.exit(positional.length === 0 ? 1 : 0) }

  const url = assertWechatUrl(positional[0])
  console.log(`抓取文章: ${url.href}`)
  const html = await fetchArticle(url.href)

  console.log('解析元数据...')
  const meta = extractMeta(html)
  console.log(`  标题: ${meta.title}`)
  console.log(`  作者: ${meta.author || '(未提供)'}`)
  console.log(`  时间: ${meta.date ? meta.date.toLocaleDateString('zh-CN') : '(未提供)'}`)

  if (!meta.date) throw new Error('未能提取发布时间')
  meta.sourceUrl = url.href

  console.log('清理正文...')
  const { content } = cleanContentDom(html)
  const pendingImages = []
  const td = buildTurndown(pendingImages)
  const bodyMd = td.turndown(content.innerHTML)
    .replace(/\n{3,}/g, '\n\n')          // 压缩连续空行
    .replace(/ +\n/g, '\n')              // 行尾空格
    .trim()

  console.log(`正文转换完成: ${bodyMd.length} 字符, ${pendingImages.length} 张图片`)

  const dateStr = meta.date.toISOString().slice(0, 10)
  const slugBase = `${dateStr}-${slugifyTitle(meta.title)}`
  const outDir = path.join('src', 'content', 'news', dateStr.slice(0, 4), dateStr.slice(5, 7))
  const outFile = path.join(outDir, `${slugBase}.md`)

  if (existsSync(outFile)) {
    throw new Error(`目标文件已存在: ${outFile}（如需覆盖请先删除）`)
  }

  let finalMd = bodyMd
  if (args.images && pendingImages.length > 0) {
    console.log('本地化图片...')
    const mapping = await localizeImages(pendingImages, slugBase)
    for (const [remote, local] of mapping) {
      finalMd = finalMd.split(remote).join(local)
    }
  }

  const frontmatter = buildFrontmatter(meta, args.category || '转载', args.tags || ['公众号'])
  const document = frontmatter + '\n' + finalMd + '\n'

  if (args.dryRun) {
    console.log('\n===== 预览（--dry-run，未写入文件）=====')
    console.log(document.slice(0, 1500))
    console.log(`\n... (共 ${document.length} 字符)`)
    console.log(`目标路径: ${outFile}`)
    return
  }

  await mkdir(outDir, { recursive: true })
  await writeFile(outFile, document, 'utf8')
  console.log(`\n✅ 已导入: ${outFile}`)
  console.log('   运行 yarn dev 后访问 /news 即可看到新文章')
}

main().catch(e => { console.error(`\n❌ ${e.message}`); process.exit(1) })
