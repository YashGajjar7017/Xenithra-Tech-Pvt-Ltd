import { useState } from 'react'
import { topbarStyles } from './topbarStyles'

const Topbar = ({ onToggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState('JavaScript')

  const languages = ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript']

  return (
    <div style={topbarStyles.topbar}>
      <h1 style={topbarStyles.title}>Editor</h1>

      <div style={topbarStyles.controls}>
        <button style={topbarStyles.button} title="Format Code">
          ✨ Format
        </button>
        <button style={topbarStyles.button} title="Save">
          💾 Save
        </button>
        <button style={{ ...topbarStyles.button, ...topbarStyles.btnRun }}>
          ▶ Run
        </button>
      </div>

      <div style={topbarStyles.langSelect}>
        <span>Language:</span>
        <div style={topbarStyles.dropdown} className={dropdownOpen ? 'open' : ''}>
          <button
            style={topbarStyles.dropdownToggle}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {selectedLang}
            <span style={topbarStyles.arrow}>▼</span>
          </button>
          {dropdownOpen && (
            <div style={topbarStyles.dropdownMenu}>
              {languages.map((lang) => (
                <button
                  key={lang}
                  style={topbarStyles.dropdownItem}
                  onClick={() => {
                    setSelectedLang(lang)
                    setDropdownOpen(false)
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Topbar
