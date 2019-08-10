'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------
const gulp              = require('gulp');

// Housekeeping

const fractal           = require('./fractal.js');
const logger            = fractal.cli.console;
const path              = require('path');
const rename            = require("gulp-rename");
const shell             = require('gulp-shell');

// Sass and CSS Stuff
const sass              = require('gulp-dart-sass');
const notify            = require("gulp-notify");

// JS Things
const concat            = require('gulp-concat');

// Design Tokens
const theoG             = require('gulp-theo');
const theo              = require('theo');
const componentPath     = path.resolve(__dirname, 'src' );

// Local Server Stuff
const browserSync       = require('browser-sync').create();
const reload            = browserSync.reload;





// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// Design Tokens
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Design Tokens Template


const theoGeneratedFileWarning = `// This file has been dynamically generated from design tokens
// Please do NOT edit directly.`;
const theoSourceTokenLocation = `// Source: {{relative "${ componentPath }" meta.file}}`;

const theoGeneratedSassTemplate = `${theoGeneratedFileWarning}
${theoSourceTokenLocation}

{{#each props as |prop|}}
{{#if prop.comment}}
{{{trimLeft (indent (comment (trim prop.comment)))}}}
{{/if}}
\${{prop.name}}: {{#eq prop.type "string"}}"{{/eq}}{{{prop.value}}}{{#eq prop.type "string"}}"{{/eq}} !default;
{{/each}}
`;

const theoGeneratedMapTemplate = `${theoGeneratedFileWarning}

${theoSourceTokenLocation}

\${{stem meta.file}}-map: (
{{#each props as |prop|}}
  {{#if prop.comment}}
  {{{trimLeft (indent (comment (trim prop.comment)))}}}
  {{/if}}
  '{{prop.name}}': ({{#eq prop.type "string"}}"{{/eq}}{{{prop.value}}}{{#eq prop.type "string"}}"{{/eq}}),
{{/each}}
);
`;

const theoGeneratedPropertiesTemplate = `${theoGeneratedFileWarning}

${theoSourceTokenLocation}

:root {
  {{#each props as |prop|}}
  {{#if prop.comment}}
  {{{trimLeft (indent (comment (trim prop.comment)))}}}
  {{/if}}
  --{{prop.name}}: {{#eq prop.type "string"}}"{{/eq}}{{{prop.value}}}{{#eq prop.type "string"}}"{{/eq}};
{{/each}}
}
`;

// -----------------------------------------------------------------------------
// Design Token Formats

theo.registerFormat( "scss",`${theoGeneratedSassTemplate}`);
theo.registerFormat( "map.scss",`${theoGeneratedMapTemplate}`);
theo.registerFormat( "custom-properties.scss",`${theoGeneratedPropertiesTemplate}`);
theo.registerFormat('typography-map', result => {
  let { category, type } = result
    .get('props')
    .first()
    .toJS();
  return `${theoGeneratedFileWarning}
// Source: ${path.basename(result.getIn(['meta', 'file']))}
$${category}-map: (
${result
  .get('props')
  .map(
  prop => `
  '${prop.get("name")}': (
    'font-size': ${prop.getIn(["value", "fontSize"])},
    'font-weight': ${prop.getIn(["value", "fontWeight"])},
    'line-height': ${prop.getIn(["value", "lineHeight"])}
  ),`
  )
  .sort()
  .join('\n')}
);
  `;
});

// -----------------------------------------------------------------------------
// Design Token Transforms

theo.registerTransform("web", ["color/hex"]);


// -----------------------------------------------------------------------------
// Design Token Tasks


gulp.task('tokens:variables', () =>
  gulp.src('./design-tokens/components/*.yml')
    .pipe(theoG({
      transform: { type: 'web' },
      format: { type: 'scss' }
    }))
    .pipe(rename(function (path) {
       path.dirname += "/"+path.basename;
       path.extname = ".variables.scss";
   }))
   .pipe(gulp.dest('./components'))
);

gulp.task('tokens:typographic-scale', () =>
  gulp.src('./design-tokens/global/typography.yml')
    .pipe(theoG({
      transform: { type: 'web' },
      format: { type: 'typography-map' }
    }))
    .pipe(rename(function (path) {
      path.extname = ".map.scss";
    }))
    .pipe(gulp.dest('./design-tokens/dist/sass/maps'))
);

gulp.task('tokens:globalVariables', () =>
  gulp.src(['./design-tokens/global/*.yml', '!./design-tokens/global/typography.yml'])
    .pipe(theoG({
      transform: { type: 'web' },
      format: { type: 'scss' }
    }))
    .pipe(rename(function (path) {
       path.extname = ".variables.scss";
   }))
   .pipe(gulp.dest('./design-tokens/dist/sass/variables'))
);

gulp.task('tokens:documentation', () =>
  gulp.src(['./design-tokens/global/*.yml'])
    .pipe(theoG({
      transform: { type: 'web', includeMeta: true },
      format: { type: 'ios.json' }
    }))
    .pipe(gulp.dest('./design-tokens/dist/documentation'))
);

gulp.task('tokens:maps', () =>
  gulp.src(['./design-tokens/global/*.yml', '!./design-tokens/global/typography.yml', '!./design-tokens/global/font-family.yml'])
    .pipe(theoG({
      transform: { type: 'web' },
      format: { type: 'map.scss' }
    }))
    .pipe(gulp.dest('./design-tokens/dist/sass/maps'))
);

gulp.task('tokens:props', () =>
  gulp.src(['./design-tokens/global/*.yml', '!./design-tokens/global/typography.yml'])
    .pipe(theoG({
      transform: { type: 'web' },
      format: { type: 'custom-properties.scss' }
    }))
    .pipe(gulp.dest('./design-tokens/dist/sass/custom-properties'))
);


gulp.task('tokens', gulp.parallel(
  'tokens:maps', 'tokens:variables', 'tokens:documentation', 'tokens:props', 'tokens:globalVariables', 'tokens:typographic-scale'
));


// -----------------------------------------------------------------------------
// Sass and CSS Tasks
// -----------------------------------------------------------------------------

gulp.task('css', function() {
  return gulp.src('./assets/scss/styles.scss')
  .pipe(sass({
    includePaths: [ path.resolve(__dirname, 'components') ],
    sourcemap: true,
    sourcemapPath: './components/',
  })).on('error', notify.onError(function (error) {return "Problem file : " + error.message;}))
  .pipe(browserSync.stream())
  .pipe(gulp.dest('./public/css'));
});

// -----------------------------------------------------------------------------
// JavaScript Tasks
// -----------------------------------------------------------------------------

gulp.task('scripts', function() {
  return gulp.src(['./components/**/*.js'])
  .pipe(concat('scripts.js'))
  .pipe(gulp.dest('./public/javascript/'));
});

// -----------------------------------------------------------------------------
// Fractal Tasks
// -----------------------------------------------------------------------------

gulp.task('frctlStart', function(){
  const server = fractal.web.server({
    sync: true
  });
  server.on('error', err => logger.error(err.message));
  return server.start().then(() => {
    logger.success(`Fractal server is now running at ${server.url}`);
  });
});

gulp.task('frctlBuild', function () {
  const builder = fractal.web.builder();
  builder.on('progress', (completed, total) => logger.update(`Exported ${completed} of ${total} items`, 'info'));
  builder.on('error', err => logger.error(err.message));
  return builder.build().then(() => {
    logger.success('Fractal build completed!');
  });
});


// -----------------------------------------------------------------------------
//  Watch Tasks
// -----------------------------------------------------------------------------

gulp.task('watchCSS', function(done) {
  gulp.watch(['./assets/**/*.scss', './components/**/*.scss'], gulp.series('css')).on('change', reload);
  done();
});

gulp.task('watchJS', function(done) {
  gulp.watch('./components/blocks/**/*.js', gulp.series('scripts')).on('change', reload);
  done();
});

gulp.task('watchTokens', function(done) {
  gulp.watch(['./design-tokens/theme/*.alias.yml', './design-tokens/components/*.yml'], gulp.series('tokens:variables')).on('change', reload);
  done();
});


// -----------------------------------------------------------------------------
// Default Tasks
// -----------------------------------------------------------------------------

gulp.task('watch', gulp.parallel('watchCSS', 'watchJS', 'watchTokens'));

gulp.task('dev', gulp.series('css', 'frctlStart', 'watch'));

gulp.task('build', gulp.series('css', 'frctlBuild'));

gulp.task('create-component', shell.task( ['yo ./tools/component-generator'] ));
