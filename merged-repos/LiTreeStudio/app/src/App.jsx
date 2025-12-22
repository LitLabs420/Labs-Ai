import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import MediaLibrary from './pages/MediaLibrary'
import Player from './pages/Player'
import './App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/play/:id" element={<Player />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
