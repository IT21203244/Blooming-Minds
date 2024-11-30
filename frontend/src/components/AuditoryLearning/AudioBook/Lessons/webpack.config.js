const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      https: require.resolve('https-browserify'),
      querystring: require.resolve('querystring-es3'),
      'stream': require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      os: require.resolve('os-browserify/browser'),
      fs: false, // You can use 'false' to avoid polyfilling fs
      child_process: false, // You can use 'false' to avoid polyfilling child_process

      stream: require.resolve('stream-browserify'),
      https: require.resolve('https-browserify'),
      querystring: require.resolve('querystring-es3'),
      http: require.resolve('stream-http'),
      os: require.resolve('os-browserify/browser'),
      fs: false, // Avoid polyfilling fs
      child_process: false, // Avoid polyfilling child_process
    },
  },
  // Other Webpack configurations you may have...
};
