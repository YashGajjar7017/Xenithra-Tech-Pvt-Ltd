import { useState } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import Topbar from '../Topbar/Topbar'
import { layoutStyles } from './layoutStyles'

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div style={layoutStyles.container}>
      <style>{layoutStyles.globalCSS}</style>
      <div style={layoutStyles.app}>
        <div style={layoutStyles.borderNeon}></div>
        <div style={layoutStyles.shell}>
          <Sidebar collapsed={sidebarCollapsed} />
          <div style={layoutStyles.main}>
            <Topbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
            <div style={layoutStyles.content}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout
