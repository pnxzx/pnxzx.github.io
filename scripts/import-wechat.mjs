#!/usr/bin/env node
// scripts/import-wechat.mjs
// 公众号文章导入工具：
//   yarn node scripts/import-wechat.mjs <文章URL> [--dry-run] [--no-images] [--category 名称] [--tags a,b]
// 产出：src/content/news/<年>/<月>/<日期>-<标题>.md + 本地化的正文图片
//
// 清洗策略（针对公众号文章的通用模板特征）：
// - 移除模板文字：点击蓝字/关注我们/长按识别/二维码等
// - 移除章节徽章数字（孤立的 1/2/3...行）
// - 落款（出品|文稿|编辑|...）收集为文末引用块
// - 落款之后的尾图（宣传图/二维码）默认移除（--keep-footer-images 保留）
// - 图片分类：重复>=3次、宽高比>=3（横幅/分隔线）、<2KB（图标）判为装饰图并移除
// - 结构化：中文序号小节行提升为 Markdown 标题
// - summary 缺失或与标题相同时，从正文首段生成
import { JSDOM } from 'jsdom'
import TurndownService from 'turndown'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const WX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const HOTLINK_REFERER = 'https://mp.weixin.qq.com/'

// ---------- 参数 ----------
function parseArgs(argv) {
  const args = { images: true, dryRun: false }
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--no-images') args.images = false
    else if (a === '--keep-footer-images') args.keepFooterImages = true
    else if (a === '--category') args.category = argv[++i]
    else if (a === '--tags') args.tags = argv[++i].split(',').map(s => s.trim()).filter(Boolean)
    else if (a === '--help' || a === '-h') args.help = true
    else positional.push(a)
  }
  return { args, positional }
}

function usage() {
  console.log([
    '用法: yarn node scripts/import-wechat.mjs <公众号文章URL> [选项]',
    '',
    '选项:',
    '  --dry-run             仅解析并预览结果，不写文件',
    '  --no-images           不下载图片，保留 mmbiz.qpic.cn 外链（有防盗链风险）',
    '  --keep-footer-images  保留落款后的尾图（默认移除宣传图/二维码等模板尾图）',
    '  --category X          新闻分类（默认: 转载）',
    '  --tags a,b            逗号分隔的标签',
  ].join('\n'))
}

function assertWechatUrl(url) {
  let parsed
  try { parsed = new URL(url) } catch { throw new Error('URL 无法解析: ' + url) }
  if (parsed.hostname !== 'mp.weixin.qq.com') {
    throw new Error('仅支持公众号文章（mp.weixin.qq.com），收到: ' + parsed.hostname)
  }
  return parsed
}

async function fetchArticle(url) {
  const res = await fetch(url, { headers: { 'User-Agent': WX_UA } })
  if (!res.ok) throw new Error('抓取失败: HTTP ' + res.status)
  return res.text()
}

function decodeEntities(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
          .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
}

// ---------- 元数据 ----------
function extractMeta(html) {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const meta = (prop) => doc.querySelector('meta[property="' + prop + '"]')?.getAttribute('content')?.trim() || ''

  const title = meta('og:title') || doc.title.trim()
  if (!title) throw new Error('未能提取标题：文章可能已被删除，或触发环境验证')

  const nicknameMatch = /var\s+nickname\s*=\s*htmlDecode\("([^"]*)"\)/.exec(html)
  const author = nicknameMatch ? decodeEntities(nicknameMatch[1]) : meta('og:article:author')

  const ctMatch = /var\s+ct\s*=\s*"(\d{10})"/.exec(html)
  const ct2Match = /create_time:\s*'(\d{10})'\s*\*\s*1/.exec(html)
  const ts = ctMatch ? Number(ctMatch[1]) : ct2Match ? Number(ct2Match[1]) : null
  const date = ts ? new Date(ts * 1000) : null

  const description = meta('og:description') || ''
  return { title, author, date, description }
}

// ---------- 图片尺寸探测（JPEG/PNG/GIF 头解析） ----------
function probeImageSize(buf) {
  try {
    if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50) { // PNG
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
    }
    if (buf.length > 10 && buf[0] === 0x47 && buf[1] === 0x49) { // GIF
      return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) }
    }
    if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) { // JPEG
      let off = 2
      while (off + 9 < buf.length) {
        if (buf[off] !== 0xff) { off++; continue }
        const marker = buf[off + 1]
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) }
        }
        off += 2 + buf.readUInt16BE(off + 2)
      }
    }
  } catch { /* 探测失败按未知处理 */ }
  return null
}

// ---------- 模板内容识别 ----------
const JUNK_PATTERNS = [
  /点击.{0,6}蓝字/,
  /^关注\s*我们$/,
  /^长按识别/,
  /^微信搜?一搜$/,
  /^扫一?扫.{0,6}关注/,
  /^扫码关注/,
  /^戳.{0,4}蓝字/,
]

function isJunkText(text) {
  const t = text.trim()
  if (!t || t.length > 30) return false
  return JUNK_PATTERNS.some(re => re.test(t))
}

// 孤立的数字行：公众号章节徽章残留
function isSectionBadge(text) {
  return /^\d{1,2}$/.test(text.trim())
}

// 落款行：出品| 文稿| 编辑| ...
const CREDIT_RE = /^(出品|监制|策划|文稿|文字|供图|图片|摄影|排版|编辑|校对|初审|复审|审核|终审|签发|来源|作者)\s*[|｜:：]\s*(.*)$/

// ---------- 正文 DOM 清洗 ----------
function cleanContentDom(html) {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const content = doc.querySelector('#js_content')
  if (!content) throw new Error('未找到正文 #js_content：文章可能需要验证或已被删除')

  // 图片：真实地址在 data-src
  content.querySelectorAll('img').forEach(img => {
    const real = img.getAttribute('data-src') || img.getAttribute('src') || ''
    if (real) img.setAttribute('src', real)
    img.removeAttribute('data-src')
    img.removeAttribute('data-lazy-bgimg')
    img.removeAttribute('data-ratio')
    img.removeAttribute('data-w')
  })

  // 占位与脚本
  content.querySelectorAll('svg, script, style').forEach(el => el.remove())

  // 文本清理 + 落款收集（document 顺序）
  const allElements = [...content.querySelectorAll('*')]
  const creditElements = []
  const credits = [] // { role, name }

  for (const el of allElements) {
    if (el.children.length > 0) continue // 只处理叶子文本块
    const text = (el.textContent || '').trim()
    if (!text) continue

    if (isJunkText(text) || isSectionBadge(text)) {
      el.remove()
      continue
    }
    const creditMatch = CREDIT_RE.exec(text)
    if (creditMatch && text.length <= 30) {
      credits.push({ role: creditMatch[1], name: creditMatch[2].trim() })
      creditElements.push(el)
    }
  }

  // 落款之后的图片：视为模板尾图（宣传图/二维码）。
  // 注意：必须用"已移除前的记录"判断——被 remove 的节点再用
  // compareDocumentPosition 会返回不可靠的位置（含 CONTAINED_BY 位），
  // 曾导致全部正文图片被误判为尾图。改用 NodeIterator 按文档序判断：
  if (creditElements.length > 0) {
    const lastCredit = creditElements[creditElements.length - 1]
    const walker = doc.createTreeWalker(content, dom.window.NodeFilter.SHOW_ELEMENT)
    let current = walker.nextNode()
    let afterCredit = false
    while (current) {
      if (current === lastCredit) {
        afterCredit = true
      } else if (afterCredit && current.nodeName === 'IMG') {
        current.setAttribute('data-importer-footer', '1')
      }
      current = walker.nextNode()
    }
  }

  // 统一移除落款元素（尾图标记完成后）
  creditElements.forEach(el => el.remove())

  // 空段落
  content.querySelectorAll('section, p, span').forEach(el => {
    if (!el.textContent.trim() && !el.querySelector('img, video')) el.remove()
  })

  return { content, credits }
}

// ---------- HTML -> Markdown ----------
function buildTurndown(pendingImages) {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  })
  td.addRule('wechat-image', {
    filter: (node) => node.nodeName === 'IMG' && !node.getAttribute('data-importer-footer'),
    replacement: (content, node) => {
      const src = node.getAttribute('src') || ''
      const alt = (node.getAttribute('alt') || '').replace(/[[\]]/g, '')
      if (!src) return ''
      pendingImages.push({ src, alt })
      return '![' + alt + '](' + src + ')'
    }
  })
  td.addRule('footer-image', {
    filter: (node) => node.nodeName === 'IMG' && node.getAttribute('data-importer-footer') === '1',
    replacement: () => ''
  })
  return td
}

// 中文序号小节 → Markdown 标题
function promoteHeadings(md) {
  const NO_PUNCT = /[。！？，,；;：:]/
  return md.split('\n').map(line => {
    const bare = line.replace(/\*\*/g, '').trim()
    const m1 = /^([一二三四五六七八九十]{1,3})\s*、\s*([^。！？，,；;：:]{1,22}?)$/.exec(bare)
    if (m1) return '## ' + bare.replace(/[。.]\s*$/, '')
    const m2 = /^（[一二三四五六七八九十]{1,3}）\s*([^。！？，,；;：:]{1,20}?)$/.exec(bare)
    if (m2) return '### ' + bare.replace(/[。.]\s*$/, '')
    return line
  }).join('\n')
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stripDecorativeImages(md, decorativeUrls) {
  let out = md
  for (const url of decorativeUrls) {
    // 仅移除整行图片；混排在文字中的保守保留
    const re = new RegExp('^[ \\t]*!\\[[^\\]]*\\]\\(' + escapeRegExp(url) + '\\)[ \\t]*$\\n?', 'gm')
    out = out.replace(re, '')
  }
  return out
}

function buildCreditsBlock(credits) {
  if (credits.length === 0) return ''
  const line = credits.map(c => c.role + '：' + c.name).join('　|　')
  return '> ' + line + '\n'
}

// 仅用于文件/目录命名：强制 ASCII，避免 Windows 编码与 URL 编码问题
function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'import'
}

// ---------- 图片下载与分类 ----------
async function downloadAndClassify(pendingImages) {
  const unique = [...new Map(pendingImages.filter(i => i.src.startsWith('http')).map(i => [i.src, i])).values()]
  const repeatCount = new Map()
  for (const p of pendingImages) {
    repeatCount.set(p.src, (repeatCount.get(p.src) || 0) + 1)
  }

  const results = [] // { src, alt, buf, dims, decorative }
  let index = 1
  for (const item of unique) {
    process.stdout.write('  下载图片 ' + index + '/' + unique.length + ' ... ')
    try {
      const res = await fetch(item.src, { headers: { 'User-Agent': WX_UA, Referer: HOTLINK_REFERER } })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const buf = Buffer.from(await res.arrayBuffer())
      const dims = probeImageSize(buf)
      const repeats = repeatCount.get(item.src)
      let decorative = false
      let reason = ''
      if (repeats >= 3) { decorative = true; reason = '重复' + repeats + '次(分隔图)' }
      else if (dims && dims.width / dims.height >= 3) { decorative = true; reason = '宽高比' + (dims.width / dims.height).toFixed(1) + '(横幅/分隔线)' }
      else if (buf.length < 2048) { decorative = true; reason = '文件过小(图标)' }
      console.log((dims ? dims.width + 'x' + dims.height : '尺寸未知') + ' ' + repeats + '次 ' + (buf.length / 1024).toFixed(0) + 'KB ' + (decorative ? '-> 装饰图(' + reason + ')' : '-> 内容图'))
      results.push({ ...item, buf, dims, decorative })
    } catch (e) {
      console.log('下载失败(' + e.message + ')，保留外链')
      results.push({ ...item, buf: null, decorative: false, keepRemote: true })
    }
    index++
  }
  return results
}

// ---------- 摘要 ----------
function deriveSummary(md, title) {
  const text = md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')   // 图片
    .replace(/^#{1,6}\s+/gm, '')            // 标题符
    .replace(/[*_>`[\]#]/g, '')
    .split('\n').map(s => s.trim()).filter(s => s.length > 15)[0] || ''
  const base = text || title
  return base.length > 100 ? base.slice(0, 100) + '…' : base
}

function buildFrontmatter(meta, category, tags) {
  return [
    '---',
    'title: "' + meta.title.replace(/"/g, '\\"') + '"',
    'date: "' + meta.date.toISOString().slice(0, 10) + '"',
    'author: "' + (meta.author || '佚名').replace(/"/g, '\\"') + '"',
    'category: "' + category + '"',
    'tags: [' + tags.map(t => '"' + t + '"').join(', ') + ']',
    'featured: false',
    'summary: "' + meta.summary.replace(/"/g, '\\"') + '"',
    'source: "' + meta.sourceUrl.replace(/"/g, '\\"') + '"',
    '---',
    '',
  ].join('\n')
}

// ---------- 主流程 ----------
async function main() {
  const { args, positional } = parseArgs(process.argv.slice(2))
  if (args.help || positional.length === 0) { usage(); process.exit(positional.length === 0 ? 1 : 0) }

  const url = assertWechatUrl(positional[0])
  console.log('抓取文章: ' + url.href)
  const html = await fetchArticle(url.href)

  console.log('解析元数据...')
  const meta = extractMeta(html)
  console.log('  标题: ' + meta.title)
  console.log('  作者: ' + (meta.author || '(未提供)'))
  console.log('  时间: ' + (meta.date ? meta.date.toLocaleDateString('zh-CN') : '(未提供)'))
  if (!meta.date) throw new Error('未能提取发布时间')
  meta.sourceUrl = url.href

  console.log('清理正文（模板文字/徽章/落款）...')
  const { content, credits } = cleanContentDom(html)
  if (credits.length > 0) console.log('  收集落款 ' + credits.length + ' 条')

  const pendingImages = []
  const td = buildTurndown(pendingImages)
  let bodyMd = td.turndown(content.innerHTML)
    .replace(/^(\d+)\\./gm, '$1.')  // turndown 转义的 "1\."
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ +\n/g, '\n')
    .trim()

  console.log('结构化（小节标题提升）...')
  bodyMd = promoteHeadings(bodyMd)

  const dateStr = meta.date.toISOString().slice(0, 10)
  const slugBase = dateStr + '-' + slugifyTitle(meta.title)
  const outDir = path.join('src', 'content', 'news', dateStr.slice(0, 4), dateStr.slice(5, 7))
  const outFile = path.join(outDir, slugBase + '.md')
  if (existsSync(outFile)) throw new Error('目标文件已存在: ' + outFile + '（如需覆盖请先删除）')

  let finalMd = bodyMd
  const imgDirRel = '/assets/news/' + slugBase

  if (args.images && pendingImages.length > 0) {
    const uniqueCount = new Set(pendingImages.map(i => i.src)).size
    console.log('下载与分类图片（共 ' + uniqueCount + ' 张）...')
    const classified = await downloadAndClassify(pendingImages)
    const decorativeUrls = classified.filter(c => c.decorative).map(c => c.src)
    if (decorativeUrls.length > 0) finalMd = stripDecorativeImages(finalMd, decorativeUrls)

    const contentImages = classified.filter(c => !c.decorative)
    const publicDir = path.join('public', 'assets', 'news', slugBase)
    await mkdir(publicDir, { recursive: true })
    const mapping = new Map()
    let n = 1
    for (const item of contentImages) {
      if (!item.buf) { mapping.set(item.src, item.src); continue } // 下载失败保留外链
      const ext = (() => {
        try {
          const m = /\.(jpe?g|png|gif|webp)(\?|$)/i.exec(new URL(item.src).pathname)
          return m ? '.' + m[1].toLowerCase() : '.jpg'
        } catch { return '.jpg' }
      })()
      const filename = 'img-' + String(n).padStart(2, '0') + ext
      await writeFile(path.join(publicDir, filename), item.buf)
      mapping.set(item.src, imgDirRel + '/' + filename)
      console.log('  内容图 ' + filename + ' (' + (item.buf.length / 1024).toFixed(0) + 'KB)')
      n++
    }
    for (const [remote, local] of mapping) {
      if (remote !== local) finalMd = finalMd.split(remote).join(local)
    }
  }

  const creditsBlock = buildCreditsBlock(credits)
  finalMd = finalMd.replace(/\n{3,}/g, '\n\n').trim()
  meta.summary = (meta.description && meta.description !== meta.title)
    ? meta.description.slice(0, 120)
    : deriveSummary(finalMd, meta.title)

  const document = buildFrontmatter(meta, args.category || '转载', args.tags || ['公众号'])
    + '\n' + finalMd + '\n'
    + (creditsBlock ? '\n' + creditsBlock : '')

  if (args.dryRun) {
    console.log('\n===== 预览（--dry-run，未写入文件）=====')
    console.log(document.slice(0, 2200))
    console.log('\n... (共 ' + document.length + ' 字符)')
    console.log('目标路径: ' + outFile)
    return
  }

  await mkdir(outDir, { recursive: true })
  await writeFile(outFile, document, 'utf8')
  console.log('\n✅ 已导入: ' + outFile)
  console.log('   运行 yarn dev 后访问 /news 即可看到新文章')
}

main().catch(e => { console.error('\n❌ ' + e.message); process.exit(1) })
