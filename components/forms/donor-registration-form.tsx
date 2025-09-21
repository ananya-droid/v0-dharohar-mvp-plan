"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, AlertCircle, Blocks } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { blockchainService } from "@/lib/blockchain-service"
import type { Donor, BloodType, OrganType } from "@/types/medical"
import { BLOOD_TYPES, ORGAN_TYPES, INDIAN_STATES } from "@/types/medical"

interface DonorRegistrationFormProps {
  onBack: () => void
  onSuccess: () => void
}

export function DonorRegistrationForm({ onBack, onSuccess }: DonorRegistrationFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [blockchainTxId, setBlockchainTxId] = useState("")

  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    age: "",
    gender: "",
    contactNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",

    // Medical Information
    bloodType: "",
    hlaType: "",
    organType: "",
    medicalHistory: "",
    currentMedications: "",
    allergies: "",
    smokingStatus: "",
    alcoholStatus: "",

    // Consent Information
    consentGiven: false,
    witnessName: "",
    witnessContact: "",
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.name || !formData.age || !formData.contactNumber) {
      return "Please fill in all required personal information fields"
    }

    if (!formData.bloodType || !formData.hlaType || !formData.organType) {
      return "Please fill in all required medical information fields"
    }

    if (!formData.consentGiven) {
      return "Donor consent is required to proceed"
    }

    if (!formData.witnessName || !formData.witnessContact) {
      return "Witness information is required for consent validation"
    }

    const age = Number.parseInt(formData.age)
    if (age < 18 || age > 65) {
      return "Donor age must be between 18 and 65 years"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      // Create donor data object
      const donorData: Donor = {
        id: `donor_${Date.now()}`,
        personalInfo: {
          name: formData.name,
          age: Number.parseInt(formData.age),
          gender: formData.gender as "male" | "female" | "other",
          contactNumber: formData.contactNumber,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        medicalInfo: {
          bloodType: formData.bloodType as BloodType,
          hlaType: formData.hlaType,
          organType: formData.organType as OrganType,
          medicalHistory: formData.medicalHistory,
          currentMedications: formData.currentMedications,
          allergies: formData.allergies,
          smokingStatus: formData.smokingStatus as "never" | "former" | "current",
          alcoholStatus: formData.alcoholStatus as "never" | "occasional" | "regular",
        },
        consentInfo: {
          consentGiven: formData.consentGiven,
          consentDate: new Date().toISOString(),
          witnessName: formData.witnessName,
          witnessContact: formData.witnessContact,
        },
        isActive: true,
        registrationDate: new Date().toISOString(),
        hospitalId: user?.hospitalId || "",
      }

      const blockchainTx = await blockchainService.registerDonor(donorData, user?.hospitalId || "", user?.id || "")
      setBlockchainTxId(blockchainTx.id)

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store in localStorage for demo (in production, this would be handled by blockchain)
      const existingDonors = JSON.parse(localStorage.getItem("dharohar_donors") || "[]")
      existingDonors.push(donorData)
      localStorage.setItem("dharohar_donors", JSON.stringify(existingDonors))

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 3000)
    } catch (err) {
      setError("Failed to register donor. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Donor Registered Successfully</h2>
          <p className="text-muted-foreground mb-4">
            The donor has been registered and recorded on the blockchain. The information is now immutable and available
            for matching.
          </p>

          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Blocks className="w-5 h-5 text-primary" />
              <span className="font-medium">Blockchain Transaction</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Transaction ID: <span className="font-mono">{blockchainTxId}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              This registration is now permanently recorded and cannot be altered
            </div>
          </div>

          <Button onClick={onSuccess}>Return to Dashboard</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Register New Donor</h1>
          <p className="text-muted-foreground">Add a new organ donor to the blockchain system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic demographic and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="65"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  placeholder="Age (18-65)"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                  placeholder="+91 XXXXXXXXXX"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Complete address"
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  placeholder="XXXXXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
            <CardDescription>Medical details required for matching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type *</Label>
                <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="organType">Organ Type *</Label>
                <Select value={formData.organType} onValueChange={(value) => handleInputChange("organType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organ" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGAN_TYPES.map((organ) => (
                      <SelectItem key={organ} value={organ}>
                        {organ.charAt(0).toUpperCase() + organ.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hlaType">HLA Type *</Label>
                <Input
                  id="hlaType"
                  value={formData.hlaType}
                  onChange={(e) => handleInputChange("hlaType", e.target.value)}
                  placeholder="A1,A2,B5,B8,DR3,DR4"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smokingStatus">Smoking Status</Label>
                <Select
                  value={formData.smokingStatus}
                  onValueChange={(value) => handleInputChange("smokingStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select smoking status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="former">Former</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alcoholStatus">Alcohol Status</Label>
                <Select
                  value={formData.alcoholStatus}
                  onValueChange={(value) => handleInputChange("alcoholStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alcohol status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="occasional">Occasional</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                placeholder="Relevant medical history, surgeries, conditions..."
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  value={formData.currentMedications}
                  onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                  placeholder="List current medications..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange("allergies", e.target.value)}
                  placeholder="Known allergies..."
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent Information */}
        <Card>
          <CardHeader>
            <CardTitle>Consent Information</CardTitle>
            <CardDescription>Legal consent and witness details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                checked={formData.consentGiven}
                onCheckedChange={(checked) => handleInputChange("consentGiven", checked as boolean)}
              />
              <Label htmlFor="consent" className="text-sm">
                I hereby give my consent for organ donation and confirm that this decision is made voluntarily without
                any coercion.
              </Label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="witnessName">Witness Name *</Label>
                <Input
                  id="witnessName"
                  value={formData.witnessName}
                  onChange={(e) => handleInputChange("witnessName", e.target.value)}
                  placeholder="Full name of witness"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="witnessContact">Witness Contact *</Label>
                <Input
                  id="witnessContact"
                  value={formData.witnessContact}
                  onChange={(e) => handleInputChange("witnessContact", e.target.value)}
                  placeholder="Witness contact number"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Recording on Blockchain..." : "Register Donor"}
          </Button>
        </div>
      </form>
    </div>
  )
}
