import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import Login from './Login.jsx'
import Signup from './Signup.jsx'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import NotFound from './NotFound.jsx'
import Home from './Home.jsx'
import DonorDashboard from './DonorDashboard.jsx'
import RecipientDashboard from './RecipientDashboard.jsx'
import { Info } from 'lucide-react'
        
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
   
      <BrowserRouter>
     
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home/>}/>
        <Route path='/donor' element={<DonorDashboard/>}/>
        <Route path='/reciver' element={<RecipientDashboard/>}/>
        <Route path='/info' element={<Info/>}/>
        <Route path='*' element={<NotFound/>}/>
         
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
