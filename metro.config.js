const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro's default resolver doesn't try `.mjs`, and lucide-react-native ships
 * its icons as ESM subpath imports (`./icons/arrow-left.mjs`). Without this
 * every icon import fails to resolve and the bundle 500s.
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

if (!config.resolver.sourceExts.includes('mjs')) {
  config.resolver.sourceExts.push('mjs');
}

module.exports = config;
