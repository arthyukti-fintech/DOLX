/**
 * Turns the supplied SVG files into a TypeScript module of XML strings.
 *
 * Colours are replaced with a __C__ token so a single `color` prop can tint an
 * icon at the call site. Three icons carry meaning in their colour - the green
 * up arrow, the red down arrow, the gold star - so those record a default and
 * only change when a caller asks.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCES = [path.join(ROOT, 'src/assets/icons')];

// file basename -> semantic name used by <Icon name="…" />
const NAMES = {
  Home: 'home',
  Wallet: 'wallet',
  Category: 'category',
  Profile: 'person',
  'Profile 2': 'personAlt',
  Notification: 'bell',
  Location: 'location',
  Favarotie: 'heart',
  Edit: 'edit',
  Email: 'mail',
  Call: 'phone',
  Security: 'lock',
  'Help and security': 'help',
  'Terms and condition': 'document',
  'Log out': 'logout',
  Search: 'search',
  Clock: 'clock',
  Star: 'star',
  Up: 'arrowOut',
  Down: 'arrowIn',
  Forword: 'back',
};

// Icons whose colour carries meaning rather than just matching the surface.
const SEMANTIC_DEFAULTS = {
  arrowOut: '#34A853',
  arrowIn: '#EA4335',
  star: '#FDC540',
};

const out = {};

for (const dir of SOURCES) {
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.svg')) continue;
    const base = file.replace(/\.svg$/, '');
    const name = NAMES[base];
    if (!name) {
      console.log('  SKIP (unmapped):', file);
      continue;
    }

    let xml = fs.readFileSync(path.join(dir, file), 'utf8').trim();

    // Mask ids are global once several icons render on one screen; namespace
    // them per icon so two icons can't fight over the same id.
    xml = xml.replace(/mask0_[0-9_]+/g, `dolxmask_${name}`);

    // Every literal colour becomes the tint token. `fill="none"` is structural,
    // not a colour, so it must survive.
    xml = xml.replace(/(stroke|fill)="(#[0-9a-fA-F]{3,8}|white|black)"/g, (m, attr) => `${attr}="__C__"`);

    out[name] = xml.replace(/\s*\n\s*/g, ' ');
    console.log(`  ${String(name).padEnd(10)} <- ${file}`);
  }
}

const lines = [
  '/**',
  ' * The icon set supplied with the design, inlined as SVG strings.',
  ' *',
  " * Rendered through react-native-svg's SvgXml rather than a Metro SVG",
  ' * transformer: the library is already a dependency, and this keeps the icons',
  ' * out of the build configuration entirely.',
  ' *',
  ' * `__C__` marks every colour the tint replaces at render time.',
  ' *',
  ' * Generated from the design SVGs - edit those and re-run, do not hand-edit.',
  ' */',
  '',
  'export const DOLX_ICON_XML: Record<string, string> = {',
  ...Object.entries(out).map(([k, v]) => `  ${/^[a-zA-Z]+$/.test(k) ? k : `'${k}'`}: ${JSON.stringify(v)},`),
  '};',
  '',
  '/** Icons whose colour is part of their meaning, not just their surface. */',
  'export const DOLX_ICON_DEFAULT_COLOR: Record<string, string> = {',
  ...Object.entries(SEMANTIC_DEFAULTS).map(([k, v]) => `  ${k}: '${v}',`),
  '};',
  '',
];

const target = path.join(ROOT, 'src/components/ui/dolxIconXml.ts');
fs.writeFileSync(target, lines.join('\n'));
console.log(`\n${Object.keys(out).length} icons written to ${target}`);
