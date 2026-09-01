import React, { useState, useEffect, useRef } from 'react'
import '../css/CDllStudio.css'

// Starter Templates
const DLL_TEMPLATES = {
  standard: {
    name: 'Standard DLL with DllMain',
    filename: 'math_library',
    code: `/*
 * Xenithra MinGW Dynamic Link Library (.dll)
 * Starter Template: Standard DLL with Exported Functions
 */
#include <windows.h>
#include <stdio.h>

// Exported Function: Add two integers
__declspec(dllexport) int Add(int a, int b) {
    return a + b;
}

// Exported Function: Multiply two numbers
__declspec(dllexport) double Multiply(double a, double b) {
    return a * b;
}

// Exported Function: Return a dynamic string
__declspec(dllexport) const char* GetLibraryVersion(void) {
    return "Xenithra Native Dynamic Library v1.0.0 (MinGW GCC)";
}

// Standard Windows DLL Entry Point
BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvReserved) {
    switch (fdwReason) {
        case DLL_PROCESS_ATTACH:
            // Initialize once for each new process
            break;
        case DLL_THREAD_ATTACH:
            // Do thread-specific initialization
            break;
        case DLL_THREAD_DETACH:
            // Do thread-specific cleanup
            break;
        case DLL_PROCESS_DETACH:
            // Perform any necessary cleanup
            break;
    }
    return TRUE;
}
`
  },
  math_vector: {
    name: 'Math & 2D/3D Vector Engine',
    filename: 'vector_math',
    code: `/*
 * High-Performance Vector & Math Computation DLL
 */
#include <windows.h>
#include <math.h>

typedef struct {
    float x;
    float y;
} Vector2D;

typedef struct {
    float x;
    float y;
    float z;
} Vector3D;

// Compute 2D Vector Magnitude
__declspec(dllexport) float Vector2D_Magnitude(float x, float y) {
    return sqrtf(x * x + y * y);
}

// Compute 3D Dot Product
__declspec(dllexport) float Vector3D_DotProduct(float x1, float y1, float z1, float x2, float y2, float z2) {
    return (x1 * x2) + (y1 * y2) + (z1 * z2);
}

// Fast Inverse Square Root (Quake III Algorithm)
__declspec(dllexport) float FastInvSqrt(float number) {
    long i;
    float x2, y;
    const float threehalfs = 1.5F;

    x2 = number * 0.5F;
    y  = number;
    i  = * ( long * ) &y;
    i  = 0x5f3759df - ( i >> 1 );
    y  = * ( float * ) &i;
    y  = y * ( threehalfs - ( x2 * y * y ) );

    return y;
}

BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvReserved) {
    return TRUE;
}
`
  },
  string_utils: {
    name: 'String & Cryptography Utils',
    filename: 'string_utils',
    code: `/*
 * String Transformations & Hash Utility DLL
 */
#include <windows.h>
#include <string.h>
#include <ctype.h>

// Exported Function: Caesar Cipher Encoder / Decoder
__declspec(dllexport) void CaesarCipher(char* text, int shift) {
    if (!text) return;
    for (int i = 0; text[i] != '\\0'; i++) {
        if (isupper((unsigned char)text[i])) {
            text[i] = (char)((text[i] - 'A' + shift) % 26 + 'A');
        } else if (islower((unsigned char)text[i])) {
            text[i] = (char)((text[i] - 'a' + shift) % 26 + 'a');
        }
    }
}

// Exported Function: DJB2 Fast Hash Algorithm
__declspec(dllexport) unsigned long HashDJB2(const char* str) {
    unsigned long hash = 5381;
    int c;
    while ((c = *str++)) {
        hash = ((hash << 5) + hash) + c; /* hash * 33 + c */
    }
    return hash;
}

// Exported Function: String Length
__declspec(dllexport) int GetLength(const char* str) {
    if (!str) return 0;
    return (int)strlen(str);
}

BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvReserved) {
    return TRUE;
}
`
  },
  matrix_math: {
    name: 'Matrix Operations & Linear Algebra',
    filename: 'matrix_ops',
    code: `/*
 * High-Performance Matrix Operations DLL
 */
#include <windows.h>
#include <stdlib.h>

// Exported Function: 2x2 Determinant
__declspec(dllexport) double Determinant2x2(double a, double b, double c, double d) {
    return (a * d) - (b * c);
}

// Exported Function: 2x2 Matrix Multiplication
__declspec(dllexport) void Multiply2x2(double A[2][2], double B[2][2], double C[2][2]) {
    C[0][0] = A[0][0]*B[0][0] + A[0][1]*B[1][0];
    C[0][1] = A[0][0]*B[0][1] + A[0][1]*B[1][1];
    C[1][0] = A[1][0]*B[0][0] + A[1][1]*B[1][0];
    C[1][1] = A[1][0]*B[0][1] + A[1][1]*B[1][1];
}

// Exported Function: Dot Product for N elements
__declspec(dllexport) double DotProductN(const double* a, const double* b, int n) {
    if (!a || !b || n <= 0) return 0.0;
    double sum = 0.0;
    for (int i = 0; i < n; i++) {
        sum += a[i] * b[i];
    }
    return sum;
}

BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvReserved) {
    return TRUE;
}
`
  },
  win32_hooks: {
    name: 'Win32 Native Alert & Audio Hooks',
    filename: 'system_hooks',
    code: `/*
 * Win32 System Modal & Native Hardware Hooks DLL
 */
#include <windows.h>

// Exported Function: Trigger a native Windows MessageBox
__declspec(dllexport) int ShowNativeAlert(const char* title, const char* message, int alertType) {
    // alertType: 0 = Info (MB_OK), 1 = Warning (MB_OKCANCEL), 2 = Error (MB_ICONERROR)
    UINT flags = MB_OK | MB_ICONINFORMATION;
    if (alertType == 1) flags = MB_OKCANCEL | MB_ICONWARNING;
    if (alertType == 2) flags = MB_OK | MB_ICONERROR;

    return MessageBoxA(NULL, message, title, flags | MB_SETFOREGROUND);
}

// Exported Function: Hardware Frequency Sound Beep
__declspec(dllexport) BOOL PlayFrequencyBeep(DWORD frequencyHz, DWORD durationMs) {
    return Beep(frequencyHz, durationMs);
}

BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvReserved) {
    return TRUE;
}
`
  },
  minimal: {
    name: 'Minimal Blank Export',
    filename: 'native_lib',
    code: `/*
 * Minimal Windows Dynamic Link Library (.dll)
 */
#include <windows.h>

__declspec(dllexport) int ExecuteCustomLogic(int value) {
    return value * 42;
}

BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpvReserved) {
    return TRUE;
}
`
  }
}

// Live extract functions tagged with __declspec(dllexport)
const extractLiveSymbols = (srcCode) => {
  if (!srcCode) return []
  const results = []
  const lines = srcCode.split('\n')
  const regex = /__declspec\s*\(\s*dllexport\s*\)\s+([a-zA-Z0-9_*]+(?:\s+[a-zA-Z0-9_*]+)*)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let match
    regex.lastIndex = 0
    while ((match = regex.exec(line)) !== null) {
      results.push({
        returnType: match[1].trim(),
        name: match[2].trim(),
        params: match[3].trim(),
        signature: `${match[1].trim()} ${match[2].trim()}(${match[3].trim()})`,
        line: i + 1
      })
    }
  }
  return results
}

const CDllStudioPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('standard')
  const [filename, setFilename] = useState('math_library')
  const [code, setCode] = useState(DLL_TEMPLATES.standard.code)
  const [compilerFlags, setCompilerFlags] = useState('-O2 -Wall -std=c11')
  const [activeTab, setActiveTab] = useState('console') // 'console' | 'symbols' | 'usage' | 'config'

  // Compilation States
  const [isCompiling, setIsCompiling] = useState(false)
  const [compileStatus, setCompileStatus] = useState('idle') // 'idle' | 'running' | 'success' | 'error'
  const [logs, setLogs] = useState([
    { type: 'info', text: '⚡ MinGW GCC C-to-DLL Compiler Studio Ready.' },
    { type: 'info', text: 'Write C code with __declspec(dllexport) functions, then click "Compile to DLL" or press Ctrl+Enter.' }
  ])
  const [compilationResult, setCompilationResult] = useState(null)
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })

  const textareaRef = useRef(null)
  const lineNumbersRef = useRef(null)
  const syntaxRef = useRef(null)
  const terminalEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Frameless Window Controls
  const handleMinimizeWindow = () => {
    if (window.api && typeof window.api.minimizeWindow === 'function') {
      window.api.minimizeWindow()
    }
  }

  const handleMaximizeWindow = () => {
    if (window.api && typeof window.api.maximizeWindow === 'function') {
      window.api.maximizeWindow()
    }
  }

  const handleCloseWindow = () => {
    if (window.api && typeof window.api.closeWindow === 'function') {
      window.api.closeWindow()
    }
  }

  // Exit Studio back to main IDE
  const exitStudio = () => {
    window.location.hash = '#/'
  }

  // Handle template switch
  const handleTemplateChange = (e) => {
    const key = e.target.value
    setSelectedTemplate(key)
    if (DLL_TEMPLATES[key]) {
      setCode(DLL_TEMPLATES[key].code)
      setFilename(DLL_TEMPLATES[key].filename)
      setLogs((prev) => [
        ...prev,
        { type: 'info', text: `Loaded template: "${DLL_TEMPLATES[key].name}"` }
      ])
    }
  }

  // Sync scrolling between textarea, line numbers and syntax highlight layer
  const handleScroll = (e) => {
    if (syntaxRef.current) {
      syntaxRef.current.scrollTop = e.target.scrollTop
      syntaxRef.current.scrollLeft = e.target.scrollLeft
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop
    }
  }

  // Auto-scroll terminal on new log
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  // Track cursor position
  const handleCursorMove = () => {
    if (!textareaRef.current) return
    const pos = textareaRef.current.selectionStart
    const textBefore = code.substring(0, pos)
    const lines = textBefore.split('\n')
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    })
  }

  // Keyboard Shortcuts (Ctrl+Enter or Ctrl+B to Compile, Esc to exit)
  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.key.toLowerCase() === 'b')) {
        e.preventDefault()
        handleCompile()
      } else if (e.key === 'Escape') {
        exitStudio()
      }
    }
    window.addEventListener('keydown', handleKeyDownGlobal)
    return () => window.removeEventListener('keydown', handleKeyDownGlobal)
  }, [code, filename, compilerFlags, isCompiling])

  // Keyboard indentation (Tab / Enter auto-indent)
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd

      if (!e.shiftKey) {
        // Insert 4 spaces
        const newCode = code.substring(0, start) + '    ' + code.substring(end)
        setCode(newCode)
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4
          }
        }, 0)
      } else {
        // Shift+Tab: Outdent
        const before = code.substring(0, start)
        const lineStart = before.lastIndexOf('\n') + 1
        if (code.substring(lineStart, lineStart + 4) === '    ') {
          const newCode = code.substring(0, lineStart) + code.substring(lineStart + 4)
          setCode(newCode)
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = Math.max(
                lineStart,
                start - 4
              )
            }
          }, 0)
        }
      }
    } else if (e.key === 'Enter') {
      // Auto indentation retention
      const start = e.target.selectionStart
      const lines = code.substring(0, start).split('\n')
      const currentLine = lines[lines.length - 1]
      const matchIndent = currentLine.match(/^\s+/)
      const indent = matchIndent ? matchIndent[0] : ''

      // Extra indent if line ends with '{'
      const extraIndent = currentLine.trim().endsWith('{') ? '    ' : ''
      const totalIndent = '\n' + indent + extraIndent

      e.preventDefault()
      const newCode = code.substring(0, start) + totalIndent + code.substring(start)
      setCode(newCode)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
            start + totalIndent.length
        }
      }, 0)
    }
  }

  // High performance C Syntax Color Highlighter
  const renderHighlightedCode = (rawCode) => {
    if (!rawCode) return null

    return rawCode.split('\n').map((line, lineIdx) => {
      const parts = []
      let remaining = line

      // 1. Comments
      const commentIdx = remaining.indexOf('//')
      let commentPart = ''
      if (commentIdx !== -1) {
        commentPart = remaining.substring(commentIdx)
        remaining = remaining.substring(0, commentIdx)
      }

      // 2. Preprocessor directives
      if (remaining.trim().startsWith('#')) {
        parts.push(
          <span key="prep" className="c-token-preprocessor">
            {remaining}
          </span>
        )
      } else {
        // Words & Tokens
        const tokenRegex =
          /(__declspec\(dllexport\)|__declspec|dllexport|WINAPI|BOOL|HINSTANCE|DWORD|LPVOID|UINT|MB_OK|MB_ICONINFORMATION|MB_OKCANCEL|MB_ICONWARNING|MB_ICONERROR|MB_SETFOREGROUND|TRUE|FALSE|int|double|float|char|void|long|short|unsigned|size_t|struct|typedef|return|switch|case|break|default|if|else|while|for|const|static|"(\\.|[^"\\])*"|\b\d+\b)/g

        let lastIndex = 0
        let match
        let subIndex = 0

        while ((match = tokenRegex.exec(remaining)) !== null) {
          const matchText = match[0]
          const matchStart = match.index

          if (matchStart > lastIndex) {
            parts.push(
              <span key={`text-${lineIdx}-${subIndex++}`}>
                {remaining.substring(lastIndex, matchStart)}
              </span>
            )
          }

          if (matchText === '__declspec(dllexport)' || matchText === 'dllexport') {
            parts.push(
              <span key={`export-${lineIdx}-${subIndex++}`} className="c-token-export">
                {matchText}
              </span>
            )
          } else if (
            [
              'int',
              'double',
              'float',
              'char',
              'void',
              'long',
              'short',
              'unsigned',
              'size_t',
              'struct',
              'typedef',
              'BOOL',
              'HINSTANCE',
              'DWORD',
              'LPVOID',
              'UINT'
            ].includes(matchText)
          ) {
            parts.push(
              <span key={`type-${lineIdx}-${subIndex++}`} className="c-token-type">
                {matchText}
              </span>
            )
          } else if (
            [
              'return',
              'switch',
              'case',
              'break',
              'default',
              'if',
              'else',
              'while',
              'for',
              'const',
              'static',
              'WINAPI',
              'TRUE',
              'FALSE',
              'MB_OK',
              'MB_ICONINFORMATION',
              'MB_OKCANCEL',
              'MB_ICONWARNING',
              'MB_ICONERROR',
              'MB_SETFOREGROUND'
            ].includes(matchText)
          ) {
            parts.push(
              <span key={`kw-${lineIdx}-${subIndex++}`} className="c-token-keyword">
                {matchText}
              </span>
            )
          } else if (matchText.startsWith('"')) {
            parts.push(
              <span key={`str-${lineIdx}-${subIndex++}`} className="c-token-string">
                {matchText}
              </span>
            )
          } else if (/^\d+$/.test(matchText)) {
            parts.push(
              <span key={`num-${lineIdx}-${subIndex++}`} className="c-token-number">
                {matchText}
              </span>
            )
          } else {
            parts.push(<span key={`tok-${lineIdx}-${subIndex++}`}>{matchText}</span>)
          }

          lastIndex = matchStart + matchText.length
        }

        if (lastIndex < remaining.length) {
          parts.push(
            <span key={`end-${lineIdx}-${subIndex++}`}>
              {remaining.substring(lastIndex)}
            </span>
          )
        }
      }

      if (commentPart) {
        parts.push(
          <span key={`comm-${lineIdx}`} className="c-token-comment">
            {commentPart}
          </span>
        )
      }

      return (
        <div key={lineIdx} style={{ minHeight: '22px' }}>
          {parts.length > 0 ? parts : ' '}
        </div>
      )
    })
  }

  // Handle local C file import
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCode(event.target.result)
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        setFilename(nameWithoutExt)
        setLogs((prev) => [
          ...prev,
          { type: 'info', text: `Loaded local file: ${file.name} (${file.size} bytes)` }
        ])
      }
      reader.readAsText(file)
    }
  }

  // Format Code Helper
  const handleFormatCode = () => {
    try {
      const lines = code.split('\n')
      let indentLevel = 0
      const formatted = lines
        .map((l) => {
          const trimmed = l.trim()
          if (trimmed.length === 0) return ''

          if (trimmed.startsWith('}') || trimmed.startsWith(');')) {
            indentLevel = Math.max(0, indentLevel - 1)
          }

          const indent = '    '.repeat(indentLevel)
          const result = indent + trimmed

          if (trimmed.endsWith('{') && !trimmed.startsWith('//')) {
            indentLevel++
          }

          return result
        })
        .join('\n')

      setCode(formatted)
      setLogs((prev) => [...prev, { type: 'info', text: 'Formatted C source code structure.' }])
    } catch (err) {
      console.warn('Formatting error:', err)
    }
  }

  // Copy Code to Clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    setLogs((prev) => [...prev, { type: 'info', text: 'Copied source code to clipboard!' }])
  }

  // Reset to Current Template
  const handleResetTemplate = () => {
    if (DLL_TEMPLATES[selectedTemplate]) {
      setCode(DLL_TEMPLATES[selectedTemplate].code)
      setFilename(DLL_TEMPLATES[selectedTemplate].filename)
      setLogs((prev) => [
        ...prev,
        { type: 'info', text: `Reset code to starter template: ${DLL_TEMPLATES[selectedTemplate].name}` }
      ])
    }
  }

  // Main Compilation Pipeline Execution
  const handleCompile = async () => {
    if (isCompiling) return
    setIsCompiling(true)
    setCompileStatus('running')
    setActiveTab('console')

    const cleanBaseName = filename.replace(/\.c$/i, '').trim() || 'library'
    const timestamp = new Date().toLocaleTimeString()

    setLogs((prev) => [
      ...prev,
      { type: 'info', text: `\n[${timestamp}] 🚀 Starting MinGW GCC C-to-DLL compilation pipeline...` },
      { type: 'info', text: `Target Binary: ${cleanBaseName}.dll & Import Library: ${cleanBaseName}.lib` },
      {
        type: 'command',
        text: `$ gcc -shared -o ${cleanBaseName}.dll ${cleanBaseName}.c -Wl,--out-implib,${cleanBaseName}.lib ${compilerFlags}`
      }
    ])

    try {
      let result = null

      // 1. Try Native Electron IPC first if available
      if (window.api && typeof window.api.compileDll === 'function') {
        result = await window.api.compileDll({
          code,
          filename: cleanBaseName,
          flags: compilerFlags
        })
      } else {
        // 2. Fallback to Express backend API
        const port = localStorage.getItem('api-port') || '8000'
        const res = await fetch(`http://localhost:${port}/api/dll/compile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            filename: cleanBaseName,
            flags: compilerFlags
          })
        })
        result = await res.json()
      }

      setCompilationResult(result)

      if (result.success) {
        setCompileStatus('success')
        setLogs((prev) => [
          ...prev,
          {
            type: 'success',
            text: `✔ Windows Dynamic Link Library (.dll) compiled successfully in ${result.compileTimeMs}ms!`
          },
          {
            type: 'success',
            text: `📦 Binary Generated: ${cleanBaseName}.dll (${(result.dllSize / 1024).toFixed(2)} KB)`
          },
          {
            type: 'success',
            text: `📚 Import Library: ${cleanBaseName}.lib (${(result.libSize / 1024).toFixed(2)} KB)`
          },
          {
            type: 'info',
            text: `Exported Functions (${result.symbols ? result.symbols.length : 0} symbols): ${
              result.symbols && result.symbols.length > 0
                ? result.symbols.map((s) => s.name).join(', ')
                : 'No __declspec(dllexport) functions found.'
            }`
          }
        ])
      } else {
        setCompileStatus('error')
        setLogs((prev) => [
          ...prev,
          {
            type: 'error',
            text: `✖ Compilation Failed (${result.compileTimeMs || 0}ms).`
          },
          {
            type: 'error',
            text: result.stderr || result.error || 'MinGW GCC exited with error.'
          },
          {
            type: 'warning',
            text: '💡 Tip: Ensure MinGW GCC is installed (e.g. C:\\MinGW\\bin or MSYS2) and available in your Windows PATH.'
          }
        ])
      }
    } catch (err) {
      console.error('Compilation fetch error:', err)
      setCompileStatus('error')
      setLogs((prev) => [
        ...prev,
        {
          type: 'error',
          text: `✖ Compiler Engine Connection Error: ${err.message}`
        }
      ])
    } finally {
      setIsCompiling(false)
    }
  }

  // Trigger Download of generated .dll or .lib
  const handleDownload = async (fileType) => {
    if (!compilationResult || !compilationResult.sessionId) {
      alert('Please compile the DLL first!')
      return
    }

    const sessionId = compilationResult.sessionId
    const base = compilationResult.baseName || filename || 'library'
    const targetName = `${base}.${fileType}`

    // Try native Electron save dialog first
    if (window.api && typeof window.api.saveDllBinaryDialog === 'function') {
      const res = await window.api.saveDllBinaryDialog(sessionId, fileType, targetName)
      if (res && res.success) {
        setLogs((prev) => [
          ...prev,
          { type: 'success', text: `Saved ${targetName} directly to ${res.filePath}` }
        ])
        return
      } else if (res && res.canceled) {
        return
      }
    }

    // Browser Download via API endpoint
    const port = localStorage.getItem('api-port') || '8000'
    const downloadUrl = `http://localhost:${port}/api/dll/download/${sessionId}/${fileType}`

    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = targetName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setLogs((prev) => [
      ...prev,
      { type: 'info', text: `Initiated download for ${targetName}...` }
    ])
  }

  const lineCount = Math.max(1, code.split('\n').length)

  // Live extracted symbols + compilation symbols fallback
  const liveSymbols = extractLiveSymbols(code)
  const displaySymbols =
    compilationResult && compilationResult.symbols && compilationResult.symbols.length > 0
      ? compilationResult.symbols
      : liveSymbols

  // Language Usage Snippets generator
  const getUsageSnippets = () => {
    const base = compilationResult ? compilationResult.baseName : filename || 'library'
    const firstFunc = displaySymbols[0] || { name: 'Add', returnType: 'int', params: 'int a, int b' }

    return {
      python: `# Python Integration with ctypes
import ctypes
import os

# Load the compiled Windows DLL
dll_path = os.path.abspath("${base}.dll")
lib = ctypes.CDLL(dll_path)

# Configure function signature
lib.${firstFunc.name}.argtypes = [ctypes.c_int, ctypes.c_int]
lib.${firstFunc.name}.restype = ctypes.c_int

# Call exported native DLL function
result = lib.${firstFunc.name}(15, 30)
print(f"Result from ${base}.dll -> {result}")
`,
      csharp: `// C# .NET Integration with P/Invoke
using System;
using System.Runtime.InteropServices;

class Program {
    // Import exported function from Windows DLL
    [DllImport("${base}.dll", CallingConvention = CallingConvention.Cdecl)]
    public static extern int ${firstFunc.name}(int a, int b);

    static void Main() {
        int result = ${firstFunc.name}(15, 30);
        Console.WriteLine($"Result from ${base}.dll: {result}");
    }
}
`,
      cpp: `// C++ Native Dynamic Load with LoadLibrary
#include <windows.h>
#include <iostream>

typedef int (*${firstFunc.name}Func)(int, int);

int main() {
    HINSTANCE hDLL = LoadLibraryA("${base}.dll");
    if (!hDLL) {
        std::cerr << "Failed to load ${base}.dll" << std::endl;
        return 1;
    }

    ${firstFunc.name}Func ${firstFunc.name} = (${firstFunc.name}Func)GetProcAddress(hDLL, "${firstFunc.name}");
    if (${firstFunc.name}) {
        int result = ${firstFunc.name}(15, 30);
        std::cout << "Result: " << result << std::endl;
    }

    FreeLibrary(hDLL);
    return 0;
}
`,
      nodejs: `// Node.js ffi-napi Integration
const ffi = require('ffi-napi');
const path = require('path');

const dllPath = path.resolve(__dirname, '${base}.dll');
const lib = ffi.Library(dllPath, {
    '${firstFunc.name}': ['int', ['int', 'int']]
});

const result = lib.${firstFunc.name}(15, 30);
console.log('Result from ${base}.dll:', result);
`,
      rust: `// Rust libloading Integration
use libloading::{Library, Symbol};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    unsafe {
        let lib = Library::new("${base}.dll")?;
        let ${firstFunc.name}: Symbol<unsafe extern "C" fn(i32, i32) -> i32> = lib.get(b"${firstFunc.name}")?;
        let result = ${firstFunc.name}(15, 30);
        println!("Result from ${base}.dll: {}", result);
    }
    Ok(())
}
`
    }
  }

  const snippets = getUsageSnippets()

  // Generate C Header File (.h) for the exports
  const generateHeaderContent = () => {
    const base = compilationResult ? compilationResult.baseName : filename || 'library'
    const upperBase = base.toUpperCase().replace(/[^A-Z0-9]/g, '_')
    const symbols = displaySymbols

    let h = `/*
 * Auto-Generated C Header for ${base}.dll
 * MinGW Shared Library Export Interface
 */
#ifndef ${upperBase}_H
#define ${upperBase}_H

#ifdef __cplusplus
extern "C" {
#endif

#ifdef BUILDING_${upperBase}
#define ${upperBase}_API __declspec(dllexport)
#else
#define ${upperBase}_API __declspec(dllimport)
#endif

`
    if (symbols.length > 0) {
      symbols.forEach((sym) => {
        h += `// Line ${sym.line}\n`
        h += `${upperBase}_API ${sym.signature};\n\n`
      })
    } else {
      h += `// Tag your functions with __declspec(dllexport) in ${base}.c\n`
    }

    h += `#ifdef __cplusplus
}
#endif

#endif // ${upperBase}_H
`
    return h
  }

  return (
    <div className="cdll-studio-container">
      {/* Ambient background glow effects */}
      <div className="cdll-ambient-glow cdll-glow-1"></div>
      <div className="cdll-ambient-glow cdll-glow-2"></div>

      {/* Hidden File Input for .c file loading */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".c,.h,.cpp,.txt"
        style={{ display: 'none' }}
      />

      {/* Top Header & Compilation Controls */}
      <header className="cdll-top-header">
        <div className="cdll-brand-group">
          <button className="cdll-exit-btn" onClick={exitStudio} title="Return to Main Code IDE (Esc)">
            <span style={{ fontSize: '14px', lineHeight: 1 }}>←</span>
            <span>Exit Studio</span>
          </button>
          <div className="cdll-title-wrap">
            <div className="cdll-title-row">
              <i className="bx bx-chip" style={{ fontSize: '18px', color: '#00f3ff' }}></i>
              <span className="cdll-title-main">C &rarr; DLL MinGW Studio</span>
              <span className="cdll-badge-mingw">GCC 6.3 MinGW</span>
            </div>
          </div>
        </div>

        {/* Center Control Tools */}
        <div className="cdll-header-center-tools">
          {/* Filename Input */}
          <div className="cdll-filename-box" title="Base library file name">
            <span style={{ color: '#94a3b8', fontSize: '11px', marginRight: '4px' }}>📄</span>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="cdll-filename-input"
              placeholder="library_name"
            />
            <span className="cdll-filename-ext">.c</span>
            <span className="cdll-arrow-icon">&rarr;</span>
            <span className="cdll-target-dll">.dll</span>
          </div>

          {/* Starter Template Selector */}
          <select
            value={selectedTemplate}
            onChange={handleTemplateChange}
            className="cdll-select"
            title="Load starter C template"
          >
            {Object.entries(DLL_TEMPLATES).map(([key, t]) => (
              <option key={key} value={key}>
                🧩 {t.name}
              </option>
            ))}
          </select>

          {/* Compiler Flags */}
          <select
            value={compilerFlags}
            onChange={(e) => setCompilerFlags(e.target.value)}
            className="cdll-select"
            title="MinGW GCC Optimization Flags"
          >
            <option value="-O2 -Wall -std=c11">⚙️ -O2 -Wall -std=c11 (Recommended)</option>
            <option value="-O3 -Wall -std=c11">⚡ -O3 Max Performance</option>
            <option value="-O0 -g -Wall">🐞 -O0 Debug Symbols</option>
            <option value="-O2 -std=c99">📜 -std=c99 Legacy Standard</option>
            <option value="-O2 -s">📦 -s Strip Debug Symbols</option>
          </select>
        </div>

        {/* Right Header Action Buttons & Window Controls */}
        <div className="cdll-header-actions">
          <button
            className="cdll-btn-compile"
            onClick={handleCompile}
            disabled={isCompiling}
            title="Compile C Source into Windows .DLL with MinGW GCC (Ctrl+Enter / Ctrl+B)"
          >
            {isCompiling ? (
              <>
                <span className="cdll-dot-running" style={{ width: '8px', height: '8px' }}></span>
                <span>Compiling DLL...</span>
              </>
            ) : (
              <>
                <span>▶ Compile to DLL</span>
              </>
            )}
          </button>

          {compilationResult && compilationResult.success && (
            <>
              <button
                className="cdll-btn-download"
                onClick={() => handleDownload('dll')}
                title={`Download compiled ${compilationResult.baseName}.dll (${(compilationResult.dllSize / 1024).toFixed(1)} KB)`}
              >
                <span>⬇ .DLL</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>
                  ({(compilationResult.dllSize / 1024).toFixed(0)}KB)
                </span>
              </button>

              <button
                className="cdll-btn-download-secondary"
                onClick={() => handleDownload('lib')}
                title={`Download import library ${compilationResult.baseName}.lib`}
              >
                <span>⬇ .LIB</span>
              </button>
            </>
          )}

          {/* Window Controls for frameless window */}
          <div className="cdll-window-controls">
            <button
              className="cdll-win-btn minimize"
              onClick={handleMinimizeWindow}
              title="Minimize Window"
            >
              &#8212;
            </button>
            <button
              className="cdll-win-btn maximize"
              onClick={handleMaximizeWindow}
              title="Maximize / Restore Window"
            >
              &#9633;
            </button>
            <button
              className="cdll-win-btn close"
              onClick={handleCloseWindow}
              title="Close Application"
            >
              &#10005;
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Arena */}
      <div className="cdll-workspace">
        {/* Left Side: C Code Editor */}
        <div className="cdll-editor-pane">
          <div className="cdll-editor-toolbar">
            <div className="cdll-editor-tools-left">
              <span className="cdll-editor-tab-active">
                <i className="bx bx-code-alt"></i> {filename || 'library'}.c
              </span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>
                (C Source &bull; MinGW Shared Export)
              </span>
            </div>

            <div className="cdll-editor-tools-right">
              <button
                className="cdll-tool-btn"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                title="Upload local .c file"
              >
                📁 Open .c
              </button>
              <button className="cdll-tool-btn" onClick={handleFormatCode} title="Format C Code">
                ✨ Format
              </button>
              <button className="cdll-tool-btn" onClick={handleCopyCode} title="Copy code to clipboard">
                📋 Copy
              </button>
              <button className="cdll-tool-btn" onClick={handleResetTemplate} title="Reset code to selected template">
                🔄 Reset
              </button>
            </div>
          </div>

          <div className="cdll-editor-core">
            {/* Line Numbers Gutter */}
            <div ref={lineNumbersRef} className="cdll-line-numbers">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    color: cursorPos.line === i + 1 ? '#00f3ff' : '#475569',
                    fontWeight: cursorPos.line === i + 1 ? '700' : 'normal'
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Input & Syntax Highlight Layer */}
            <div className="cdll-code-container">
              <div ref={syntaxRef} className="cdll-syntax-layer">
                {renderHighlightedCode(code)}
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                onClick={handleCursorMove}
                onKeyUp={handleCursorMove}
                className="cdll-textarea"
                placeholder="Write or paste your C source code here..."
                spellCheck="false"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
              />
            </div>
          </div>

          {/* Editor Status Bar */}
          <div className="cdll-editor-statusbar">
            <div>
              <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
              <span style={{ margin: '0 8px' }}>&bull;</span>
              <span>{lineCount} lines</span>
              <span style={{ margin: '0 8px' }}>&bull;</span>
              <span>{code.length} characters</span>
            </div>
            <div>
              <span style={{ color: '#00f3ff', fontWeight: 600 }}>__declspec(dllexport)</span> {displaySymbols.length} Exports Detected &bull; MinGW 64-bit GCC
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Console & Inspection Terminal */}
        <div className="cdll-console-pane">
          <div className="cdll-console-nav">
            <div className="cdll-console-tabs">
              <button
                className={`cdll-tab-btn ${activeTab === 'console' ? 'active' : ''}`}
                onClick={() => setActiveTab('console')}
              >
                <span>🖥️ Compiler Console</span>
              </button>
              <button
                className={`cdll-tab-btn ${activeTab === 'symbols' ? 'active' : ''}`}
                onClick={() => setActiveTab('symbols')}
              >
                <span>🔍 Exported Symbols</span>
                {displaySymbols.length > 0 && (
                  <span
                    style={{
                      background: 'rgba(0, 243, 255, 0.15)',
                      color: '#00f3ff',
                      padding: '1px 5px',
                      borderRadius: '8px',
                      fontSize: '10px'
                    }}
                  >
                    {displaySymbols.length}
                  </span>
                )}
              </button>
              <button
                className={`cdll-tab-btn ${activeTab === 'usage' ? 'active' : ''}`}
                onClick={() => setActiveTab('usage')}
              >
                <span>💡 How to Use DLL</span>
              </button>
              <button
                className={`cdll-tab-btn ${activeTab === 'config' ? 'active' : ''}`}
                onClick={() => setActiveTab('config')}
              >
                <span>⚙️ GCC Flags</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="cdll-console-metrics">
                <div
                  className={`cdll-status-dot cdll-dot-${
                    compileStatus === 'running'
                      ? 'running'
                      : compileStatus === 'success'
                      ? 'success'
                      : compileStatus === 'error'
                      ? 'error'
                      : 'idle'
                  }`}
                ></div>
                <span style={{ textTransform: 'capitalize' }}>
                  {compileStatus === 'running' ? 'Compiling...' : compileStatus}
                </span>
              </div>

              {activeTab === 'console' && (
                <button
                  className="cdll-tool-btn"
                  onClick={() => setLogs([{ type: 'info', text: 'Console cleared.' }])}
                  title="Clear Console Output"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: Terminal Log */}
          {activeTab === 'console' && (
            <div className="cdll-terminal-body">
              {logs.map((log, idx) => (
                <div key={idx} className={`cdll-log-line cdll-log-${log.type}`}>
                  {log.text}
                </div>
              ))}

              {/* Compilation Success Banner Card */}
              {compilationResult && compilationResult.success && (
                <div className="cdll-success-card">
                  <div className="cdll-card-header">
                    <div className="cdll-card-title">
                      <span>✔ Windows Dynamic Link Library Generated Successfully!</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#6ee7b7' }}>
                      ⚡ {compilationResult.compileTimeMs}ms
                    </span>
                  </div>

                  <div className="cdll-file-chips">
                    <div className="cdll-chip">
                      <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>📦 DLL:</span>
                      <span>{compilationResult.baseName}.dll</span>
                      <span style={{ color: '#94a3b8' }}>
                        ({(compilationResult.dllSize / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <div className="cdll-chip">
                      <span style={{ color: '#a855f7', fontWeight: 'bold' }}>📚 LIB:</span>
                      <span>{compilationResult.baseName}.lib</span>
                      <span style={{ color: '#94a3b8' }}>
                        ({(compilationResult.libSize / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <button
                      className="cdll-btn-download"
                      onClick={() => handleDownload('dll')}
                      style={{ padding: '4px 12px', fontSize: '11px' }}
                    >
                      ⬇ Download {compilationResult.baseName}.dll
                    </button>
                    <button
                      className="cdll-btn-download-secondary"
                      onClick={() => handleDownload('lib')}
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      ⬇ Download Import .lib
                    </button>
                    <button
                      className="cdll-btn-download-secondary"
                      onClick={() => setActiveTab('symbols')}
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      🔍 Inspect Symbols ({displaySymbols.length})
                    </button>
                  </div>
                </div>
              )}

              <div ref={terminalEndRef} />
            </div>
          )}

          {/* TAB 2: Exported Symbols Inspector */}
          {activeTab === 'symbols' && (
            <div className="cdll-symbols-view">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Functions tagged with <code style={{ color: '#00f3ff' }}>__declspec(dllexport)</code> are exported in the DLL export table for external applications to call.
                </div>
                <button
                  className="cdll-tool-btn"
                  style={{ background: 'rgba(0,243,255,0.12)', color: '#00f3ff', padding: '4px 10px', fontWeight: '600' }}
                  onClick={() => {
                    navigator.clipboard.writeText(generateHeaderContent())
                    alert('Generated C Header (.h) copied to clipboard!')
                  }}
                  title="Copy C Header (.h) file for exported symbols"
                >
                  📋 Copy .h Header
                </button>
              </div>

              {displaySymbols.length > 0 ? (
                <table className="cdll-symbols-table">
                  <thead>
                    <tr>
                      <th>Export Name</th>
                      <th>Return Type</th>
                      <th>Full Signature</th>
                      <th>Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displaySymbols.map((sym, idx) => (
                      <tr key={idx}>
                        <td className="cdll-symbol-name">{sym.name}</td>
                        <td style={{ color: '#79c0ff' }}>{sym.returnType}</td>
                        <td className="cdll-symbol-sig">{sym.signature}</td>
                        <td style={{ color: '#64748b' }}>:{sym.line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                  <p style={{ marginBottom: '10px' }}>No exported symbols detected yet.</p>
                  <p>Add <code style={{ color: '#00f3ff' }}>__declspec(dllexport)</code> before your function signatures and click <strong>"Compile to DLL"</strong>!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: How to Use DLL Snippets */}
          {activeTab === 'usage' && (
            <div className="cdll-usage-view">
              {/* Python Snippet */}
              <div className="cdll-snippet-card">
                <div className="cdll-snippet-header">
                  <span>🐍 Python (ctypes)</span>
                  <button
                    className="cdll-tool-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(snippets.python)
                      alert('Copied Python snippet to clipboard!')
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="cdll-snippet-code">{snippets.python}</pre>
              </div>

              {/* C# Snippet */}
              <div className="cdll-snippet-card">
                <div className="cdll-snippet-header">
                  <span>💜 C# .NET (P/Invoke)</span>
                  <button
                    className="cdll-tool-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(snippets.csharp)
                      alert('Copied C# snippet to clipboard!')
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="cdll-snippet-code">{snippets.csharp}</pre>
              </div>

              {/* C++ Snippet */}
              <div className="cdll-snippet-card">
                <div className="cdll-snippet-header">
                  <span>⚙️ C / C++ (LoadLibrary / GetProcAddress)</span>
                  <button
                    className="cdll-tool-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(snippets.cpp)
                      alert('Copied C++ snippet to clipboard!')
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="cdll-snippet-code">{snippets.cpp}</pre>
              </div>

              {/* Node.js Snippet */}
              <div className="cdll-snippet-card">
                <div className="cdll-snippet-header">
                  <span>🟩 Node.js (ffi-napi)</span>
                  <button
                    className="cdll-tool-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(snippets.nodejs)
                      alert('Copied Node.js snippet to clipboard!')
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="cdll-snippet-code">{snippets.nodejs}</pre>
              </div>

              {/* Rust Snippet */}
              <div className="cdll-snippet-card">
                <div className="cdll-snippet-header">
                  <span>🦀 Rust (libloading)</span>
                  <button
                    className="cdll-tool-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(snippets.rust)
                      alert('Copied Rust snippet to clipboard!')
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="cdll-snippet-code">{snippets.rust}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: Compiler Config */}
          {activeTab === 'config' && (
            <div className="cdll-usage-view">
              <div className="cdll-snippet-card" style={{ padding: '14px' }}>
                <h4 style={{ color: '#00f3ff', fontSize: '12px', marginBottom: '10px' }}>
                  ⚙️ MinGW GCC Compiler Engine Configuration
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '4px' }}>
                      Current Compiler Command Line Flags:
                    </label>
                    <input
                      type="text"
                      value={compilerFlags}
                      onChange={(e) => setCompilerFlags(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(0,243,255,0.3)',
                        borderRadius: '4px',
                        color: '#00f3ff',
                        padding: '6px 10px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ color: '#64748b', fontSize: '10.5px', lineHeight: '1.5' }}>
                    <p>• <strong>-shared</strong>: Tells MinGW GCC to produce a Windows Dynamic Link Library (.dll).</p>
                    <p>• <strong>-Wl,--out-implib,lib.lib</strong>: Produces the MSVC / MinGW compatible import library (.lib).</p>
                    <p>• <strong>-O2 / -O3</strong>: High-level compiler optimizations.</p>
                    <p>• <strong>-std=c11</strong>: Enables ISO C11 standard language features.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CDllStudioPage
