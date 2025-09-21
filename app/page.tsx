"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"
import { DonorRegistrationForm } from "@/components/forms/donor-registration-form"
import { RecipientRegistrationForm } from "@/components/forms/recipient-registration-form"
import { TransparencyDashboard } from "@/components/dashboard/transparency-dashboard"
import { BlockchainStatus } from "@/components/blockchain/blockchain-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Activity, Blocks } from "lucide-react"
import { initializeDemoData } from "@/lib/demo-data"
import { matchingAlgorithm } from "@/lib/matching-algorithm"
import { blockchainService } from "@/lib/blockchain-service"
import type { Donor, Recipient } from "@/types/medical"

type DashboardView = "main" | "donor-form" | "recipient-form" | "transparency" | "blockchain"

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  // Initialize demo data on first load
  useEffect(() => {
    initializeDemoData()
  }, [])

  if (isAuthenticated) {
    return (
      <ProtectedRoute>
        <DashboardView />
      </ProtectedRoute>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
              Transparent Organ Matching for Healthcare Professionals
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto">
              A blockchain-based system that ensures fair, transparent, and medically-optimized organ allocation through
              sophisticated matching algorithms and immutable record keeping.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Login Form */}
            <LoginForm />

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg flex-shrink-0">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Matching Algorithm</h3>
                  <p className="text-muted-foreground">
                    Sophisticated scoring system considering blood compatibility, HLA matching, CPRA levels, waitlist
                    time, geographic proximity, and age compatibility.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg flex-shrink-0">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Blockchain Transparency</h3>
                  <p className="text-muted-foreground">
                    All matching decisions are recorded immutably on the blockchain, ensuring complete transparency and
                    preventing manipulation in organ allocation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg flex-shrink-0">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Comprehensive Management</h3>
                  <p className="text-muted-foreground">
                    Complete donor and recipient registration, real-time matching results, and detailed score breakdowns
                    for informed medical decision-making.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function DashboardView() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<DashboardView>("main")
  const [stats, setStats] = useState({
    donors: 0,
    recipients: 0,
    matches: 0,
    blockchainTxs: 0,
  })

  useEffect(() => {
    const updateStats = () => {
      const donors: Donor[] = JSON.parse(localStorage.getItem("dharohar_donors") || "[]")
      const recipients: Recipient[] = JSON.parse(localStorage.getItem("dharohar_recipients") || "[]")

      const matchingStats = matchingAlgorithm.getMatchingStats(donors, recipients)
      const blockchainStats = blockchainService.getBlockchainStats()

      setStats({
        donors: matchingStats.totalDonors,
        recipients: matchingStats.totalRecipients,
        matches: matchingStats.compatiblePairs,
        blockchainTxs: blockchainStats.totalTransactions,
      })
    }

    updateStats()

    // Update stats when view changes back to main
    if (currentView === "main") {
      updateStats()
    }
  }, [currentView])

  const handleViewChange = (view: DashboardView) => {
    setCurrentView(view)
  }

  const handleFormSuccess = () => {
    setCurrentView("main")
  }

  if (currentView === "donor-form") {
    return (
      <div className="min-h-screen bg-background">
        <Header showUserMenu />
        <main className="container mx-auto px-4 py-8">
          <DonorRegistrationForm onBack={() => setCurrentView("main")} onSuccess={handleFormSuccess} />
        </main>
      </div>
    )
  }

  if (currentView === "recipient-form") {
    return (
      <div className="min-h-screen bg-background">
        <Header showUserMenu />
        <main className="container mx-auto px-4 py-8">
          <RecipientRegistrationForm onBack={() => setCurrentView("main")} onSuccess={handleFormSuccess} />
        </main>
      </div>
    )
  }

  if (currentView === "transparency") {
    return (
      <div className="min-h-screen bg-background">
        <Header showUserMenu />
        <main className="container mx-auto px-4 py-8">
          <TransparencyDashboard onBack={() => setCurrentView("main")} />
        </main>
      </div>
    )
  }

  if (currentView === "blockchain") {
    return (
      <div className="min-h-screen bg-background">
        <Header showUserMenu />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => setCurrentView("main")}>
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Blockchain Status</h1>
              <p className="text-muted-foreground">Monitor blockchain network and transaction history</p>
            </div>
          </div>
          <BlockchainStatus />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showUserMenu />

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back, {user?.name}</h2>
          <p className="text-muted-foreground">
            Manage organ donations and view transparency reports from your blockchain-secured dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Register Donor</CardTitle>
              <CardDescription>Add new organ donor to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => handleViewChange("donor-form")}>
                Add Donor
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Register Recipient</CardTitle>
              <CardDescription>Add new organ recipient to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => handleViewChange("recipient-form")}>
                Add Recipient
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Transparency Dashboard</CardTitle>
              <CardDescription>View matching results and algorithm transparency</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary" onClick={() => handleViewChange("transparency")}>
                View Matches
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Blockchain Status</CardTitle>
              <CardDescription>Monitor network and transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-transparent"
                variant="outline"
                onClick={() => handleViewChange("blockchain")}
              >
                <Blocks className="w-4 h-4 mr-2" />
                View Blockchain
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Current system statistics and blockchain status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.donors}</div>
                <div className="text-sm text-muted-foreground">Active Donors</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-accent">{stats.recipients}</div>
                <div className="text-sm text-muted-foreground">Active Recipients</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-success">{stats.matches}</div>
                <div className="text-sm text-muted-foreground">Compatible Matches</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-warning">{stats.blockchainTxs}</div>
                <div className="text-sm text-muted-foreground">Blockchain Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
