export interface Donor {
  id: string
  personalInfo: {
    name: string
    age: number
    gender: "male" | "female" | "other"
    contactNumber: string
    email: string
    address: string
    city: string
    state: string
    pincode: string
  }
  medicalInfo: {
    bloodType: BloodType
    hlaType: string
    organType: OrganType
    medicalHistory: string
    currentMedications: string
    allergies: string
    smokingStatus: "never" | "former" | "current"
    alcoholStatus: "never" | "occasional" | "regular"
  }
  consentInfo: {
    consentGiven: boolean
    consentDate: string
    witnessName: string
    witnessContact: string
  }
  isActive: boolean
  registrationDate: string
  hospitalId: string
}

export interface Recipient {
  id: string
  personalInfo: {
    name: string
    age: number
    gender: "male" | "female" | "other"
    contactNumber: string
    email: string
    address: string
    city: string
    state: string
    pincode: string
  }
  medicalInfo: {
    bloodType: BloodType
    hlaType: string
    organType: OrganType
    medicalCondition: string
    urgencyLevel: UrgencyLevel
    waitlistDate: string
    cpra: number // 0-100
    currentMedications: string
    allergies: string
    dialysisStatus?: "none" | "peritoneal" | "hemodialysis"
    previousTransplants: number
  }
  isActive: boolean
  registrationDate: string
  hospitalId: string
}

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"

export type OrganType = "kidney" | "liver" | "heart" | "lung" | "pancreas" | "cornea"

export type UrgencyLevel = "low" | "medium" | "high" | "critical"

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
]

export const BLOOD_TYPES: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export const ORGAN_TYPES: OrganType[] = ["kidney", "liver", "heart", "lung", "pancreas", "cornea"]

export const URGENCY_LEVELS: UrgencyLevel[] = ["low", "medium", "high", "critical"]
