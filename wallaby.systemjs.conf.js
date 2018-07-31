var fs = require("fs");
var path = require("path");

function parseAureliaConfig() {
  var configObject = JSON.parse(fs.readFileSync('./aurelia_project/aurelia.json', 'utf8'));
  var packageName;
  var packageObject;
  var mapSection = '';
  var packagesSection = '';
  configObject.build.bundles[1].dependencies.forEach(function (item) {
    packageName = 'text';
    if (!item.name) {
      packageObject = JSON.parse(fs.readFileSync('./node_modules/' + item.toString() + '/package.json', 'utf8'));
      packageName = item.toString();
    }
    else if (item.name === 'i18next') {
      mapSection += '"i18next": "node_modules/i18next/dist/umd/",\n';
      packagesSection += '"i18next": { "main": "i18next.js" },\n';
    }
    else if (item.name !== 'text' && item.name !== 'rxjs' && item.name !== 'rxjs/operators') {
      packageObject = JSON.parse(fs.readFileSync('./node_modules/' + item.name.toString() + '/package.json', 'utf8'));
      packageName = item.name.toString();
    }
    if (packageObject.main && packageName !== 'text' && packageName !== 'i18next') {
      mapSection += '"' + packageName + '": "node_modules/' + packageName + '/' + path.dirname(packageObject.main.toString()) + '/",\n';
      packagesSection += '"' + packageName + '": { "main": "' + path.basename(packageObject.main.toString()) + '" },\n';
    }
  });

  return {
    mapSection: mapSection,
    packagesSection: packagesSection
  };
}

module.exports = function () {
  var parseObject = new parseAureliaConfig();

  return {
    files: [
      { pattern: 'node_modules/bluebird/js/browser/bluebird.core.js', instrument: false },
      { pattern: 'node_modules/systemjs/dist/system.js', instrument: false },

      { pattern: 'src/main.ts', load: false, instrument: false },
      { pattern: 'src/**/*.ts', load: false },
      { pattern: 'src/**/*.html', load: false, instrument: false },
      { pattern: 'test/unit/setup.ts', load: false }
    ],

    tests: [
      { pattern: 'test/unit/**/*.spec.ts', load: false }
    ],

    middleware: (app, express) => {
      app.use('/node_modules', express.static(require('path').join(__dirname, 'node_modules')));
    },

    setup: (function (wallaby) {
      var promises = [];
      var i = 0;
      var len = wallaby.tests.length;

      wallaby.delayStart();

      System.config({
        transpiler: false,
        paths: {
          'node_modules/*': 'node_modules/*'
        },
        map: {
          'rxjs': 'node_modules/rxjs',
          'rxjs/operators': 'node_modules/rxjs/operators',
          // mapSection
        },
        packages: {
          // packagesSection
          'rxjs': {
            main: 'index.js',
            format: 'cjs'
          },
          'rxjs/operators': {
            main: 'index.js',
            format: 'cjs'
          },
          'test/unit': { defaultExtension: 'js' },
          'src': { defaultExtension: 'js' }
        }
      });

      for (; i < len; i++) {
        promises.push(System['import'](wallaby.tests[i].replace(/\.js$/, '')));
      }

      System.import('test/unit/setup').then(function () {
        return Promise.all(promises);
      }).then(function () {
        wallaby.start();
      }).catch(function (e) {
        setTimeout(function () { throw e; }, 0);
      });
    }).toString()
      .replace('// mapSection', parseObject.mapSection)
      .replace('// packagesSection', parseObject.packagesSection),

    debug: true
  };
};
