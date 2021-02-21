const path = require('path');

const aliases = {};

const babelLoaderConfig = {
  loader: 'babel-loader',
  options: {
    plugins: [
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
    ],
    presets: ['@babel/typescript'],
  },
};

const baseConfig = {
  entry: [path.join(process.cwd(), 'src/index.ts')],
  // output: {
  //   filename: 'bundle.js',
  //   path: path.resolve(process.cwd(), 'dist'),
  //   library: 'svg-to-excalidraw',
  //   libraryTarget: 'umd',
  //   publicPath: '/static/',
  //   umdNamedDefine: true,
  // },
  mode: 'production',
  devtool: 'eval-source-map',
  resolve: {
    alias: { ...aliases },
    extensions: ['.js', '.mjs', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        include: path.join(process.cwd(), 'src'),
        use: [babelLoaderConfig],
      },
      {
        test: /\.m?js$/,
        include: path.join(process.cwd(), 'src'),
        use: [babelLoaderConfig],
      },
    ],
  },
};

const umdConfig = {
  ...baseConfig,
  output: {
    filename: 'bundle.js',
    path: path.resolve(process.cwd(), 'dist'),
    library: 'svg-to-excalidraw',
    libraryTarget: 'umd',
    publicPath: '/static/',
    umdNamedDefine: true,
  },
}

const esmConfig = {
  ...baseConfig,
  output: {
    filename: 'esm-bundle.js',
    path: path.resolve(process.cwd(), 'dist'),
    libraryTarget: 'module',
    publicPath: '/static/',
    umdNamedDefine: true,
    module: true,
  },
  experiments: {
    outputModule: true,
  },
};

module.exports = [umdConfig, esmConfig];
