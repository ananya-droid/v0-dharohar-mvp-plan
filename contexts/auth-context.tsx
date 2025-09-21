"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  role: "admin" | "doctor" | "coordinator"
  hospitalId: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Demo users for the MVP
  const demoUsers: Record<string, { password: string; user: User }> = {
    admin: {
      password: "hospital123",
      user: {
        id: "1",
        username: "admin",
        role: "admin",
        hospitalId: "AIIMS-001",
        name: "Dr. Admin Kumar",
      },
    },
    doctor: {
      password: "doctor123",
      user: {
        id: "2",
        username: "doctor",
        role: "doctor",
        hospitalId: "AIIMS-001",
        name: "Dr. Sarah Patel",
      },
    },
    coordinator: {
      password: "coord123",
      user: {
        id: "3",
        username: "coordinator",
        role: "coordinator",
        hospitalId: "AIIMS-001",
        name: "Rajesh Coordinator",
      },
    },
  }

  useEffect(() => {
    // Check for stored authentication on mount
    const storedUser = localStorage.getItem("dharohar_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("dharohar_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const userCredentials = demoUsers[username.toLowerCase()]

    if (userCredentials && userCredentials.password === password) {
      setUser(userCredentials.user)
      localStorage.setItem("dharohar_user", JSON.stringify(userCredentials.user))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("dharohar_user")
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
