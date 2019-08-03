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

// Sass and CSS Stuff
const sass              = require('gulp-sass');
const notify            = require("gulp-notify");

// JS Things
const concat            = require('gulp-concat');

// Design Tokens
const theoG = require('gulp-theo');
const theo = require('theo');
const componentPath = path.resolve(__dirname, 'src' );

// Local Server Stuff
const browserSync       = require('browser-sync').create();
const reload            = browserSync.reload;





// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

// Sass and CSS Configarables


// -----------------------------------------------------------------------------
// Design Tokens Tasks
// -----------------------------------------------------------------------------
theo.registerTransform("web", ["color/hex"]);

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

theo.registerFormat( "scss",`${theoGeneratedSassTemplate}`);

gulp.task('tokens:variables', () =>
  gulp.src('./Design-Tokens/patterns/*.yml')
    .pipe(theoG({
      transform: { type: 'web' },
      format: { type: 'scss' }
    }))
    .pipe(rename(function (path) {
       path.dirname += "/"+path.basename;
       path.extname = ".variables.scss";
   }))
   .pipe(gulp.dest('./patterns'))
);

gulp.task('tokens:globalVariables', () =>
  gulp.src('./Design-Tokens/global/*.yml')
    .pipe(theoG({
      transform: { type: 'web' },
      format: { type: 'scss' }
    }))
    .pipe(rename(function (path) {
       path.extname = ".variables.scss";
   }))
   .pipe(gulp.dest('./Design-Tokens/dist/sass/variables'))
);

gulp.task('tokens:documentation', () =>
  gulp.src(['./Design-Tokens/global/*.yml'])
    .pipe(theoG({
      transform: { type: 'web', includeMeta: true },
      format: { type: 'ios.json' }
    }))
    .pipe(gulp.dest('./Design-Tokens/dist/documentation'))
);

theo.registerFormat( "map.scss",`${theoGeneratedMapTemplate}`);

gulp.task('tokens:maps', () =>
  gulp.src(['./Design-Tokens/global/*.yml'])
    .pipe(theoG({
      transform: { type: 'web' },
      format: { type: 'map.scss' }
    }))
    .pipe(gulp.dest('./Design-Tokens/dist/sass/maps'))
);

theo.registerFormat( "custom-properties.scss",`${theoGeneratedPropertiesTemplate}`);

gulp.task('tokens:props', () =>
  gulp.src(['./Design-Tokens/global/*.yml'])
    .pipe(theoG({
      transform: { type: 'web' },
      format: { type: 'custom-properties.scss' }
    }))
    .pipe(gulp.dest('./Design-Tokens/dist/sass/custom-properties'))
);

gulp.task('tokens', gulp.parallel(
  'tokens:maps', 'tokens:variables', 'tokens:documentation', 'tokens:props', 'tokens:globalVariables'
));


// -----------------------------------------------------------------------------
// Sass and CSS Tasks
// -----------------------------------------------------------------------------

gulp.task('css', function() {
  return gulp.src('./assets/scss/styles.scss')
  .pipe(sass({
    includePaths: [ path.resolve(__dirname, 'patterns') ],
    sourcemap: true,
    sourcemapPath: './patterns/',
  })).on('error', notify.onError(function (error) {return "Problem file : " + error.message;}))
  .pipe(browserSync.stream())
  .pipe(gulp.dest('./public/css'));
});

// -----------------------------------------------------------------------------
// JavaScript Tasks
// -----------------------------------------------------------------------------

gulp.task('scripts', function() {
  return gulp.src(['./patterns/**/*.js'])
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
  gulp.watch(['./assets/**/*.scss', './patterns/**/*.scss'], gulp.series('css')).on('change', reload);
  done();
});

gulp.task('watchJS', function(done) {
  gulp.watch('./patterns/blocks/**/*.js', gulp.series('scripts')).on('change', reload);
  done();
});

gulp.task('watchTokens', function(done) {
  gulp.watch(['./Design-Tokens/theme/*.alias.yml', './Design-Tokens/patterns/*.yml'], gulp.series('tokens:variables')).on('change', reload);
  done();
});


// -----------------------------------------------------------------------------
// Default Tasks
// -----------------------------------------------------------------------------


gulp.task('watch', gulp.parallel('watchCSS', 'watchJS', 'watchTokens'));

gulp.task('dev', gulp.series('css', 'frctlStart', 'watch'));

gulp.task('build', gulp.series('css', 'frctlBuild'));
