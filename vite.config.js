/*
 * @Author: Damon Liu
 * @Date: 2024-09-10 09:20:01
 * @LastEditors: Damon Liu
 * @LastEditTime: 2024-09-10 16:17:20
 * @Description: 
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import svgLoader from 'vite-svg-loader' // 使用SVG图标

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
    svgLoader()
  ],
})
