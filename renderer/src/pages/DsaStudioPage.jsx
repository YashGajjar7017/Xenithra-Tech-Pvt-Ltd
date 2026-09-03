import React, { useState, useEffect, useRef } from 'react'

const DsaStudioPage = () => {
  const [selectedAlgo, setSelectedAlgo] = useState('binary-search')
  const [dsaStep, setDsaStep] = useState(0)
  const [dsaPlaying, setDsaPlaying] = useState(false)
  const [dsaSpeed, setDsaSpeed] = useState(1500)
  const [selectedLang, setSelectedLang] = useState('javascript')
  const [customInputVal, setCustomInputVal] = useState('56')
  const [isInteractiveMode, setIsInteractiveMode] = useState(false)
  const [customCode, setCustomCode] = useState('')
  const [testResults, setTestResults] = useState([])
  const [customComplexities, setCustomComplexities] = useState(null)
  const [selectedFlowNode, setSelectedFlowNode] = useState(null)

  const parseCustomCodeFlowchart = (codeText) => {
    const raw = codeText || ''
    const nodes = []

    // 1. Function entry
    const funcMatch = raw.match(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/)
    const funcName = funcMatch ? funcMatch[1] : 'customAlgorithm'
    const funcParams = funcMatch ? funcMatch[2] : 'input'
    nodes.push({
      id: 'entry',
      type: 'entry',
      color: '#00ffaa',
      badge: 'START NODE',
      title: `Function Entry: ${funcName}(${funcParams})`,
      detail: `Initializes execution frame. Arguments [${funcParams}] bound to local scope.`
    })

    // 2. Variable Declarations
    const varMatches = raw.match(/(?:let|const|var)\s+([a-zA-Z0-9_]+)\s*=\s*([^;\n]+)/g) || []
    if (varMatches.length > 0) {
      nodes.push({
        id: 'vars',
        type: 'vars',
        color: '#38bdf8',
        badge: 'STATE MEMORY',
        title: 'Variable Declarations',
        detail: varMatches.slice(0, 3).join('; ')
      })
    }

    // 3. Outer Loop
    const forOrWhileMatches = [...raw.matchAll(/(for|while)\s*\(([^)]+)\)/g)]
    if (forOrWhileMatches.length > 0) {
      const outer = forOrWhileMatches[0]
      nodes.push({
        id: 'outer-loop',
        type: 'outer-loop',
        color: '#f59e0b',
        badge: 'OUTER LOOP',
        title: `Loop 1: ${outer[1]} (${outer[2]})`,
        detail: 'Evaluates iteration predicate. While true, executes loop body.'
      })

      // 4. Nested Loop in Loop
      if (forOrWhileMatches.length > 1) {
        const inner = forOrWhileMatches[1]
        nodes.push({
          id: 'nested-loop',
          type: 'nested-loop',
          color: '#ec4899',
          badge: 'NESTED LOOP IN LOOP',
          title: `Loop 2 (Nested): ${inner[1]} (${inner[2]})`,
          detail: 'Inner iteration running O(n * m) Cartesian passes inside outer block.'
        })
      }
    }

    // 5. Conditionals (if statements)
    const ifMatches = raw.match(/if\s*\(([^)]+)\)/g) || []
    if (ifMatches.length > 0) {
      nodes.push({
        id: 'condition',
        type: 'condition',
        color: '#a855f7',
        badge: 'DECISION BRANCH',
        title: `Predicate: ${ifMatches[0]}`,
        detail: 'True: executes immediate return / swap block. False: advances pointer to next iteration.'
      })
    }

    // 6. Return Statements (Where & How Output Comes)
    const returnMatches = raw.match(/return\s+([^;\n]+)/g) || []
    if (returnMatches.length > 0) {
      returnMatches.forEach((ret, idx) => {
        nodes.push({
          id: `return-${idx}`,
          type: 'return',
          color: '#10b981',
          badge: 'OUTPUT GENERATION',
          title: `Result Yield: ${ret}`,
          detail: idx === 0 
            ? 'Success Output: Calculated when condition evaluates to true.' 
            : 'Fallback Output: Returned upon loop termination.'
        })
      })
    } else {
      nodes.push({
        id: 'return-default',
        type: 'return',
        color: '#10b981',
        badge: 'OUTPUT GENERATION',
        title: 'Result Yield: return value',
        detail: 'Outputs computed return value or undefined.'
      })
    }

    return nodes
  }

  const playTimerRef = useRef(null)

  // Algorithm Source Code Templates (1-indexed matching display line numbers)
  const codeTemplates = {
    'binary-search': {
      javascript: [
        "function binarySearch(arr, target) {", // 1
        "    let low = 0;", // 2
        "    let high = arr.length - 1;", // 3
        "    while (low <= high) {", // 4
        "        let mid = Math.floor((low + high) / 2);", // 5
        "        if (arr[mid] === target) {", // 6
        "            return mid; // Found!", // 7
        "        } else if (arr[mid] < target) {", // 8
        "            low = mid + 1;", // 9
        "        } else {", // 10
        "            high = mid - 1;", // 11
        "        }", // 12
        "    }", // 13
        "    return -1; // Not found", // 14
        "}" // 15
      ]
    },
    'bubble-sort': {
      javascript: [
        "function bubbleSort(arr) {", // 1
        "    let n = arr.length;", // 2
        "    for (let i = 0; i < n; i++) {", // 3
        "        for (let j = 0; j < n - i - 1; j++) {", // 4
        "            if (arr[j] > arr[j + 1]) {", // 5
        "                let temp = arr[j];", // 6
        "                arr[j] = arr[j + 1];", // 7
        "                arr[j + 1] = temp;", // 8
        "            }", // 9
        "        }", // 10
        "    }", // 11
        "    return arr;", // 12
        "}" // 13
      ]
    },
    'linked-list': {
      javascript: [
        "function insertNode(head, val) {", // 1
        "    let newNode = new Node(val);", // 2
        "    if (!head) return newNode;", // 3
        "    let curr = head;", // 4
        "    while (curr.next && curr.next.val < val) {", // 5
        "        curr = curr.next;", // 6
        "    }", // 7
        "    newNode.next = curr.next;", // 8
        "    curr.next = newNode;", // 9
        "    return head;", // 10
        "}" // 11
      ]
    },
    'gradient-descent': {
      javascript: [
        "function gradientDescent(initialW, learningRate) {", // 1
        "    let w = initialW;", // 2
        "    for (let step = 0; step < maxSteps; step++) {", // 3
        "        let gradient = 2 * (w - targetW);", // 4
        "        w = w - learningRate * gradient;", // 5
        "        let loss = Math.pow(w - targetW, 2);", // 6
        "        if (Math.abs(gradient) < tolerance) {", // 7
        "            break; // Converged", // 8
        "        }", // 9
        "    }", // 10
        "    return w;", // 11
        "}" // 12
      ]
    },
    'fibonacci': {
      javascript: [
        "function fibonacci(n) {", // 1
        "    if (n <= 1) {", // 2
        "        return n;", // 3
        "    }", // 4
        "    let left = fibonacci(n - 1);", // 5
        "    let right = fibonacci(n - 2);", // 6
        "    return left + right;", // 7
        "}" // 8
      ]
    }
  }

  // Trace steps data mapping (15-20 steps per algorithm)
  const algoTraces = {
    'binary-search': [
      { line: 2, desc: "Initialize search segment: set low pointer to 0", vars: { low: 0, high: "null", mid: "null", currentVal: "null" } },
      { line: 3, desc: "Set high pointer to end of array index 11 (value 95)", vars: { low: 0, high: 11, mid: "null", currentVal: "null" } },
      { line: 4, desc: "Check loop condition: low (0) <= high (11) is TRUE", vars: { low: 0, high: 11, mid: "null", currentVal: "null" } },
      { line: 5, desc: "Calculate midpoint: mid = Math.floor((0 + 11) / 2) = 5", vars: { low: 0, high: 11, mid: 5, currentVal: 35 } },
      { line: 6, desc: "Compare mid element (35) with target (56): 35 === 56 is FALSE", vars: { low: 0, high: 11, mid: 5, currentVal: 35 } },
      { line: 8, desc: "Check if mid element (35) < target (56): 35 < 56 is TRUE", vars: { low: 0, high: 11, mid: 5, currentVal: 35 } },
      { line: 9, desc: "Target lies in right half: set low = mid + 1 = 6", vars: { low: 6, high: 11, mid: 5, currentVal: 35 } },
      { line: 4, desc: "Check loop condition: low (6) <= high (11) is TRUE", vars: { low: 6, high: 11, mid: 5, currentVal: "null" } },
      { line: 5, desc: "Calculate midpoint: mid = Math.floor((6 + 11) / 2) = 8", vars: { low: 6, high: 11, mid: 8, currentVal: 67 } },
      { line: 6, desc: "Compare mid element (67) with target (56): 67 === 56 is FALSE", vars: { low: 6, high: 11, mid: 8, currentVal: 67 } },
      { line: 8, desc: "Check if mid element (67) < target (56): 67 < 56 is FALSE", vars: { low: 6, high: 11, mid: 8, currentVal: 67 } },
      { line: 11, desc: "Target lies in left half: set high = mid - 1 = 7", vars: { low: 6, high: 7, mid: 8, currentVal: 67 } },
      { line: 4, desc: "Check loop condition: low (6) <= high (7) is TRUE", vars: { low: 6, high: 7, mid: 8, currentVal: "null" } },
      { line: 5, desc: "Calculate midpoint: mid = Math.floor((6 + 7) / 2) = 6", vars: { low: 6, high: 7, mid: 6, currentVal: 48 } },
      { line: 6, desc: "Compare mid element (48) with target (56): 48 === 56 is FALSE", vars: { low: 6, high: 7, mid: 6, currentVal: 48 } },
      { line: 8, desc: "Check if mid element (48) < target (56): 48 < 56 is TRUE", vars: { low: 6, high: 7, mid: 6, currentVal: 48 } },
      { line: 9, desc: "Target lies in right half: set low = mid + 1 = 7", vars: { low: 7, high: 7, mid: 6, currentVal: 48 } },
      { line: 4, desc: "Check loop condition: low (7) <= high (7) is TRUE", vars: { low: 7, high: 7, mid: 6, currentVal: "null" } },
      { line: 5, desc: "Calculate midpoint: mid = Math.floor((7 + 7) / 2) = 7", vars: { low: 7, high: 7, mid: 7, currentVal: 56 } },
      { line: 6, desc: "Compare mid element (56) with target (56): 56 === 56 is TRUE. Match found!", vars: { low: 7, high: 7, mid: 7, currentVal: 56 } },
      { line: 7, desc: "Match found at index 7. Return 7 successfully and end search.", vars: { low: 7, high: 7, mid: 7, currentVal: 56 } }
    ],
    'bubble-sort': [
      { line: 2, desc: "Initialize sort: n = array length = 6", vars: { i: "null", j: "null", swapCount: 0, arr: "[45, 12, 32, 21, 69, 15]" } },
      { line: 3, desc: "Outer loop: pass i = 0 started", vars: { i: 0, j: "null", swapCount: 0, arr: "[45, 12, 32, 21, 69, 15]" } },
      { line: 4, desc: "Inner loop: index j = 0. Comparing elements [0] (45) and [1] (12)", vars: { i: 0, j: 0, swapCount: 0, arr: "[45, 12, 32, 21, 69, 15]" } },
      { line: 5, desc: "Compare: 45 > 12 is TRUE. Swap is required.", vars: { i: 0, j: 0, swapCount: 0, arr: "[45, 12, 32, 21, 69, 15]" } },
      { line: 7, desc: "Swapping elements: move 45 right and 12 left.", vars: { i: 0, j: 0, swapCount: 1, arr: "[12, 45, 32, 21, 69, 15]" } },
      { line: 4, desc: "Inner loop: index j = 1. Comparing elements [1] (45) and [2] (32)", vars: { i: 0, j: 1, swapCount: 1, arr: "[12, 45, 32, 21, 69, 15]" } },
      { line: 5, desc: "Compare: 45 > 32 is TRUE. Swap is required.", vars: { i: 0, j: 1, swapCount: 1, arr: "[12, 45, 32, 21, 69, 15]" } },
      { line: 7, desc: "Swapping elements: move 45 right and 32 left.", vars: { i: 0, j: 1, swapCount: 2, arr: "[12, 32, 45, 21, 69, 15]" } },
      { line: 4, desc: "Inner loop: index j = 2. Comparing elements [2] (45) and [3] (21)", vars: { i: 0, j: 2, swapCount: 2, arr: "[12, 32, 45, 21, 69, 15]" } },
      { line: 5, desc: "Compare: 45 > 21 is TRUE. Swap is required.", vars: { i: 0, j: 2, swapCount: 2, arr: "[12, 32, 45, 21, 69, 15]" } },
      { line: 7, desc: "Swapping elements: move 45 right and 21 left.", vars: { i: 0, j: 2, swapCount: 3, arr: "[12, 32, 21, 45, 69, 15]" } },
      { line: 4, desc: "Inner loop: index j = 3. Comparing elements [3] (45) and [4] (69)", vars: { i: 0, j: 3, swapCount: 3, arr: "[12, 32, 21, 45, 69, 15]" } },
      { line: 5, desc: "Compare: 45 > 69 is FALSE. No swap needed.", vars: { i: 0, j: 3, swapCount: 3, arr: "[12, 32, 21, 45, 69, 15]" } },
      { line: 4, desc: "Inner loop: index j = 4. Comparing elements [4] (69) and [5] (15)", vars: { i: 0, j: 4, swapCount: 3, arr: "[12, 32, 21, 45, 69, 15]" } },
      { line: 5, desc: "Compare: 69 > 15 is TRUE. Swap is required.", vars: { i: 0, j: 4, swapCount: 3, arr: "[12, 32, 21, 45, 69, 15]" } },
      { line: 7, desc: "Swapping elements: move 69 right and 15 left. 69 is now in final position.", vars: { i: 0, j: 4, swapCount: 4, arr: "[12, 32, 21, 45, 15, 69]" } },
      { line: 3, desc: "Outer loop: pass i = 1 started", vars: { i: 1, j: "null", swapCount: 4, arr: "[12, 32, 21, 45, 15, 69]" } },
      { line: 4, desc: "Inner loop: index j = 0. Comparing elements [0] (12) and [1] (32)", vars: { i: 1, j: 0, swapCount: 4, arr: "[12, 32, 21, 45, 15, 69]" } },
      { line: 5, desc: "Compare: 12 > 32 is FALSE. No swap needed.", vars: { i: 1, j: 0, swapCount: 4, arr: "[12, 32, 21, 45, 15, 69]" } },
      { line: 4, desc: "Inner loop: index j = 1. Comparing elements [1] (32) and [2] (21)", vars: { i: 1, j: 1, swapCount: 4, arr: "[12, 32, 21, 45, 15, 69]" } },
      { line: 5, desc: "Compare: 32 > 21 is TRUE. Swap is required.", vars: { i: 1, j: 1, swapCount: 4, arr: "[12, 32, 21, 45, 15, 69]" } },
      { line: 7, desc: "Swapping elements: move 32 right and 21 left.", vars: { i: 1, j: 1, swapCount: 5, arr: "[12, 21, 32, 45, 15, 69]" } },
      { line: 12, desc: "Sorting sequence finished! Array is fully ordered.", vars: { i: "done", j: "done", swapCount: 5, arr: "[12, 21, 32, 15, 45, 69]" } }
    ],
    'linked-list': [
      { line: 2, desc: "Create a new memory node container with value 30", vars: { val: 30, nodeAddr: "0x7ffd10b", current: "null", next: "null" } },
      { line: 3, desc: "Check head node pointer: head (Node 10) is NOT null", vars: { val: 30, nodeAddr: "0x7ffd10b", current: "null", next: "null" } },
      { line: 4, desc: "Initialize navigation pointer: curr = head (Node 10)", vars: { val: 30, nodeAddr: "0x7ffd10b", current: 10, next: 25 } },
      { line: 5, desc: "Check while insertion condition: curr.next (25) exists and 25 < 30 is TRUE", vars: { val: 30, nodeAddr: "0x7ffd10b", current: 10, next: 25 } },
      { line: 6, desc: "Advance loop traversal pointer: curr = curr.next (Node 25)", vars: { val: 30, nodeAddr: "0x7ffd10b", current: 25, next: 40 } },
      { line: 5, desc: "Check insertion condition: curr.next (40) exists and 40 < 30 is FALSE. Exit loop.", vars: { val: 30, nodeAddr: "0x7ffd10b", current: 25, next: 40 } },
      { line: 8, desc: "Connect new node's next pointer forward to Node 40: newNode.next = curr.next", vars: { val: 30, nodeAddr: "0x7ffd10b", current: 25, next: 40 } },
      { line: 9, desc: "Update parent link: connect Node 25's next pointer to Node 30: curr.next = newNode", vars: { val: 30, nodeAddr: "0x7ffd10b", current: 25, next: 30 } },
      { line: 10, desc: "Insertion sequence finished. Return updated list head address.", vars: { val: 30, nodeAddr: "0x7ffd10b", current: 10, next: "null" } }
    ],
    'gradient-descent': [
      { line: 2, desc: "Initialize parameter weights: set w = 1.8", vars: { w: 1.8, learningRate: 0.1, step: "null", loss: "null" } },
      { line: 3, desc: "Start optimization iterations loop: step = 0", vars: { w: 1.8, learningRate: 0.1, step: 0, loss: "null" } },
      { line: 4, desc: "Calculate gradient (slope) at w = 1.8: grad = 2 * (1.8 - 0.5) = 2.6", vars: { w: 1.8, learningRate: 0.1, step: 0, gradient: 2.6, loss: "null" } },
      { line: 5, desc: "Perform gradient step weight update: w = 1.8 - 0.1 * 2.6 = 1.54", vars: { w: 1.54, learningRate: 0.1, step: 0, gradient: 2.6, loss: "null" } },
      { line: 6, desc: "Calculate mean squared error loss: loss = (1.54 - 0.5)² = 1.08", vars: { w: 1.54, learningRate: 0.1, step: 0, gradient: 2.6, loss: 1.08 } },
      { line: 7, desc: "Check convergence condition: abs(2.6) < 0.01 is FALSE", vars: { w: 1.54, learningRate: 0.1, step: 0, gradient: 2.6, loss: 1.08 } },
      { line: 3, desc: "Optimization loop: step = 1", vars: { w: 1.54, learningRate: 0.1, step: 1, loss: 1.08 } },
      { line: 4, desc: "Calculate gradient (slope) at w = 1.54: grad = 2 * (1.54 - 0.5) = 2.08", vars: { w: 1.54, learningRate: 0.1, step: 1, gradient: 2.08, loss: 1.08 } },
      { line: 5, desc: "Update weight: w = 1.54 - 0.1 * 2.08 = 1.332", vars: { w: 1.332, learningRate: 0.1, step: 1, gradient: 2.08, loss: 1.08 } },
      { line: 6, desc: "Calculate loss: loss = (1.332 - 0.5)² = 0.69", vars: { w: 1.332, learningRate: 0.1, step: 1, gradient: 2.08, loss: 0.69 } },
      { line: 7, desc: "Check convergence condition: abs(2.08) < 0.01 is FALSE", vars: { w: 1.332, learningRate: 0.1, step: 1, gradient: 2.08, loss: 0.69 } },
      { line: 3, desc: "Optimization loop: step = 2", vars: { w: 1.332, learningRate: 0.1, step: 2, loss: 0.69 } },
      { line: 4, desc: "Calculate gradient: grad = 2 * (1.332 - 0.5) = 1.66", vars: { w: 1.332, learningRate: 0.1, step: 2, gradient: 1.66, loss: 0.69 } },
      { line: 5, desc: "Update weight: w = 1.332 - 0.1 * 1.66 = 1.166", vars: { w: 1.166, learningRate: 0.1, step: 2, gradient: 1.66, loss: 0.69 } },
      { line: 6, desc: "Calculate loss: loss = (1.166 - 0.5)² = 0.44", vars: { w: 1.166, learningRate: 0.1, step: 2, gradient: 1.66, loss: 0.44 } },
      { line: 7, desc: "Weight parameters converging. Step completed.", vars: { w: 1.166, learningRate: 0.1, step: 2, gradient: 1.66, loss: 0.44 } }
    ],
    'fibonacci': [
      { line: 2, desc: "Check base conditions: n = 4. Since 4 <= 1 is FALSE, skip if block", vars: { n: 4, activeStackSize: 1, callStack: "fib(4)" } },
      { line: 5, desc: "Recursive division: calculate left call = fib(3)", vars: { n: 3, activeStackSize: 2, callStack: "fib(4) -> fib(3)" } },
      { line: 2, desc: "Check base conditions: n = 3. Since 3 <= 1 is FALSE, skip if block", vars: { n: 3, activeStackSize: 2, callStack: "fib(4) -> fib(3)" } },
      { line: 5, desc: "Recursive division: calculate left call = fib(2)", vars: { n: 2, activeStackSize: 3, callStack: "fib(4) -> fib(3) -> fib(2)" } },
      { line: 2, desc: "Check base conditions: n = 2. Since 2 <= 1 is FALSE, skip if block", vars: { n: 2, activeStackSize: 3, callStack: "fib(4) -> fib(3) -> fib(2)" } },
      { line: 5, desc: "Recursive division: calculate left call = fib(1)", vars: { n: 1, activeStackSize: 4, callStack: "fib(4) -> fib(3) -> fib(2) -> fib(1)" } },
      { line: 2, desc: "Check base conditions: n = 1. Since 1 <= 1 is TRUE, return 1 immediately.", vars: { n: 1, activeStackSize: 4, callStack: "fib(4) -> fib(3) -> fib(2) -> fib(1)" } },
      { line: 3, desc: "Pop stack: fib(1) returns 1. Resuming fib(2) frame", vars: { n: 2, activeStackSize: 3, callStack: "fib(4) -> fib(3) -> fib(2)", left: 1 } },
      { line: 6, desc: "Calculate right call for fib(2): right = fib(0)", vars: { n: 0, activeStackSize: 4, callStack: "fib(4) -> fib(3) -> fib(2) -> fib(0)", left: 1 } },
      { line: 2, desc: "Check base conditions: n = 0. Since 0 <= 1 is TRUE, return 0 immediately.", vars: { n: 0, activeStackSize: 4, callStack: "fib(4) -> fib(3) -> fib(2) -> fib(0)" } },
      { line: 3, desc: "Pop stack: fib(0) returns 0. Resuming fib(2) frame", vars: { n: 2, activeStackSize: 3, callStack: "fib(4) -> fib(3) -> fib(2)", left: 1, right: 0 } },
      { line: 7, desc: "Resolve fib(2): return left (1) + right (0) = 1. Pop fib(2) stack frame.", vars: { n: 2, activeStackSize: 2, callStack: "fib(4) -> fib(3)", left: 1, right: 0 } },
      { line: 6, desc: "Calculate right call for fib(3): right = fib(1)", vars: { n: 1, activeStackSize: 3, callStack: "fib(4) -> fib(3) -> fib(1)", left: 1 } },
      { line: 2, desc: "Check base conditions: n = 1. Since 1 <= 1 is TRUE, return 1 immediately.", vars: { n: 1, activeStackSize: 3, callStack: "fib(4) -> fib(3) -> fib(1)" } },
      { line: 3, desc: "Pop stack: fib(1) returns 1. Resuming fib(3) frame", vars: { n: 3, activeStackSize: 2, callStack: "fib(4) -> fib(3)", left: 1, right: 1 } },
      { line: 7, desc: "Resolve fib(3): return left (1) + right (1) = 2. Pop fib(3) stack frame.", vars: { n: 3, activeStackSize: 1, callStack: "fib(4)", left: 2 } }
    ]
  }

  // Visual structures templates
  const binarySearchArray = [3, 9, 14, 22, 29, 35, 48, 56, 67, 78, 89, 95]
  
  // Custom Step values override
  const getBspPointersForStep = (step) => {
    if (step <= 1) return { low: 0, high: 11, mid: -1 }
    if (step === 2) return { low: 0, high: 11, mid: -1 }
    if (step >= 3 && step <= 5) return { low: 0, high: 11, mid: 5 }
    if (step === 6) return { low: 6, high: 11, mid: 5 }
    if (step >= 7 && step <= 10) return { low: 6, high: 11, mid: 8 }
    if (step === 11) return { low: 6, high: 7, mid: 8 }
    if (step >= 12 && step <= 15) return { low: 6, high: 7, mid: 6 }
    if (step === 16) return { low: 7, high: 7, mid: 6 }
    return { low: 7, high: 7, mid: 7 }
  }

  // Linked list simulation nodes
  const getLinkedListNodesForStep = (step) => {
    const defaultNodes = [
      { id: 1, val: 10, next: 2 },
      { id: 2, val: 25, next: 3 },
      { id: 3, val: 40, next: 4 },
      { id: 4, val: 85, next: null }
    ]
    if (step < 6) return defaultNodes
    if (step === 6 || step === 7) {
      return [
        { id: 1, val: 10, next: 2 },
        { id: 2, val: 25, next: 3 },
        { id: 3, val: 40, next: 4 },
        { id: 4, val: 85, next: null },
        { id: 5, val: 30, next: 3 } // Node 30 links to Node 40
      ]
    }
    // Fully connected
    return [
      { id: 1, val: 10, next: 2 },
      { id: 2, val: 25, next: 5 }, // Node 25 links to Node 30
      { id: 5, val: 30, next: 3 }, // Node 30 links to Node 40
      { id: 3, val: 40, next: 4 },
      { id: 4, val: 85, next: null }
    ]
  }

  const getSortArrayForStep = (step) => {
    const list = [
      [45, 12, 32, 21, 69, 15], // 0
      [45, 12, 32, 21, 69, 15], // 1
      [45, 12, 32, 21, 69, 15], // 2
      [45, 12, 32, 21, 69, 15], // 3
      [12, 45, 32, 21, 69, 15], // 4
      [12, 45, 32, 21, 69, 15], // 5
      [12, 45, 32, 21, 69, 15], // 6
      [12, 32, 45, 21, 69, 15], // 7
      [12, 32, 45, 21, 69, 15], // 8
      [12, 32, 45, 21, 69, 15], // 9
      [12, 32, 21, 45, 69, 15], // 10
      [12, 32, 21, 45, 69, 15], // 11
      [12, 32, 21, 45, 69, 15], // 12
      [12, 32, 21, 45, 69, 15], // 13
      [12, 32, 21, 45, 69, 15], // 14
      [12, 32, 21, 45, 15, 69], // 15
      [12, 32, 21, 45, 15, 69], // 16
      [12, 32, 21, 45, 15, 69], // 17
      [12, 21, 32, 45, 15, 69], // 18
      [12, 21, 32, 15, 45, 69]  // 19
    ]
    return list[step] || [12, 21, 32, 15, 45, 69]
  }

  const getSortIndicesForStep = (step) => {
    if (step <= 1) return { i: -1, j: -1 }
    if (step === 2 || step === 3 || step === 4) return { i: 0, j: 1 }
    if (step === 5 || step === 6 || step === 7) return { i: 1, j: 2 }
    if (step === 8 || step === 9 || step === 10) return { i: 2, j: 3 }
    if (step === 11 || step === 12) return { i: 3, j: 4 }
    return { i: 4, j: 5 }
  }

  const traces = algoTraces[selectedAlgo] || []
  const currentTrace = traces[dsaStep] || { line: 0, desc: "Finished", vars: {} }

  const handleDsaNext = () => {
    setDsaStep((prev) => {
      if (prev >= traces.length - 1) {
        setDsaPlaying(false)
        return prev
      }
      return prev + 1
    })
  }

  const handleDsaReset = () => {
    setDsaStep(0)
    setDsaPlaying(false)
  }

  // Play steps ticker
  useEffect(() => {
    if (dsaPlaying) {
      playTimerRef.current = setInterval(() => {
        setDsaStep((prev) => {
          if (prev >= traces.length - 1) {
            setDsaPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, dsaSpeed)
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current)
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current)
    }
  }, [dsaPlaying, dsaSpeed, traces])

  // Sync template values if target changes
  useEffect(() => {
    const template = codeTemplates[selectedAlgo]?.javascript?.join('\n') || ''
    setCustomCode(template)
    setTestResults([])
    setCustomComplexities(null)
  }, [selectedAlgo])

  const testCases = {
    'binary-search': [
      { input: [[1, 3, 5, 7, 9], 5], expect: 2, name: 'Target in Middle' },
      { input: [[1, 3, 5, 7, 9], 1], expect: 0, name: 'Target at Start' },
      { input: [[1, 3, 5, 7, 9], 4], expect: -1, name: 'Target Missing' }
    ],
    'bubble-sort': [
      { input: [[5, 3, 8, 4, 2]], expect: [2, 3, 4, 5, 8], name: 'Unsorted Array' },
      { input: [[1, 2, 3, 4, 5]], expect: [1, 2, 3, 4, 5], name: 'Already Sorted' }
    ],
    'fibonacci': [
      { input: [5], expect: 5, name: 'N = 5' },
      { input: [10], expect: 55, name: 'N = 10' }
    ],
    'linked-list': [
      { input: [null, 5], expect: [5], name: 'Insert into Empty List' }
    ],
    'gradient-descent': [
      { input: [10.0, 0.1], expect: 2.0, name: 'Converge from 10.0' }
    ]
  }

  const analyzeCustomCode = (codeText, algoType) => {
    let timeComplexity = 'O(n)'
    let omegaComplexity = 'Ω(1)'
    let spaceComplexity = 'O(1)'

    const codeLower = (codeText || '').toLowerCase()

    if (algoType === 'bubble-sort' || codeLower.includes('bubble')) {
      const nestedLoops = (codeLower.match(/for\s*\(|while\s*\(/g) || []).length >= 2
      timeComplexity = nestedLoops ? 'O(n²)' : 'O(n)'
      omegaComplexity = codeLower.includes('break') ? 'Ω(n)' : 'Ω(n²)'
      spaceComplexity = 'O(1)'
    } else if (algoType === 'binary-search' || codeLower.includes('binary')) {
      timeComplexity = 'O(log n)'
      omegaComplexity = 'Ω(1)'
      spaceComplexity = 'O(1)'
    } else if (algoType === 'fibonacci' || codeLower.includes('fib')) {
      const hasRecursion = codeLower.includes('fib(') || codeLower.includes('fibonacci(')
      timeComplexity = hasRecursion ? 'O(2ⁿ)' : 'O(n)'
      omegaComplexity = 'Ω(1)'
      spaceComplexity = hasRecursion ? 'O(n)' : 'O(1)'
    } else {
      const loopCount = (codeLower.match(/for\s*\(|while\s*\(/g) || []).length
      if (loopCount === 0) {
        timeComplexity = 'O(1)'
        omegaComplexity = 'Ω(1)'
        spaceComplexity = 'O(1)'
      } else if (loopCount === 1) {
        timeComplexity = 'O(n)'
        omegaComplexity = 'Ω(1)'
        spaceComplexity = 'O(1)'
      } else if (loopCount >= 2) {
        timeComplexity = 'O(n²)'
        omegaComplexity = 'Ω(n)'
        spaceComplexity = 'O(1)'
      }
    }

    return { timeComplexity, omegaComplexity, spaceComplexity }
  }

  const handleRunTestSuite = () => {
    try {
      let fullCode = customCode
      if (selectedAlgo === 'linked-list') {
        fullCode = `
          class Node {
            constructor(val) {
              this.val = val;
              this.next = null;
            }
          }
          \n${fullCode}
        `
      }

      let funcName = 'binarySearch'
      if (selectedAlgo === 'bubble-sort') funcName = 'bubbleSort'
      if (selectedAlgo === 'linked-list') funcName = 'insertNode'
      if (selectedAlgo === 'gradient-descent') funcName = 'gradientDescent'
      if (selectedAlgo === 'fibonacci') funcName = 'fibonacci'

      const evalFunc = new Function(fullCode + `\nreturn ${funcName};`)
      const userFunc = evalFunc()

      const results = []
      const cases = testCases[selectedAlgo] || []

      for (let tc of cases) {
        let output
        let pass = false
        try {
          const clonedInputs = JSON.parse(JSON.stringify(tc.input))
          output = userFunc(...clonedInputs)

          if (Array.isArray(tc.expect)) {
            pass = JSON.stringify(output) === JSON.stringify(tc.expect)
          } else if (selectedAlgo === 'linked-list') {
            let vals = []
            let curr = output
            while (curr) {
              vals.push(curr.val)
              curr = curr.next
            }
            pass = JSON.stringify(vals) === JSON.stringify([5])
          } else if (selectedAlgo === 'gradient-descent') {
            pass = Math.abs(output - 2.0) < 0.2
          } else {
            pass = output === tc.expect
          }
        } catch (e) {
          output = `Error: ${e.message}`
          pass = false
        }
        results.push({ name: tc.name, expect: JSON.stringify(tc.expect), got: JSON.stringify(output), pass })
      }

      setTestResults(results)
      const analyzerResult = analyzeCustomCode(customCode, selectedAlgo)
      setCustomComplexities(analyzerResult)
    } catch (err) {
      setTestResults([{ name: 'Syntax/Compilation Error', expect: 'Valid syntax', got: err.message, pass: false }])
    }
  }

  const exitStudio = () => {
    window.location.hash = '#/'
  }

  // Sync template values if target changes
  const activeTemplate = codeTemplates[selectedAlgo] ? codeTemplates[selectedAlgo].javascript : []

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: '#020202',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: '#090909',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px' }}>🧩</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '800', letterSpacing: '0.06em' }}>
              DSA PLAY & STEP COMPILE STUDIO
            </h2>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              Line-by-line compiler execution visualizer sandbox
            </div>
          </div>
          
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', marginLeft: '24px' }}>
            <button
              onClick={() => setIsInteractiveMode(false)}
              style={{
                background: !isInteractiveMode ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
                border: 'none',
                color: !isInteractiveMode ? '#00f3ff' : '#888',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Simulation Mode
            </button>
            <button
              onClick={() => setIsInteractiveMode(true)}
              style={{
                background: isInteractiveMode ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
                border: 'none',
                color: isInteractiveMode ? '#00f3ff' : '#888',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Interactive Playground
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={exitStudio}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              fontWeight: '600',
              fontSize: '11px',
              padding: '6px 14px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={(e) => (e.target.style.background = 'rgba(255,255,255,0.08)')}
          >
            ← Exit Studio
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
            <button
              onClick={() => window.api && window.api.minimizeWindow && window.api.minimizeWindow()}
              style={{ background: 'transparent', border: 'none', color: '#888', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
              title="Minimize"
            >
              &#8212;
            </button>
            <button
              onClick={() => window.api && window.api.maximizeWindow && window.api.maximizeWindow()}
              style={{ background: 'transparent', border: 'none', color: '#888', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
              title="Maximize"
            >
              &#9633;
            </button>
            <button
              onClick={() => window.api && window.api.closeWindow && window.api.closeWindow()}
              style={{ background: 'transparent', border: 'none', color: '#888', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
              title="Close"
            >
              &#10005;
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          padding: '16px 20px',
          gap: '20px',
          overflow: 'hidden',
          boxSizing: 'border-box',
          height: 'calc(100vh - 48px - 28px)'
        }}
      >
        {!isInteractiveMode ? (
          <div
            style={{
              background: '#070707',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                background: '#0d0d0d',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                <span>💻</span>
                <span>Compiler Source Highlighting</span>
              </div>
              <div style={{ fontSize: '10px', color: '#ff4d4f', fontWeight: 'bold' }}>
                ● LINE {currentTrace.line} ACTIVE
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: '24px',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '13px',
                lineHeight: '2.1',
                background: '#030303',
                overflowY: 'auto'
              }}
            >
              {activeTemplate.map((codeLine, idx) => {
                const lineNum = idx + 1
                const isActive = lineNum === currentTrace.line
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                      color: isActive ? '#ffffff' : 'rgba(255,255,255,0.45)',
                      borderLeft: isActive ? '4px solid #ffffff' : '4px solid transparent',
                      paddingLeft: '12px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span
                      style={{
                        width: '32px',
                        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.18)',
                        userSelect: 'none',
                        textAlign: 'right',
                        paddingRight: '16px'
                      }}
                    >
                      {lineNum}
                    </span>
                    <pre style={{ margin: 0, fontFamily: 'inherit' }}>{codeLine}</pre>
                  </div>
                )
              })}
            </div>

            <div
              style={{
                padding: '16px 20px',
                background: '#090909',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                minHeight: '60px'
              }}
            >
              <div style={{ fontSize: '10px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Step {dsaStep + 1} of {traces.length}: Compiler Evaluation Note
              </div>
              <div style={{ fontSize: '12px', color: '#eee', marginTop: '6px', fontWeight: '600', lineHeight: '1.4' }}>
                {currentTrace.desc}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#070707',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                background: '#0d0d0d',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                <span>✍️</span>
                <span>Interactive Code Playground</span>
              </div>
              <button
                onClick={handleRunTestSuite}
                style={{
                  background: 'linear-gradient(135deg, #00ffaa 0%, #00bfff 100%)',
                  border: 'none',
                  color: '#020617',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(0,255,170,0.3)'
                }}
              >
                ⚡ Compile & Run
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                spellCheck="false"
                style={{
                  flex: 1,
                  background: '#030303',
                  color: '#00f3ff',
                  border: 'none',
                  padding: '16px',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: '13px',
                  lineHeight: '1.6',
                  resize: 'none',
                  outline: 'none',
                  overflowY: 'auto'
                }}
              />
              
              <div
                style={{
                  height: '180px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  background: '#090909',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '8px 16px', background: '#0d0d0d', fontSize: '10px', fontWeight: 'bold', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  TEST SUITE TELEMETRY
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {testResults.length === 0 ? (
                    <div style={{ color: '#666', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', marginTop: '30px' }}>
                      Click "⚡ Compile & Run" to execute test cases.
                    </div>
                  ) : (
                    testResults.map((tr, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: tr.pass ? 'rgba(0, 255, 170, 0.04)' : 'rgba(255, 77, 79, 0.04)', border: tr.pass ? '1px solid rgba(0, 255, 170, 0.15)' : '1px solid rgba(255, 77, 79, 0.15)', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{tr.name}</span>
                          <span style={{ fontSize: '9px', color: '#888' }}>Expect: {tr.expect} | Got: <span style={{ color: tr.pass ? '#00ffaa' : '#ff4d4f' }}>{tr.got}</span></span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: tr.pass ? '#00ffaa' : '#ff4d4f', marginLeft: 'auto' }}>
                          {tr.pass ? '✓ PASS' : '✗ FAIL'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isInteractiveMode ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}
          >
            <div
              style={{
                background: '#070707',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#00ffaa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚡</span>
                  <span>AST CODE EXECUTION FLOWCHART</span>
                </div>
                <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 'bold' }}>
                  Loop-in-Loop Hierarchy
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
                {parseCustomCodeFlowchart(customCode).map((node, idx, arr) => {
                  const isSelected = selectedFlowNode === node.id || (!selectedFlowNode && idx === 0)
                  return (
                    <React.Fragment key={node.id}>
                      <div
                        onClick={() => setSelectedFlowNode(node.id)}
                        style={{
                          background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                          border: isSelected ? `1px solid ${node.color}` : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: isSelected ? `0 0 12px ${node.color}33` : 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '9.5px', fontWeight: '800', color: node.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {node.badge}
                          </span>
                          <span style={{ fontSize: '9px', color: '#666' }}>Node #{idx + 1}</span>
                        </div>
                        <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#fff', fontFamily: 'monospace' }}>
                          {node.title}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.4' }}>
                          {node.detail}
                        </div>
                      </div>

                      {idx < arr.length - 1 && (
                        <div style={{ textAlign: 'center', color: node.color, fontSize: '12px', lineHeight: '1', opacity: 0.7 }}>
                          ↓
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>

            <div
              style={{
                background: '#090909',
                border: '1px solid rgba(0, 255, 170, 0.25)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#00ffaa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎯</span>
                <span>WHERE & HOW THE OUTPUT COMES</span>
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.5' }}>
                The algorithm traverses input sequences through the loop-in-loop state hierarchy. When the predicate evaluates to true, the return statement yields the final result to caller without redundant passes.
              </div>
            </div>

            <div
              style={{
                background: '#070707',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#666', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px', textTransform: 'uppercase' }}>
                Big-O Telemetry Dashboard
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ background: '#030303', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '9px', color: '#666' }}>Time O(•)</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#00f3ff', marginTop: '2px', fontFamily: 'monospace' }}>
                    {customComplexities ? customComplexities.timeComplexity : 'O(n)'}
                  </div>
                </div>

                <div style={{ background: '#030303', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '9px', color: '#666' }}>Best Ω(•)</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#00ffaa', marginTop: '2px', fontFamily: 'monospace' }}>
                    {customComplexities ? customComplexities.omegaComplexity : 'Ω(1)'}
                  </div>
                </div>

                <div style={{ background: '#030303', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '9px', color: '#666' }}>Space S(•)</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#ff00c8', marginTop: '2px', fontFamily: 'monospace' }}>
                    {customComplexities ? customComplexities.spaceComplexity : 'O(1)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}
          >
            <div
              style={{
                background: '#070707',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#888', marginBottom: '12px' }}>
                SELECT TRACE ALGORITHM
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[
                  { id: 'binary-search', label: '🔍 Binary Search' },
                  { id: 'bubble-sort', label: '📊 Bubble Sort' },
                  { id: 'linked-list', label: '🔗 Linked List' },
                  { id: 'gradient-descent', label: '📉 Gradient Descent' },
                  { id: 'fibonacci', label: '🌀 Fibonacci Stack' }
                ].map((algo) => (
                  <button
                    key={algo.id}
                    onClick={() => {
                      setSelectedAlgo(algo.id)
                      setDsaStep(0)
                      setDsaPlaying(false)
                    }}
                    style={{
                      background: selectedAlgo === algo.id ? '#ffffff' : 'rgba(255,255,255,0.04)',
                      border: selectedAlgo === algo.id ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.08)',
                      color: selectedAlgo === algo.id ? '#000000' : '#cccccc',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    {algo.label}
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '10px 14px',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleDsaReset}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: 'none',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}
                  >
                    ⏮ Reset
                  </button>
                  <button
                    onClick={() => setDsaPlaying(!dsaPlaying)}
                    style={{
                      background: '#ffffff',
                      border: 'none',
                      color: '#000',
                      fontWeight: 'bold',
                      padding: '6px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '10px'
                    }}
                  >
                    {dsaPlaying ? '⏸ Pause' : '▶ Auto Play'}
                  </button>
                  <button
                    onClick={handleDsaNext}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}
                  >
                    ▶▶ Step Next
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    { label: 'Slow', speed: 2000 },
                    { label: 'Normal', speed: 1500 },
                    { label: 'Fast', speed: 800 }
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setDsaSpeed(s.speed)}
                      style={{
                        background: dsaSpeed === s.speed ? '#ffffff' : 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: dsaSpeed === s.speed ? '#000' : '#aaa',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        fontSize: '9px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#070707',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '20px',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '14px', textTransform: 'uppercase' }}>
                Interactive Visual Arena
              </div>

              {selectedAlgo === 'binary-search' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#aaa', textAlign: 'center', marginBottom: '8px' }}>
                    Searching Target: <span style={{ color: '#fff', fontWeight: 'bold' }}>56</span>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', padding: '16px 0', justifyContent: 'center' }}>
                    {binarySearchArray.map((num, idx) => {
                      const pointers = getBspPointersForStep(dsaStep)
                      const isLow = idx === pointers.low
                      const isHigh = idx === pointers.high
                      const isMid = idx === pointers.mid
                      const inRange = idx >= pointers.low && idx <= pointers.high

                      let bg = 'rgba(255,255,255,0.03)'
                      let border = '1px solid rgba(255,255,255,0.1)'
                      let color = '#777'

                      if (inRange) {
                        bg = 'rgba(255,255,255,0.06)'
                        border = '1px solid rgba(255,255,255,0.3)'
                        color = '#ccc'
                      }
                      if (isMid) {
                        bg = 'rgba(255, 255, 255, 0.2)'
                        border = '1px solid #ffffff'
                        color = '#ffffff'
                      }
                      if (num === 56 && isMid && dsaStep >= 19) {
                        bg = '#ffffff'
                        color = '#000000'
                        border = '1px solid #ffffff'
                      }

                      return (
                        <div
                          key={idx}
                          style={{
                            width: '38px',
                            height: '42px',
                            background: bg,
                            border: border,
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: color,
                            fontWeight: 'bold',
                            fontSize: '13px',
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                        >
                          <span>{num}</span>
                          <span style={{ fontSize: '8px', position: 'absolute', bottom: '2px', opacity: 0.6 }}>
                            {isLow && 'L'} {isMid && 'M'} {isHigh && 'H'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedAlgo === 'bubble-sort' && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '140px', justifyContent: 'center', padding: '10px 0' }}>
                  {getSortArrayForStep(dsaStep).map((num, idx) => {
                    const indices = getSortIndicesForStep(dsaStep)
                    const isComparing = idx === indices.i || idx === indices.j
                    return (
                      <div
                        key={idx}
                        style={{
                          width: '32px',
                          height: `${(num / 90) * 100}px`,
                          background: isComparing ? 'linear-gradient(180deg, #ff4d4f 0%, #ff7875 100%)' : 'rgba(255,255,255,0.1)',
                          border: isComparing ? '1px solid #ff4d4f' : '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          transition: 'all 0.2s'
                        }}
                      >
                        {num}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div
              style={{
                background: '#070707',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '10px', textTransform: 'uppercase' }}>
                State Machine Registry
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {Object.keys(currentTrace.vars || {}).map((keyName) => (
                  <div
                    key={keyName}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>{keyName}</span>
                    <span style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {currentTrace.vars[keyName]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: '28px',
          minHeight: '28px',
          maxHeight: '28px',
          background: '#090909',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: '11px',
          color: '#888',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#00ffaa', fontWeight: 'bold' }}>
            ● {isInteractiveMode ? 'Interactive Playground Mode' : 'Algorithm Simulation Mode'}
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>Active: {isInteractiveMode ? 'Custom Source Code AST' : selectedAlgo}</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ color: '#00f3ff' }}>V8 Runtime Engine: Online</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Tests: {testResults.filter((t) => t.pass).length}/{testResults.length} Passed</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>Memory: Safe O(1)</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>Ready</span>
        </div>
      </footer>
    </div>
  )
}

export default DsaStudioPage
