import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Routes, Route } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './components/ThemeTogle/ThemeContext'
import { AuthProvider } from './context/AuthProvider'
import Layout from './Layout'
import Loading from './components/Common/Loading'

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const ForgotPassword = lazy(() => import('./components/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AICounselor = lazy(() => import('./pages/AICounselor'));
const Profile = lazy(() => import('./pages/Profile'));
const UniversityShortlisting = lazy(() => import('./pages/UniversityShortlisting'));
const LockedUniversities = lazy(() => import('./pages/LockedUniversities'));
const AllUniversities = lazy(() => import('./pages/AllUniversities'));
const ErrorPage = lazy(() => import('./components/Common/ErrorPage'));

import PublicRoute from './components/Routes/PublicRoute'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />

        {/* Public Routes (Redirect to Dashboard if logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        <Route path="onboarding" element={<Onboarding />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="university-shortlist" element={<UniversityShortlisting />} />
        <Route path="shortlist" element={<LockedUniversities />} />
        <Route path="universities/explore" element={<AllUniversities />} />
        <Route path="*" element={<ErrorPage code={404} title="Page Not Found" message="The page you are looking for has been moved or doesn't exist." />} />
      </Route>
      <Route path="ai-counselor" element={
        <Suspense fallback={<Loading />}>
          <AICounselor />
        </Suspense>
      } />
    </Route>

  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)