var Generator = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var config = require(path.resolve('.','package.json'));

config.vfConfig = config.vfConfig || [];
vfName = config.vfConfig.vfName || "Visual Framework 2.0";
vfNamespace = config.vfConfig.vfNamespace || "vf-";
vfComponentPath = config.vfConfig.vfComponentPath || path.resolve(__dirname, '../../components');

module.exports = class extends Generator {
  prompting() {
    this.log((
      chalk.blue.bold("   ___  __   _  _  ____   __   __ _  ____  __ _  ____  \n") +
      chalk.blue.bold("  / __)/  \ ( \/ )(  _ \ /  \ (  ( \(  __)(  ( \(_  _) \n") +
      chalk.blue.bold(" ( (__(  O )/ \/ \ ) __/(  O )/    / ) _) /    /  )(   \n") +
      chalk.blue.bold("  \___)\__/ \_)(_/(__)   \__/ \_)__)(____)\_)__) (__)  \n") +
      chalk.blue.bold("   ___  ____  __ _  ____  ____   __  ____  __  ____    \n") +
      chalk.blue.bold("  / __)(  __)(  ( \(  __)(  _ \ / _\(_  _)/  \(  _ \   \n") +
      chalk.blue.bold(" ( (_ \ ) _) /    / ) _)  )   //    \ )( (  O ))   /   \n") +
      chalk.blue.bold("  \___/(____)\_)__)(____)(__\_)\_/\_/(__) \__/(__\_)   \n")
    ));

    var componentType = ['element', 'block', 'container', 'grid', 'boilerplate'];
    if (vfNamespace != 'vf-') {
      var DepartmentType = [vfName, 'VF Global'];
    } else {
      var DepartmentType = [vfName];
    }

    var prompts = [{
      type: 'list',
      name: 'type',
      required: true,
      message: 'What type of component is this?',
      choices: componentType
    }, {
      type: 'input',
      name: 'componentName',
      required: true,
      message: 'What\'s the name of your component? (all lowercase, a hyphen instead of space, will be prefixed with your project\'s namespace.)',
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

    switch (this.props.dept) {
      case vfName:
      var namespace = vfNamespace;
      break;
      case "VF Global":
      var namespace = "vf-";
      break;
    }
    var patternType = this.props.type;
    var totalPath = vfComponentPath + '/' + namespace + this.props.componentName + "/";
    var fileName = namespace + this.props.componentName;

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
      this.templatePath('_.npmignore'),
      this.destinationPath(totalPath + '.npmignore'),
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
          componentHomepage: config.vfConfig.vfHomepage,
          componentStylesheet: fileName + '.scss'
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
