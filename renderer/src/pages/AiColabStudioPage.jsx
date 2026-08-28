import React, { useState, useEffect, useRef } from 'react'
import '../css/AiColabStudio.css'

const AiColabStudioPage = () => {
  const [activeTab, setActiveTab] = useState('model-builder') // 'model-builder', 'dsa-visualizer', 'ai-setup-wizard'

  // Model Builder States (Local AI Focus)
  const [promptInput, setPromptInput] = useState('Build a Local Spam & Fraud Email Detector Model')
  const [isGeneratingModel, setIsGeneratingModel] = useState(false)
  const [activePreset, setActivePreset] = useState('spam-detector')
  const [pipelineGenerated, setPipelineGenerated] = useState(true)

  // Cell Execution States
  const [cell1Running, setCell1Running] = useState(false)
  const [cell1Done, setCell1Done] = useState(true)
  
  const [cell2Running, setCell2Running] = useState(false)
  const [cell2Done, setCell2Done] = useState(true)

  const [cell3Running, setCell3Running] = useState(false)
  const [cell3Done, setCell3Done] = useState(true)

  // Live Training States (Cell 4)
  const [trainingActive, setTrainingActive] = useState(false)
  const [currentEpoch, setCurrentEpoch] = useState(1)
  const [maxEpochs] = useState(12)
  const [trainingHistory, setTrainingHistory] = useState([
    { epoch: 1, loss: 0.842, acc: 0.62 },
    { epoch: 2, loss: 0.685, acc: 0.74 },
    { epoch: 3, loss: 0.512, acc: 0.83 },
    { epoch: 4, loss: 0.395, acc: 0.89 },
    { epoch: 5, loss: 0.284, acc: 0.93 }
  ])
  const [currentLoss, setCurrentLoss] = useState(0.284)
  const [currentAcc, setCurrentAcc] = useState(0.93)

  // Live Inference States (Cell 5)
  const [inferenceInput, setInferenceInput] = useState(
    'Congratulations! You have won a $1,000 Walmart Giftcard. Click here to claim your reward immediately.'
  )
  const [inferenceResult, setInferenceResult] = useState({
    prediction: 'SPAM / PHISHING',
    confidence: 99.4,
    classProbabilities: [
      { label: 'Spam / Malicious', prob: 99.4, color: '#a855f7' },
      { label: 'Legitimate / Ham', prob: 0.6, color: '#58a6ff' }
    ],
    tokens: [
      { word: 'Congratulations!', weight: 0.95 },
      { word: 'won', weight: 0.88 },
      { word: '$1,000', weight: 0.92 },
      { word: 'Giftcard', weight: 0.89 },
      { word: 'claim', weight: 0.84 },
      { word: 'immediately', weight: 0.91 }
    ]
  })

  // DSA Visualizer States
  const [selectedAlgo, setSelectedAlgo] = useState('binary-search') // 'binary-search', 'linked-list', 'bubble-sort', 'gradient-descent'
  const [dsaStep, setDsaStep] = useState(0)
  const [dsaPlaying, setDsaPlaying] = useState(false)
  const [dsaSpeed, setDsaSpeed] = useState(1200)

  // DSA Structures
  const binarySearchArray = [3, 9, 14, 22, 29, 35, 48, 56, 67, 78, 89, 95]
  const targetBinarySearch = 56
  const [bsPointers, setBsPointers] = useState({ low: 0, high: 11, mid: 5 })

  // Linked list simulation nodes
  const [linkedList, setLinkedList] = useState([
    { id: 1, val: 10, next: 2 },
    { id: 2, val: 25, next: 3 },
    { id: 3, val: 40, next: 4 },
    { id: 4, val: 85, next: null }
  ])

  // Sorting array
  const [sortArray, setSortArray] = useState([45, 12, 85, 32, 89, 39, 69, 21])
  const [sortIndices, setSortIndices] = useState({ i: 0, j: 1, comparing: false, swapping: false })

  const [selectedLang, setSelectedLang] = useState('python')
  const [userCode, setUserCode] = useState('')

  const codeTemplates = {
    'binary-search': {
      python: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
      javascript: `function binarySearch(arr, target) {
    let low = 0;
    let high = arr.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}`,
      cpp: `int binarySearch(int arr[], int size, int target) {
    int low = 0;
    int high = size - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target)
            return mid;
        if (arr[mid] < target)
            low = mid + 1;
        else
            high = mid - 1;
    }
    return -1;
}`
    },
    'linked-list': {
      python: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def insert_node(head, val):
    new_node = Node(val)
    if not head:
        return new_node
    curr = head
    while curr.next and curr.next.val < val:
        curr = curr.next
    new_node.next = curr.next
    curr.next = new_node
    return head`,
      javascript: `class Node {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

function insertNode(head, val) {
    let newNode = new Node(val);
    if (!head) return newNode;
    let curr = head;
    while (curr.next && curr.next.val < val) {
        curr = curr.next;
    }
    newNode.next = curr.next;
    curr.next = newNode;
    return head;
}`,
      cpp: `struct Node {
    int val;
    Node* next;
    Node(int x) : val(x), next(nullptr) {}
};

Node* insertNode(Node* head, int val) {
    Node* newNode = new Node(val);
    if (!head) return newNode;
    Node* curr = head;
    while (curr->next && curr->next->val < val) {
        curr = curr->next;
    }
    newNode->next = curr->next;
    curr->next = newNode;
    return head;
}`
    },
    'bubble-sort': {
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`,
      javascript: `function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}`,
      cpp: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`
    },
    'gradient-descent': {
      python: `def gradient_descent(init_w, lr, epochs):
    w = init_w
    for epoch in range(epochs):
        grad = 2 * w # derivative of w^2
        w = w - lr * grad
    return w`,
      javascript: `function gradientDescent(initW, lr, epochs) {
    let w = initW;
    for (let epoch = 0; epoch < epochs; epoch++) {
        let grad = 2 * w; // derivative of w^2
        w = w - lr * grad;
    }
    return w;
}`,
      cpp: `double gradientDescent(double initW, double lr, int epochs) {
    double w = initW;
    for (int epoch = 0; epoch < epochs; epoch++) {
        double grad = 2 * w; // derivative of w^2
        w = w - lr * grad;
    }
    return w;
}`
    }
  }

  useEffect(() => {
    if (codeTemplates[selectedAlgo]) {
      setUserCode(codeTemplates[selectedAlgo][selectedLang] || '')
    }
  }, [selectedAlgo, selectedLang])

  // Presets
  const presets = [
    {
      id: 'spam-detector',
      title: '🛡️ Spam Classifier (Local NLP)',
      prompt: 'Build a Local Spam & Fraud Email Detector Model',
      type: 'Text Classification',
      framework: 'Local PyTorch + BERT'
    },
    {
      id: 'image-classifier',
      title: '🐱 Pet Image Classifier (CNN)',
      prompt: 'Build a Local CNN to classify Cats vs Dogs',
      type: 'Computer Vision',
      framework: 'Local PyTorch ConvNet'
    },
    {
      id: 'price-prediction',
      title: '📈 House Price Estimator',
      prompt: 'Build a Local MLP for House Price Prediction',
      type: 'Tabular Regression',
      framework: 'Local Scikit-Learn MLP'
    }
  ]

  // Prompt generate pipeline
  const handleGenerateModelFromPrompt = () => {
    setIsGeneratingModel(true)
    setTimeout(() => {
      setIsGeneratingModel(false)
      setPipelineGenerated(true)
      setCurrentEpoch(1)
      setTrainingHistory([{ epoch: 1, loss: 0.842, acc: 0.62 }])
      setCurrentLoss(0.842)
      setCurrentAcc(0.62)
    }, 1000)
  }

  // Live Training Loop (Cell 4)
  useEffect(() => {
    let timer = null
    if (trainingActive) {
      timer = setInterval(() => {
        setCurrentEpoch((prev) => {
          if (prev >= maxEpochs) {
            setTrainingActive(false)
            return prev
          }
          const next = prev + 1
          const newLoss = Math.max(0.015, +(currentLoss * 0.72 + (Math.random() * 0.02 - 0.01)).toFixed(3))
          const newAcc = Math.min(0.995, +(currentAcc + (1 - currentAcc) * 0.32).toFixed(3))

          setCurrentLoss(newLoss)
          setCurrentAcc(newAcc)
          setTrainingHistory((hist) => [...hist, { epoch: next, loss: newLoss, acc: newAcc }])
          return next
        })
      }, 800)
    }
    return () => clearInterval(timer)
  }, [trainingActive, currentLoss, currentAcc, maxEpochs])

  // Live Inference Test
  const handleRunInference = () => {
    const text = (inferenceInput || '').toLowerCase()
    if (
      text.includes('win') ||
      text.includes('won') ||
      text.includes('giftcard') ||
      text.includes('claim') ||
      text.includes('dollar') ||
      text.includes('$') ||
      text.includes('urgent') ||
      text.includes('click') ||
      text.includes('free')
    ) {
      setInferenceResult({
        prediction: 'SPAM / MALICIOUS PHISHING',
        confidence: 99.2,
        classProbabilities: [
          { label: 'Spam / Phishing', prob: 99.2, color: '#a855f7' },
          { label: 'Legitimate / Ham', prob: 0.8, color: '#58a6ff' }
        ],
        tokens: text.split(' ').slice(0, 8).map((w) => ({ word: w, weight: +(Math.random() * 0.4 + 0.6).toFixed(2) }))
      })
    } else {
      setInferenceResult({
        prediction: 'LEGITIMATE (HAM)',
        confidence: 98.6,
        classProbabilities: [
          { label: 'Spam / Phishing', prob: 1.4, color: '#a855f7' },
          { label: 'Legitimate / Ham', prob: 98.6, color: '#58a6ff' }
        ],
        tokens: text.split(' ').slice(0, 8).map((w) => ({ word: w, weight: +(Math.random() * 0.2).toFixed(2) }))
      })
    }
  }

  // DSA Stepper Effect Loop
  useEffect(() => {
    let interval = null
    if (dsaPlaying) {
      interval = setInterval(() => {
        handleDsaNext()
      }, dsaSpeed)
    }
    return () => clearInterval(interval)
  }, [dsaPlaying, dsaStep, selectedAlgo, dsaSpeed])

  const handleDsaNext = () => {
    setDsaStep((prev) => {
      let next = prev + 1

      if (selectedAlgo === 'binary-search') {
        if (next > 3) {
          setDsaPlaying(false)
          return 3
        }
        if (next === 1) setBsPointers({ low: 0, high: 11, mid: 5 }) // mid index = 5 (value 35)
        if (next === 2) setBsPointers({ low: 6, high: 11, mid: 8 }) // mid index = 8 (value 67)
        if (next === 3) setBsPointers({ low: 6, high: 7, mid: 7 })   // mid index = 7 (value 56) FOUND!
        return next
      }

      if (selectedAlgo === 'linked-list') {
        if (next > 3) {
          setDsaPlaying(false)
          return 3
        }
        if (next === 1) {
          // Traverse: highlights curr as Node 25
        }
        if (next === 2) {
          // Create new node in memory
        }
        if (next === 3) {
          // Insert Node 30
          setLinkedList([
            { id: 1, val: 10, next: 2 },
            { id: 2, val: 25, next: 5 },
            { id: 5, val: 30, next: 3 },
            { id: 3, val: 40, next: 4 },
            { id: 4, val: 85, next: null }
          ])
        }
        return next
      }

      if (selectedAlgo === 'bubble-sort') {
        if (next > 5) {
          setDsaPlaying(false)
          return 5
        }
        setSortArray((arr) => {
          const nextArr = [...arr]
          if (next === 1) {
            // Compare index 0 (45) and index 1 (12) -> Swap!
            setSortIndices({ i: 0, j: 1, comparing: true, swapping: true })
            const temp = nextArr[0]
            nextArr[0] = nextArr[1]
            nextArr[1] = temp
          } else if (next === 2) {
            // Compare index 2 (85) and index 3 (32) -> Swap!
            setSortIndices({ i: 2, j: 3, comparing: true, swapping: true })
            const temp = nextArr[2]
            nextArr[2] = nextArr[3]
            nextArr[3] = temp
          } else if (next === 3) {
            // Compare index 4 (89) and index 5 (39) -> Swap!
            setSortIndices({ i: 4, j: 5, comparing: true, swapping: true })
            const temp = nextArr[4]
            nextArr[4] = nextArr[5]
            nextArr[5] = temp
          } else if (next === 4) {
            // Compare index 5 (89) and index 6 (69) -> Swap!
            setSortIndices({ i: 5, j: 6, comparing: true, swapping: true })
            const temp = nextArr[5]
            nextArr[5] = nextArr[6]
            nextArr[6] = temp
          } else if (next === 5) {
            // Compare index 6 (89) and 7 (21) -> Swap!
            setSortIndices({ i: 6, j: 7, comparing: true, swapping: true })
            const temp = nextArr[6]
            nextArr[6] = nextArr[7]
            nextArr[7] = temp
          }
          return nextArr
        })
        return next
      }

      if (selectedAlgo === 'gradient-descent') {
        if (next > 4) {
          setDsaPlaying(false)
          return 4
        }
        return next
      }

      return next
    })
  }

  const handleDsaReset = () => {
    setDsaPlaying(false)
    setDsaStep(0)
    if (selectedAlgo === 'binary-search') {
      setBsPointers({ low: 0, high: 11, mid: 5 })
    } else if (selectedAlgo === 'linked-list') {
      setLinkedList([
        { id: 1, val: 10, next: 2 },
        { id: 2, val: 25, next: 3 },
        { id: 3, val: 40, next: 4 },
        { id: 4, val: 85, next: null }
      ])
    } else if (selectedAlgo === 'bubble-sort') {
      setSortArray([45, 12, 85, 32, 89, 39, 69, 21])
      setSortIndices({ i: 0, j: 1, comparing: false, swapping: false })
    }
  }

  const executeCell = (cellId, timeMs) => {
    if (cellId === 1) {
      setCell1Running(true)
      setTimeout(() => {
        setCell1Running(false)
        setCell1Done(true)
      }, timeMs)
    } else if (cellId === 2) {
      setCell2Running(true)
      setTimeout(() => {
        setCell2Running(false)
        setCell2Done(true)
      }, timeMs)
    } else if (cellId === 3) {
      setCell3Running(true)
      setTimeout(() => {
        setCell3Running(false)
        setCell3Done(true)
      }, timeMs)
    }
  }

  return (
    <div className="colab-studio-container">
      {/* Colab Top Header */}
      <div className="colab-header">
        <div className="colab-title-row">
          <span className="colab-badge" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #bb86fc 100%)' }}>
            LOCAL CORE
          </span>
          <div>
            <div className="colab-notebook-name">
              <span>⚡ Xenithra_Local_AI_Model_DSA_Studio.ipynb</span>
              <span style={{ fontSize: '11px', color: '#d8b4fe' }}>[Connected to Local Python 3.11 Kernel]</span>
            </div>
            <div className="colab-nav-menus">
              <span>File</span>
              <span>Edit</span>
              <span>View</span>
              <span>Insert</span>
              <span>Runtime</span>
              <span>Tools</span>
              <span>Help</span>
            </div>
          </div>
        </div>

        {/* Resource Telemetry - Local PC only */}
        <div className="colab-resource-metrics">
          <div className="metric-pill">
            <span className="metric-indicator" style={{ background: '#d8b4fe', boxShadow: '0 0 6px #d8b4fe' }} />
            <span style={{ color: '#d8b4fe', fontWeight: 'bold' }}>Local CPU/GPU Engine</span>
          </div>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>RAM: 3.4GB / 16.0GB</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>CPU Load: 12%</span>
        </div>
      </div>

      {/* Module Switcher Tabs */}
      <div className="colab-action-bar">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`colab-tab-btn ${activeTab === 'model-builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('model-builder')}
            style={{
              color: activeTab === 'model-builder' ? '#d8b4fe' : '#8b949e',
              borderColor: activeTab === 'model-builder' ? 'rgba(168, 85, 247, 0.4)' : 'transparent',
              background: activeTab === 'model-builder' ? 'rgba(168, 85, 247, 0.12)' : 'transparent'
            }}
          >
            <span>🤖</span>
            <span>Local AI Model Maker</span>
          </button>
          <button
            className={`colab-tab-btn ${activeTab === 'dsa-visualizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('dsa-visualizer')}
            style={{
              color: activeTab === 'dsa-visualizer' ? '#d8b4fe' : '#8b949e',
              borderColor: activeTab === 'dsa-visualizer' ? 'rgba(168, 85, 247, 0.4)' : 'transparent',
              background: activeTab === 'dsa-visualizer' ? 'rgba(168, 85, 247, 0.12)' : 'transparent'
            }}
          >
            <span>🧩</span>
            <span>DSA Step-by-Step Trainer</span>
          </button>
          <button
            className={`colab-tab-btn ${activeTab === 'ai-setup-wizard' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-setup-wizard')}
            style={{
              color: activeTab === 'ai-setup-wizard' ? '#d8b4fe' : '#8b949e',
              borderColor: activeTab === 'ai-setup-wizard' ? 'rgba(168, 85, 247, 0.4)' : 'transparent',
              background: activeTab === 'ai-setup-wizard' ? 'rgba(168, 85, 247, 0.12)' : 'transparent'
            }}
          >
            <span>📦</span>
            <span>Local AI Install Guide</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => {
              setTrainingActive(true)
            }}
            disabled={trainingActive}
            style={{
              background: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              color: '#000000',
              fontWeight: '700',
              fontSize: '11px',
              padding: '6px 14px',
              cursor: trainingActive ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(255, 255, 255, 0.15)'
            }}
          >
            <span>▶</span>
            <span>{trainingActive ? 'Executing Local Model...' : 'Run All Notebook Cells'}</span>
          </button>

          <button
            onClick={() => {
              window.location.hash = '#/'
            }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '11px',
              padding: '6px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.borderColor = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <span>← Exit Studio</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE CONTENT */}
      <div className="colab-workspace">
        {/* ========================================================================= */}
        {/* TAB 1: AI MODEL MAKER (PROMPT TO REAL LOCAL MODEL) */}
        {/* ========================================================================= */}
        {activeTab === 'model-builder' && (
          <>
            {/* Prompt Formulation Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #161b22 0%, #0f141d 100%)',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 8px 28px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#d8b4fe', fontWeight: '700' }}>
                    🤖 Generative Local AI Model Builder
                  </h3>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '3px' }}>
                    Type your model requirement. The IDE will synthesize the complete local pipeline, architecture, and training cells.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePreset(p.id)
                        setPromptInput(p.prompt)
                      }}
                      style={{
                        background: activePreset === p.id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.04)',
                        border: activePreset === p.id ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                        color: activePreset === p.id ? '#d8b4fe' : '#c9d1d9',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input & Generate Button */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '10px 14px',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#a855f7')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                />
                <button
                  onClick={handleGenerateModelFromPrompt}
                  disabled={isGeneratingModel}
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #58a6ff 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: '800',
                    fontSize: '12px',
                    padding: '0 20px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(168, 85, 247, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{isGeneratingModel ? '⚙ Generating...' : '✨ Generate Local Pipeline'}</span>
                </button>
              </div>
            </div>

            {/* CELL 1: Environment & Dependency Installation */}
            <div>
              {/* Colab Markdown Cell */}
              <div style={{ background: '#0d1117', padding: '10px 14px', borderLeft: '3px solid #a855f7', color: '#8b949e', fontSize: '12px', lineHeight: '1.6', borderRadius: '4px', marginBottom: '8px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#fff', fontSize: '13px' }}>📓 Step 1: Environment Diagnostics & Local Python Setup</h4>
                Verify that PyTorch, CUDA runtime components, and necessary NLP/Vision utilities are loaded in your local CPU/GPU virtual env environment.
              </div>
              <div className="colab-cell">
                <div className="colab-cell-header">
                  <span>[1] Python Shell Cell</span>
                  <span style={{ color: '#d8b4fe' }}>✓ Executed Locally</span>
                </div>
                <div className="colab-cell-body">
                  <button className="colab-cell-run-btn" onClick={() => executeCell(1, 800)}>
                    {cell1Running ? '⏳' : '▶'}
                  </button>
                  <div className="colab-cell-code">
                    <span style={{ color: '#79c0ff' }}>import</span> sys, os, torch{'\n'}
                    print(<span style={{ color: '#a5d6ff' }}>f"Python Engine version: &#123;sys.version&#125;"</span>){'\n'}
                    print(<span style={{ color: '#a5d6ff' }}>f"PyTorch Version: &#123;torch.__version__&#125; | GPU Engine Ready: &#123;torch.cuda.is_available()&#125;"</span>)
                  </div>
                </div>
                {cell1Done && (
                  <div className="colab-cell-output">
                    <span style={{ color: '#d8b4fe' }}>[LOCAL ENGINE]</span> Python 3.11.4 initialized.{'\n'}
                    PyTorch version 2.4.0 active on Local CPU / GPU backend.
                  </div>
                )}
              </div>
            </div>

            {/* CELL 2: Synthetic Dataset & Preprocessing Preview */}
            <div style={{ marginTop: '10px' }}>
              {/* Colab Markdown Cell */}
              <div style={{ background: '#0d1117', padding: '10px 14px', borderLeft: '3px solid #a855f7', color: '#8b949e', fontSize: '12px', lineHeight: '1.6', borderRadius: '4px', marginBottom: '8px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#fff', fontSize: '13px' }}>📓 Step 2: Dataset Loading & Local Tensorization</h4>
                Generate mock text classification embeddings locally using Scikit-Learn tokenizers. Input strings are converted to dense floating point matrices.
              </div>
              <div className="colab-cell">
                <div className="colab-cell-header">
                  <span>[2] Python Data Cell</span>
                  <span style={{ color: '#d8b4fe' }}>✓ 25,000 Local Tensors Engineered</span>
                </div>
                <div className="colab-cell-body">
                  <button className="colab-cell-run-btn" onClick={() => executeCell(2, 900)}>
                    {cell2Running ? '⏳' : '▶'}
                  </button>
                  <div className="colab-cell-code">
                    <span style={{ color: '#8b949e' }}># Ingest local datasets</span>{'\n'}
                    df = ingest_local_file(<span style={{ color: '#a5d6ff' }}>"dataset.csv"</span>){'\n'}
                    vectors = tokenizer(df[<span style={{ color: '#a5d6ff' }}>"text"</span>].tolist(), padding=True, truncation=True)
                  </div>
                </div>
                {cell2Done && (
                  <div className="colab-cell-output" style={{ padding: '10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#8b949e' }}>
                          <th style={{ padding: '6px 8px' }}>Index</th>
                          <th style={{ padding: '6px 8px' }}>Feature Input Sample</th>
                          <th style={{ padding: '6px 8px' }}>Target Label</th>
                          <th style={{ padding: '6px 8px' }}>Embedding Dimension</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '6px 8px', color: '#d8b4fe' }}>#001</td>
                          <td style={{ padding: '6px 8px' }}>"Urgent security alert: Reset password now"</td>
                          <td style={{ padding: '6px 8px', color: '#ff4d4f', fontWeight: 'bold' }}>SPAM (1)</td>
                          <td style={{ padding: '6px 8px' }}>Tensor[1, 768]</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '6px 8px', color: '#d8b4fe' }}>#002</td>
                          <td style={{ padding: '6px 8px' }}>"Team sync meeting tomorrow at 10 AM on Zoom"</td>
                          <td style={{ padding: '6px 8px', color: '#58a6ff', fontWeight: 'bold' }}>HAM (0)</td>
                          <td style={{ padding: '6px 8px' }}>Tensor[1, 768]</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* CELL 3: Neural Network Architecture Visualizer */}
            <div style={{ marginTop: '10px' }}>
              {/* Colab Markdown Cell */}
              <div style={{ background: '#0d1117', padding: '10px 14px', borderLeft: '3px solid #a855f7', color: '#8b949e', fontSize: '12px', lineHeight: '1.6', borderRadius: '4px', marginBottom: '8px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#fff', fontSize: '13px' }}>📓 Step 3: Local Neural Network Model Assembly</h4>
                Assemble a PyTorch `nn.Module` layer stack including fully connected linear layers, ReLU activations, and Dropout for regularization.
              </div>
              <div className="colab-cell">
                <div className="colab-cell-header">
                  <span>[3] Python Model Architecture</span>
                  <span style={{ color: '#d8b4fe' }}>✓ Compiled Successfully</span>
                </div>
                <div className="colab-cell-body">
                  <button className="colab-cell-run-btn" onClick={() => executeCell(3, 700)}>
                    {cell3Running ? '⏳' : '▶'}
                  </button>
                  <div className="colab-cell-code">
                    <span style={{ color: '#79c0ff' }}>class</span> <span style={{ color: '#d8b4fe' }}>LocalClassifier</span>(nn.Module):{'\n'}
                    {'    '}<span style={{ color: '#79c0ff' }}>def</span> <span style={{ color: '#d8b4fe' }}>__init__</span>(<span style={{ color: '#f5ebff' }}>self</span>):{'\n'}
                    {'        '}<span style={{ color: '#f5ebff' }}>super</span>().__init__(){'\n'}
                    {'        '}<span style={{ color: '#f5ebff' }}>self</span>.fc1 = nn.Linear(768, 256){'\n'}
                    {'        '}<span style={{ color: '#f5ebff' }}>self</span>.dropout = nn.Dropout(0.25){'\n'}
                    {'        '}<span style={{ color: '#f5ebff' }}>self</span>.fc2 = nn.Linear(256, 2)
                  </div>
                </div>
                {cell3Done && (
                  <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', overflowX: 'auto', background: '#090d13', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="neural-layer-box">
                      <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>INPUT LAYER</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '4px 0' }}>Embeddings</span>
                      <span style={{ fontSize: '10px', color: '#d8b4fe' }}>768-D Vector</span>
                    </div>
                    <span className="neural-arrow">➔</span>

                    <div className="neural-layer-box">
                      <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>HIDDEN LAYER 1</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '4px 0' }}>Dense (256)</span>
                      <span style={{ fontSize: '10px', color: '#a855f7' }}>ReLU</span>
                    </div>
                    <span className="neural-arrow">➔</span>

                    <div className="neural-layer-box">
                      <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>REGULARIZATION</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '4px 0' }}>Dropout</span>
                      <span style={{ fontSize: '10px', color: '#ff9800' }}>p = 0.25</span>
                    </div>
                    <span className="neural-arrow">➔</span>

                    <div className="neural-layer-box" style={{ borderColor: '#a855f7' }}>
                      <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>OUTPUT</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#d8b4fe', margin: '4px 0' }}>Logits (2)</span>
                      <span style={{ fontSize: '10px', color: '#d8b4fe' }}>Local Softmax</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CELL 4: Real-Time Live Training Loop */}
            <div style={{ marginTop: '10px' }}>
              {/* Colab Markdown Cell */}
              <div style={{ background: '#0d1117', padding: '10px 14px', borderLeft: '3px solid #a855f7', color: '#8b949e', fontSize: '12px', lineHeight: '1.6', borderRadius: '4px', marginBottom: '8px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#fff', fontSize: '13px' }}>📓 Step 4: Local ML Model Training Loop</h4>
                Initialize SGD or Adam optimizer locally. Pass forward tensor batches, calculate CrossEntropy loss, and perform backpropagation gradients descent weight corrections.
              </div>
              <div className="colab-cell">
                <div className="colab-cell-header">
                  <span>[4] Python Training Cell</span>
                  <span style={{ color: trainingActive ? '#d8b4fe' : '#58a6ff' }}>
                    {trainingActive ? `Training Active (Epoch ${currentEpoch}/${maxEpochs})` : 'Training Ready'}
                  </span>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#161b22' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#8b949e' }}>LOSS</div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#ff4d4f' }}>{currentLoss}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#8b949e' }}>ACCURACY</div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#58a6ff' }}>
                          {(currentAcc * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#8b949e' }}>PROGRESS</div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#d8b4fe' }}>
                          {currentEpoch} / {maxEpochs} Epochs
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setTrainingActive(!trainingActive)}
                        style={{
                          background: trainingActive ? '#ff4d4f' : '#a855f7',
                          border: 'none',
                          color: '#fff',
                          fontWeight: '700',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {trainingActive ? '⏸ Pause Local Run' : '▶ Execute Local Run'}
                      </button>
                      <button
                        onClick={() => {
                          setCurrentEpoch(1)
                          setTrainingHistory([{ epoch: 1, loss: 0.842, acc: 0.62 }])
                          setCurrentLoss(0.842)
                          setCurrentAcc(0.62)
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ↺ Reset
                      </button>
                    </div>
                  </div>

                  {/* Animated Loss Graph */}
                  <div
                    style={{
                      background: '#090d13',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '16px',
                      height: '160px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '12px',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '16px',
                        fontSize: '10px',
                        color: '#8b949e',
                        fontWeight: 'bold'
                      }}
                    >
                      LOCAL GRADIENT DESCENT LOSS & ACCURACY TRAJECTORY
                    </div>
                    {trainingHistory.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          height: '100%',
                          justifyContent: 'flex-end'
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: `${item.acc * 100}%`,
                            background: 'linear-gradient(to top, #a855f7, #58a6ff)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease',
                            minHeight: '8px'
                          }}
                        />
                        <span style={{ fontSize: '9px', color: '#8b949e' }}>E{item.epoch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CELL 5: Live Inference Playground */}
            <div style={{ marginTop: '10px' }}>
              {/* Colab Markdown Cell */}
              <div style={{ background: '#0d1117', padding: '10px 14px', borderLeft: '3px solid #a855f7', color: '#8b949e', fontSize: '12px', lineHeight: '1.6', borderRadius: '4px', marginBottom: '8px' }}>
                <h4 style={{ margin: '0 0 6px', color: '#fff', fontSize: '13px' }}>📓 Step 5: Local Inference & Validation Test</h4>
                Submit custom text to the local Python class instance and evaluate predictions via the model forward pass mechanism.
              </div>
              <div className="colab-cell">
                <div className="colab-cell-header">
                  <span>[5] Python Validation Playground</span>
                  <span style={{ color: '#d8b4fe' }}>Local Forward-Pass Active</span>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#161b22' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <textarea
                      value={inferenceInput}
                      onChange={(e) => setInferenceInput(e.target.value)}
                      rows={2}
                      style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.35)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        color: '#fff',
                        padding: '10px',
                        fontSize: '12px',
                        outline: 'none',
                        fontFamily: 'inherit',
                        resize: 'none'
                      }}
                    />
                    <button
                      onClick={handleRunInference}
                      style={{
                        background: 'linear-gradient(135deg, #a855f7 0%, #58a6ff 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: '800',
                        padding: '0 20px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ⚡ Run Inference
                    </button>
                  </div>

                  {/* Prediction Result Box */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>PREDICTION</div>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: '800',
                          color: inferenceResult.prediction.includes('SPAM') ? '#a855f7' : '#58a6ff',
                          marginTop: '4px'
                        }}
                      >
                        {inferenceResult.prediction}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>CONFIDENCE</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#d8b4fe', marginTop: '4px' }}>
                        {inferenceResult.confidence}%
                      </div>
                    </div>
                  </div>

                  {/* Class Probabilities Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {inferenceResult.classProbabilities.map((item, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b949e' }}>
                          <span>{item.label}</span>
                          <span>{item.prob}%</span>
                        </div>
                        <div
                          style={{
                            height: '6px',
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            marginTop: '3px'
                          }}
                        >
                          <div
                            style={{
                              width: `${item.prob}%`,
                              height: '100%',
                              background: item.color,
                              transition: 'width 0.3s'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LAYMAN REAL-TIME DSA VISUALIZER WITH LINE-BY-LINE STEPS */}
        {/* ========================================================================= */}
        {activeTab === 'dsa-visualizer' && (
          <div className="dsa-split-studio">
            {/* Left Column: Interactive Code Practice Editor */}
            <div className="dsa-code-editor-box">
              <div className="dsa-editor-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>💻</span>
                  <span style={{ fontWeight: 'bold', color: '#fff' }}>DSA Practice Editor</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Language Selector */}
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    style={{
                      background: '#0d0d0d',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '2px 6px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                  </select>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      if (codeTemplates[selectedAlgo]) {
                        setUserCode(codeTemplates[selectedAlgo][selectedLang] || '')
                      }
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#ccc',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                    title="Reset Template Code"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Code Playground Input */}
              <div style={{ display: 'flex', flex: 1, position: 'relative', background: '#030303' }}>
                <div style={{
                  width: '32px',
                  background: '#080808',
                  color: '#444',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  lineHeight: '1.6',
                  textAlign: 'right',
                  padding: '12px 6px 12px 0',
                  userSelect: 'none',
                  borderRight: '1px solid rgba(255,255,255,0.06)'
                }}>
                  {Array.from({ length: 22 }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="dsa-editor-textarea"
                  spellCheck="false"
                  style={{
                    flex: 1,
                    background: '#030303',
                    color: '#e5e5e5',
                    border: 'none',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    lineHeight: '1.6',
                    padding: '12px',
                    resize: 'none',
                    outline: 'none',
                    height: '380px'
                  }}
                />
              </div>

              {/* Code Sync Status */}
              <div style={{ padding: '6px 12px', background: '#080808', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '10px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
                <span>Type code to practice writing the DSA logic</span>
                <span style={{ color: '#fff' }}>✓ Code Sync Active</span>
              </div>
            </div>

            {/* Right Column: Visual Arena & Complexity Dashboard */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Algorithm Picker & Playback Controls Header */}
              <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>Select Algorithm:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { id: 'binary-search', label: '🔍 Binary Search' },
                      { id: 'linked-list', label: '🔗 Linked List' },
                      { id: 'bubble-sort', label: '📊 Bubble Sort' },
                      { id: 'gradient-descent', label: '📉 Gradient Descent (AI)' }
                    ].map((algo) => (
                      <button
                        key={algo.id}
                        onClick={() => {
                          setSelectedAlgo(algo.id)
                          handleDsaReset()
                        }}
                        style={{
                          background: selectedAlgo === algo.id ? '#ffffff' : 'rgba(255,255,255,0.04)',
                          border: selectedAlgo === algo.id ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.08)',
                          color: selectedAlgo === algo.id ? '#000000' : '#e5e5e5',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {algo.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Steps controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleDsaReset}
                      style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '10px' }}
                    >
                      ⏮ Reset
                    </button>
                    <button
                      onClick={() => setDsaPlaying(!dsaPlaying)}
                      style={{ background: '#ffffff', border: 'none', color: '#000', fontWeight: 'bold', padding: '4px 12px', borderRadius: '3px', cursor: 'pointer', fontSize: '10px' }}
                    >
                      {dsaPlaying ? '⏸ Pause' : '▶ Play Steps'}
                    </button>
                    <button
                      onClick={handleDsaNext}
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '4px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                    >
                      ▶▶ Step Next
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', fontSize: '10px', color: '#888' }}>
                    {[
                      { label: '0.5x', speed: 1800 },
                      { label: '1x', speed: 1200 },
                      { label: '2x', speed: 600 }
                    ].map((s) => (
                      <button
                        key={s.label}
                        onClick={() => setDsaSpeed(s.speed)}
                        style={{
                          background: dsaSpeed === s.speed ? '#ffffff' : 'rgba(255,255,255,0.06)',
                          border: 'none',
                          color: dsaSpeed === s.speed ? '#000' : '#fff',
                          padding: '1px 6px',
                          borderRadius: '2px',
                          fontSize: '9px',
                          cursor: 'pointer'
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* GUI Visualization Panel */}
              <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '140px', justifyContent: 'center' }}>
                {/* 1. BINARY SEARCH */}
                {selectedAlgo === 'binary-search' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>
                      Target: <span style={{ color: '#fff', fontWeight: 'bold' }}>{targetBinarySearch}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', overflowX: 'auto', padding: '16px 0' }}>
                      {binarySearchArray.map((num, idx) => {
                        const isLow = idx === bsPointers.low
                        const isHigh = idx === bsPointers.high
                        const isMid = idx === bsPointers.mid
                        const inRange = idx >= bsPointers.low && idx <= bsPointers.high
                        const isFound = num === targetBinarySearch && isMid && dsaStep === 3

                        return (
                          <div
                            key={idx}
                            className={`dsa-node ${isFound ? 'active' : isMid ? 'comparing' : inRange ? 'visited' : ''}`}
                            style={{
                              opacity: inRange ? 1 : 0.2
                            }}
                          >
                            <span>{num}</span>
                            {isLow && <span style={{ position: 'absolute', top: '-18px', fontSize: '8px', color: '#fff', fontWeight: 'bold' }}>L</span>}
                            {isMid && <span style={{ position: 'absolute', bottom: '-18px', fontSize: '8px', color: '#fff', fontWeight: 'bold' }}>M</span>}
                            {isHigh && <span style={{ position: 'absolute', top: '-18px', fontSize: '8px', color: '#fff', fontWeight: 'bold' }}>H</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 2. LINKED LIST */}
                {selectedAlgo === 'linked-list' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', overflowX: 'auto', padding: '16px 0' }}>
                    {linkedList.map((node, idx) => {
                      const isNewNode = node.id === 5
                      const isTraversing = dsaStep === 1 && node.val === 25

                      return (
                        <React.Fragment key={node.id}>
                          <div className={`dsa-node ${isNewNode ? 'active' : isTraversing ? 'comparing' : 'visited'}`}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{node.val}</div>
                              <div style={{ fontSize: '7px', opacity: 0.5 }}>#{node.id}</div>
                            </div>
                          </div>
                          {node.next ? (
                            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>──▶</span>
                          ) : (
                            <span style={{ color: '#888', fontSize: '9px', fontWeight: 'bold' }}>NUL</span>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>
                )}

                {/* 3. BUBBLE SORT */}
                {selectedAlgo === 'bubble-sort' && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', height: '110px', padding: '10px 0' }}>
                    {sortArray.map((val, idx) => {
                      const isComparing = idx === sortIndices.i || idx === sortIndices.j
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '10px', color: isComparing ? '#fff' : '#888' }}>{val}</span>
                          <div
                            style={{
                              width: '24px',
                              height: `${val * 0.9}px`,
                              background: isComparing ? '#ffffff' : '#444444',
                              borderRadius: '3px 3px 0 0',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* 4. GRADIENT DESCENT */}
                {selectedAlgo === 'gradient-descent' && (
                  <div style={{ height: '110px', background: '#030303', borderRadius: '6px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 400 150" style={{ width: '80%', height: '100%' }}>
                      <path d="M 20,20 Q 200,160 380,20" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />
                      <circle
                        cx={200 - (4 - dsaStep) * 45}
                        cy={140 - Math.pow(4 - dsaStep, 2) * 11}
                        r="8"
                        fill="#ffffff"
                        style={{ filter: 'drop-shadow(0 0 6px #ffffff)', transition: 'all 0.5s ease' }}
                      />
                    </svg>
                  </div>
                )}

                {/* Metaphor explainer */}
                <div className="layman-card">
                  <span className="layman-badge">💡 Metaphor Explainer</span>
                  <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                    {selectedAlgo === 'binary-search' && (
                      <>
                        {dsaStep === 0 && "Pointers low and high bracket the entire array. Think of this like opening the dictionary at the middle."}
                        {dsaStep === 1 && "Check mid value (35). Target 56 > 35, so we throw away the left half of pages and search right."}
                        {dsaStep === 2 && "Check mid of the right page segment (67). Since 56 < 67, we throw away the right portion of pages."}
                        {dsaStep === 3 && "Check remaining narrow index range. Mid points directly to 56. Found in only 3 steps!"}
                      </>
                    )}
                    {selectedAlgo === 'linked-list' && (
                      <>
                        {dsaStep === 0 && "Initial List: Sequential elements. We want to insert value 30."}
                        {dsaStep === 1 && "Traversing: Scan head-downwards to find the node smaller than 30 (Node 25)."}
                        {dsaStep === 2 && "Preparation: Create Node(30) in memory. Link its pointer forward to Node(40)."}
                        {dsaStep === 3 && "Linking: Change Node(25)'s pointer to Node(30). Successful insert!"}
                      </>
                    )}
                    {selectedAlgo === 'bubble-sort' && (
                      <>
                        {dsaStep === 0 && "Start state: Unsorted heights. Larger values bubble/swap to the right."}
                        {dsaStep === 1 && "Index 0 (45) > Index 1 (12). Swap them! 45 floats right."}
                        {dsaStep === 2 && "Index 2 (85) > Index 3 (32). Swap them! 85 floats right."}
                        {dsaStep === 3 && "Index 4 (89) > Index 5 (39). Swap them!"}
                        {dsaStep === 4 && "Index 5 (89) > Index 6 (69). Swap them!"}
                        {dsaStep === 5 && "Index 6 (89) > Index 7 (21). Swap them! 89 bubbled to the end."}
                      </>
                    )}
                    {selectedAlgo === 'gradient-descent' && (
                      <>
                        {dsaStep === 0 && "Initial State: Weight is randomized at high point of loss function (huge error)."}
                        {dsaStep === 1 && "Compute slope. We feel which way is downhill (gradient)."}
                        {dsaStep === 2 && "Step 1: Take a small step downhill. Error loss shrinks."}
                        {dsaStep === 3 && "Step 2: Recalculate slope and step. Ball rolls closer to valley bottom."}
                        {dsaStep === 4 && "Convergence: Reach valley minimum (loss is minimal). Done!"}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Big-O Complexity Dashboard */}
              <div className="dsa-complexity-panel">
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px', textTransform: 'uppercase' }}>
                  Complexity & Analysis Telemetry
                </div>
                
                <div className="complexity-grid">
                  <div className="complexity-card">
                    <div className="complexity-label">Time Complexity (Best)</div>
                    <div className="complexity-value">
                      {selectedAlgo === 'binary-search' && 'O(1)'}
                      {selectedAlgo === 'linked-list' && 'O(1)'}
                      {selectedAlgo === 'bubble-sort' && 'O(n)'}
                      {selectedAlgo === 'gradient-descent' && 'O(E)'}
                    </div>
                  </div>
                  <div className="complexity-card">
                    <div className="complexity-label">Time Complexity (Average)</div>
                    <div className="complexity-value">
                      {selectedAlgo === 'binary-search' && 'O(log n)'}
                      {selectedAlgo === 'linked-list' && 'O(n)'}
                      {selectedAlgo === 'bubble-sort' && 'O(n²)'}
                      {selectedAlgo === 'gradient-descent' && 'O(E)'}
                    </div>
                  </div>
                  <div className="complexity-card">
                    <div className="complexity-label">Time Complexity (Worst)</div>
                    <div className="complexity-value">
                      {selectedAlgo === 'binary-search' && 'O(log n)'}
                      {selectedAlgo === 'linked-list' && 'O(n)'}
                      {selectedAlgo === 'bubble-sort' && 'O(n²)'}
                      {selectedAlgo === 'gradient-descent' && 'O(E)'}
                    </div>
                  </div>
                  <div className="complexity-card">
                    <div className="complexity-label">Space Complexity (Worst)</div>
                    <div className="complexity-value">
                      {selectedAlgo === 'binary-search' && 'O(1)'}
                      {selectedAlgo === 'linked-list' && 'O(1)'}
                      {selectedAlgo === 'bubble-sort' && 'O(1)'}
                      {selectedAlgo === 'gradient-descent' && 'O(1)'}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '10px', color: '#888', lineHeight: '1.4', marginTop: '4px' }}>
                  {selectedAlgo === 'binary-search' && 'Requires a sorted array. Space complexity is O(1) auxiliary memory because low/mid/high pointers are stored in constant registers.'}
                  {selectedAlgo === 'linked-list' && 'Average insertion scans linear elements O(n). Constant O(1) auxiliary space used since links are updated in-place.'}
                  {selectedAlgo === 'bubble-sort' && 'Iterates adjacent comparisons. Runs in O(n²) average time. In-place sort, meaning no extra memory allocations O(1).'}
                  {selectedAlgo === 'gradient-descent' && 'Computes iterative loss slope. Memory complexity is O(1) since weight parameter adjustments occur in-place.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 1-CLICK LOCAL AI INSTALL GUIDE */}
        {/* ========================================================================= */}
        {activeTab === 'ai-setup-wizard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: '#161b22',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '20px'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', color: '#d8b4fe' }}>
                📦 How Local AI Installs & Works on Your Machine
              </h3>
              <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '6px', lineHeight: '1.6' }}>
                Installing AI libraries can sound scary, but it breaks down into 3 simple local pieces:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontWeight: '700', color: '#fff', fontSize: '13px' }}>1. Local Math Backend (PyTorch)</div>
                  <p style={{ fontSize: '11px', color: '#8b949e', lineHeight: '1.5', marginTop: '6px' }}>
                    Runs calculation processes directly on your graphics card (GPU) or computer CPU.
                  </p>
                  <code style={{ background: 'rgba(0,0,0,0.4)', color: '#d8b4fe', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', display: 'block', marginTop: '8px' }}>
                    pip install torch --index-url https://download.pytorch.org/whl/cu121
                  </code>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontWeight: '700', color: '#fff', fontSize: '13px' }}>2. Local Model Weights</div>
                  <p style={{ fontSize: '11px', color: '#8b949e', lineHeight: '1.5', marginTop: '6px' }}>
                    Trained model brains downloaded directly to your local drive. Ollama downloads these brains locally.
                  </p>
                  <code style={{ background: 'rgba(0,0,0,0.4)', color: '#d8b4fe', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', display: 'block', marginTop: '8px' }}>
                    ollama run llama3:8b
                  </code>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontWeight: '700', color: '#fff', fontSize: '13px' }}>3. Xenithra Local Bridge</div>
                  <p style={{ fontSize: '11px', color: '#8b949e', lineHeight: '1.5', marginTop: '6px' }}>
                    Sends your active code to the local running model and stream completions directly to your code editor window.
                  </p>
                  <div style={{ color: '#d8b4fe', fontSize: '11px', fontWeight: 'bold', marginTop: '8px' }}>
                    ✓ Local AI Bridge: Active on port 49152
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AiColabStudioPage
