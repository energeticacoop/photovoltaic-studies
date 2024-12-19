//require gas-local itself
var gas = require("gas-local")
//require your downloaded google apps script library from src subfolder as normal module
var glib = gas.require("./src")

//pick default mock object
var defMock = gas.globalMockDefault
//Mock various GAS functions by extending default mock object
var customMock = {
  SpreadsheetApp: {
    getActiveSpreadsheet: function () {
      return {
        getRangeByName: function (rangeName) {
          return {
            getValue: function () {
              // For getter functions, return a mocked value (the range name in this case)
              return `Mocked Value: ${rangeName}`
            },
            getValues: function () {
              // Mock multiple values as a 2D array
              return [["Mocked Value"]]
            },
            getColumn: function () {
              // Mock the getColumn by returning a single column of values
              return [["Mocked Column Value"]]
            },
            setValue: function (value) {
              // For setter functions, just log the value being set
              console.log(`Set value in range: ${value}`)
            },
            setValues: function (values) {
              // For setter functions, just log the values being set
              console.log(`Set values in range: ${JSON.stringify(values)}`)
            },
            setColumn: function (values) {
              // For setter functions, just log the column values being set
              console.log(
                `Set column values in range: ${JSON.stringify(values)}`
              )
            },
            setRichTextValue: function (richText) {
              // For setter functions, log the rich text value being set
              console.log(`Set rich text value: ${JSON.stringify(richText)}`)
            },
            clearContent: function () {
              // For clearing content, log the action
              console.log(`Cleared content in range`)
            },
            getCell: function (row, col) {
              return this // Mock returning itself for chainable calls
            },
          }
        },
        newRichTextValue: function () {
          return {
            setText: function (text) {
              console.log(`Setting rich text: ${text}`)
              return this // For chainable calls
            },
            setLinkUrl: function (url) {
              console.log(`Setting link URL: ${url}`)
              return this // For chainable calls
            },
            build: function () {
              return {
                getText: function () {
                  return "Mocked Rich Text"
                },
                getLinkUrl: function () {
                  return "Mocked URL"
                },
              }
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

console.log(glib.getValue("testing"))
