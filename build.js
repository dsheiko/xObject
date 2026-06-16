'use strict';

const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

const SRC = 'js/source';
const DST = 'js/build';

const bundles = {
  'xObject.core':         ['xObject.core.js'],
  'xObject.widget':       ['xObject.core.js', 'xObject.widget.js'],
  'xObject.mixin':        ['xObject.core.js', 'xObject.mixin.js'],
  'xObject.interface':    ['xObject.core.js', 'xObject.interface.js'],
  'xObject.dbc':          ['xObject.core.js', 'xObject.dbc.js'],
  'xObject.widget-mixin': ['xObject.core.js', 'xObject.mixin.js', 'xObject.widget.js'],
  'xObject':              ['xObject.core.js', 'xObject.mixin.js', 'xObject.interface.js', 'xObject.dbc.js', 'xObject.widget.js'],
};

async function build() {
  if (!fs.existsSync(DST)) {
    fs.mkdirSync(DST, { recursive: true });
  }
  for (const [name, files] of Object.entries(bundles)) {
    const src = files.map(f => fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n');
    const { code } = await minify(src);
    const outPath = path.join(DST, `${name}.min.js`);
    fs.writeFileSync(outPath, code, 'utf8');
    console.log(`built ${outPath}`);
  }
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
