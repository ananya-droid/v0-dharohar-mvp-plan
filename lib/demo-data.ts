import type { Donor, Recipient } from "@/types/medical"

// Demo donors for testing the matching algorithm
export const DEMO_DONORS: Donor[] = [
  {
    id: "donor_001",
    personalInfo: {
      name: "Rajesh Kumar",
      age: 35,
      gender: "male",
      contactNumber: "+91 9876543210",
      email: "rajesh.kumar@email.com",
      address: "123 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
    medicalInfo: {
      bloodType: "O+",
      hlaType: "A1,A2,B7,B8,DR3,DR4",
      organType: "kidney",
      medicalHistory: "No significant medical history",
      currentMedications: "None",
      allergies: "None known",
      smokingStatus: "never",
      alcoholStatus: "occasional",
    },
    consentInfo: {
      consentGiven: true,
      consentDate: "2024-01-15T00:00:00.000Z",
      witnessName: "Dr. Sharma",
      witnessContact: "+91 9876543211",
    },
    isActive: true,
    registrationDate: "2024-01-15T00:00:00.000Z",
    hospitalId: "AIIMS-001",
  },
  {
    id: "donor_002",
    personalInfo: {
      name: "Priya Patel",
      age: 28,
      gender: "female",
      contactNumber: "+91 9876543212",
      email: "priya.patel@email.com",
      address: "456 Park Street",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380001",
    },
    medicalInfo: {
      bloodType: "A+",
      hlaType: "A1,A3,B5,B7,DR1,DR3",
      organType: "kidney",
      medicalHistory: "Healthy donor",
      currentMedications: "Multivitamins",
      allergies: "Penicillin",
      smokingStatus: "never",
      alcoholStatus: "never",
    },
    consentInfo: {
      consentGiven: true,
      consentDate: "2024-02-01T00:00:00.000Z",
      witnessName: "Dr. Mehta",
      witnessContact: "+91 9876543213",
    },
    isActive: true,
    registrationDate: "2024-02-01T00:00:00.000Z",
    hospitalId: "AIIMS-001",
  },
  {
    id: "donor_003",
    personalInfo: {
      name: "Amit Singh",
      age: 42,
      gender: "male",
      contactNumber: "+91 9876543214",
      email: "amit.singh@email.com",
      address: "789 Civil Lines",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
    },
    medicalInfo: {
      bloodType: "B+",
      hlaType: "A2,A24,B5,B8,DR3,DR7",
      organType: "kidney",
      medicalHistory: "Minor surgery in 2020",
      currentMedications: "Blood pressure medication",
      allergies: "None",
      smokingStatus: "former",
      alcoholStatus: "occasional",
    },
    consentInfo: {
      consentGiven: true,
      consentDate: "2024-01-20T00:00:00.000Z",
      witnessName: "Dr. Gupta",
      witnessContact: "+91 9876543215",
    },
    isActive: true,
    registrationDate: "2024-01-20T00:00:00.000Z",
    hospitalId: "AIIMS-001",
  },
]

// Demo recipients for testing the matching algorithm
export const DEMO_RECIPIENTS: Recipient[] = [
  {
    id: "recipient_001",
    personalInfo: {
      name: "Sunita Sharma",
      age: 45,
      gender: "female",
      contactNumber: "+91 9876543220",
      email: "sunita.sharma@email.com",
      address: "321 Residency Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
    },
    medicalInfo: {
      bloodType: "O+",
      hlaType: "A1,A2,B7,B8,DR3,DR4",
      organType: "kidney",
      medicalCondition: "Chronic kidney disease stage 5",
      urgencyLevel: "high",
      waitlistDate: "2023-06-15",
      cpra: 25,
      currentMedications: "Dialysis, EPO, Iron supplements",
      allergies: "Sulfa drugs",
      dialysisStatus: "hemodialysis",
      previousTransplants: 0,
    },
    isActive: true,
    registrationDate: "2023-06-15T00:00:00.000Z",
    hospitalId: "AIIMS-001",
  },
  {
    id: "recipient_002",
    personalInfo: {
      name: "Mohammad Ali",
      age: 38,
      gender: "male",
      contactNumber: "+91 9876543221",
      email: "mohammad.ali@email.com",
      address: "654 Old City",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500001",
    },
    medicalInfo: {
      bloodType: "A+",
      hlaType: "A1,A3,B5,B7,DR1,DR3",
      organType: "kidney",
      medicalCondition: "Polycystic kidney disease",
      urgencyLevel: "medium",
      waitlistDate: "2023-09-10",
      cpra: 60,
      currentMedications: "ACE inhibitors, Diuretics",
      allergies: "None",
      dialysisStatus: "peritoneal",
      previousTransplants: 0,
    },
    isActive: true,
    registrationDate: "2023-09-10T00:00:00.000Z",
    hospitalId: "AIIMS-001",
  },
  {
    id: "recipient_003",
    personalInfo: {
      name: "Kavya Reddy",
      age: 32,
      gender: "female",
      contactNumber: "+91 9876543222",
      email: "kavya.reddy@email.com",
      address: "987 Tech City",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
    },
    medicalInfo: {
      bloodType: "B+",
      hlaType: "A2,A24,B5,B8,DR3,DR7",
      organType: "kidney",
      medicalCondition: "Diabetic nephropathy",
      urgencyLevel: "critical",
      waitlistDate: "2022-12-01",
      cpra: 85,
      currentMedications: "Insulin, Dialysis medications",
      allergies: "Iodine contrast",
      dialysisStatus: "hemodialysis",
      previousTransplants: 1,
    },
    isActive: true,
    registrationDate: "2022-12-01T00:00:00.000Z",
    hospitalId: "AIIMS-001",
  },
]

// Function to initialize demo data if localStorage is empty
export function initializeDemoData() {
  const existingDonors = localStorage.getItem("dharohar_donors")
  const existingRecipients = localStorage.getItem("dharohar_recipients")

  if (!existingDonors) {
    localStorage.setItem("dharohar_donors", JSON.stringify(DEMO_DONORS))
  }

  if (!existingRecipients) {
    localStorage.setItem("dharohar_recipients", JSON.stringify(DEMO_RECIPIENTS))
  }
}
