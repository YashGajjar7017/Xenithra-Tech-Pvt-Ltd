import { runCode as executeCode, packageCode as buildBinary } from '../compiler-engine/compiler.js'

/**
 * Xenithra Code Runner Service
 * Handles compilation, execution, and binary packaging for supported runtimes.
 */
export const runCode = async (lang, code, args, compilerPaths = {}) => {
  return await executeCode(lang, code, args, compilerPaths)
}

export const packageCode = async (lang, code, filename) => {
  return await buildBinary(lang, code, filename)
}

export default {
  runCode,
  packageCode
}
