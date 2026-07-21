import { runCode as executeCode, packageCode as buildBinary } from '../compiler-engine/compiler.js'

/**
 * Xenithra Code Runner Service
 * Handles compilation, execution, and binary packaging for supported runtimes.
 */
export const runCode = async (lang, code, args) => {
  return await executeCode(lang, code, args)
}

export const packageCode = async (lang, code, filename) => {
  return await buildBinary(lang, code, filename)
}

export default {
  runCode,
  packageCode
}
