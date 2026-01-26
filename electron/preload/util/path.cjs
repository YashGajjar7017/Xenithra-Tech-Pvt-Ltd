// This is module is use for path module only
const path = require('path')

// console.log(process.env.PATH)
module.exports = path.dirname(process.mainModule.filename)
