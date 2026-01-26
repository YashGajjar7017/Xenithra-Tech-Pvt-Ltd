const path = require('path')
const rootDir = require('../util/path')

// Frontend maintenance controller
class FrontendMaintenanceController {
  constructor() {
    this.maintenanceEndpoint = '/api/maintenance'
    this.checkInterval = null
  }

  // Check maintenance status
  async checkMaintenanceStatus() {
    try {
      const response = await fetch(`${this.maintenanceEndpoint}/status`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error checking maintenance status:', error)
      return { success: false, error: error.message }
    }
  }

  // Enable maintenance mode
  async enableMaintenance(config) {
    try {
      const response = await fetch(`${this.maintenanceEndpoint}/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error enabling maintenance:', error)
      return { success: false, error: error.message }
    }
  }

  // Disable maintenance mode
  async disableMaintenance() {
    try {
      const response = await fetch(`${this.maintenanceEndpoint}/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error disabling maintenance:', error)
      return { success: false, error: error.message }
    }
  }

  // Update maintenance message
  async updateMessage(message) {
    try {
      const response = await fetch(`${this.maintenanceEndpoint}/message`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating message:', error)
      return { success: false, error: error.message }
    }
  }

  // Add allowed IP
  async addAllowedIP(ip) {
    try {
      const response = await fetch(`${this.maintenanceEndpoint}/allowed-ip/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip })
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding allowed IP:', error)
      return { success: false, error: error.message }
    }
  }

  // Remove allowed IP
  async removeAllowedIP(ip) {
    try {
      const response = await fetch(`${this.maintenanceEndpoint}/allowed-ip/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip })
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error removing allowed IP:', error)
      return { success: false, error: error.message }
    }
  }

  // Start periodic maintenance check
  startMaintenanceCheck(intervalMs = 30000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    this.checkInterval = setInterval(async () => {
      const status = await this.checkMaintenanceStatus()
      if (status.data && status.data.enabled) {
        this.handleMaintenanceMode(status.data)
      }
    }, intervalMs)
  }

  // Stop periodic maintenance check
  stopMaintenanceCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  // Handle maintenance mode
  handleMaintenanceMode(maintenanceData) {
    // Show maintenance banner or redirect
    const maintenanceBanner = document.getElementById('maintenance-banner')
    if (maintenanceBanner) {
      maintenanceBanner.style.display = 'block'
      maintenanceBanner.textContent = maintenanceData.message
    } else {
      // Create maintenance banner
      const banner = document.createElement('div')
      banner.id = 'maintenance-banner'
      banner.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ff6b6b;
                color: white;
                padding: 10px;
                text-align: center;
                z-index: 9999;
                font-weight: bold;
            `
      banner.textContent = maintenanceData.message
      document.body.insertBefore(banner, document.body.firstChild)
    }
  }

  // Create maintenance control panel
  createMaintenancePanel() {
    const panel = document.createElement('div')
    panel.id = 'maintenance-panel'
    panel.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            width: 300px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
        `

    panel.innerHTML = `
            <h3>Maintenance Control</h3>
            <div>
                <label>Message:</label>
                <input type="text" id="maintenance-message" placeholder="Maintenance message">
            </div>
            <div>
                <label>Allowed IPs:</label>
                <input type="text" id="allowed-ips" placeholder="Comma-separated IPs">
            </div>
            <div>
                <button onclick="maintenanceController.enableMaintenance()">Enable</button>
                <button onclick="maintenanceController.disableMaintenance()">Disable</button>
            </div>
            <div id="maintenance-status"></div>
        `

    document.body.appendChild(panel)
  }
}

// Create global instance
const maintenanceController = new FrontendMaintenanceController()

// Export for use in other modules
module.exports = {
  FrontendMaintenanceController,
  maintenanceController
}

// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
  window.maintenanceController = maintenanceController
}
