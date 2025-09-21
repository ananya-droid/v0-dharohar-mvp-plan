import type { Donor, Recipient, BloodType } from "@/types/medical"

export interface MatchScore {
  totalScore: number
  breakdown: {
    bloodCompatibility: number
    hlaMatching: number
    cpraScore: number
    waitlistTime: number
    geographicProximity: number
    ageCompatibility: number
  }
  explanation: {
    bloodCompatibility: string
    hlaMatching: string
    cpraScore: string
    waitlistTime: string
    geographicProximity: string
    ageCompatibility: string
  }
}

export interface DonorMatch {
  donor: Donor
  score: MatchScore
  isCompatible: boolean
}

// Blood type compatibility matrix
const BLOOD_COMPATIBILITY: Record<BloodType, BloodType[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // Universal donor
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"], // Universal recipient (can only donate to AB+)
}

// Indian states proximity mapping (simplified for demo)
const STATE_PROXIMITY: Record<string, Record<string, number>> = {
  Delhi: { Delhi: 100, Haryana: 75, Punjab: 50, "Uttar Pradesh": 50 },
  Maharashtra: { Maharashtra: 100, Gujarat: 75, Karnataka: 50, Goa: 75 },
  Karnataka: { Karnataka: 100, "Tamil Nadu": 75, "Andhra Pradesh": 75, Kerala: 50 },
  "Tamil Nadu": { "Tamil Nadu": 100, Karnataka: 75, Kerala: 75, "Andhra Pradesh": 50 },
  "West Bengal": { "West Bengal": 100, Odisha: 75, Jharkhand: 50, Bihar: 50 },
  // Add more states as needed
}

export class MatchingAlgorithm {
  /**
   * Calculate blood type compatibility score
   */
  private calculateBloodCompatibility(
    donorBlood: BloodType,
    recipientBlood: BloodType,
  ): {
    score: number
    explanation: string
    isCompatible: boolean
  } {
    const compatibleTypes = BLOOD_COMPATIBILITY[donorBlood] || []
    const isCompatible = compatibleTypes.includes(recipientBlood)

    if (!isCompatible) {
      return {
        score: 0,
        explanation: `Blood type ${donorBlood} is not compatible with recipient blood type ${recipientBlood}`,
        isCompatible: false,
      }
    }

    // Perfect match gets full points
    if (donorBlood === recipientBlood) {
      return {
        score: 100,
        explanation: `Perfect blood type match (${donorBlood} → ${recipientBlood})`,
        isCompatible: true,
      }
    }

    // Universal donor gets high score
    if (donorBlood === "O-") {
      return {
        score: 90,
        explanation: `Universal donor O- is compatible with recipient ${recipientBlood}`,
        isCompatible: true,
      }
    }

    // Other compatible combinations
    return {
      score: 80,
      explanation: `Blood type ${donorBlood} is compatible with recipient ${recipientBlood}`,
      isCompatible: true,
    }
  }

  /**
   * Calculate HLA matching score
   */
  private calculateHLAMatching(
    donorHLA: string,
    recipientHLA: string,
  ): {
    score: number
    explanation: string
  } {
    // Parse HLA strings (format: "A1,A2,B5,B8,DR3,DR4")
    const parseHLA = (hlaString: string) => {
      const alleles = hlaString.split(",").map((s) => s.trim().toUpperCase())
      return {
        A: alleles.filter((a) => a.startsWith("A")),
        B: alleles.filter((a) => a.startsWith("B")),
        DR: alleles.filter((a) => a.startsWith("DR")),
      }
    }

    const donorAlleles = parseHLA(donorHLA)
    const recipientAlleles = parseHLA(recipientHLA)

    let mismatches = 0
    const totalLoci = 6 // 2 A, 2 B, 2 DR

    // Count mismatches for each locus
    const countMismatches = (donorSet: string[], recipientSet: string[]) => {
      let matches = 0
      for (const recipientAllele of recipientSet) {
        if (donorSet.includes(recipientAllele)) {
          matches++
        }
      }
      return Math.max(0, recipientSet.length - matches)
    }

    mismatches += countMismatches(donorAlleles.A, recipientAlleles.A)
    mismatches += countMismatches(donorAlleles.B, recipientAlleles.B)
    mismatches += countMismatches(donorAlleles.DR, recipientAlleles.DR)

    // Calculate score (fewer mismatches = higher score)
    const score = Math.max(0, ((totalLoci - mismatches) / totalLoci) * 100)

    let explanation = ""
    if (mismatches === 0) {
      explanation = "Perfect HLA match - no mismatches detected"
    } else if (mismatches <= 2) {
      explanation = `Excellent HLA match - only ${mismatches} mismatch(es)`
    } else if (mismatches <= 4) {
      explanation = `Good HLA match - ${mismatches} mismatch(es)`
    } else {
      explanation = `Poor HLA match - ${mismatches} mismatch(es)`
    }

    return { score, explanation }
  }

  /**
   * Calculate CPRA score (higher CPRA = higher priority)
   */
  private calculateCPRAScore(cpra: number): { score: number; explanation: string } {
    // CPRA 0-100%, higher values get more points
    const score = cpra

    let explanation = ""
    if (cpra >= 80) {
      explanation = `Very high CPRA (${cpra}%) - highly sensitized patient with priority`
    } else if (cpra >= 50) {
      explanation = `High CPRA (${cpra}%) - sensitized patient`
    } else if (cpra >= 20) {
      explanation = `Moderate CPRA (${cpra}%) - some sensitization`
    } else {
      explanation = `Low CPRA (${cpra}%) - minimal sensitization`
    }

    return { score, explanation }
  }

  /**
   * Calculate waitlist time score
   */
  private calculateWaitlistScore(waitlistDate: string): { score: number; explanation: string } {
    const waitlistStart = new Date(waitlistDate)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - waitlistStart.getTime()) / (1000 * 60 * 60 * 24))

    // 1 point per 10 days, max 75 points (750 days = ~2 years)
    const score = Math.min(75, Math.floor(daysDiff / 10))

    const years = Math.floor(daysDiff / 365)
    const months = Math.floor((daysDiff % 365) / 30)

    let explanation = ""
    if (years > 0) {
      explanation = `On waitlist for ${years} year(s) and ${months} month(s) (${daysDiff} days)`
    } else if (months > 0) {
      explanation = `On waitlist for ${months} month(s) (${daysDiff} days)`
    } else {
      explanation = `On waitlist for ${daysDiff} days`
    }

    return { score, explanation }
  }

  /**
   * Calculate geographic proximity score
   */
  private calculateGeographicScore(
    donorState: string,
    recipientState: string,
  ): {
    score: number
    explanation: string
  } {
    if (!donorState || !recipientState) {
      return { score: 25, explanation: "Geographic information incomplete" }
    }

    // Same state gets full points
    if (donorState === recipientState) {
      return { score: 100, explanation: `Same state (${donorState}) - optimal for organ transport` }
    }

    // Check proximity mapping
    const proximityScore = STATE_PROXIMITY[donorState]?.[recipientState] || 25

    let explanation = ""
    if (proximityScore >= 75) {
      explanation = `Neighboring states (${donorState} → ${recipientState}) - good transport logistics`
    } else if (proximityScore >= 50) {
      explanation = `Regional proximity (${donorState} → ${recipientState}) - acceptable transport time`
    } else {
      explanation = `Distant states (${donorState} → ${recipientState}) - longer transport required`
    }

    return { score: proximityScore, explanation }
  }

  /**
   * Calculate age compatibility score
   */
  private calculateAgeCompatibility(
    donorAge: number,
    recipientAge: number,
  ): {
    score: number
    explanation: string
  } {
    const ageDiff = Math.abs(donorAge - recipientAge)

    // Ideal age difference is 0-10 years
    let score = 100
    if (ageDiff > 10) {
      score = Math.max(50, 100 - (ageDiff - 10) * 2)
    }

    let explanation = ""
    if (ageDiff <= 5) {
      explanation = `Excellent age match (donor: ${donorAge}, recipient: ${recipientAge})`
    } else if (ageDiff <= 10) {
      explanation = `Good age compatibility (donor: ${donorAge}, recipient: ${recipientAge})`
    } else if (ageDiff <= 20) {
      explanation = `Acceptable age difference (donor: ${donorAge}, recipient: ${recipientAge})`
    } else {
      explanation = `Significant age difference (donor: ${donorAge}, recipient: ${recipientAge})`
    }

    return { score, explanation }
  }

  /**
   * Calculate overall match score for a donor-recipient pair
   */
  public calculateMatch(donor: Donor, recipient: Recipient): MatchScore {
    // Check basic compatibility first
    const bloodResult = this.calculateBloodCompatibility(donor.medicalInfo.bloodType, recipient.medicalInfo.bloodType)

    // If blood types are incompatible, return zero score
    if (!bloodResult.isCompatible) {
      return {
        totalScore: 0,
        breakdown: {
          bloodCompatibility: 0,
          hlaMatching: 0,
          cpraScore: 0,
          waitlistTime: 0,
          geographicProximity: 0,
          ageCompatibility: 0,
        },
        explanation: {
          bloodCompatibility: bloodResult.explanation,
          hlaMatching: "N/A - Blood type incompatible",
          cpraScore: "N/A - Blood type incompatible",
          waitlistTime: "N/A - Blood type incompatible",
          geographicProximity: "N/A - Blood type incompatible",
          ageCompatibility: "N/A - Blood type incompatible",
        },
      }
    }

    // Calculate all scoring factors
    const hlaResult = this.calculateHLAMatching(donor.medicalInfo.hlaType, recipient.medicalInfo.hlaType)
    const cpraResult = this.calculateCPRAScore(recipient.medicalInfo.cpra)
    const waitlistResult = this.calculateWaitlistScore(recipient.medicalInfo.waitlistDate)
    const geoResult = this.calculateGeographicScore(donor.personalInfo.state, recipient.personalInfo.state)
    const ageResult = this.calculateAgeCompatibility(donor.personalInfo.age, recipient.personalInfo.age)

    // Weighted scoring (adjust weights as needed)
    const weights = {
      bloodCompatibility: 0.25, // 25%
      hlaMatching: 0.3, // 30%
      cpraScore: 0.15, // 15%
      waitlistTime: 0.15, // 15%
      geographicProximity: 0.1, // 10%
      ageCompatibility: 0.05, // 5%
    }

    const totalScore =
      bloodResult.score * weights.bloodCompatibility +
      hlaResult.score * weights.hlaMatching +
      cpraResult.score * weights.cpraScore +
      waitlistResult.score * weights.waitlistTime +
      geoResult.score * weights.geographicProximity +
      ageResult.score * weights.ageCompatibility

    return {
      totalScore: Math.round(totalScore),
      breakdown: {
        bloodCompatibility: Math.round(bloodResult.score),
        hlaMatching: Math.round(hlaResult.score),
        cpraScore: Math.round(cpraResult.score),
        waitlistTime: Math.round(waitlistResult.score),
        geographicProximity: Math.round(geoResult.score),
        ageCompatibility: Math.round(ageResult.score),
      },
      explanation: {
        bloodCompatibility: bloodResult.explanation,
        hlaMatching: hlaResult.explanation,
        cpraScore: cpraResult.explanation,
        waitlistTime: waitlistResult.explanation,
        geographicProximity: geoResult.explanation,
        ageCompatibility: ageResult.explanation,
      },
    }
  }

  /**
   * Find all compatible donors for a recipient, sorted by score
   */
  public findMatches(recipient: Recipient, donors: Donor[]): DonorMatch[] {
    const matches: DonorMatch[] = []

    for (const donor of donors) {
      // Only match same organ type and active donors
      if (donor.medicalInfo.organType === recipient.medicalInfo.organType && donor.isActive) {
        const score = this.calculateMatch(donor, recipient)
        const isCompatible = score.totalScore > 0

        matches.push({
          donor,
          score,
          isCompatible,
        })
      }
    }

    // Sort by total score (highest first)
    return matches.filter((match) => match.isCompatible).sort((a, b) => b.score.totalScore - a.score.totalScore)
  }

  /**
   * Get system-wide matching statistics
   */
  public getMatchingStats(
    donors: Donor[],
    recipients: Recipient[],
  ): {
    totalDonors: number
    totalRecipients: number
    compatiblePairs: number
    averageScore: number
    organTypeBreakdown: Record<string, { donors: number; recipients: number }>
  } {
    const organTypes = new Set([
      ...donors.map((d) => d.medicalInfo.organType),
      ...recipients.map((r) => r.medicalInfo.organType),
    ])

    const organTypeBreakdown: Record<string, { donors: number; recipients: number }> = {}

    for (const organType of organTypes) {
      organTypeBreakdown[organType] = {
        donors: donors.filter((d) => d.medicalInfo.organType === organType && d.isActive).length,
        recipients: recipients.filter((r) => r.medicalInfo.organType === organType && r.isActive).length,
      }
    }

    // Calculate compatible pairs and average scores
    let compatiblePairs = 0
    let totalScore = 0
    let scoreCount = 0

    for (const recipient of recipients.filter((r) => r.isActive)) {
      const matches = this.findMatches(recipient, donors)
      compatiblePairs += matches.length

      for (const match of matches) {
        totalScore += match.score.totalScore
        scoreCount++
      }
    }

    return {
      totalDonors: donors.filter((d) => d.isActive).length,
      totalRecipients: recipients.filter((r) => r.isActive).length,
      compatiblePairs,
      averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
      organTypeBreakdown,
    }
  }
}

// Export singleton instance
export const matchingAlgorithm = new MatchingAlgorithm()
