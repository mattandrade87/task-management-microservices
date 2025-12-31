import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '@/lib/api'

interface User {
  id: string
  email: string
  username: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const response = await api.get('/auth/me')
          setUser(response.data)
        } catch (error) {
          console.error('Failed to fetch user:', error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { access_token, refresh_token, user: userData } = response.data

      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      setUser(userData)
    } catch (error: any) {
      console.error('Login failed:', error)
      if (error.response) {
        // Server responded with error status
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
        throw new Error(error.response.data?.message || 'Login failed')
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received. Check if API is running at:', api.defaults.baseURL)
        throw new Error('Cannot connect to server. Please check your connection.')
      } else {
        // Something else happened
        console.error('Error:', error.message)
        throw error
      }
    }
  }

  const register = async (email: string, username: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { email, username, password })
      const { access_token, refresh_token, user: userData } = response.data

      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      setUser(userData)
    } catch (error: any) {
      console.error('Registration failed:', error)
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
        throw new Error(error.response.data?.message || 'Registration failed')
      } else if (error.request) {
        console.error('No response received. Check if API is running at:', api.defaults.baseURL)
        throw new Error('Cannot connect to server. Please check your connection.')
      } else {
        console.error('Error:', error.message)
        throw error
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
