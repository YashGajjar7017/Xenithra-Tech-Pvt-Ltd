import React, { useState, useEffect, useRef } from 'react'
import '../css/AiColabStudio.css'

const AiColabStudioPage = () => {
  const [activeTab, setActiveTab] = useState('model-builder') // 'model-builder', 'dsa-visualizer', 'ai-setup-wizard'

  // Model Builder States
  const [promptInput, setPromptInput] = useState('Build a Spam & Fraud Email Detector NLP Model')
  const [isGeneratingModel, setIsGeneratingModel] = useState(false)
  const [activePreset, setActivePreset] = useState('spam-detector')
  const [pipelineGenerated, setPipelineGenerated] = useState(true)

  // Live Training States
  const [trainingActive, setTrainingActive] = useState(false)
  const [currentEpoch, setCurrentEpoch] = useState(1)
  const [maxEpochs] = useState(15)
  const [trainingHistory, setTrainingHistory] = useState([
    { epoch: 1, loss: 0.842, acc: 0.62 },
    { epoch: 2, loss: 0.685, acc: 0.74 },
    { epoch: 3, loss: 0.512, acc: 0.83 },
    { epoch: 4, loss: 0.395, acc: 0.89 },
    { epoch: 5, loss: 0.284, acc: 0.93 }
  ])
  const [currentLoss, setCurrentLoss] = useState(0.284)
  const [currentAcc, setCurrentAcc] = useState(0.93)

  // Live Inference States
  const [inferenceInput, setInferenceInput] = useState(
    'Congratulations! You have won a $1,000 Walmart Giftcard. Click here to claim your reward immediately.'
  )
  const [inferenceResult, setInferenceResult] = useState({
    prediction: 'SPAM / PHISHING',
    confidence: 99.4,
    classProbabilities: [
      { label: 'Spam / Malicious', prob: 99.4, color: '#ff4d4f' },
      { label: 'Legitimate / Ham', prob: 0.6, color: '#00e676' }
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
  const [selectedAlgo, setSelectedAlgo] = useState('binary-search') // 'binary-search', 'linked-list', 'tree-traversal', 'bubble-sort', 'gradient-descent'
  const [dsaStep, setDsaStep] = useState(0)
  const [dsaPlaying, setDsaPlaying] = useState(false)
  const [dsaSpeed, setDsaSpeed] = useState(1000)

  // DSA Data Structures
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
  const [sortIndices, setSortIndices] = useState({ i: 0, j: 0, swapped: false })

  // Model Presets
  const presets = [
    {
      id: 'spam-detector',
      title: '🛡️ Spam & Phishing Classifier (NLP)',
      prompt: 'Build a Spam & Fraud Email Detector NLP Model',
      type: 'Text Classification',
      framework: 'PyTorch + HuggingFace Transformers'
    },
    {
      id: 'image-classifier',
      title: '🐱 Pet Image Classifier (CNN)',
      prompt: 'Build a Convolutional Neural Network (CNN) to classify Cats vs Dogs',
      type: 'Computer Vision',
      framework: 'PyTorch TorchVision'
    },
    {
      id: 'price-prediction',
      title: '📈 House Price Estimator (Regression)',
      prompt: 'Build a Multi-Layer Perceptron (MLP) for Real Estate Price Prediction',
      type: 'Tabular Regression',
      framework: 'Scikit-Learn + PyTorch'
    },
    {
      id: 'customer-churn',
      title: '👥 Customer Churn Predictor (Binary)',
      prompt: 'Build a Deep Learning Model to predict customer churn probability',
      type: 'Binary Classification',
      framework: 'TensorFlow / Keras'
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
    }, 1200)
  }

  // Live Training Loop
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
          const newLoss = Math.max(0.018, +(currentLoss * 0.78 + (Math.random() * 0.02 - 0.01)).toFixed(3))
          const newAcc = Math.min(0.994, +(currentAcc + (1 - currentAcc) * 0.28).toFixed(3))

          setCurrentLoss(newLoss)
          setCurrentAcc(newAcc)
          setTrainingHistory((hist) => [...hist, { epoch: next, loss: newLoss, acc: newAcc }])
          return next
        })
      }, 900)
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
          { label: 'Spam / Phishing', prob: 99.2, color: '#ff4d4f' },
          { label: 'Legitimate / Ham', prob: 0.8, color: '#00e676' }
        ],
        tokens: text.split(' ').slice(0, 8).map((w) => ({ word: w, weight: +(Math.random() * 0.4 + 0.6).toFixed(2) }))
      })
    } else {
      setInferenceResult({
        prediction: 'LEGITIMATE (HAM)',
        confidence: 98.6,
        classProbabilities: [
          { label: 'Spam / Phishing', prob: 1.4, color: '#ff4d4f' },
          { label: 'Legitimate / Ham', prob: 98.6, color: '#00e676' }
        ],
        tokens: text.split(' ').slice(0, 8).map((w) => ({ word: w, weight: +(Math.random() * 0.2).toFixed(2) }))
      })
    }
  }

  // DSA Stepper Loop
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
    if (selectedAlgo === 'binary-search') {
      setDsaStep((prev) => {
        if (prev >= 3) {
          setDsaPlaying(false)
          return 3
        }
        const next = prev + 1
        if (next === 1) setBsPointers({ low: 0, high: 11, mid: 5 }) // mid = 35 < 56 -> low = 6
        if (next === 2) setBsPointers({ low: 6, high: 11, mid: 8 }) // mid = 67 > 56 -> high = 7
        if (next === 3) setBsPointers({ low: 6, high: 7, mid: 7 }) // mid = 56 === 56 FOUND!
        return next
      })
    } else if (selectedAlgo === 'bubble-sort') {
      setDsaStep((prev) => prev + 1)
      setSortArray((arr) => {
        const nextArr = [...arr]
        let swapped = false
        for (let i = 0; i < nextArr.length - 1; i++) {
          if (nextArr[i] > nextArr[i + 1]) {
            const temp = nextArr[i]
            nextArr[i] = nextArr[i + 1]
            nextArr[i + 1] = temp
            swapped = true
            setSortIndices({ i, j: i + 1, swapped: true })
            break
          }
        }
        if (!swapped) {
          setDsaPlaying(false)
        }
        return nextArr
      })
    } else {
      setDsaStep((prev) => (prev < 4 ? prev + 1 : 0))
    }
  }

  const handleDsaReset = () => {
    setDsaPlaying(false)
    setDsaStep(0)
    if (selectedAlgo === 'binary-search') {
      setBsPointers({ low: 0, high: 11, mid: 5 })
    } else if (selectedAlgo === 'bubble-sort') {
      setSortArray([45, 12, 85, 32, 89, 39, 69, 21])
      setSortIndices({ i: 0, j: 0, swapped: false })
    }
  }

  return (
    <div className="colab-studio-container">
      {/* Colab Top Header */}
      <div className="colab-header">
        <div className="colab-title-row">
          <span className="colab-badge">COLAB PRO</span>
          <div>
            <div className="colab-notebook-name">
              <span>⚡ Xenithra_AI_Model_DSA_Studio.ipynb</span>
              <span style={{ fontSize: '11px', color: '#00ffaa' }}>[Connected to Local Python 3.11 Runtime]</span>
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

        {/* Resource Telemetry */}
        <div className="colab-resource-metrics">
          <div className="metric-pill">
            <span className="metric-indicator" />
            <span style={{ color: '#00ffaa', fontWeight: 'bold' }}>NVIDIA T4 GPU</span>
          </div>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>RAM: 3.4GB / 12.7GB</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>Disk: 28.2GB / 100GB</span>
        </div>
      </div>

      {/* Module Switcher Tabs */}
      <div className="colab-action-bar">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`colab-tab-btn ${activeTab === 'model-builder' ? 'active' : ''}`}
            onClick={() => setActiveTab('model-builder')}
          >
            <span>🤖</span>
            <span>AI Model Maker (From Prompt)</span>
          </button>
          <button
            className={`colab-tab-btn ${activeTab === 'dsa-visualizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('dsa-visualizer')}
          >
            <span>🧩</span>
            <span>Layman Real-Time DSA Visualizer</span>
          </button>
          <button
            className={`colab-tab-btn ${activeTab === 'ai-setup-wizard' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-setup-wizard')}
          >
            <span>📦</span>
            <span>1-Click AI & PyTorch Setup Guide</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => {
              setTrainingActive(true)
            }}
            disabled={trainingActive}
            style={{
              background: 'linear-gradient(135deg, #00f3ff 0%, #0088ff 100%)',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontWeight: '700',
              fontSize: '11px',
              padding: '6px 14px',
              cursor: trainingActive ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 12px rgba(0, 243, 255, 0.3)'
            }}
          >
            <span>▶</span>
            <span>{trainingActive ? 'Training in Progress...' : 'Run All Notebook Cells'}</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE CONTENT BASED ON ACTIVE TAB */}
      <div className="colab-workspace">
        {/* ========================================================================= */}
        {/* TAB 1: AI MODEL MAKER (PROMPT TO REAL MODEL & LIVE TRAINING) */}
        {/* ========================================================================= */}
        {activeTab === 'model-builder' && (
          <>
            {/* Prompt Formulation Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #161b22 0%, #0f141d 100%)',
                border: '1px solid rgba(0, 243, 255, 0.3)',
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
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#00f3ff', fontWeight: '700' }}>
                    🚀 Generative AI Model Builder
                  </h3>
                  <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '3px' }}>
                    Type your AI model requirement in plain English. The IDE will synthesize the complete pipeline,
                    architecture, training loop, and interactive live inference tester.
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
                        background: activePreset === p.id ? 'rgba(0, 243, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                        border: activePreset === p.id ? '1px solid #00f3ff' : '1px solid rgba(255,255,255,0.08)',
                        color: activePreset === p.id ? '#00f3ff' : '#c9d1d9',
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
                  placeholder="Describe your model (e.g. Build an AI customer churn classifier with 95% accuracy)..."
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
                  onFocus={(e) => (e.target.style.borderColor = '#00f3ff')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
                />
                <button
                  onClick={handleGenerateModelFromPrompt}
                  disabled={isGeneratingModel}
                  style={{
                    background: 'linear-gradient(135deg, #00f3ff 0%, #a855f7 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000',
                    fontWeight: '800',
                    fontSize: '12px',
                    padding: '0 20px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0, 243, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <span>{isGeneratingModel ? '⚙ Generating...' : '✨ Generate AI Pipeline'}</span>
                </button>
              </div>
            </div>

            {/* CELL 1: Environment & Dependency Installation */}
            <div className="colab-cell">
              <div className="colab-cell-header">
                <span>[1] Environment & GPU Setup</span>
                <span style={{ color: '#00ffaa' }}>✓ Executed in 1.4s</span>
              </div>
              <div className="colab-cell-body">
                <button className="colab-cell-run-btn" title="Run Cell">
                  ▶
                </button>
                <div className="colab-cell-code">
                  <span style={{ color: '#ff7b72' }}>!</span>pip install torch torchvision numpy pandas scikit-learn
                  matplotlib transformers --quiet{'\n'}
                  <span style={{ color: '#79c0ff' }}>import</span> torch{'\n'}
                  <span style={{ color: '#79c0ff' }}>import</span> torch.nn <span style={{ color: '#79c0ff' }}>as</span>{' '}
                  nn{'\n'}
                  device = torch.device(<span style={{ color: '#a5d6ff' }}>"cuda"</span>{' '}
                  <span style={{ color: '#79c0ff' }}>if</span> torch.cuda.is_available(){' '}
                  <span style={{ color: '#79c0ff' }}>else</span> <span style={{ color: '#a5d6ff' }}>"cpu"</span>){'\n'}
                  print(<span style={{ color: '#a5d6ff' }}>f"PyTorch CUDA Hardware Accelerated Engine: &#123;device&#125;"</span>)
                </div>
              </div>
              <div className="colab-cell-output">
                <span style={{ color: '#00ffaa' }}>[SETUP SUCCESS]</span> PyTorch 2.4.0+cu121 initialized on NVIDIA
                GeForce RTX Hardware Backend (VRAM: 8192MB).
              </div>
            </div>

            {/* CELL 2: Synthetic Dataset & Preprocessing Preview */}
            <div className="colab-cell">
              <div className="colab-cell-header">
                <span>[2] Dataset Ingestion & Feature Engineering</span>
                <span style={{ color: '#00ffaa' }}>✓ 25,000 Sample Records Synthesized</span>
              </div>
              <div className="colab-cell-body">
                <button className="colab-cell-run-btn" title="Run Cell">
                  ▶
                </button>
                <div className="colab-cell-code">
                  <span style={{ color: '#8b949e' }}># Dataset preview and tokenized vectors</span>
                  {'\n'}
                  df = load_dataset(<span style={{ color: '#a5d6ff' }}>"{activePreset}"</span>, n_samples=
                  <span style={{ color: '#79c0ff' }}>25000</span>){'\n'}
                  train_loader, test_loader = build_dataloaders(df, batch_size=
                  <span style={{ color: '#79c0ff' }}>64</span>)
                </div>
              </div>
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
                      <td style={{ padding: '6px 8px', color: '#58a6ff' }}>#001</td>
                      <td style={{ padding: '6px 8px' }}>"Urgent security alert: Reset password now"</td>
                      <td style={{ padding: '6px 8px', color: '#ff4d4f', fontWeight: 'bold' }}>SPAM (1)</td>
                      <td style={{ padding: '6px 8px' }}>Tensor[1, 768]</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '6px 8px', color: '#58a6ff' }}>#002</td>
                      <td style={{ padding: '6px 8px' }}>"Team sync meeting tomorrow at 10 AM on Zoom"</td>
                      <td style={{ padding: '6px 8px', color: '#00e676', fontWeight: 'bold' }}>HAM (0)</td>
                      <td style={{ padding: '6px 8px' }}>Tensor[1, 768]</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 8px', color: '#58a6ff' }}>#003</td>
                      <td style={{ padding: '6px 8px' }}>"Wire transfer confirmation invoice attached"</td>
                      <td style={{ padding: '6px 8px', color: '#ff4d4f', fontWeight: 'bold' }}>SPAM (1)</td>
                      <td style={{ padding: '6px 8px' }}>Tensor[1, 768]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CELL 3: Neural Network Architecture Visualizer */}
            <div className="colab-cell">
              <div className="colab-cell-header">
                <span>[3] Visual Deep Learning Model Architecture</span>
                <span style={{ color: '#58a6ff' }}>Parameters: 1,248,386 Trainable Weights</span>
              </div>
              <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', overflowX: 'auto' }}>
                <div className="neural-layer-box">
                  <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>INPUT LAYER</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '4px 0' }}>Embeddings</span>
                  <span style={{ fontSize: '10px', color: '#00f3ff' }}>768-D Vector</span>
                </div>
                <span className="neural-arrow">➔</span>

                <div className="neural-layer-box">
                  <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>HIDDEN LAYER 1</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '4px 0' }}>Dense (256)</span>
                  <span style={{ fontSize: '10px', color: '#a855f7' }}>ReLU + BatchNorm</span>
                </div>
                <span className="neural-arrow">➔</span>

                <div className="neural-layer-box">
                  <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>REGULARIZATION</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '4px 0' }}>Dropout</span>
                  <span style={{ fontSize: '10px', color: '#ff9800' }}>p = 0.25</span>
                </div>
                <span className="neural-arrow">➔</span>

                <div className="neural-layer-box">
                  <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>HIDDEN LAYER 2</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '4px 0' }}>Dense (64)</span>
                  <span style={{ fontSize: '10px', color: '#a855f7' }}>LeakyReLU</span>
                </div>
                <span className="neural-arrow">➔</span>

                <div className="neural-layer-box" style={{ borderColor: '#00e676' }}>
                  <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>OUTPUT LAYER</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#00e676', margin: '4px 0' }}>Softmax / Logits</span>
                  <span style={{ fontSize: '10px', color: '#00e676' }}>2 Classes (Binary)</span>
                </div>
              </div>
            </div>

            {/* CELL 4: Real-Time Live Training Loop with Interactive Graph */}
            <div className="colab-cell">
              <div className="colab-cell-header">
                <span>[4] Live Real-time Training Simulator & Loss Curve</span>
                <span style={{ color: trainingActive ? '#00f3ff' : '#00ffaa' }}>
                  {trainingActive ? `Training Active (Epoch ${currentEpoch}/${maxEpochs})` : 'Training Complete'}
                </span>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#8b949e' }}>CURRENT LOSS</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#ff4d4f' }}>{currentLoss}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#8b949e' }}>ACCURACY</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#00e676' }}>
                        {(currentAcc * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#8b949e' }}>PROGRESS</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: '#00f3ff' }}>
                        {currentEpoch} / {maxEpochs} Epochs
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setTrainingActive(!trainingActive)}
                      style={{
                        background: trainingActive ? '#ff4d4f' : '#00e676',
                        border: 'none',
                        color: '#000',
                        fontWeight: '700',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {trainingActive ? '⏸ Pause Training' : '▶ Start Live Training'}
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

                {/* Animated Loss Graph (SVG) */}
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
                    LOSS DECAY & ACCURACY CONVERGENCE REAL-TIME CURVE
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
                          background: 'linear-gradient(to top, #00f3ff, #00e676)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease',
                          minHeight: '8px'
                        }}
                        title={`Epoch ${item.epoch}: Loss ${item.loss}, Acc ${(item.acc * 100).toFixed(1)}%`}
                      />
                      <span style={{ fontSize: '9px', color: '#8b949e' }}>E{item.epoch}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CELL 5: Live Inference Playground */}
            <div className="colab-cell">
              <div className="colab-cell-header">
                <span>[5] Interactive Real-Time Inference Playground</span>
                <span style={{ color: '#00f3ff' }}>Live PyTorch Forward-Pass Ready</span>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '12px', color: '#8b949e' }}>
                  Test your freshly trained model with real sample text or custom parameters:
                </div>
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
                      background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#000',
                      fontWeight: '800',
                      padding: '0 20px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ⚡ Predict Live
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
                    <div style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>PREDICTION OUTPUT</div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: '800',
                        color: inferenceResult.prediction.includes('SPAM') ? '#ff4d4f' : '#00e676',
                        marginTop: '4px'
                      }}
                    >
                      {inferenceResult.prediction}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#8b949e', fontWeight: 'bold' }}>CONFIDENCE SCORE</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#00f3ff', marginTop: '4px' }}>
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
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LAYMAN REAL-TIME DSA VISUALIZER */}
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
                <h3 style={{ margin: 0, fontSize: '15px', color: '#00f3ff' }}>
                  🧩 Interactive Real-Time DSA Visualizer for Laymen
                </h3>
                <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '3px' }}>
                  Data Structures & Algorithms animated step-by-step with simple everyday metaphors.
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
                      background: selectedAlgo === algo.id ? 'rgba(0, 243, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                      border: selectedAlgo === algo.id ? '1px solid #00f3ff' : '1px solid rgba(255,255,255,0.08)',
                      color: selectedAlgo === algo.id ? '#00f3ff' : '#c9d1d9',
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

            {/* Playback Controls & Speed Slider */}
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
                    background: dsaPlaying ? '#ff4d4f' : '#00e676',
                    border: 'none',
                    color: '#000',
                    fontWeight: '700',
                    padding: '6px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  {dsaPlaying ? '⏸ Pause' : '▶ Play Animation'}
                </button>
                <button
                  onClick={handleDsaNext}
                  style={{
                    background: 'rgba(0, 243, 255, 0.15)',
                    border: '1px solid #00f3ff',
                    color: '#00f3ff',
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
                <span>Speed:</span>
                {[
                  { label: '0.5x', speed: 1800 },
                  { label: '1x', speed: 1000 },
                  { label: '2x', speed: 500 }
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setDsaSpeed(s.speed)}
                    style={{
                      background: dsaSpeed === s.speed ? '#58a6ff' : 'rgba(255,255,255,0.06)',
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
            <div className="dsa-arena-card">
              {/* 1. BINARY SEARCH ARENA */}
              {selectedAlgo === 'binary-search' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#fff' }}>
                      Target to Find: <span style={{ color: '#00f3ff' }}>{targetBinarySearch}</span>
                    </span>
                    <span style={{ fontSize: '12px', color: '#8b949e' }}>
                      Pointers: [Low: {bsPointers.low}, Mid: {bsPointers.mid}, High: {bsPointers.high}]
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
                          {/* Pointer Badges */}
                          {isLow && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '-22px',
                                fontSize: '9px',
                                color: '#00f3ff',
                                fontWeight: 'bold'
                              }}
                            >
                              LOW
                            </span>
                          )}
                          {isMid && (
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '-22px',
                                fontSize: '9px',
                                color: '#ffb86c',
                                fontWeight: 'bold'
                              }}
                            >
                              MID
                            </span>
                          )}
                          {isHigh && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '-22px',
                                fontSize: '9px',
                                color: '#ff79c6',
                                fontWeight: 'bold'
                              }}
                            >
                              HIGH
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Layman Explanation */}
                  <div className="layman-card">
                    <span className="layman-badge">💡 Plain English Analogy</span>
                    <div>
                      {dsaStep === 0 && (
                        <span>
                          <strong>Step 1:</strong> Think of Binary Search like opening a 1,000-page dictionary in the
                          exact middle. We look at the middle page (35). Since 56 is bigger, we throw away the whole
                          left half!
                        </span>
                      )}
                      {dsaStep === 1 && (
                        <span>
                          <strong>Step 2:</strong> Now we look at the middle of the remaining right half (67). Since 56
                          is smaller than 67, we throw away everything to the right!
                        </span>
                      )}
                      {dsaStep === 2 && (
                        <span>
                          <strong>Step 3:</strong> Now we check the narrow remaining slice. Middle is 56!
                        </span>
                      )}
                      {dsaStep === 3 && (
                        <span style={{ color: '#00ffaa' }}>
                          🎉 <strong>Found in only 3 comparisons!</strong> Instead of checking all 12 items one by one
                          (which takes 12 steps), Binary Search halved the problem every step ($O(\log n)$).
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. LINKED LIST ARENA */}
              {selectedAlgo === 'linked-list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '30px 10px' }}>
                    {linkedList.map((node, idx) => (
                      <React.Fragment key={node.id}>
                        <div className="dsa-node active" style={{ width: '60px', height: '60px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: '800' }}>{node.val}</div>
                            <div style={{ fontSize: '8px', opacity: 0.6 }}>Node #{node.id}</div>
                          </div>
                        </div>
                        {node.next && (
                          <div style={{ display: 'flex', alignItems: 'center', color: '#00f3ff', fontSize: '20px', fontWeight: 'bold' }}>
                            ──▶
                          </div>
                        )}
                        {!node.next && (
                          <div style={{ color: '#ff4d4f', fontSize: '11px', fontWeight: 'bold' }}>NULL</div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="layman-card">
                    <span className="layman-badge">💡 Plain English Analogy</span>
                    <div>
                      Think of a <strong>Linked List</strong> like a scavenger hunt! Each clue doesn't know where all the
                      clues are—it only has a note pointing to the <em>next clue</em>. Unlike an array where everything is
                      seated in fixed rows, linked list nodes can float anywhere in memory as long as they hold the
                      address pointer to the next node!
                    </div>
                  </div>
                </div>
              )}

              {/* 3. BUBBLE SORT ARENA */}
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
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: isComparing ? '#00f3ff' : '#fff' }}>
                            {val}
                          </span>
                          <div
                            style={{
                              width: '38px',
                              height: `${val * 1.5}px`,
                              background: isComparing
                                ? 'linear-gradient(to top, #ff9800, #ff4d4f)'
                                : 'linear-gradient(to top, #00f3ff, #0088ff)',
                              borderRadius: '6px 6px 0 0',
                              transition: 'all 0.3s ease'
                            }}
                          />
                          <span style={{ fontSize: '9px', color: '#8b949e' }}>[{idx}]</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="layman-card">
                    <span className="layman-badge">💡 Plain English Analogy</span>
                    <div>
                      <strong>Bubble Sort</strong> works like air bubbles in water! The heavier (larger) numbers sink
                      slowly to the right while smaller numbers float to the top left by repeatedly swapping adjacent
                      pairs.
                    </div>
                  </div>
                </div>
              )}

              {/* 4. GRADIENT DESCENT (AI DSA) ARENA */}
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
                    {/* SVG Bowl Curve */}
                    <svg viewBox="0 0 400 150" style={{ width: '80%', height: '100%' }}>
                      <path d="M 20,20 Q 200,160 380,20" fill="none" stroke="rgba(0, 243, 255, 0.4)" strokeWidth="3" />
                      {/* Rolling Optimizer Ball */}
                      <circle
                        cx={200 - (3 - dsaStep) * 45}
                        cy={140 - Math.pow(3 - dsaStep, 2) * 12}
                        r="10"
                        fill="#00ffaa"
                        style={{ filter: 'drop-shadow(0 0 8px #00ffaa)', transition: 'all 0.4s ease' }}
                      />
                    </svg>
                  </div>

                  <div className="layman-card">
                    <span className="layman-badge">💡 Plain English Analogy</span>
                    <div>
                      <strong>Gradient Descent</strong> is the algorithm that powers ALL Modern AI! Imagine you are blindfolded on top of a misty mountain (High Loss) and you want to reach the valley (Low Loss / Perfect Accuracy). You feel the slope with your feet and take small steps downhill until you reach the bottom!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 1-CLICK AI & PYTORCH/OLLAMA SETUP GUIDE */}
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
              <h3 style={{ margin: 0, fontSize: '16px', color: '#00f3ff' }}>
                📦 Layman Guide: How AI Installs & Works Under the Hood
              </h3>
              <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '6px', lineHeight: '1.6' }}>
                Installing AI libraries can sound scary, but it breaks down into 3 simple pieces:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontWeight: '700', color: '#fff', fontSize: '13px' }}>1. The Math Engine (PyTorch / CUDA)</div>
                  <p style={{ fontSize: '11px', color: '#8b949e', lineHeight: '1.5', marginTop: '6px' }}>
                    Like a calculator supercharged by your graphics card (GPU). It multiplies millions of matrix numbers simultaneously.
                  </p>
                  <code style={{ background: 'rgba(0,0,0,0.4)', color: '#00ffaa', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', display: 'block', marginTop: '8px' }}>
                    pip install torch --index-url https://download.pytorch.org/whl/cu121
                  </code>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontWeight: '700', color: '#fff', fontSize: '13px' }}>2. The Model Weights (Trained Brain)</div>
                  <p style={{ fontSize: '11px', color: '#8b949e', lineHeight: '1.5', marginTop: '6px' }}>
                    Gigabytes of tuned numbers (weights) trained on billions of lines of code. HuggingFace / Ollama downloads these brains locally.
                  </p>
                  <code style={{ background: 'rgba(0,0,0,0.4)', color: '#00ffaa', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', display: 'block', marginTop: '8px' }}>
                    ollama run llama3:8b
                  </code>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontWeight: '700', color: '#fff', fontSize: '13px' }}>3. The Local Runner (Xenithra IDE)</div>
                  <p style={{ fontSize: '11px', color: '#8b949e', lineHeight: '1.5', marginTop: '6px' }}>
                    Xenithra sends your active code to the local model and injects real-time completions directly into your cursor!
                  </p>
                  <div style={{ color: '#00e676', fontSize: '11px', fontWeight: 'bold', marginTop: '8px' }}>
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
