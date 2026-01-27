import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ScrollToTopButton from './utils/ScrollToTopButton'
import './App.css'

// Pages
import Home from './pages/Home'
import Editor from './pages/Editor'


function App() {
  return (
    <div className='w-full'>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/editor' element={<Editor />} />
        </Routes>
      </Router>
      <ScrollToTopButton />
    </div>
  )
}

export default App
