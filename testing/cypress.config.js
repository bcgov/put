const { defineConfig } = require("cypress");

module.exports = defineConfig({
  
  e2e: {
    baseUrl: 'https://artifacts.apps.clab.devops.gov.bc.ca',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
