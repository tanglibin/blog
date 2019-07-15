const path = require('path');
const isDev = think.env === 'development';

module.exports = [
  {
    handle: 'meta',
    options: {
      logRequest: isDev,
      sendResponseTime: isDev
    }
  },
  {
    handle: 'resource',
    enable: isDev,
    options: {
      root: path.join(think.ROOT_PATH, 'www'),
      publicPath: /^\/(static\/|home\/|admin\/|[^/]+\.(?!js|html|xml)\w+$)/
    }
  },
  {
    handle: 'trace',
    enable: !think.isCli,
    options: {
      debug: isDev
    }
  },
  {
    handle: 'payload',
    options: {
      keepExtensions: true,
      limit: '5mb',
      uploadDir: path.join(think.ROOT_PATH, 'runtime/data')
    }
  },
  {
    handle: 'router',
    options: {
      prefix: ['/']
    }
  },
  'logic',
  'controller'
];
