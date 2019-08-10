var Generator = require('yeoman-generator');
var yosay = require('yosay');
var path = require('path');
var config = require(path.resolve('.','package.json'));

config.Config = config.Config || [];
ComponentPath = config.Config.ComponentPath || path.resolve(__dirname, '../../components');

module.exports = class extends Generator {
  prompting() {
    this.log((
      " Component Generator \n"
    ));

    var prompts = [{
      type: 'input',
      name: 'componentName',
      required: true,
      message: 'What\'s the name of your component?',
      description: 'Component name'
    }, {
      type: 'confirm',
      name: 'npm',
      message: 'Will this be published to npm?',
      default: true
    }];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
    }.bind(this));
  }

  writing() {

    var patternType = this.props.type;
    var totalPath = ComponentPath + '/' + this.props.componentName + "/";
    var fileName = this.props.componentName;

    var outputFile = fileName + '.njk';
    this.fs.copyTpl(
      this.templatePath('_component.njk'),
      this.destinationPath(totalPath + outputFile),
      {
        componentName: fileName
      }
    );

    var outputFile = fileName + '.scss';
    this.fs.copyTpl(
      this.templatePath('_component.scss'),
      this.destinationPath(totalPath + outputFile),
      {
        componentName: fileName
      }
    );

    var outputFile = fileName + '.variables.scss';
    this.fs.copyTpl(
      this.templatePath('_component.variables.scss'),
      this.destinationPath(totalPath + outputFile),
      {
        componentName: fileName
      }
    );

    var outputFile = fileName + '.mixes.scss';
    this.fs.copyTpl(
      this.templatePath('_component.mixes.scss'),
      this.destinationPath(totalPath + outputFile),
      {
        componentName: fileName
      }
    );

    var outputFile = fileName + '.js';
    this.fs.copyTpl(
      this.templatePath('_component.js'),
      this.destinationPath(totalPath + outputFile),
      {
        componentName: fileName
      }
    );

    var outputFile = fileName + '.config.yml';
    this.fs.copyTpl(
      this.templatePath('_component.config.yml'),
      this.destinationPath(totalPath + outputFile),
      {
        componentType: patternType,
        componentName: fileName
      }
    );

    this.fs.copyTpl(
      this.templatePath('_README.md'),
      this.destinationPath(totalPath + 'README.md'),
      {
        componentName: fileName
      }
    );

    this.fs.copyTpl(
      this.templatePath('_CHANGELOG.md'),
      this.destinationPath(totalPath + 'CHANGELOG.md'),
      {
        componentName: fileName
      }
    );

    if (this.props.npm) {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath(totalPath + 'package.json'),
        {
          componentName: fileName,
          componentHomepage: config.Config.Homepage,
          componentStylesheet: fileName + '.scss'
        }
      );
    }

    if (this.props.npm) {
      this.fs.copyTpl(
        this.templatePath('_.npmignore'),
        this.destinationPath(totalPath + '.npmignore'),
        {
          componentName: fileName
        }
      );
    }

    if (this.props.npm) {
      this.fs.copyTpl(
        this.templatePath('_index.scss'),
        this.destinationPath(totalPath + 'index.scss'),
        {
          componentName: fileName
        }
      );
    }
  }
};
