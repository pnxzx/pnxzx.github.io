<template>
  <div class="disclaimer-container">
    <h1>免责声明</h1>
    
    <section class="disclaimer-section">
      <h2>1. 非官方性质声明</h2>
      <p>
        本网站由校友个人/团队独立运营，与 <strong>{{ schoolName }}</strong> 官方无隶属关系。
        所有内容仅代表创建者个人观点，不代表学校立场。
      </p>
    </section>

    <section class="disclaimer-section">
      <h2>2. 内容责任声明</h2>
      <p>
        网站内容基于校友记忆、个人收集的资料或公开信息整理，可能存在误差。
        建议以学校官方渠道发布的信息为准。
      </p>
    </section>

    <section class="disclaimer-section">
      <h2>3. 版权与引用说明</h2>
      <p>
        部分素材（如校徽、照片等）来源于 <strong>{{ schoolName }}</strong> 或公开网络，版权归原作者所有。
        如有侵权，请联系我们删除。
      </p>
      <p>
        本网站的原创内容未经许可，禁止商业性转载或篡改。
      </p>
    </section>

    <section class="disclaimer-section">
      <h2>4. 隐私保护声明</h2>
      <p>
        本网站不会主动收集用户隐私信息。若涉及校友投稿或留言，默认视为同意公开（敏感信息将做匿名处理）。
      </p>
    </section>

    <section class="disclaimer-section">
      <h2>5. 免责条款</h2>
      <p>
        用户因使用本网站信息导致的任何损失，本网站概不负责。访问即视为同意本声明。
      </p>
    </section>
    <section class="disclaimer-section">
      <h2>6. 联系方式</h2>
      <p>
        如有疑问或建议，请联系：<a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
      </p>
      <!-- 新增 GitHub 项目链接 -->
      <p>
        本网站开源地址：
        <a :href="githubUrl" target="_blank" rel="noopener noreferrer">
          {{ githubUrl }}
        </a>
      </p>
    </section>

    <p class="update-date">最后更新于：{{ lastUpdated }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 可配置的变量
const schoolName = ref('平南县中学');
const contactEmail = ref('lyxyz5223@qq.com');
const lastUpdated = ref('2025年8月31日');
// 新增 GitHub 项目地址
const githubUrl = ref('https://github.com/pnxzx/pnxzx.github.io'); // 替换为你的项目地址
</script>

<style scoped>
.disclaimer-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: var(--color-text-strong);
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--color-text-strong);
}

.disclaimer-section {
  margin-bottom: 25px;
}

h2 {
  font-size: 1.2em;
  color: var(--color-primary);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 5px;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.update-date {
  font-size: 0.9em;
  color: var(--color-text-muted);
  text-align: right;
  margin-top: 30px;
}

a[href^="https://github.com"]::before {
  content: "🔗 ";
}
</style>
