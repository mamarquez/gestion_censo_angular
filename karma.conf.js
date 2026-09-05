// Configuración de Karma para este proyecto. Angular la usa en vez de su
// configuración interna en cuanto se referencia vía "karmaConfig" en
// angular.json, así que replica exactamente la config por defecto que genera
// @angular/build:karma (frameworks, plugins, launchers, etc.) y solo añade el
// reporter 'lcovonly', necesario para que sonar.bat pueda enviar la cobertura
// a SonarQube (sonar.javascript.lcov.reportPaths en sonar-project.properties).
const path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage')
    ],
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: path.join(__dirname, 'coverage', 'gestion_censo'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly', file: 'lcov.info' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['Chrome'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
      }
    },
    restartOnFileChange: true
  });
};
