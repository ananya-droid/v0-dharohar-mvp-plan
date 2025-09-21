"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Search, Filter, Users, Heart, Clock, MapPin, User, Activity } from "lucide-react"
import { matchingAlgorithm } from "@/lib/matching-algorithm"
import type { Donor, Recipient, DonorMatch } from "@/lib/matching-algorithm"
import type { UrgencyLevel } from "@/types/medical"

interface TransparencyDashboardProps {
  onBack: () => void
}

export function TransparencyDashboard({ onBack }: TransparencyDashboardProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [donors, setDonors] = useState<Donor[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [matches, setMatches] = useState<DonorMatch[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterUrgency, setFilterUrgency] = useState<string>("all")
  const [filterOrgan, setFilterOrgan] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load data from localStorage
    const loadedRecipients: Recipient[] = JSON.parse(localStorage.getItem("dharohar_recipients") || "[]")
    const loadedDonors: Donor[] = JSON.parse(localStorage.getItem("dharohar_donors") || "[]")

    setRecipients(loadedRecipients.filter((r) => r.isActive))
    setDonors(loadedDonors.filter((d) => d.isActive))
  }, [])

  const handleRecipientSelect = async (recipient: Recipient) => {
    setSelectedRecipient(recipient)
    setIsLoading(true)

    // Simulate processing time for dramatic effect
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const recipientMatches = matchingAlgorithm.findMatches(recipient, donors)
    setMatches(recipientMatches)
    setIsLoading(false)
  }

  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch = recipient.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesUrgency = filterUrgency === "all" || recipient.medicalInfo.urgencyLevel === filterUrgency
    const matchesOrgan = filterOrgan === "all" || recipient.medicalInfo.organType === filterOrgan

    return matchesSearch && matchesUrgency && matchesOrgan
  })

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-destructive"
  }

  const getWaitlistDays = (waitlistDate: string) => {
    const start = new Date(waitlistDate)
    const now = new Date()
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (selectedRecipient) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => setSelectedRecipient(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recipients
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Donor Matches</h1>
            <p className="text-muted-foreground">
              Showing matches for {selectedRecipient.personalInfo.name} ({selectedRecipient.medicalInfo.organType}{" "}
              recipient)
            </p>
          </div>
        </div>

        {/* Recipient Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Recipient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">{selectedRecipient.personalInfo.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Blood Type</div>
                <div className="font-medium">{selectedRecipient.medicalInfo.bloodType}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Urgency</div>
                <Badge variant={getUrgencyColor(selectedRecipient.medicalInfo.urgencyLevel)}>
                  {selectedRecipient.medicalInfo.urgencyLevel.toUpperCase()}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Waitlist Days</div>
                <div className="font-medium">{getWaitlistDays(selectedRecipient.medicalInfo.waitlistDate)} days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matches */}
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Calculating matches using advanced algorithm...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Compatible Donors ({matches.length} {matches.length === 1 ? "match" : "matches"} found)
              </h2>
              {matches.length > 0 && (
                <div className="text-sm text-muted-foreground">Sorted by compatibility score (highest first)</div>
              )}
            </div>

            {matches.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Compatible Donors Found</h3>
                  <p className="text-muted-foreground">
                    There are currently no donors that match the medical criteria for this recipient.
                  </p>
                </CardContent>
              </Card>
            ) : (
              matches.map((match, index) => <DonorMatchCard key={match.donor.id} match={match} rank={index + 1} />)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transparency Dashboard</h1>
          <p className="text-muted-foreground">View recipients and their potential donor matches</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Recipients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Urgency Level</label>
              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Organ Type</label>
              <Select value={filterOrgan} onValueChange={setFilterOrgan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organs</SelectItem>
                  <SelectItem value="kidney">Kidney</SelectItem>
                  <SelectItem value="liver">Liver</SelectItem>
                  <SelectItem value="heart">Heart</SelectItem>
                  <SelectItem value="lung">Lung</SelectItem>
                  <SelectItem value="pancreas">Pancreas</SelectItem>
                  <SelectItem value="cornea">Cornea</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipients List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Recipients ({filteredRecipients.length} {filteredRecipients.length === 1 ? "recipient" : "recipients"})
          </h2>
        </div>

        {filteredRecipients.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Recipients Found</h3>
              <p className="text-muted-foreground">
                {recipients.length === 0
                  ? "No recipients have been registered yet."
                  : "No recipients match the current filter criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRecipients.map((recipient) => (
              <RecipientCard
                key={recipient.id}
                recipient={recipient}
                onSelect={() => handleRecipientSelect(recipient)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RecipientCard({ recipient, onSelect }: { recipient: Recipient; onSelect: () => void }) {
  const waitlistDays = Math.floor(
    (new Date().getTime() - new Date(recipient.medicalInfo.waitlistDate).getTime()) / (1000 * 60 * 60 * 24),
  )

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{recipient.personalInfo.name}</h3>
              <p className="text-muted-foreground">
                {recipient.personalInfo.age} years • {recipient.personalInfo.gender}
              </p>
            </div>
          </div>
          <Button variant="outline">View Matches</Button>
        </div>

        <div className="grid md:grid-cols-5 gap-4 mt-4 pt-4 border-t">
          <div>
            <div className="text-sm text-muted-foreground">Organ Needed</div>
            <div className="font-medium capitalize">{recipient.medicalInfo.organType}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Blood Type</div>
            <div className="font-medium">{recipient.medicalInfo.bloodType}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Urgency</div>
            <Badge variant={getUrgencyColor(recipient.medicalInfo.urgencyLevel)}>
              {recipient.medicalInfo.urgencyLevel.toUpperCase()}
            </Badge>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">CPRA</div>
            <div className="font-medium">{recipient.medicalInfo.cpra}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Waitlist</div>
            <div className="font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {waitlistDays} days
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {recipient.personalInfo.city}, {recipient.personalInfo.state}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DonorMatchCard({ match, rank }: { match: DonorMatch; rank: number }) {
  const [showDetails, setShowDetails] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-destructive"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match"
    if (score >= 60) return "Good Match"
    if (score >= 40) return "Fair Match"
    return "Poor Match"
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground font-bold">
              {rank}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{match.donor.personalInfo.name}</h3>
              <p className="text-muted-foreground">
                {match.donor.personalInfo.age} years • {match.donor.personalInfo.gender}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(match.score.totalScore)}`}>
              {match.score.totalScore}%
            </div>
            <div className="text-sm text-muted-foreground">{getScoreLabel(match.score.totalScore)}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Blood Type</div>
            <div className="font-medium">{match.donor.medicalInfo.bloodType}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">HLA Type</div>
            <div className="font-medium text-sm">{match.donor.medicalInfo.hlaType}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Location</div>
            <div className="font-medium">
              {match.donor.personalInfo.city}, {match.donor.personalInfo.state}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Organ</div>
            <div className="font-medium capitalize">{match.donor.medicalInfo.organType}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Score Breakdown</span>
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? "Hide Details" : "Show Details"}
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <ScoreBar
              label="Blood Compatibility"
              score={match.score.breakdown.bloodCompatibility}
              explanation={match.score.explanation.bloodCompatibility}
              showDetails={showDetails}
            />
            <ScoreBar
              label="HLA Matching"
              score={match.score.breakdown.hlaMatching}
              explanation={match.score.explanation.hlaMatching}
              showDetails={showDetails}
            />
            <ScoreBar
              label="CPRA Score"
              score={match.score.breakdown.cpraScore}
              explanation={match.score.explanation.cpraScore}
              showDetails={showDetails}
            />
            <ScoreBar
              label="Waitlist Time"
              score={match.score.breakdown.waitlistTime}
              explanation={match.score.explanation.waitlistTime}
              showDetails={showDetails}
            />
            <ScoreBar
              label="Geographic Proximity"
              score={match.score.breakdown.geographicProximity}
              explanation={match.score.explanation.geographicProximity}
              showDetails={showDetails}
            />
            <ScoreBar
              label="Age Compatibility"
              score={match.score.breakdown.ageCompatibility}
              explanation={match.score.explanation.ageCompatibility}
              showDetails={showDetails}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScoreBar({
  label,
  score,
  explanation,
  showDetails,
}: {
  label: string
  score: number
  explanation: string
  showDetails: boolean
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-success"
    if (score >= 60) return "bg-warning"
    return "bg-destructive"
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold">{score}%</span>
      </div>
      <Progress value={score} className="h-2" />
      {showDetails && <p className="text-xs text-muted-foreground">{explanation}</p>}
    </div>
  )
}
