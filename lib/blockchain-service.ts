// Blockchain simulation service for Dharohar MVP
// In production, this would integrate with actual blockchain networks like Ethereum or Hyperledger

export interface BlockchainTransaction {
  id: string
  type: "donor_registration" | "recipient_registration" | "match_calculation" | "system_event"
  timestamp: string
  data: any
  hash: string
  previousHash: string
  hospitalId: string
  userId: string
}

export interface Block {
  index: number
  timestamp: string
  transactions: BlockchainTransaction[]
  hash: string
  previousHash: string
  nonce: number
}

export interface BlockchainStats {
  totalBlocks: number
  totalTransactions: number
  lastBlockTime: string
  networkStatus: "connected" | "disconnected" | "syncing"
  consensusAlgorithm: string
}

class BlockchainService {
  private chain: Block[] = []
  private pendingTransactions: BlockchainTransaction[] = []
  private readonly MINING_REWARD = 0 // No mining rewards for medical blockchain
  private readonly DIFFICULTY = 2 // Simplified difficulty for demo

  constructor() {
    // Initialize with genesis block
    this.createGenesisBlock()
    this.loadFromStorage()
  }

  private createGenesisBlock(): void {
    const genesisBlock: Block = {
      index: 0,
      timestamp: "2024-01-01T00:00:00.000Z",
      transactions: [],
      hash: "0000000000000000000000000000000000000000000000000000000000000000",
      previousHash: "",
      nonce: 0,
    }
    this.chain = [genesisBlock]
  }

  private loadFromStorage(): void {
    try {
      const storedChain = localStorage.getItem("dharohar_blockchain")
      if (storedChain) {
        const parsedChain = JSON.parse(storedChain)
        if (parsedChain.length > 1) {
          // Only load if there are blocks beyond genesis
          this.chain = parsedChain
        }
      }
    } catch (error) {
      console.error("Failed to load blockchain from storage:", error)
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem("dharohar_blockchain", JSON.stringify(this.chain))
    } catch (error) {
      console.error("Failed to save blockchain to storage:", error)
    }
  }

  private calculateHash(
    index: number,
    timestamp: string,
    transactions: BlockchainTransaction[],
    previousHash: string,
    nonce: number,
  ): string {
    const data = index + timestamp + JSON.stringify(transactions) + previousHash + nonce
    // Simple hash simulation (in production, use SHA-256)
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, "0")
  }

  private calculateTransactionHash(transaction: Omit<BlockchainTransaction, "hash">): string {
    const data = transaction.id + transaction.type + transaction.timestamp + JSON.stringify(transaction.data)
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(8, "0")
  }

  private mineBlock(block: Block): Block {
    const target = "0".repeat(this.DIFFICULTY)

    while (block.hash.substring(0, this.DIFFICULTY) !== target) {
      block.nonce++
      block.hash = this.calculateHash(block.index, block.timestamp, block.transactions, block.previousHash, block.nonce)
    }

    return block
  }

  private getLatestBlock(): Block {
    return this.chain[this.chain.length - 1]
  }

  /**
   * Create a new transaction and add it to pending transactions
   */
  public createTransaction(
    type: BlockchainTransaction["type"],
    data: any,
    hospitalId: string,
    userId: string,
  ): BlockchainTransaction {
    const transaction: Omit<BlockchainTransaction, "hash"> = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      data,
      previousHash: this.getLatestBlock().hash,
      hospitalId,
      userId,
    }

    const transactionWithHash: BlockchainTransaction = {
      ...transaction,
      hash: this.calculateTransactionHash(transaction),
    }

    this.pendingTransactions.push(transactionWithHash)
    return transactionWithHash
  }

  /**
   * Mine pending transactions into a new block
   */
  public async minePendingTransactions(): Promise<Block | null> {
    if (this.pendingTransactions.length === 0) {
      return null
    }

    const block: Block = {
      index: this.chain.length,
      timestamp: new Date().toISOString(),
      transactions: [...this.pendingTransactions],
      hash: "",
      previousHash: this.getLatestBlock().hash,
      nonce: 0,
    }

    // Simulate mining delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const minedBlock = this.mineBlock(block)
    this.chain.push(minedBlock)
    this.pendingTransactions = []
    this.saveToStorage()

    return minedBlock
  }

  /**
   * Register a donor on the blockchain
   */
  public async registerDonor(donorData: any, hospitalId: string, userId: string): Promise<BlockchainTransaction> {
    const transaction = this.createTransaction("donor_registration", donorData, hospitalId, userId)

    // Auto-mine for demo purposes
    setTimeout(() => {
      this.minePendingTransactions()
    }, 2000)

    return transaction
  }

  /**
   * Register a recipient on the blockchain
   */
  public async registerRecipient(
    recipientData: any,
    hospitalId: string,
    userId: string,
  ): Promise<BlockchainTransaction> {
    const transaction = this.createTransaction("recipient_registration", recipientData, hospitalId, userId)

    // Auto-mine for demo purposes
    setTimeout(() => {
      this.minePendingTransactions()
    }, 2000)

    return transaction
  }

  /**
   * Record match calculation on blockchain
   */
  public async recordMatchCalculation(
    matchData: any,
    hospitalId: string,
    userId: string,
  ): Promise<BlockchainTransaction> {
    const transaction = this.createTransaction("match_calculation", matchData, hospitalId, userId)

    // Auto-mine for demo purposes
    setTimeout(() => {
      this.minePendingTransactions()
    }, 1000)

    return transaction
  }

  /**
   * Get blockchain statistics
   */
  public getBlockchainStats(): BlockchainStats {
    const totalTransactions = this.chain.reduce((total, block) => total + block.transactions.length, 0)

    return {
      totalBlocks: this.chain.length,
      totalTransactions: totalTransactions + this.pendingTransactions.length,
      lastBlockTime: this.chain.length > 1 ? this.getLatestBlock().timestamp : "N/A",
      networkStatus: "connected",
      consensusAlgorithm: "Proof of Work (Simplified)",
    }
  }

  /**
   * Get recent transactions
   */
  public getRecentTransactions(limit = 10): BlockchainTransaction[] {
    const allTransactions: BlockchainTransaction[] = []

    // Get transactions from all blocks (newest first)
    for (let i = this.chain.length - 1; i >= 0; i--) {
      allTransactions.push(...this.chain[i].transactions.reverse())
    }

    // Add pending transactions
    allTransactions.unshift(...this.pendingTransactions.reverse())

    return allTransactions.slice(0, limit)
  }

  /**
   * Get transactions by type
   */
  public getTransactionsByType(type: BlockchainTransaction["type"]): BlockchainTransaction[] {
    const allTransactions: BlockchainTransaction[] = []

    this.chain.forEach((block) => {
      allTransactions.push(...block.transactions)
    })

    allTransactions.push(...this.pendingTransactions)

    return allTransactions.filter((tx) => tx.type === type)
  }

  /**
   * Verify blockchain integrity
   */
  public verifyChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]

      // Verify current block hash
      const calculatedHash = this.calculateHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.transactions,
        currentBlock.previousHash,
        currentBlock.nonce,
      )

      if (currentBlock.hash !== calculatedHash) {
        return false
      }

      // Verify link to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
    }

    return true
  }

  /**
   * Get full blockchain for audit purposes
   */
  public getFullChain(): Block[] {
    return [...this.chain]
  }

  /**
   * Search transactions by donor/recipient ID
   */
  public searchTransactions(searchId: string): BlockchainTransaction[] {
    const allTransactions: BlockchainTransaction[] = []

    this.chain.forEach((block) => {
      allTransactions.push(...block.transactions)
    })

    allTransactions.push(...this.pendingTransactions)

    return allTransactions.filter((tx) => {
      const data = JSON.stringify(tx.data).toLowerCase()
      return data.includes(searchId.toLowerCase())
    })
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService()
