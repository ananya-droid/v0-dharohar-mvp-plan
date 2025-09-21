"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Recipient, BloodType, OrganType, UrgencyLevel } from "@/types/medical"
import { BLOOD_TYPES, ORGAN_TYPES, URGENCY_LEVELS, INDIAN_STATES } from "@/types/medical"

interface RecipientRegistrationFormProps {
  onBack: () => void
  onSuccess: () => void
}

export function RecipientRegistrationForm({ onBack, onSuccess }: RecipientRegistrationFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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
    medicalCondition: "",
    urgencyLevel: "",
    waitlistDate: "",
    cpra: "",
    currentMedications: "",
    allergies: "",
    dialysisStatus: "",
    previousTransplants: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.name || !formData.age || !formData.contactNumber) {
      return "Please fill in all required personal information fields"
    }

    if (!formData.bloodType || !formData.hlaType || !formData.organType || !formData.urgencyLevel) {
      return "Please fill in all required medical information fields"
    }

    if (!formData.waitlistDate || !formData.cpra) {
      return "Please provide waitlist date and CPRA percentage"
    }

    const age = Number.parseInt(formData.age)
    if (age < 1 || age > 80) {
      return "Recipient age must be between 1 and 80 years"
    }

    const cpra = Number.parseInt(formData.cpra)
    if (cpra < 0 || cpra > 100) {
      return "CPRA must be between 0 and 100"
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const recipientData: Recipient = {
        id: `recipient_${Date.now()}`,
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
          medicalCondition: formData.medicalCondition,
          urgencyLevel: formData.urgencyLevel as UrgencyLevel,
          waitlistDate: formData.waitlistDate,
          cpra: Number.parseInt(formData.cpra),
          currentMedications: formData.currentMedications,
          allergies: formData.allergies,
          dialysisStatus: formData.dialysisStatus as "none" | "peritoneal" | "hemodialysis" | undefined,
          previousTransplants: Number.parseInt(formData.previousTransplants) || 0,
        },
        isActive: true,
        registrationDate: new Date().toISOString(),
        hospitalId: user?.hospitalId || "",
      }

      // Store in localStorage for demo (in production, this would go to blockchain)
      const existingRecipients = JSON.parse(localStorage.getItem("dharohar_recipients") || "[]")
      existingRecipients.push(recipientData)
      localStorage.setItem("dharohar_recipients", JSON.stringify(existingRecipients))

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err) {
      setError("Failed to register recipient. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Recipient Registered Successfully</h2>
          <p className="text-muted-foreground mb-6">
            The recipient has been registered and added to the blockchain. The system will now calculate matches.
          </p>
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
          <h1 className="text-2xl font-bold text-foreground">Register New Recipient</h1>
          <p className="text-muted-foreground">Add a new organ recipient to the system</p>
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
                  min="1"
                  max="80"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  placeholder="Age (1-80)"
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
            <div className="grid md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="urgencyLevel">Medical Urgency *</Label>
                <Select
                  value={formData.urgencyLevel}
                  onValueChange={(value) => handleInputChange("urgencyLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waitlistDate">Waitlist Date *</Label>
                <Input
                  id="waitlistDate"
                  type="date"
                  value={formData.waitlistDate}
                  onChange={(e) => handleInputChange("waitlistDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpra">CPRA Percentage *</Label>
                <Input
                  id="cpra"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.cpra}
                  onChange={(e) => handleInputChange("cpra", e.target.value)}
                  placeholder="0-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousTransplants">Previous Transplants</Label>
                <Input
                  id="previousTransplants"
                  type="number"
                  min="0"
                  value={formData.previousTransplants}
                  onChange={(e) => handleInputChange("previousTransplants", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {formData.organType === "kidney" && (
              <div className="space-y-2">
                <Label htmlFor="dialysisStatus">Dialysis Status</Label>
                <Select
                  value={formData.dialysisStatus}
                  onValueChange={(value) => handleInputChange("dialysisStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dialysis status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="peritoneal">Peritoneal Dialysis</SelectItem>
                    <SelectItem value="hemodialysis">Hemodialysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="medicalCondition">Medical Condition *</Label>
              <Textarea
                id="medicalCondition"
                value={formData.medicalCondition}
                onChange={(e) => handleInputChange("medicalCondition", e.target.value)}
                placeholder="Primary medical condition requiring transplant..."
                rows={3}
                required
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

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register Recipient"}
          </Button>
        </div>
      </form>
    </div>
  )
}
