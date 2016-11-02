'use strict';

// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------
const gulp              = require('gulp');

// Sass and CSS Stuff
const sass              = require('gulp-sass');
const sassGlob          = require('gulp-sass-glob');
const autoprefixer      = require('gulp-autoprefixer');
const notify            = require("gulp-notify");

// JS Things
const concat            = require('gulp-concat');


// Local Server Stuff
const browserSync       = require('browser-sync').create();
const reload            = browserSync.reload;

// Housekeeping

const fractal           = require('./fractal.js');
const logger            = fractal.cli.console;

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

// Sass Configarables

const autoprefixerOptions = { browsers: ['last 2 versions', '> 5%', 'Firefox ESR'] };

// -----------------------------------------------------------------------------
// Sass and CSS Tasks
// -----------------------------------------------------------------------------

gulp.task('css', function() {
  return gulp.src('./assets/scss/styles.scss')
  .pipe(sassGlob())
  .pipe(sass({
    sourcemap: true,
    sourcemapPath: './patterns/',
  })).on('error', notify.onError(function (error) {return "Problem file : " + error.message;}))
  .pipe(autoprefixer(autoprefixerOptions))
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

gulp.task('watchCSS', function(done) {
  gulp.watch('./dev/assets/**/*.scss', gulp.series('css')).on('change', reload);
  done();
});

gulp.task('watchJS', function(done) {
  gulp.watch('./patterns/blocks/**/*.js', gulp.series('scripts')).on('change', reload);
  done();
});



// -----------------------------------------------------------------------------
// Default Tasks
// -----------------------------------------------------------------------------


gulp.task('watch', gulp.parallel('watchCSS', 'watchJS'));

gulp.task('dev', gulp.parallel('frctlStart', 'css', 'watch'));
