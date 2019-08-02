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

gulp.task('tokens:documentation', () =>
  gulp.src(['./Design-Tokens/src/documentation/*.yml'])
    .pipe(theoG({
      transform: { type: 'web', includeMeta: true },
      format: { type: 'ios.json' }
    }))
    .pipe(gulp.dest('./dist/documentation'))
);

gulp.task('tokens:maps', () =>
  gulp.src(['./Design-Tokens/src/maps/*.yml'])
    .pipe(theoG({
      transform: { type: 'web' },
      format: { type: 'map.scss' }
    }))
    .pipe(gulp.dest('./Design-Tokens/dist/sass/maps'))
);

gulp.task('tokens', gulp.parallel(
  'tokens:maps', 'tokens:variables', 'tokens:documentation'
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
  gulp.watch('./Design-Tokens/patterns/*.yml', gulp.series('tokens:variables')).on('change', reload);
  done();
});


// -----------------------------------------------------------------------------
// Default Tasks
// -----------------------------------------------------------------------------


gulp.task('watch', gulp.parallel('watchCSS', 'watchJS', 'watchTokens'));

gulp.task('dev', gulp.parallel('frctlStart', 'css', 'watch'));
