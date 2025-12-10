import React, { useState } from 'react';
import { Users, Heart, ArrowRight, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyBs9jU6_1D8aMFIKMY0FQd8QWW4PuNJEjA",
  authDomain: "eat-cycle.firebaseapp.com",
  projectId: "eat-cycle",
  storageBucket: "eat-cycle.firebasestorage.app",
  messagingSenderId: "208388832351",
  appId: "1:208388832351:web:53b8b572de0dd3f21aafea",
  measurementId: "G-C4FT87BNNH"
  };

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate=useNavigate()
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // Initialize Firebase here when needed
    console.log(`Selected role: ${role}`);
    console.log('Firebase Config:', firebaseConfig);
    // Navigate to respective dashboard
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
              <Leaf className="w-8 h-8 text-green-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">FoodShare</h1>
              <p className="text-green-200 text-sm">Together Against Food Waste</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-6xl w-full">
            {/* Hero Section */}
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6">
                Save Food, Save Lives
              </h2>
              <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
                Join our community to reduce food wastage and help those in need
              </p>
              <div className="flex items-center justify-center gap-2 text-green-200">
                <Users className="w-5 h-5" />
                <span className="text-lg">Choose your role to get started</span>
              </div>
            </div>

            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Donor Card */}
              <div
                onMouseEnter={() => setHoveredCard('donor')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleRoleSelect('donor')}
                className="group cursor-pointer"
              >
                <div className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 transition-all duration-500 ${
                  hoveredCard === 'donor' 
                    ? 'border-green-400 shadow-2xl shadow-green-500/50 transform scale-105' 
                    : 'border-white/20 hover:border-green-300/50'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-green-400 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform duration-300">
                      <Heart className="w-10 h-10 text-white" />
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white mb-4">I'm a Donor</h3>
                    <p className="text-green-100 text-lg mb-6 leading-relaxed">
                      Have surplus food? Share it with those who need it and make a difference in your community.
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-3 text-green-200">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Post available food items</span>
                      </li>
                      <li className="flex items-center gap-3 text-green-200">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Connect with recipients</span>
                      </li>
                      <li className="flex items-center gap-3 text-green-200">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Track your impact</span>
                      </li>
                    </ul>
                    
                    <button 
                      onClick={()=> {navigate("/donor")}}
                      className="w-full bg-white text-green-900 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transform group-hover:gap-4 transition-all duration-300">
                      <span>Continue as Donor</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recipient Card */}
              <div
                onMouseEnter={() => setHoveredCard('recipient')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleRoleSelect('recipient')}
                className="group cursor-pointer"
              >
                <div className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-2 transition-all duration-500 ${
                  hoveredCard === 'recipient' 
                    ? 'border-emerald-400 shadow-2xl shadow-emerald-500/50 transform scale-105' 
                    : 'border-white/20 hover:border-emerald-300/50'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform duration-300">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white mb-4">I'm a Recipient</h3>
                    <p className="text-green-100 text-lg mb-6 leading-relaxed">
                      Looking for food assistance? Browse available donations and connect with generous donors.
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-3 text-green-200">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span>Browse available food</span>
                      </li>
                      <li className="flex items-center gap-3 text-green-200">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span>Request what you need</span>
                      </li>
                      <li className="flex items-center gap-3 text-green-200">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span>Get notified instantly</span>
                      </li>
                    </ul>
                    
                    <button 
                       onClick={()=> {navigate("/reciver")}}
                      className="w-full bg-white text-emerald-900 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transform group-hover:gap-4 transition-all duration-300">
                      <span>Continue as Recipient</span>
                      
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">1.2M+</div>
                <div className="text-green-200">Meals Saved</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">50K+</div>
                <div className="text-green-200">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">500+</div>
                <div className="text-green-200">Cities</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-green-200">
          <p>© 2024 FoodShare. Making a difference, one meal at a time.</p>
        </footer>
      </div>
    </div>
  );
}