import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SchemaUiVue',
      formats: ['es', 'cjs'],
      fileName: (format) => `schema-ui-vue.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      // vue is a peer dependency — don't bundle it
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
    outDir: 'dist-lib',
    cssCodeSplit: false,
  },
})
