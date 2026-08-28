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
              background: 'linear-gradient(135deg, #a855f7 0%, #00b0ff 100%)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontWeight: '700',
              fontSize: '11px',
              padding: '6px 14px',
              cursor: trainingActive ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 12px rgba(168, 85, 247, 0.3)'
            }}
          >
            <span>▶</span>
            <span>{trainingActive ? 'Executing Local Model...' : 'Run All Notebook Cells'}</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Algorithm Picker Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#161b22',
                padding: '14px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#d8b4fe' }}>
                  🧩 DSA Step-by-Step Trainer (Layman Explanations)
                </h3>
                <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '3px' }}>
                  Watch execution traces live, sync variables with node changes, and trace pseudocode.
                </div>
              </div>

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
                      background: selectedAlgo === algo.id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.04)',
                      border: selectedAlgo === algo.id ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                      color: selectedAlgo === algo.id ? '#d8b4fe' : '#c9d1d9',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {algo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Playback Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.03)',
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={handleDsaReset}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  ⏮ Reset
                </button>
                <button
                  onClick={() => setDsaPlaying(!dsaPlaying)}
                  style={{
                    background: dsaPlaying ? '#ff4d4f' : '#a855f7',
                    border: 'none',
                    color: '#fff',
                    fontWeight: '700',
                    padding: '6px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  {dsaPlaying ? '⏸ Pause' : '▶ Play Steps'}
                </button>
                <button
                  onClick={handleDsaNext}
                  style={{
                    background: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid #a855f7',
                    color: '#d8b4fe',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                >
                  ▶▶ Step Next
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#8b949e' }}>
                <span>Traversal Speed:</span>
                {[
                  { label: '0.5x', speed: 1800 },
                  { label: '1x', speed: 1200 },
                  { label: '2x', speed: 600 }
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setDsaSpeed(s.speed)}
                    style={{
                      background: dsaSpeed === s.speed ? '#a855f7' : 'rgba(255,255,255,0.06)',
                      border: 'none',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Arena Card */}
            <div className="dsa-arena-card" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
              
              {/* Left Column: Algorithm Simulation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
                {/* 1. BINARY SEARCH */}
                {selectedAlgo === 'binary-search' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#fff' }}>
                        Target to Find: <span style={{ color: '#d8b4fe' }}>{targetBinarySearch}</span>
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '30px 10px',
                        overflowX: 'auto'
                      }}
                    >
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
                              opacity: inRange ? 1 : 0.25,
                              borderWidth: isMid || isFound ? '2px' : '1px'
                            }}
                          >
                            <span>{num}</span>
                            {isLow && (
                              <span style={{ position: 'absolute', top: '-22px', fontSize: '9px', color: '#58a6ff', fontWeight: 'bold' }}>
                                LOW
                              </span>
                            )}
                            {isMid && (
                              <span style={{ position: 'absolute', bottom: '-22px', fontSize: '9px', color: '#a855f7', fontWeight: 'bold' }}>
                                MID
                              </span>
                            )}
                            {isHigh && (
                              <span style={{ position: 'absolute', top: '-22px', fontSize: '9px', color: '#ff79c6', fontWeight: 'bold' }}>
                                HIGH
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 2. LINKED LIST */}
                {selectedAlgo === 'linked-list' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '30px 10px', overflowX: 'auto' }}>
                      {linkedList.map((node, idx) => {
                        // Highlight insert state
                        const isNewNode = node.id === 5
                        const isTraversing = dsaStep === 1 && node.val === 25

                        return (
                          <React.Fragment key={node.id}>
                            <div className={`dsa-node ${isNewNode ? 'active' : isTraversing ? 'comparing' : 'visited'}`} style={{ width: '60px', height: '60px' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '15px', fontWeight: '800' }}>{node.val}</div>
                                <div style={{ fontSize: '8px', opacity: 0.6 }}>Node #{node.id}</div>
                              </div>
                            </div>
                            {node.next && (
                              <div style={{ display: 'flex', alignItems: 'center', color: '#d8b4fe', fontSize: '20px', fontWeight: 'bold' }}>
                                ──▶
                              </div>
                            )}
                            {!node.next && (
                              <div style={{ color: '#ff4d4f', fontSize: '11px', fontWeight: 'bold' }}>NULL</div>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 3. BUBBLE SORT */}
                {selectedAlgo === 'bubble-sort' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        gap: '12px',
                        height: '180px',
                        padding: '20px 0'
                      }}
                    >
                      {sortArray.map((val, idx) => {
                        const isComparing = idx === sortIndices.i || idx === sortIndices.j
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: isComparing ? '#d8b4fe' : '#fff' }}>
                              {val}
                            </span>
                            <div
                              style={{
                                width: '30px',
                                height: `${val * 1.6}px`,
                                background: isComparing
                                  ? 'linear-gradient(to top, #ff9800, #a855f7)'
                                  : 'linear-gradient(to top, #a855f7, #58a6ff)',
                                borderRadius: '6px 6px 0 0',
                                transition: 'all 0.4s ease'
                              }}
                            />
                            <span style={{ fontSize: '9px', color: '#8b949e' }}>[{idx}]</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 4. GRADIENT DESCENT */}
                {selectedAlgo === 'gradient-descent' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                      style={{
                        height: '180px',
                        background: '#090d13',
                        borderRadius: '10px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg viewBox="0 0 400 150" style={{ width: '80%', height: '100%' }}>
                        <path d="M 20,20 Q 200,160 380,20" fill="none" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="3" />
                        {/* Rolling Optimizer Ball */}
                        <circle
                          cx={200 - (4 - dsaStep) * 45}
                          cy={140 - Math.pow(4 - dsaStep, 2) * 11}
                          r="10"
                          fill="#d8b4fe"
                          style={{ filter: 'drop-shadow(0 0 8px #d8b4fe)', transition: 'all 0.5s ease' }}
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Plain English Analogy Card */}
                <div className="layman-card">
                  <span className="layman-badge">💡 Metaphor Explainer</span>
                  <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
                    {selectedAlgo === 'binary-search' && (
                      <>
                        {dsaStep === 0 && "Setup: Pointers low and high bracket the entire array. Think of this like opening the dictionary at the middle."}
                        {dsaStep === 1 && "Step 1: Check mid value (35). Target 56 > 35, so we throw away the left half of the pages and look right."}
                        {dsaStep === 2 && "Step 2: Check mid of the right page segment (67). Since 56 < 67, we throw away the right portion of remaining pages."}
                        {dsaStep === 3 && "Step 3: Check remaining narrow index range. Mid points directly to 56. Found in only 3 steps!"}
                      </>
                    )}
                    {selectedAlgo === 'linked-list' && (
                      <>
                        {dsaStep === 0 && "Initial List: List has nodes pointing to the next element sequentially. We want to insert value 30."}
                        {dsaStep === 1 && "Traversing: Move temporary pointer step-by-step from head node until we find the node smaller than 30 (Node 25)."}
                        {dsaStep === 2 && "Preparation: Create a new detached Node(30) in memory. Link its pointer forward to Node(40)."}
                        {dsaStep === 3 && "Linking: Change Node(25)'s pointer to target Node(30). Node(30) is now successfully inserted!"}
                      </>
                    )}
                    {selectedAlgo === 'bubble-sort' && (
                      <>
                        {dsaStep === 0 && "Start state: Array elements are unsorted. Larger bubbles sink/swap to the right."}
                        {dsaStep === 1 && "Comparison 1: Index 0 (45) > Index 1 (12). Swap them! 45 floats to the right."}
                        {dsaStep === 2 && "Comparison 2: Index 2 (85) > Index 3 (32). Swap them! 85 floats to the right."}
                        {dsaStep === 3 && "Comparison 3: Index 4 (89) > Index 5 (39). Swap them!"}
                        {dsaStep === 4 && "Comparison 4: Index 5 (89) > Index 6 (69). Swap them!"}
                        {dsaStep === 5 && "Comparison 5: Index 6 (89) > Index 7 (21). Swap them! Largest value 89 successfully bubbled to the end."}
                      </>
                    )}
                    {selectedAlgo === 'gradient-descent' && (
                      <>
                        {dsaStep === 0 && "Initial State: Ball is randomized at high point of the loss function (huge error weight)."}
                        {dsaStep === 1 && "Calculation: Compute local gradient slope (steepness index). We feel which way is downhill."}
                        {dsaStep === 2 && "Step 1: Take a small step downhill. Weight updates, and the error loss shrinks."}
                        {dsaStep === 3 && "Step 2: Recalculate slope and take another step. Ball rolls closer to valley bottom."}
                        {dsaStep === 4 && "Convergence: Reach local valley minimum. Loss is minimal. AI model has finished training!"}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Code Sync & Variable Inspector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8b949e', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  CODE SYNC & LOCAL VARIABLES
                </div>

                {/* Line Code Display */}
                <div style={{ fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.6', color: '#c9d1d9', flex: 1 }}>
                  {selectedAlgo === 'binary-search' && (
                    <>
                      <div style={{ background: dsaStep === 0 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep === 0 ? '#d8b4fe' : '#c9d1d9' }}>
                        low, high = 0, len(arr) - 1
                      </div>
                      <div style={{ background: dsaStep > 0 && dsaStep < 3 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep > 0 && dsaStep < 3 ? '#d8b4fe' : '#c9d1d9' }}>
                        mid = (low + high) // 2
                      </div>
                      <div style={{ background: dsaStep === 1 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep === 1 ? '#d8b4fe' : '#c9d1d9' }}>
                        if arr[mid] &lt; target: low = mid + 1
                      </div>
                      <div style={{ background: dsaStep === 2 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep === 2 ? '#d8b4fe' : '#c9d1d9' }}>
                        elif arr[mid] &gt; target: high = mid - 1
                      </div>
                      <div style={{ background: dsaStep === 3 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep === 3 ? '#d8b4fe' : '#c9d1d9' }}>
                        else: return mid
                      </div>
                    </>
                  )}
                  {selectedAlgo === 'linked-list' && (
                    <>
                      <div style={{ background: dsaStep === 0 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep === 0 ? '#d8b4fe' : '#c9d1d9' }}>
                        curr = head
                      </div>
                      <div style={{ background: dsaStep === 1 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep === 1 ? '#d8b4fe' : '#c9d1d9' }}>
                        while curr.next and curr.next.val &lt; new_val:
                      </div>
                      <div style={{ background: dsaStep === 2 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep === 2 ? '#d8b4fe' : '#c9d1d9' }}>
                        new_node.next = curr.next
                      </div>
                      <div style={{ background: dsaStep === 3 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep === 3 ? '#d8b4fe' : '#c9d1d9' }}>
                        curr.next = new_node
                      </div>
                    </>
                  )}
                  {selectedAlgo === 'bubble-sort' && (
                    <>
                      <div style={{ background: dsaStep === 0 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep === 0 ? '#d8b4fe' : '#c9d1d9' }}>
                        for i in range(len(arr)):
                      </div>
                      <div style={{ background: dsaStep > 0 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep > 0 ? '#d8b4fe' : '#c9d1d9' }}>
                        if arr[j] &gt; arr[j+1]:
                      </div>
                      <div style={{ background: dsaStep > 0 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep > 0 ? '#d8b4fe' : '#c9d1d9' }}>
                        swap(arr[j], arr[j+1])
                      </div>
                    </>
                  )}
                  {selectedAlgo === 'gradient-descent' && (
                    <>
                      <div style={{ background: dsaStep === 0 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep === 0 ? '#d8b4fe' : '#c9d1d9' }}>
                        w = init_weight()
                      </div>
                      <div style={{ background: dsaStep === 1 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep === 1 ? '#d8b4fe' : '#c9d1d9' }}>
                        gradient = dw_loss(w)
                      </div>
                      <div style={{ background: dsaStep > 1 ? 'rgba(168, 85, 247, 0.2)' : 'transparent', padding: '2px 6px', color: dsaStep > 1 ? '#d8b4fe' : '#c9d1d9' }}>
                        w = w - learning_rate * gradient
                      </div>
                    </>
                  )}
                </div>

                {/* Variable inspector */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', color: '#8b949e', marginBottom: '4px' }}>Inspector:</div>
                  {selectedAlgo === 'binary-search' && (
                    <>
                      <div>low_ptr: {bsPointers.low} (Val: {binarySearchArray[bsPointers.low]})</div>
                      <div>mid_ptr: {bsPointers.mid} (Val: {binarySearchArray[bsPointers.mid]})</div>
                      <div>high_ptr: {bsPointers.high} (Val: {binarySearchArray[bsPointers.high]})</div>
                      <div>target: {targetBinarySearch}</div>
                    </>
                  )}
                  {selectedAlgo === 'linked-list' && (
                    <>
                      <div>head_val: 10</div>
                      <div>target_insert: 30</div>
                      <div>curr_traversal_id: {dsaStep === 1 ? 'Node 25' : 'None'}</div>
                    </>
                  )}
                  {selectedAlgo === 'bubble-sort' && (
                    <>
                      <div>arr: [{sortArray.join(', ')}]</div>
                      <div>i: {sortIndices.i} (Val: {sortArray[sortIndices.i]})</div>
                      <div>j: {sortIndices.j} (Val: {sortArray[sortIndices.j]})</div>
                    </>
                  )}
                  {selectedAlgo === 'gradient-descent' && (
                    <>
                      <div>w_weight: {(0.85 - dsaStep * 0.18).toFixed(3)}</div>
                      <div>learning_rate: 0.1</div>
                      <div>loss: {Math.max(0.015, +(0.95 - dsaStep * 0.22).toFixed(3))}</div>
                    </>
                  )}
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
