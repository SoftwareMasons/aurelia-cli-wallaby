const wallabyWebpack = require('wallaby-webpack');
const path = require('path');	
const AureliaPlugin = require('aurelia-webpack-plugin').AureliaPlugin;
const DefinePlugin = require('webpack').DefinePlugin;

module.exports = function (wallaby) {
  const wallabyPostprocessor = wallabyWebpack({
    entryPatterns: ['test/unit/setup.js', 'test/unit/**/*.spec.js'],
    resolve: {
      modules: [
        path.join(wallaby.projectCacheDir, 'src')
      ],
      alias: {}
    },
    module: {
      rules: [
        {test: /\.html$/i, loader: 'html-loader'}
      ]
    },
    plugins: [
      new DefinePlugin({AURELIA_WEBPACK_2_0: undefined}),
      new AureliaPlugin()
    ],
    node: {
      fs: "empty"
    }
  });

  return {
    files: [
      { pattern: 'test/unit/setup.ts', load: false, instrumented: false },
      { pattern: 'src/**/*.ts', load: false },
      { pattern: 'src/**/*.html', load: false, instrumented: false }
    ],

    tests: [
      { pattern: 'test/unit/**/*.spec.ts', load: false }
    ],

    env: {
      kind: "electron"
    },

    postprocessor: wallabyPostprocessor,

    setup: function () {
      window.__moduleBundler.loadTests();
    },

    debug: true
  };
};
