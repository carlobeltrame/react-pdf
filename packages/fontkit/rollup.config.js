import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import ignore from 'rollup-plugin-ignore';
import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-polyfill-node'
import pkg from './package.json';

const cjs = {
  exports: 'named',
  format: 'cjs',
};

const es = {
  format: 'es',
};

const getCJS = override => Object.assign({}, cjs, override);
const getESM = override => Object.assign({}, es, override);

const babelConfig = ({ browser }) => ({
  babelrc: false,
  exclude: 'node_modules/**',
  babelHelpers: 'runtime',
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: false,
        ...(browser
          ? { targets: { browsers: 'last 2 versions' } }
          : { targets: { node: '12' } }),
      },
    ],
  ],
  plugins: [['@babel/plugin-transform-runtime', { version: '^7.16.4' }]],
});

const input = 'src/index.js';

const getExternal = function ({ browser }) {
  return Object.keys(pkg.dependencies)
    .filter(dep => {
      // In browsers, dfa and restructure must be transpiled and bundled, in order to avoid the error
      // "import not found: default" in apps using react-pdf through a modern ES module bundler. The
      // reason is that these modules are still written in CommonJS format.
      return !['dfa', 'restructure'].includes(dep);
    })
    .concat([
      '@babel/runtime/helpers/createForOfIteratorHelperLoose',
      '@babel/runtime/helpers/createClass',
      '@babel/runtime/helpers/applyDecoratedDescriptor',
      '@babel/runtime/helpers/defineProperty',
      '@babel/runtime/helpers/inheritsLoose',
    ])
    .concat(browser ? ['@babel/runtime/regenerator'] : ['fs', 'brotli/decompress']);
}

const getPlugins = function ({ browser, minify = false }) {
  return [
    ...(browser ? [ignore(['fs', 'brotli', 'brotli/decompress', './WOFF2Font'])] : []),
    replace({
      preventAssignment: true,
      values: {
        BROWSER: JSON.stringify(browser),
      },
    }),
    json(),

    nodeResolve({ browser, preferBuiltins: !browser }),
    commonjs({ include: [ /node_modules\// ] }),

    // babel must come after commonjs, otherwise the following error happens: 'default' is not exported by ../../node_modules/dfa/index.js
    babel(babelConfig({ browser })),
    // also transpile the modules which we bundle into the output
    // babel({
    //   ...babelConfig({ browser }),
    //   exclude: [],
    //   include: [ /node_modules\/restructure\/.*\.js/, /node_modules\/dfa\/.*\.js/ ],
    // }),

    // nodePolyfills must come after commonjs, otherwise commonjs treats all files with injected imports as es6 modules
    nodePolyfills({
      include: [ /node_modules\/.+\.js/ ]
    }),

    ...(minify ? [terser()] : []),
  ]
};

const serverConfig = {
  input,
  output: [
    getESM({ file: 'lib/fontkit.es.js' }),
    getCJS({ file: 'lib/fontkit.cjs.js' }),
  ],
  plugins: getPlugins({ browser: false }),
  external: getExternal({ browser: false }),
};

const serverProdConfig = Object.assign({}, serverConfig, {
  output: [
    getESM({ file: 'lib/fontkit.es.min.js' }),
    getCJS({ file: 'lib/fontkit.cjs.min.js' }),
  ],
  plugins: getPlugins({ browser: false, minify: true }),
});

const browserConfig = {
  input,
  output: [
    getESM({ file: 'lib/fontkit.browser.es.js' }),
    getCJS({ file: 'lib/fontkit.browser.cjs.js' }),
  ],
  external: getExternal({ browser: true }),
  plugins: getPlugins({ browser: true }),
};

const browserProdConfig = Object.assign({}, browserConfig, {
  output: [
    getESM({ file: 'lib/fontkit.browser.es.min.js' }),
    getCJS({ file: 'lib/fontkit.browser.cjs.min.js' }),
  ],
  plugins: getPlugins({ browser: true, minify: true }),
});

export default [
  serverConfig,
  serverProdConfig,
  browserConfig,
  browserProdConfig,
];
