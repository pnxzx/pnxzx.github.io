<template>
  <div class="about-page">
    <header class="about-hero">
      <img :src="banner" alt="平南县中学校园" class="about-hero-image" />
      <div class="about-hero-mask">
        <h1>学校简介</h1>
        <p>八榕苍翠 · 百年平中 · 自治区示范性普通高中</p>
      </div>
    </header>

    <div class="about-container">
      <section class="about-card">
        <h2 class="section-title">百年平中</h2>
        <p class="about-text">
          平南县中学是一所自治区级示范性普通高中，坐落在广西贵港市平南县城区城东路东段、在源远流长的浔江河畔，是一所历史悠久、业绩卓著、传统优良的百年老校。学校创建于1909年，校园内有八棵大榕树，枝繁叶茂，四季常青，向来为平南县中学的象征。在百年的历史中，平中矢志不渝，历经了在黑暗中探索、在曙光中新生、在动乱中前进、在改革中开拓的艰辛和坎坷，积淀了深厚的文化底蕴，形成了独特的办学风格和优良的办学传统，为中国的革命和建设培养了数万名有用人才。
        </p>
      </section>

      <section class="about-section">
        <h2 class="section-title">办学历史</h2>
        <ol class="timeline">
          <li class="timeline-item">
            <span class="timeline-year">1909</span>
            <div class="timeline-body">
              <h3>学校创建</h3>
              <p>定名为平南县立中学，开启百年办学之路。</p>
            </div>
          </li>
          <li class="timeline-item">
            <span class="timeline-year">1962</span>
            <div class="timeline-body">
              <h3>校名定名</h3>
              <p>校名历经多次更易，正式定名为“广西平南县中学”。</p>
            </div>
          </li>
          <li class="timeline-item">
            <span class="timeline-year">1997</span>
            <div class="timeline-body">
              <h3>转为高级中学</h3>
              <p>学校由完全中学成为高级中学。</p>
            </div>
          </li>
          <li class="timeline-item">
            <span class="timeline-year">2001</span>
            <div class="timeline-body">
              <h3>自治区示范性普通高中</h3>
              <p>被评为自治区示范性普通高中立项高中之一。</p>
            </div>
          </li>
        </ol>
      </section>

      <section class="about-card plaque-card">
        <figure>
          <img :src="plaque" alt="清华大学 2020 年生源中学授牌" loading="lazy" />
          <figcaption>清华大学 2020 年生源中学授牌</figcaption>
        </figure>
        <div class="plaque-text">
          <h3>办学成果</h3>
          <p>
            百余年中，平中经历了一场场风雨的洗礼，迎接了一次次时代的挑战，成为区著名重点中学，
            令人自豪地在《中国著名中学》中占了一席之地。
          </p>
        </div>
      </section>

      <nav class="about-links" aria-label="相关页面">
        <router-link class="about-link" to="/news">
          <span class="link-title">新闻动态</span>
          <span class="link-desc">查看学校最新公告与资讯</span>
        </router-link>
        <router-link class="about-link" to="/guestbook">
          <span class="link-title">留言板</span>
          <span class="link-desc">留下你的想法与建议</span>
        </router-link>
        <router-link class="about-link" to="/contact">
          <span class="link-title">联系我们</span>
          <span class="link-desc">地址、电话与邮箱</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import banner from '@/assets/img/hero-3.webp'
import plaque from '@/assets/img/about-plaque.webp'
</script>

<style scoped>
.about-hero {
  position: relative;
  height: clamp(240px, 36vh, 360px);
  overflow: hidden;
}

.about-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
}

.about-hero-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  color: #fff;
  background: linear-gradient(180deg, rgba(0, 40, 80, 0.35), rgba(0, 40, 80, 0.62));
}

.about-hero-mask h1 {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

.about-hero-mask p {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
  letter-spacing: 0.12em;
}

.about-container {
  position: relative;
  z-index: 1;
  max-width: var(--container-width-wide);
  margin: -3rem auto 0;
  padding: 0 1rem 3rem;
}

.about-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  padding: clamp(1.25rem, 3vw, 2rem);
  margin-bottom: 2rem;
}

.about-card .section-title {
  margin: 0 0 1rem;
}

.about-text {
  margin: 0;
  text-indent: 2em;
  line-height: 1.9;
  color: var(--color-text);
}

.about-section {
  margin-bottom: 2rem;
}

.about-section .section-title {
  margin: 0 0 1.25rem;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0 0 0 0.5rem;
  border-left: 2px solid var(--color-border);
}

.timeline-item {
  position: relative;
  padding: 0 0 1.4rem 1.5rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -7px;
  top: 0.35rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-bg-page);
}

.timeline-year {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-accent);
}

.timeline-body h3 {
  margin: 0.2rem 0 0.3rem;
  font-size: 1rem;
  color: var(--color-text-strong);
}

.timeline-body p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.plaque-card {
  display: grid;
  grid-template-columns: minmax(0, 320px) 1fr;
  gap: 1.5rem;
  align-items: center;
}

.plaque-card figure {
  margin: 0;
}

.plaque-card img {
  width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.plaque-card figcaption {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: var(--color-text-faint);
  text-align: center;
}

.plaque-text h3 {
  font-family: var(--font-display);
  color: var(--color-accent);
  margin: 0 0 0.5rem;
}

.plaque-text p {
  margin: 0;
  color: var(--color-text);
  line-height: 1.8;
  font-size: 0.95rem;
}

.about-links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.about-link {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 1.1rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.about-link:hover {
  border-color: var(--color-primary-border);
  transform: translateY(-2px);
}

.link-title {
  font-weight: 600;
  color: var(--color-text-strong);
}

.link-desc {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .about-container {
    margin-top: -1.5rem;
  }

  .plaque-card {
    grid-template-columns: 1fr;
  }

  .about-links {
    grid-template-columns: 1fr;
  }
}
</style>
