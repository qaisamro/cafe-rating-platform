const { getDefaultConfig } = require('expo/metro-config');
const { createProxyMiddleware } = require('http-proxy-middleware');

const config = getDefaultConfig(__dirname);

config.server = {
  enhanceMiddleware: (metroMiddleware) => {
    return (req, res, next) => {
      if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
        createProxyMiddleware({
          target: 'http://localhost:3000',
          changeOrigin: true,
          logLevel: 'silent',
        })(req, res, next);
      } else {
        metroMiddleware(req, res, next);
      }
    };
  },
};

module.exports = config;
