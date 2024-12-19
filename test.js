//require gas-local itself
var gas = require("gas-local")
//require your downloaded google apps script library from src subfolder as normal module
var glib = gas.require("./src")

//call some function from your app script library
//glib.print_test_message("hola")

//pick default mock object
var defMock = gas.globalMockDefault
//Mock MailApp by extending default mock object
var customMock = {
  MailApp: {
    getRemainingDailyQuota: function () {
      return 50
    },
  },

  SpreadsheetApp: {
    // Mock the method(s) you want to override
    getActiveSpreadsheet: function () {
      return {
        getRangeByName: function (rangeName) {
          return {
            getValue: function () {
              return "Mocked Value"
            },
          }
        },
      }
    },
  },
  // Extend the default mock object for other services
  __proto__: defMock,
}

//pass it to require
var glib = gas.require("./src", customMock)

//call some function from your app script library working with MailApp
//glib.sendMails();

//glib.print_test_message("hola")
console.log(glib.getValue())
