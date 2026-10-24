import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**', '平南县中学模板/**'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,vue}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        sessionStorage: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __APP_VERSION__: 'readonly',
      },
    },
    rules: {
      // 组件文件名不一定多词（Home.vue/Footer.vue 等为项目约定）
      'vue/multi-word-component-names': 'off',
      // 样式风格交给 Prettier
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      // 排版交给 Prettier
      'vue/html-indent': 'off',
      // 内容已经过 DOMPurify 过滤（markdown-processor / ForumTopic）
      'vue/no-v-html': 'off',
    },
  },
]
