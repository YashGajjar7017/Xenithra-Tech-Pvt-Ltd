import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './ThemeSelector.css'

const ThemeSelector = () => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showFailAlert, setShowFailAlert] = useState(false)
  const [activeTheme, setActiveTheme] = useState(null)

  const themes = [
    {
      id: 'github',
      name: 'Github Theme',
      image: '/images/github.jpg'
    },
    {
      id: 'red',
      name: 'Red Theme',
      background: 'rgb(241, 60, 60)'
    },
    {
      id: 'blue',
      name: 'Blue Theme',
      background: 'rgb(54, 54, 238)'
    },
    {
      id: 'green',
      name: 'Green Theme',
      background: 'rgb(22, 173, 22)'
    },
    {
      id: 'pink',
      name: 'Pink Theme',
      background: 'linear-gradient(to top, #c471f5 0%, #fa71cd 100%)'
    },
    {
      id: 'yellowgreen',
      name: 'YellowGreen Theme',
      background: 'yellowgreen'
    },
    {
      id: 'gradient1',
      name: 'Gradient Theme 1',
      background: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)'
    },
    {
      id: 'gradient2',
      name: 'Gradient Theme 2',
      background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)'
    }
  ]

  const applyTheme = (themeId) => {
    setActiveTheme(themeId)
    setShowSuccessAlert(true)
    // Simulate API call to apply theme to editor
    setTimeout(() => {
      setShowSuccessAlert(false)
    }, 3000)
  }

  const removeTheme = () => {
    setActiveTheme(null)
    setShowFailAlert(true)
    setTimeout(() => {
      setShowFailAlert(false)
    }, 3000)
  }

  const renderThemeCard = (theme) => (
    <div key={theme.id} className="card theme-card" style={{ width: '18rem', marginRight: '2%' }}>
      <div
        className="card-img-top"
        style={{
          backgroundImage: theme.image ? `url(${theme.image})` : 'none',
          backgroundColor: theme.background,
          backgroundSize: 'cover',
          height: '32vh'
        }}
      />
      <div className="card-body">
        <h5 className="card-title">{theme.name}</h5>
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-success"
            onClick={() => applyTheme(theme.id)}
            disabled={activeTheme === theme.id}
          >
            Apply
          </button>
          {activeTheme === theme.id && (
            <button className="btn btn-danger" onClick={removeTheme}>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#555', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-light custom">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            The Byter Machine
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" href="/">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Join with us
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  Dropdown
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                    <a className="dropdown-item" href="#">
                      Action
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Another action
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Something else here
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <a className="nav-link disabled" href="/classLoader">
                  Classroom
                </a>
              </li>
            </ul>
            <form className="d-flex">
              <input className="form-control me-2" type="search" placeholder="Search" />
              <button className="btn btn-outline-success" type="submit">
                Search
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Title */}
      <div className="text-center" style={{ marginTop: '2%', color: 'white' }}>
        <h2>Theme Zone</h2>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div
          className="alert alert-success alert-dismissible fade show container my-2"
          role="alert"
        >
          <strong>Successfully</strong> apply the theme to texteditor
          <button type="button" className="btn-close" onClick={() => setShowSuccessAlert(false)} />
        </div>
      )}

      {/* Fail Alert */}
      {showFailAlert && (
        <div className="alert alert-danger alert-dismissible fade show container my-2" role="alert">
          <strong>Fail to</strong> apply the theme to texteditor
          <button type="button" className="btn-close" onClick={() => setShowFailAlert(false)} />
        </div>
      )}

      {/* Theme Cards - Row 1 */}
      <div className="container" style={{ display: 'flex', marginTop: '3%' }}>
        {themes.slice(0, 4).map(renderThemeCard)}
      </div>

      {/* Theme Cards - Row 2 */}
      <div className="container" style={{ display: 'flex', marginTop: '3%', marginBottom: '7vh' }}>
        {themes.slice(4, 8).map(renderThemeCard)}
      </div>

      {/* Active Theme Indicator */}
      {activeTheme && (
        <div className="container text-center">
          <div className="alert alert-info">
            Currently Active: <strong>{themes.find((t) => t.id === activeTheme)?.name}</strong>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeSelector
