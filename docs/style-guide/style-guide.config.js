'use strict';

const path = require('path');

module.exports = {
  context: {
    colors: require(path.join(process.cwd(), 'Design-Tokens/dist/documentation/colors.ios.json'))
  }
};
