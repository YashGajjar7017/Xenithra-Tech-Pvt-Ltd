// Achievements JavaScript
document.addEventListener('DOMContentLoaded', function () {
  initializeAchievements()
  loadAchievementsData()
  setupCategoryFilters()
})

function initializeAchievements() {
  // Check authentication
  const token = getCookie('token')
  if (!token) {
    window.location.href = '/Account/login'
    return
  }
}

function setupCategoryFilters() {
  const categoryTabs = document.querySelectorAll('.category-tab')
  categoryTabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const category = this.getAttribute('data-category')

      // Update active tab
      categoryTabs.forEach((t) => t.classList.remove('active'))
      this.classList.add('active')

      // Filter achievements
      filterAchievements(category)
    })
  })

  // Leaderboard tabs
  const leaderboardTabs = document.querySelectorAll('.leaderboard-tab')
  leaderboardTabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const period = this.getAttribute('data-period')

      leaderboardTabs.forEach((t) => t.classList.remove('active'))
      this.classList.add('active')

      loadLeaderboard(period)
    })
  })
}

function loadAchievementsData() {
  fetch('/api/achievements', {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateAchievements(data.data.achievements)
        updateProgress(data.data.progress)
        updateLeaderboard(data.data.leaderboard)
        updateStats(data.data.stats)
      }
    })
    .catch((error) => console.error('Error loading achievements:', error))
}

function updateAchievements(achievements) {
  const achievementsGrid = document.getElementById('achievementsGrid')
  if (!achievementsGrid) return

  achievementsGrid.innerHTML = achievements
    .map(
      (achievement) => `
        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}"
             onclick="showAchievementDetails('${achievement.id}')">
            <div class="achievement-icon">
                <i class='bx bx-trophy'></i>
            </div>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
            <div class="achievement-progress">
                <div class="progress-bar" style="width: ${achievement.progress}%"></div>
            </div>
            <div class="achievement-points">
                ${achievement.points} points • ${achievement.category}
            </div>
        </div>
    `
    )
    .join('')
}

function updateProgress(progress) {
  const progressGrid = document.getElementById('progressGrid')
  if (!progressGrid || !progress) return

  progressGrid.innerHTML = progress
    .map(
      (item) => `
        <div class="progress-item">
            <div class="progress-header">
                <div class="progress-title">${item.title}</div>
                <div class="progress-value">${item.current}/${item.target}</div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-fill" style="width: ${item.percentage}%"></div>
            </div>
            <div class="progress-text">${item.description}</div>
        </div>
    `
    )
    .join('')
}

function updateLeaderboard(leaderboard, period = 'all') {
  const leaderboardElement = document.getElementById('leaderboard')
  if (!leaderboardElement || !leaderboard) return

  leaderboardElement.innerHTML = leaderboard
    .map(
      (user, index) => `
        <div class="leaderboard-item ${user.isCurrentUser ? 'current-user' : ''} ${index < 3 ? 'top-three' : ''}">
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-user">
                <div class="leaderboard-avatar">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div class="leaderboard-name">${user.name}</div>
                    <div style="font-size: 0.8rem; color: #6c757d;">${user.achievements} achievements</div>
                </div>
            </div>
            <div class="leaderboard-score">${user.points}</div>
        </div>
    `
    )
    .join('')
}

function updateStats(stats) {
  if (!stats) return

  document.getElementById('unlockedCount').textContent = stats.unlockedCount || 0
  document.getElementById('totalPoints').textContent = stats.totalPoints || 0
  document.getElementById('rank').textContent = stats.rank || 0
}

function filterAchievements(category) {
  const achievementCards = document.querySelectorAll('.achievement-card')

  achievementCards.forEach((card) => {
    if (category === 'all') {
      card.style.display = 'block'
    } else {
      const cardCategory = card
        .querySelector('.achievement-points')
        .textContent.split('•')[1]
        .trim()
        .toLowerCase()
      card.style.display = cardCategory === category ? 'block' : 'none'
    }
  })
}

function loadLeaderboard(period) {
  fetch(`/api/achievements/leaderboard?period=${period}`, {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updateLeaderboard(data.data)
      }
    })
    .catch((error) => console.error('Error loading leaderboard:', error))
}

function showAchievementDetails(achievementId) {
  fetch(`/api/achievements/${achievementId}`, {
    headers: {
      Authorization: 'Bearer ' + getCookie('token')
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        displayAchievementModal(data.data)
      }
    })
    .catch((error) => console.error('Error loading achievement details:', error))
}

function displayAchievementModal(achievement) {
  const modal = new bootstrap.Modal(document.getElementById('achievementModal'))
  const modalTitle = document.getElementById('achievementModalTitle')
  const modalBody = document.getElementById('achievementModalBody')

  modalTitle.textContent = achievement.name

  modalBody.innerHTML = `
        <div class="achievement-detail">
            <div class="achievement-detail-header">
                <div class="achievement-icon large">
                    <i class='bx bx-trophy'></i>
                </div>
                <div class="achievement-detail-info">
                    <h4>${achievement.name}</h4>
                    <p class="category">${achievement.category} • ${achievement.points} points</p>
                    <p class="status ${achievement.unlocked ? 'unlocked' : 'locked'}">
                        ${achievement.unlocked ? '✓ Unlocked' : '🔒 Locked'}
                    </p>
                </div>
            </div>

            <div class="achievement-detail-description">
                <h5>Description</h5>
                <p>${achievement.description}</p>
            </div>

            ${
              achievement.requirements
                ? `
                <div class="achievement-detail-requirements">
                    <h5>Requirements</h5>
                    <ul>
                        ${achievement.requirements.map((req) => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
            `
                : ''
            }

            ${
              achievement.rewards
                ? `
                <div class="achievement-detail-rewards">
                    <h5>Rewards</h5>
                    <ul>
                        ${achievement.rewards.map((reward) => `<li>${reward}</li>`).join('')}
                    </ul>
                </div>
            `
                : ''
            }

            <div class="achievement-detail-progress">
                <h5>Progress</h5>
                <div class="progress-bar-container">
                    <div class="progress-fill" style="width: ${achievement.progress}%"></div>
                </div>
                <p class="progress-text">${achievement.currentProgress || 0} / ${achievement.targetProgress || 1}</p>
            </div>

            ${
              achievement.unlockedAt
                ? `
                <div class="achievement-detail-unlocked">
                    <h5>Unlocked On</h5>
                    <p>${formatDate(achievement.unlockedAt)}</p>
                </div>
            `
                : ''
            }
        </div>
    `

  modal.show()
}

function showAchievementNotification(achievement) {
  const notification = document.getElementById('achievementNotification')
  const title = document.getElementById('notificationTitle')
  const description = document.getElementById('notificationDescription')

  title.textContent = `Achievement Unlocked: ${achievement.name}`
  description.textContent = achievement.description

  notification.classList.add('show')

  // Auto-hide after 5 seconds
  setTimeout(() => {
    closeAchievementNotification()
  }, 5000)
}

function closeAchievementNotification() {
  const notification = document.getElementById('achievementNotification')
  notification.classList.remove('show')
}

// Utility functions
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Make functions globally available
window.showAchievementDetails = showAchievementDetails
window.closeAchievementNotification = closeAchievementNotification
