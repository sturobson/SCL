'use strict';

const path = require('path');

module.exports = {
  context: {
    colors: require(path.join(process.cwd(), 'Design-Tokens/dist/documentation/colors.ios.json')),
    typography: require(path.join(process.cwd(), 'Design-Tokens/dist/documentation/typography.ios.json')),
    family: require(path.join(process.cwd(), 'Design-Tokens/dist/documentation/font-family.ios.json')),
    radius: require(path.join(process.cwd(), 'Design-Tokens/dist/documentation/border-radius.ios.json')),
    duration: require(path.join(process.cwd(), 'Design-Tokens/dist/documentation/duration.ios.json')),
    spacing: require(path.join(process.cwd(), 'Design-Tokens/dist/documentation/spacing.ios.json')),
    opacity: require(path.join(process.cwd(), 'Design-Tokens/dist/documentation/opacity.ios.json'))
  }
};
