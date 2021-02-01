

# CypressTest


I have created this repository with (npx create-nx-workspace --preset=angular) to simulate a bug -> https://github.com/nrwl/nx/issues/4590


First, i have installed the cypress-cucumber-preprocessor with npm i cypress-cucumber-preprocessor. 
Next, I have written an alternative preprocessTypescript() function by modifying the src/plugins/index.js file like so:


`
const wp = require('@cypress/webpack-preprocessor');
const { getWebpackConfig } = require('@nrwl/cypress/plugins/preprocessor');

function preprocessTypescript(config) {
  if (!config.env.tsConfig) {
    throw new Error(
      'Please provide an absolute path to a tsconfig.json as cypressConfig.env.tsConfig'
    );
  }

  const webpackConfig = getWebpackConfig(config);

  webpackConfig.node = { fs: 'empty', child_process: 'empty', readline: 'empty' };
  webpackConfig.module.rules.push({
    test: /\.feature$/,
    use: [{
      loader: 'cypress-cucumber-preprocessor/loader'
    }]
  }, {
    test: /\.features$/,
    use: [{
      loader: 'cypress-cucumber-preprocessor/lib/featuresLoader'
    }]
  });

  return async (...args) => wp({
    webpackOptions: webpackConfig
  })(...args);
}

module.exports = (on, config) => {
// `on` is used to hook into various events Cypress emits
// `config` is the resolved Cypress config
  on('file:preprocessor', wp);
// Preprocess Typescript file using Nx helper
on('file:preprocessor', preprocessTypescript(config));};
`


Finally, I have added a .cypress-cucumber-preprocessorrc file to the app-e2e folder with this configuration:

`{
"stepDefinitions": "src/support/step_definitions"
}`


in the package.json i have set "nonGlobalStepDefinitions": true


As an example I have created a feature file that visits the nx page and the implementation is in the support/step_definitions folder. 



## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests. 


my test will be passed successfully. I have no errors with the configuration in the angular.json: 
`
  "app-e2e": {
      "root": "apps\\app-e2e",
      "sourceRoot": "apps/app-e2e/src",
      "projectType": "application",
      "architect": {
        "e2e": {
          "builder": "@nrwl/cypress:cypress",
          "options": {
            "cypressConfig": "apps/app-e2e/cypress.json",
            "tsConfig": "apps/app-e2e/tsconfig.e2e.json",
            "devServerTarget": "app:serve",
            "watch": true
          },
          [...]
`

when i add in options  `headless:true`  like : 

`  "e2e": {
          "builder": "@nrwl/cypress:cypress",
          "options": {
            "cypressConfig": "apps/app-e2e/cypress.json",
            "tsConfig": "apps/app-e2e/tsconfig.e2e.json",
            "devServerTarget": "app:serve",
            "headless": true
          },
          
`


I get the following error message : 

`
Starting type checking service...
Using 1 worker with 2048MB memory limit


  1) An uncaught error was detected outside of a test

  0 passing (584ms)
  1 failing

  1) An uncaught error was detected outside of a test:
     Error: The following error originated from your test code, not from Cypress.

  > Fetching resource at '/__cypress/tests?p=src\support\index.ts' failed

When Cypress detects uncaught errors originating from your test code it will automatically fail t
he current test.

Cypress could not associate this error to any specific test.

We dynamically generated a new test to display this failure.
      at XMLHttpRequest.xhr.onerror (http://localhost:4200/__cypress/runner/cypress_runner.js:174
630:14)

`
