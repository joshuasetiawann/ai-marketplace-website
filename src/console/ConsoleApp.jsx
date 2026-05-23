import { Routes, Route, Navigate } from 'react-router-dom'
import ConsoleLayout from './ConsoleLayout.jsx'
import ConsoleLogin from './ConsoleLogin.jsx'
import Admin from '../pages/Admin.jsx'
import DeveloperDashboard from '../pages/DeveloperDashboard.jsx'
import Toaster from '../components/Toaster.jsx'
import { ScrollToTop } from '../components/common.jsx'
import { useApp } from '../context/AppContext.jsx'

// Console-only access: staff roles only. A buyer/seller who lands here is bounced
// to the console login (where they'll be told this surface isn't for them).
function Guard({ roles, children }) {
  const { isAuthenticated, role } = useApp()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!roles.includes(role)) return <Navigate to="/" replace />
  return <ConsoleLayout>{children}</ConsoleLayout>
}

function Landing() {
  const { isAuthenticated, role } = useApp()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />
  if (role === 'developer') return <Navigate to="/developer" replace />
  return <Navigate to="/login" replace />
}

export default function ConsoleApp() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<ConsoleLogin />} />
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={<Guard roles={['admin']}><Admin /></Guard>} />
        <Route path="/developer" element={<Guard roles={['developer', 'admin']}><DeveloperDashboard /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}
