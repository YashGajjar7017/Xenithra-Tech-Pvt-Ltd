// This is module is use for path module only
const path = require('path')

// console.log(process.env.PATH)
// Use require.main.filename instead of deprecated process.mainModule.filename
module.exports = path.dirname(require.main.filename)
