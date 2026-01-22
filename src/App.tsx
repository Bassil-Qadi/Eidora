import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/UI/Navbar'
import Footer from './components/UI/Footer'
import ScrollToTopButton from './utils/ScrollToTopButton'
import './App.css'

// Pages
import Home from './pages/Home'
import Editor from './pages/Editor'


function App() {
  return (
    <div className='w-full'>
      {/* <Navbar /> */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/editor' element={<Editor />} />
        </Routes>
      </Router>
      {/* <Footer /> */}
      <ScrollToTopButton />
    </div>
  )
}

export default App
