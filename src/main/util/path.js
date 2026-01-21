const path = require('path')

// Export project root directory. Controllers expect `rootDir` to be the repo root so they
// can reference `views`, `other`, etc. Adjust if your views are located elsewhere.
module.exports = path.resolve(__dirname, '../../..')
