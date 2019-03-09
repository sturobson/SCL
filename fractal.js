// this is in the pattern library that gets imported as a node package

'use strict';

/*
 * Dependencies
 */

const fractal    = module.exports = require('@frctl/fractal').create();
const mandelbrot = require('@frctl/mandelbrot');


fractal.set('project.title', 'Ludo');

/* Configure components */

fractal.components.set('title', 'Pattern Library');
fractal.components.set('path', `${__dirname}/patterns`);
fractal.components.set('default.preview', `@preview`);

/* Configure docs */

fractal.docs.set('path', `${__dirname}/docs`);
fractal.docs.set('indexLabel', 'Welcome');
fractal.web.set('builder.dest', __dirname + '/live');

/* Configure web */

fractal.web.set('static.path', `${__dirname}/public`);
fractal.web.set('server.sync', true);
fractal.web.set('server.syncOptions', {
    open: true,
    browser: 'default'
});
