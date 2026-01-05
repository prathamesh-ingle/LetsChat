//src/App.jsx
import { Routes, Route} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import useAuthUser from "./hooks/useAuthUser.js";



import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import ChatPage from './pages/ChatPage'
import CallPage from './pages/CallPage'
import NotificationsPage from './pages/NotificationsPage'
import PageLoader from './components/PageLoader.jsx';
import Layout from './components/Layout.jsx';
import { useThemeStore } from './store/useThemeStore.js';
import FriendsPage from './pages/Friends.jsx' 
import AIChatPage from './pages/AIChatPage.jsx';
import Symptoms from './pages/Symptoms.jsx';
import Image from './pages/Image.jsx';

const App = () => {

  // tanStack Query crash course

  const {isLoading, authUser} = useAuthUser();
  const {theme} = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;
 
  if(isLoading) return <PageLoader/>

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        <Route path="/" element={isAuthenticated && isOnboarded ? ( <Layout showSidebar={true}> <HomePage /> </Layout> ) :( <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} /> ) } />
        <Route path="/friends" element={isAuthenticated && isOnboarded ? ( <Layout showSidebar={true}> <FriendsPage /> </Layout> ) :(<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} /> )} />
        <Route path="/signup" element={!isAuthenticated ? <SignUpPage /> : <Navigate to={ isOnboarded ? "/" : "/onboarding"} />} />
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={ isOnboarded ? "/" : "/onboarding"} />} />
        <Route path="/notifications" element={isAuthenticated && isOnboarded ?( <Layout showSidebar={true}> <NotificationsPage /> </Layout> ) :(<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} /> )} />
        <Route path="/call/:id" element={isAuthenticated && isOnboarded ? ( <CallPage /> ) :(<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} /> )} />
        <Route path="/chat/:id" element={isAuthenticated && isOnboarded ? ( <Layout showSidebar={true}> <ChatPage /> </Layout> ) :(<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} /> )} />
        <Route path="/ai-chat" element={isAuthenticated && isOnboarded ? ( <Layout showSidebar={true}> <AIChatPage /> </Layout> ) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />)}/>
        <Route path="/symptoms" element={isAuthenticated && isOnboarded ? ( <Layout showSidebar={true}> <Symptoms /> </Layout> ) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />)}/>
        <Route path="/image" element={isAuthenticated && isOnboarded ? ( <Layout showSidebar={true}> <Image /> </Layout> ) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />)}/> 
        <Route path="/onboarding" element={isAuthenticated ?  (!isOnboarded ? (<OnboardingPage />) : (<Navigate to="/"/>) ) : (<Navigate to="/login"/>)} />

      </Routes>

      <Toaster />
    </div>
    
  )
}

export default App