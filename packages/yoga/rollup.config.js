import commonjs from '@rollup/plugin-commonjs'

export default {
  input: './src/dist/entry-browser.js',
  output: {
    file: 'src/dist/entry-browser.es.js',
    format: 'es',
  },
  plugins: [commonjs({})],
}