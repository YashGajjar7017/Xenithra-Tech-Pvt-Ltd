import { useState, useEffect, useCallback } from 'react'
import '../css/bootstrap/css/bootstrap.min.css'
import '../css/boxicons/css/boxicons.min.css'
import '../css/achievements.css'

const AchievementsPage = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activePeriod, setActivePeriod] = useState('all')
  const [unlockedCount, setUnlockedCount] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [rank, setRank] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationData, setNotificationData] = useState({})

  // Mock data - replace with your API calls
  const achievementsData = [
    // Add your achievements data here
  ]

  const updateStats = useCallback(() => {
    // Update stats logic here
    setUnlockedCount(12)
    setTotalPoints(1560)
    setRank(23)
  }, [])

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
  }

  const handlePeriodChange = (period) => {
    setActivePeriod(period)
  }

  const closeAchievementNotification = () => {
    setShowNotification(false)
  }

  useEffect(() => {
    updateStats()
  }, [updateStats])

  return (
    <div className="achievements-container">
      {/* Header */}
      <header className="achievements-header">
        <div className="header-content">
          <h1>
            <i className="bx bx-trophy"></i> Achievements
          </h1>
          <p>Track your progress and unlock rewards</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number" id="unlockedCount">
              {unlockedCount}
            </span>
            <span className="stat-label">Unlocked</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" id="totalPoints">
              {totalPoints}
            </span>
            <span className="stat-label">Points</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" id="rank">
              #{rank}
            </span>
            <span className="stat-label">Rank</span>
          </div>
        </div>
      </header>

      {/* Achievement Categories */}
      <div className="categories-section">
        <div className="categories-tabs">
          <button
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
            data-category="all"
          >
            <i className="bx bx-grid-alt"></i> All
          </button>
          <button
            className={`category-tab ${activeCategory === 'compilation' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('compilation')}
            data-category="compilation"
          >
            <i className="bx bx-code-alt"></i> Compilation
          </button>
          <button
            className={`category-tab ${activeCategory === 'debugging' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('debugging')}
            data-category="debugging"
          >
            <i className="bx bx-bug"></i> Debugging
          </button>
          <button
            className={`category-tab ${activeCategory === 'collaboration' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('collaboration')}
            data-category="collaboration"
          >
            <i className="bx bx-group"></i> Collaboration
          </button>
          <button
            className={`category-tab ${activeCategory === 'consistency' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('consistency')}
            data-category="consistency"
          >
            <i className="bx bx-calendar"></i> Consistency
          </button>
          <button
            className={`category-tab ${activeCategory === 'performance' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('performance')}
            data-category="performance"
          >
            <i className="bx bx-speed"></i> Performance
          </button>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid" id="achievementsGrid">
        {/* Achievements will be loaded here via state */}
      </div>

      {/* Progress Section */}
      <div className="progress-section">
        <h2>Achievement Progress</h2>
        <div className="progress-grid" id="progressGrid">
          {/* Progress items will be loaded here */}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard-section">
        <h2>
          <i className="bx bx-medal"></i> Leaderboard
        </h2>
        <div className="leaderboard-tabs">
          <button
            className={`leaderboard-tab ${activePeriod === 'all' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('all')}
            data-period="all"
          >
            All Time
          </button>
          <button
            className={`leaderboard-tab ${activePeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('monthly')}
            data-period="monthly"
          >
            This Month
          </button>
          <button
            className={`leaderboard-tab ${activePeriod === 'weekly' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('weekly')}
            data-period="weekly"
          >
            This Week
          </button>
        </div>
        <div className="leaderboard" id="leaderboard">
          {/* Leaderboard will be loaded here */}
        </div>
      </div>

      {/* Achievement Details Modal - Bootstrap Modal */}
      <div className="modal fade" id="achievementModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="achievementModalTitle">
                Achievement Details
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body" id="achievementModalBody">
              {/* Achievement details will be loaded here */}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Notification */}
      {showNotification && (
        <div className="achievement-notification" id="achievementNotification">
          <div className="notification-content">
            <div className="achievement-icon">
              <i className="bx bx-trophy"></i>
            </div>
            <div className="achievement-info">
              <h4 id="notificationTitle">{notificationData.title || 'Achievement Unlocked!'}</h4>
              <p id="notificationDescription">
                {notificationData.description || 'Congratulations on your achievement!'}
              </p>
            </div>
            <button className="notification-close" onClick={closeAchievementNotification}>
              <i className="bx bx-x"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AchievementsPage
