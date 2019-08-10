'use strict';

const path = require('path');

module.exports = {
  context: {
    colors: require(path.join(process.cwd(), 'design-tokens/dist/documentation/colors.ios.json')),
    typography: require(path.join(process.cwd(), 'design-tokens/dist/documentation/typography.ios.json')),
    family: require(path.join(process.cwd(), 'design-tokens/dist/documentation/font-family.ios.json')),
    radius: require(path.join(process.cwd(), 'design-tokens/dist/documentation/border-radius.ios.json')),
    duration: require(path.join(process.cwd(), 'design-tokens/dist/documentation/duration.ios.json')),
    spacing: require(path.join(process.cwd(), 'design-tokens/dist/documentation/spacing.ios.json')),
    opacity: require(path.join(process.cwd(), 'design-tokens/dist/documentation/opacity.ios.json'))
  }
};
