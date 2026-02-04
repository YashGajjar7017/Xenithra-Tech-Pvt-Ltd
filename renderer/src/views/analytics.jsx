import { useState, useEffect, useCallback } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'boxicons/css/boxicons.min.css'
import '../css/analytics.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [chartType, setChartType] = useState('line')
  const [stats, setStats] = useState({
    totalCompilations: 0,
    successRate: '0%',
    avgExecutionTime: '0ms',
    activeDays: 0
  })

  const [errorStats, setErrorStats] = useState({
    syntaxErrors: 0,
    runtimeErrors: 0,
    compilationErrors: 0
  })

  const [insights, setInsights] = useState({
    improvementTrend: 'Your compilation success rate has improved by 15% this month.',
    mostUsedLanguage: 'JavaScript - 45% of your compilations',
    peakHours: '2:00 PM - 4:00 PM',
    achievementProgress: '3 more achievements to unlock!'
  })

  const [recentCompilations, setRecentCompilations] = useState([])

  // Chart data
  const activityChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Compilations',
        data: [12, 19, 3, 5, 2, 3, 8],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  const languageChartData = {
    labels: ['JavaScript', 'Python', 'Java', 'C++', 'Others'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(147, 51, 234)'
        ]
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value)
    // Fetch new data based on time range
  }

  const handleChartToggle = (type) => {
    setChartType(type)
  }

  // Mock data loading
  useEffect(() => {
    // Simulate API call
    setStats({
      totalCompilations: 127,
      successRate: '89%',
      avgExecutionTime: '245ms',
      activeDays: 23
    })

    setErrorStats({
      syntaxErrors: 12,
      runtimeErrors: 8,
      compilationErrors: 5
    })

    setRecentCompilations([
      {
        date: '2025-12-25',
        language: 'JavaScript',
        status: 'Success',
        time: '180ms',
        size: '2.4KB'
      },
      { date: '2025-12-24', language: 'Python', status: 'Failed', time: 'N/A', size: '1.8KB' },
      {
        date: '2025-12-23',
        language: 'JavaScript',
        status: 'Success',
        time: '320ms',
        size: '3.1KB'
      }
    ])
  }, [])

  return (
    <div className="analytics-container">
      {/* Header */}
      <header className="analytics-header">
        <div className="header-content">
          <h1>
            <i className="bx bx-bar-chart"></i> Analytics Dashboard
          </h1>
          <p>Track your coding progress and performance</p>
        </div>
        <div className="header-actions">
          <select
            id="timeRange"
            className="form-select"
            value={timeRange}
            onChange={handleTimeRangeChange}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bx bx-code-alt"></i>
          </div>
          <div className="stat-info">
            <h3 id="totalCompilations">{stats.totalCompilations}</h3>
            <p>Total Compilations</p>
            <span className="stat-change" id="compilationsChange">
              +12%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="bx bx-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3 id="successRate">{stats.successRate}</h3>
            <p>Success Rate</p>
            <span className="stat-change" id="successChange">
              +8%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="bx bx-time-five"></i>
          </div>
          <div className="stat-info">
            <h3 id="avgExecutionTime">{stats.avgExecutionTime}</h3>
            <p>Avg Execution Time</p>
            <span className="stat-change" id="timeChange">
              -3%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="bx bx-calendar"></i>
          </div>
          <div className="stat-info">
            <h3 id="activeDays">{stats.activeDays}</h3>
            <p>Active Days</p>
            <span className="stat-change" id="daysChange">
              +5%
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Compilation Activity</h3>
            <div className="chart-controls">
              <button
                className={`chart-toggle ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => handleChartToggle('line')}
                data-chart="line"
              >
                Line
              </button>
              <button
                className={`chart-toggle ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => handleChartToggle('bar')}
                data-chart="bar"
              >
                Bar
              </button>
            </div>
          </div>
          <div style={{ height: '400px', position: 'relative' }}>
            {chartType === 'line' ? (
              <Line data={activityChartData} options={chartOptions} />
            ) : (
              <Bar data={activityChartData} options={chartOptions} />
            )}
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>Language Distribution</h3>
          </div>
          <div style={{ height: '400px', position: 'relative' }}>
            <Doughnut data={languageChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="detailed-analytics">
        <div className="analytics-table">
          <h3>Recent Compilations</h3>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Execution Time</th>
                  <th>Code Size</th>
                </tr>
              </thead>
              <tbody>
                {recentCompilations.map((compilation, index) => (
                  <tr key={index}>
                    <td>{compilation.date}</td>
                    <td>{compilation.language}</td>
                    <td>
                      <span
                        className={`badge ${compilation.status === 'Success' ? 'bg-success' : 'bg-danger'}`}
                      >
                        {compilation.status}
                      </span>
                    </td>
                    <td>{compilation.time}</td>
                    <td>{compilation.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="analytics-table">
          <h3>Error Analysis</h3>
          <div className="error-stats">
            <div className="error-item">
              <h4>Syntax Errors</h4>
              <span id="syntaxErrors">{errorStats.syntaxErrors}</span>
            </div>
            <div className="error-item">
              <h4>Runtime Errors</h4>
              <span id="runtimeErrors">{errorStats.runtimeErrors}</span>
            </div>
            <div className="error-item">
              <h4>Compilation Errors</h4>
              <span id="compilationErrors">{errorStats.compilationErrors}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="insights-section">
        <h3>Performance Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">
              <i className="bx bx-trending-up"></i>
            </div>
            <div className="insight-content">
              <h4>Improvement Trend</h4>
              <p id="improvementTrend">{insights.improvementTrend}</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">
              <i className="bx bx-target"></i>
            </div>
            <div className="insight-content">
              <h4>Most Used Language</h4>
              <p id="mostUsedLanguage">{insights.mostUsedLanguage}</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">
              <i className="bx bx-time"></i>
            </div>
            <div className="insight-content">
              <h4>Peak Coding Hours</h4>
              <p id="peakHours">{insights.peakHours}</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">
              <i className="bx bx-star"></i>
            </div>
            <div className="insight-content">
              <h4>Achievement Progress</h4>
              <p id="achievementProgress">{insights.achievementProgress}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
