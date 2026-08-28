import React, { useState, useEffect, useRef } from 'react'

const DsaStudioPage = () => {
  const [selectedAlgo, setSelectedAlgo] = useState('binary-search')
  const [dsaStep, setDsaStep] = useState(0)
  const [dsaPlaying, setDsaPlaying] = useState(false)
  const [dsaSpeed, setDsaSpeed] = useState(1500)
  const [selectedLang, setSelectedLang] = useState('javascript')
  const [customInputVal, setCustomInputVal] = useState('56')

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
        </div>

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
          ✕ Exit Studio
        </button>
      </div>

      {/* Main Studio Arena */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          padding: '20px',
          gap: '20px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* LEFT COLUMN: Huge Code Compiler Simulation Viewer */}
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

          {/* Trace Description Banner */}
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

        {/* RIGHT COLUMN: Visual Arena & Complexity Dashboard */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}
        >
          {/* Algorithm Switcher Grid */}
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

            {/* Playback Controls Panel */}
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

              {/* Speed Buttons */}
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

          {/* Graphical Visualization Sandbox Area */}
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

            {/* Binary Search Visualization */}
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
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          background: bg,
                          border: border,
                          color: color,
                          fontSize: '11px',
                          fontWeight: 'bold',
                          position: 'relative',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {num}
                        {isLow && <span style={{ position: 'absolute', top: '-18px', fontSize: '8px', color: '#fff', fontWeight: 'bold' }}>LOW</span>}
                        {isMid && <span style={{ position: 'absolute', bottom: '-18px', fontSize: '8px', color: '#ffffff', fontWeight: 'bold' }}>MID</span>}
                        {isHigh && <span style={{ position: 'absolute', top: '-18px', fontSize: '8px', color: '#fff', fontWeight: 'bold' }}>HIGH</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Bubble Sort Visualization */}
            {selectedAlgo === 'bubble-sort' && (
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', height: '110px', padding: '10px 0' }}>
                {getSortArrayForStep(dsaStep).map((val, idx) => {
                  const indices = getSortIndicesForStep(dsaStep)
                  const isComparing = idx === indices.i || idx === indices.j
                  const isSorted = idx >= 6 - Math.floor(dsaStep / 10) // highlight sorted end
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: isComparing ? '#fff' : '#666' }}>{val}</span>
                      <div
                        style={{
                          width: '28px',
                          height: `${val * 1.1}px`,
                          background: isComparing ? '#ffffff' : isSorted ? 'rgba(255,255,255,0.4)' : '#333',
                          borderRadius: '4px 4px 0 0',
                          transition: 'all 0.3s ease',
                          border: isComparing ? '1px solid #fff' : 'none'
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Linked List Insertion Visualization */}
            {selectedAlgo === 'linked-list' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', overflowX: 'auto', padding: '16px 0' }}>
                {getLinkedListNodesForStep(dsaStep).map((node) => {
                  const isNew = node.id === 5
                  const isCurr = dsaStep === 4 && node.val === 25
                  
                  return (
                    <React.Fragment key={node.id}>
                      <div
                        style={{
                          minWidth: '42px',
                          height: '42px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '6px',
                          background: isNew ? '#ffffff' : isCurr ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                          border: isNew ? '1px solid #ffffff' : isCurr ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.15)',
                          color: isNew ? '#000000' : '#ffffff',
                          transition: 'all 0.3s'
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{node.val}</div>
                        <div style={{ fontSize: '7px', opacity: isNew ? 0.7 : 0.4 }}>node#{node.id}</div>
                      </div>
                      {node.next ? (
                        <span style={{ color: '#666', fontSize: '14px', fontWeight: 'bold' }}>──▶</span>
                      ) : (
                        <span style={{ color: '#444', fontSize: '8px', fontWeight: 'bold' }}>NULL</span>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            )}

            {/* Gradient Descent Visualization */}
            {selectedAlgo === 'gradient-descent' && (
              <div style={{ height: '110px', background: '#030303', borderRadius: '8px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 400 150" style={{ width: '80%', height: '100%' }}>
                  <path d="M 20,20 Q 200,160 380,20" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2" />
                  <circle
                    cx={200 + (1.8 - (currentTrace.vars.w || 1.8)) * 140}
                    cy={110 - Math.pow((currentTrace.vars.w || 1.8) - 0.5, 2) * 20}
                    r="8"
                    fill="#ffffff"
                    style={{ filter: 'drop-shadow(0 0 6px #ffffff)', transition: 'all 0.5s ease' }}
                  />
                </svg>
              </div>
            )}

            {/* Fibonacci Stack Visualization */}
            {selectedAlgo === 'fibonacci' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '10px', color: '#aaa' }}>
                  Call Stack: <span style={{ fontFamily: 'monospace', color: '#ffffff' }}>{currentTrace.vars.callStack || 'empty'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '10px', minHeight: '80px', justifyContent: 'flex-start' }}>
                  {Array.from({ length: currentTrace.vars.activeStackSize || 1 }).map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        background: idx === (currentTrace.vars.activeStackSize - 1) ? '#ffffff' : 'rgba(255,255,255,0.1)',
                        color: idx === (currentTrace.vars.activeStackSize - 1) ? '#000000' : '#ffffff',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        borderRadius: '3px',
                        textAlign: 'center',
                        fontFamily: 'monospace'
                      }}
                    >
                      {idx === 0 ? "fib(4) entry" : idx === 1 ? "fib(3) left frame" : idx === 2 ? "fib(2) recursive frame" : "fib(1) base return"}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Local Variables Telemetry Inspector */}
          <div
            style={{
              background: '#070707',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '10px', textTransform: 'uppercase' }}>
              Local Variable Telemetry
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {Object.keys(currentTrace.vars).map((keyName) => (
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

          {/* Complexity Telemetry Dashboard */}
          <div
            style={{
              background: '#070707',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', textTransform: 'uppercase' }}>
              Big-O Telemetry Dashboard
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{ background: '#030303', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '9px', color: '#666' }}>Average Time</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', marginTop: '4px', fontFamily: 'monospace' }}>
                  {selectedAlgo === 'binary-search' && 'O(log n)'}
                  {selectedAlgo === 'bubble-sort' && 'O(n²)'}
                  {selectedAlgo === 'linked-list' && 'O(n)'}
                  {selectedAlgo === 'gradient-descent' && 'O(E)'}
                  {selectedAlgo === 'fibonacci' && 'O(2ⁿ)'}
                </div>
              </div>

              <div style={{ background: '#030303', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '9px', color: '#666' }}>Worst Time</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', marginTop: '4px', fontFamily: 'monospace' }}>
                  {selectedAlgo === 'binary-search' && 'O(log n)'}
                  {selectedAlgo === 'bubble-sort' && 'O(n²)'}
                  {selectedAlgo === 'linked-list' && 'O(n)'}
                  {selectedAlgo === 'gradient-descent' && 'O(E)'}
                  {selectedAlgo === 'fibonacci' && 'O(2ⁿ)'}
                </div>
              </div>

              <div style={{ background: '#030303', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '9px', color: '#666' }}>Auxiliary Space</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', marginTop: '4px', fontFamily: 'monospace' }}>
                  {selectedAlgo === 'binary-search' && 'O(1)'}
                  {selectedAlgo === 'bubble-sort' && 'O(1)'}
                  {selectedAlgo === 'linked-list' && 'O(1)'}
                  {selectedAlgo === 'gradient-descent' && 'O(1)'}
                  {selectedAlgo === 'fibonacci' && 'O(n)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DsaStudioPage
