const path = require('path');
const babel = require('babel-core');

module.exports = {
  assetRoot: path.resolve(__dirname),
  outputDir: path.resolve(__dirname, 'doc'),
  strict: false,
  serializer: [ 'megadoc-html-serializer', {
    favicon: null,
    theme: [ 'megadoc-theme-qt', ],
    tooltipPreviews: false,
    title: 'PAMM',
    rewrite: {
      'articles/readme': '/index.html',
    }
  }],
  sources: [
    {
      id: 'articles',
      pattern: /\.md$/,
      include: [
        'README.md',
        'gems/happybara/README.md',
        'packages/*/README.md',
      ],

      processor: [ 'megadoc-plugin-markdown', {
        id: 'articles',
        title: 'Articles',
        fullFolderTitles: true,
        discardIdPrefix: /\d+\-{1}/,
      }]
    },

    {
      id: 'js',
      test: /\.js$/,
      include: [
        path.resolve(__dirname, 'packages/*/src/**.js'),
      ],
      exclude: [
        /node_modules/,
        /\.test\.js$/,
      ],

      processor: [ 'megadoc-plugin-js', {
        id: 'js',
        strict: false,
        parse: function(str, filePath) {
          return babel.transform(str, {
            filename: filePath,
            code: true,
            ast: true,
            comments: true,
            babelrc: false,
            presets: [ ['es2015', { modules: false }], 'react' ],
            plugins: [
              'syntax-async-functions',
              'transform-regenerator'
            ]
          }).ast
        },
        // parserOptions: {
        //   babelrc: false,
        //   presets: [ ['es2015'], 'react' ],
        //   plugins: [
        //     'syntax-async-functions',
        //     'transform-regenerator'
        //   ]
        // }
      }]
    }
  ]
}