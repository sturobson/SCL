// this is in the pattern library that gets imported as a node package

'use strict';

/*
 * Dependencies
 */

const fractal    = module.exports = require('@frctl/fractal').create();
const mandelbrot = require('@frctl/mandelbrot');


fractal.set('project.title', 'Simple Component Library');

/* Configure components */

fractal.components.set('title', 'Pattern Library');
fractal.components.set('path', `${__dirname}/patterns`);
fractal.components.set('default.preview', `@preview`);
fractal.components.set('ext', '.njk'); // look for files with a .nunj file extension
fractal.components.engine('@frctl/nunjucks'); /* set as the default template engine for components */

/* Configure docs */

fractal.docs.set('path', `${__dirname}/docs`);
fractal.docs.set('indexLabel', 'Welcome');
fractal.docs.set('ext', '.njk'); // look for files with a .njk file extension
fractal.docs.engine('@frctl/nunjucks'); /* you can also use the same instance for documentation, if you like! */

/* Configure web */

fractal.web.set('builder.dest', __dirname + '/live');
fractal.web.set('static.path', `${__dirname}/public`);
fractal.web.set('server.sync', true);
fractal.web.set('server.syncOptions', {
    open: true,
    browser: 'default'
});
