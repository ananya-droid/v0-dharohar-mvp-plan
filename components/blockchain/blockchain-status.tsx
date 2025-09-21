"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Activity, Shield, Database, CheckCircle, AlertCircle, Blocks, Hash } from "lucide-react"
import { blockchainService } from "@/lib/blockchain-service"
import type { BlockchainStats, BlockchainTransaction } from "@/lib/blockchain-service"

export function BlockchainStatus() {
  const [stats, setStats] = useState<BlockchainStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<BlockchainTransaction[]>([])
  const [isVerified, setIsVerified] = useState<boolean>(true)

  useEffect(() => {
    const updateStats = () => {
      const blockchainStats = blockchainService.getBlockchainStats()
      const transactions = blockchainService.getRecentTransactions(5)
      const chainVerified = blockchainService.verifyChain()

      setStats(blockchainStats)
      setRecentTransactions(transactions)
      setIsVerified(chainVerified)
    }

    updateStats()

    // Update every 5 seconds
    const interval = setInterval(updateStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const getTransactionTypeLabel = (type: BlockchainTransaction["type"]) => {
    switch (type) {
      case "donor_registration":
        return "Donor Registration"
      case "recipient_registration":
        return "Recipient Registration"
      case "match_calculation":
        return "Match Calculation"
      case "system_event":
        return "System Event"
      default:
        return "Unknown"
    }
  }

  const getTransactionTypeColor = (type: BlockchainTransaction["type"]) => {
    switch (type) {
      case "donor_registration":
        return "bg-success/10 text-success"
      case "recipient_registration":
        return "bg-primary/10 text-primary"
      case "match_calculation":
        return "bg-accent/10 text-accent"
      case "system_event":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Activity className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Blockchain Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Blocks className="w-5 h-5" />
            Blockchain Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.totalBlocks}</div>
              <div className="text-sm text-muted-foreground">Total Blocks</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-accent">{stats.totalTransactions}</div>
              <div className="text-sm text-muted-foreground">Total Transactions</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <Badge variant="outline" className="text-success border-success">
                  {stats.networkStatus.toUpperCase()}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Network Status</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2">
                {isVerified ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
                <span className={`font-medium ${isVerified ? "text-success" : "text-destructive"}`}>
                  {isVerified ? "VERIFIED" : "ERROR"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Chain Integrity</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Consensus Algorithm</div>
              <div className="font-medium">{stats.consensusAlgorithm}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Last Block Time</div>
              <div className="font-medium">
                {stats.lastBlockTime !== "N/A" ? formatTimestamp(stats.lastBlockTime) : "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Recent Blockchain Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getTransactionTypeColor(transaction.type)}>
                        {getTransactionTypeLabel(transaction.type)}
                      </Badge>
                      <div className="text-sm text-muted-foreground">{formatTimestamp(transaction.timestamp)}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono">{transaction.hash}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="grid md:grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Hospital ID:</span>{" "}
                        <span className="font-medium">{transaction.hospitalId}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">User ID:</span>{" "}
                        <span className="font-medium">{transaction.userId}</span>
                      </div>
                    </div>

                    {transaction.type === "donor_registration" && (
                      <div className="mt-2 text-muted-foreground">
                        Donor: {transaction.data.personalInfo?.name} ({transaction.data.medicalInfo?.bloodType})
                      </div>
                    )}

                    {transaction.type === "recipient_registration" && (
                      <div className="mt-2 text-muted-foreground">
                        Recipient: {transaction.data.personalInfo?.name} ({transaction.data.medicalInfo?.bloodType})
                      </div>
                    )}

                    {transaction.type === "match_calculation" && (
                      <div className="mt-2 text-muted-foreground">
                        Match calculated for recipient {transaction.data.recipientId} - {transaction.data.matchCount}{" "}
                        compatible donors found
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blockchain Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Blockchain Security Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <div className="font-medium">Immutable Records</div>
                  <div className="text-sm text-muted-foreground">
                    All donor and recipient registrations are permanently recorded and cannot be altered
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <div className="font-medium">Transparent Matching</div>
                  <div className="text-sm text-muted-foreground">
                    Every match calculation is logged with complete algorithm transparency
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <div className="font-medium">Cryptographic Hashing</div>
                  <div className="text-sm text-muted-foreground">
                    Each transaction is secured with cryptographic hash functions
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <div className="font-medium">Audit Trail</div>
                  <div className="text-sm text-muted-foreground">
                    Complete history of all system activities for regulatory compliance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
