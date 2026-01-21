// Analytics JavaScript
document.addEventListener('DOMContentLoaded', function () {
  initializeAnalytics()
  loadAnalyticsData()
  setupTimeRangeSelector()
})

function initializeAnalytics() {
  // Check authentication
  const token = getCookie('token')
  if (!token) {
    window.location.href = '/Account/login'
    return
  }
}

function setupTimeRangeSelector() {
  const timeRangeSelect = document.getElementById('timeRange')
  if (timeRangeSelect) {
    timeRangeSelect.addEventListener('change', function () {
      loadAnalyticsData(this.value)
    })
  }
}

function loadAnalyticsData(timeRange = '30d') {
  // Load compilation statistics
  fetch(`/api/analytics/compilations?range=${timeRange}`, {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateAnalyticsStats(data.data)
        updateCharts(data.data)
      }
    })
    .catch((error) => console.error('Error loading analytics data:', error))

  // Load language usage
  fetch(`/api/analytics/languages?range=${timeRange}`, {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateLanguageChart(data.data)
      }
    })
    .catch((error) => console.error('Error loading language data:', error))

  // Load recent compilations
  fetch('/api/analytics/recent-compilations', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateRecentCompilations(data.data)
      }
    })
    .catch((error) => console.error('Error loading recent compilations:', error))
}

function updateAnalyticsStats(data) {
  document.getElementById('totalCompilations').textContent = data.totalCompilations || 0
  document.getElementById('successRate').textContent = data.successRate
    ? data.successRate + '%'
    : '0%'
  document.getElementById('avgExecutionTime').textContent = data.avgExecutionTime
    ? data.avgExecutionTime + 'ms'
    : '0ms'
  document.getElementById('activeDays').textContent = data.activeDays || 0

  // Update change indicators
  updateChangeIndicator('compilationsChange', data.compilationsChange)
  updateChangeIndicator('successChange', data.successChange)
  updateChangeIndicator('timeChange', data.timeChange)
  updateChangeIndicator('daysChange', data.daysChange)
}

function updateChangeIndicator(elementId, change) {
  const element = document.getElementById(elementId)
  if (!element) return

  if (change > 0) {
    element.textContent = `+${change}%`
    element.className = 'stat-change positive'
  } else if (change < 0) {
    element.textContent = `${change}%`
    element.className = 'stat-change negative'
  } else {
    element.textContent = '0%'
    element.className = 'stat-change'
  }
}

function updateCharts(data) {
  // Activity Chart
  if (data.activityData && window.Chart) {
    const ctx = document.getElementById('activityChart')
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.activityData.labels,
          datasets: [
            {
              label: 'Compilations',
              data: data.activityData.values,
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
  }
}

function updateLanguageChart(data) {
  if (data.languages && window.Chart) {
    const ctx = document.getElementById('languageChart')
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.languages.map((lang) => lang.name),
          datasets: [
            {
              data: data.languages.map((lang) => lang.count),
              backgroundColor: [
                '#667eea',
                '#764ba2',
                '#f093fb',
                '#f5576c',
                '#4facfe',
                '#00f2fe',
                '#43e97b',
                '#38f9d7'
              ]
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }
  }
}

function updateRecentCompilations(compilations) {
  const tableBody = document.getElementById('compilationsTableBody')
  if (!tableBody) return

  if (!compilations || compilations.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="5" class="text-center">No compilation history available</td></tr>'
    return
  }

  tableBody.innerHTML = compilations
    .map(
      (compilation) => `
        <tr>
            <td>${formatDate(compilation.timestamp)}</td>
            <td><span class="badge bg-secondary">${compilation.language}</span></td>
            <td>
                <span class="badge ${compilation.status === 'success' ? 'bg-success' : 'bg-danger'}">
                    ${compilation.status}
                </span>
            </td>
            <td>${compilation.executionTime}ms</td>
            <td>${compilation.codeSize} chars</td>
        </tr>
    `
    )
    .join('')
}

function updateInsights(data) {
  // Update performance insights
  if (data.insights) {
    document.getElementById('improvementTrend').textContent =
      data.insights.improvementTrend || 'Keep coding to see your trends!'
    document.getElementById('mostUsedLanguage').textContent =
      data.insights.mostUsedLanguage || 'No data available'
    document.getElementById('peakHours').textContent =
      data.insights.peakHours || 'No data available'
    document.getElementById('achievementProgress').textContent =
      data.insights.achievementProgress || 'Start coding to unlock achievements!'
  }

  // Update error analysis
  if (data.errors) {
    document.getElementById('syntaxErrors').textContent = data.errors.syntax || 0
    document.getElementById('runtimeErrors').textContent = data.errors.runtime || 0
    document.getElementById('compilationErrors').textContent = data.errors.compilation || 0
  }
}

// Utility functions
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}

// Chart toggle functionality
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('chart-toggle')) {
    const chartType = e.target.getAttribute('data-chart')
    const toggles = e.target.parentElement.querySelectorAll('.chart-toggle')

    toggles.forEach((toggle) => toggle.classList.remove('active'))
    e.target.classList.add('active')

    // Here you would switch between line and bar chart
    // For now, just log the selection
    console.log('Chart type changed to:', chartType)
  }
})
