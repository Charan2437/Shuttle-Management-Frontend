"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Wallet,
  History,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatTime } from "@/lib/utils"
import Script from "next/script"

interface Transaction {
  id: string
  type: "credit" | "debit" | "refund"
  amount: number
  description: string
  bookingId?: string
  date: Date
  status: "completed" | "pending" | "failed"
}

export default function StudentWallet() {
  const { toast } = useToast()
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // --- Wallet State ---
  const [walletData, setWalletData] = useState<any | null>(null)
  const [walletLoading, setWalletLoading] = useState(true)
  const [walletError, setWalletError] = useState<string | null>(null)

  // --- Transactions State ---
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)

  // --- Analytics State ---
  const [analytics, setAnalytics] = useState<any | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  // --- Fetch Wallet Data ---
  useEffect(() => {
    const jwt = localStorage.getItem("jwt")
    if (!jwt) return
    async function fetchWallet() {
      setWalletLoading(true)
      setWalletError(null)
      try {
        const res = await fetch("http://localhost:8081/api/student/wallet", {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        if (!res.ok) throw new Error("Failed to fetch wallet data")
        const data = await res.json()
        setWalletData(data)
      } catch (err: any) {
        setWalletError(err.message || "Error loading wallet data")
      } finally {
        setWalletLoading(false)
      }
    }
    fetchWallet()
  }, [])

  // --- Fetch Transactions ---
  useEffect(() => {
    const jwt = localStorage.getItem("jwt")
    if (!jwt) return
    async function fetchTransactions() {
      setTransactionsLoading(true)
      setTransactionsError(null)
      try {
        const res = await fetch("http://localhost:8081/api/student/wallet/transactions?limit=20&offset=0", {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        if (!res.ok) throw new Error("Failed to fetch transactions")
        const data = await res.json()
        const txns = Array.isArray(data) ? data : Array.isArray(data.transactions) ? data.transactions : [];
        setTransactions(
          txns.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            bookingId: t.bookingId,
            date: new Date(t.createdAt),
            status: t.status,
          }))
        )
      } catch (err: any) {
        setTransactionsError(err.message || "Error loading transactions")
      } finally {
        setTransactionsLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  // --- Fetch Analytics ---
  useEffect(() => {
    const jwt = localStorage.getItem("jwt")
    if (!jwt) return
    async function fetchAnalytics() {
      setAnalyticsLoading(true)
      setAnalyticsError(null)
      try {
        const res = await fetch("http://localhost:8081/api/student/wallet/analytics", {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        if (!res.ok) throw new Error("Failed to fetch analytics")
        const data = await res.json()
        setAnalytics(data)
      } catch (err: any) {
        setAnalyticsError(err.message || "Error loading analytics")
      } finally {
        setAnalyticsLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const getBalanceStatus = (balance: number) => {
    if (balance >= 1000) return { status: "Healthy", color: "text-green-600", bgColor: "bg-green-100" }
    if (balance >= 500) return { status: "Moderate", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    return { status: "Low", color: "text-red-600", bgColor: "bg-red-100" }
  }

  const balanceStatus = getBalanceStatus(walletData?.walletBalance || 0)

  const handleRecharge = () => {
    if (!rechargeAmount) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter amount.",
      })
      return
    }

    const amount = Number.parseInt(rechargeAmount)
    if (amount < 50 || amount > 2000) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Recharge amount must be between ₹50 and ₹2000.",
      })
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        variant: "success",
        title: "Recharge Successful",
        description: `₹${amount} has been added to your wallet.`,
      })
      setRechargeAmount("")
    }, 2000)
  }

  // Razorpay handler
  const handleRazorpay = async () => {
    if (!rechargeAmount) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter amount.",
      })
      return
    }
    const amount = Number.parseInt(rechargeAmount)
    if (amount < 50 || amount > 2000) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Recharge amount must be between ₹50 and ₹2000.",
      })
      return
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    if (!razorpayKey || razorpayKey === "rzp_test_YourKeyHere") {
      toast({
        variant: "destructive",
        title: "Payment Gateway Not Configured",
        description: "Razorpay is not properly configured. Please contact support.",
      })
      return
    }

    setIsProcessing(true)

    try {
      // 1. Create order on backend (optional, for real-world use)
      // 2. Open Razorpay checkout
      const options = {
        key: razorpayKey,
        amount: amount * 100, // in paise
        currency: "INR",
        name: "Shuttle Wallet Recharge",
        description: "Add money to your shuttle wallet",
        handler: async function (response: any) {
          // 3. On payment success, call backend to credit wallet
          try {
            const jwt = localStorage.getItem("jwt")
            const res = await fetch("http://localhost:8081/api/student/wallet/recharge", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
              },
              body: JSON.stringify({
                amount,
                razorpayPaymentId: response.razorpay_payment_id,
              }),
            })
            if (!res.ok) throw new Error("Failed to credit wallet")
            const result = await res.json()
            if (result.success) {
              toast({
                variant: "success",
                title: "Recharge Successful",
                description: `₹${amount} has been added to your wallet. New balance: ${result.walletBalance} pts`,
              })
              setRechargeAmount("")
              setWalletData((prev: any) => ({ ...prev, walletBalance: result.walletBalance }))
            } else {
              toast({
                variant: "destructive",
                title: "Recharge Failed",
                description: result.error || "Could not update wallet. Contact support.",
              })
            }
          } catch (err: any) {
            toast({
              variant: "destructive",
              title: "Recharge Failed",
              description: err.message || "Could not update wallet. Contact support.",
            })
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          email: JSON.parse(localStorage.getItem("user") || "{}").email || "",
          name: JSON.parse(localStorage.getItem("user") || "{}").name || "",
        },
        theme: { color: "#1e3a5f" },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error("Razorpay error:", error)
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
      })
      setIsProcessing(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "credit":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "debit":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "refund":
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "credit":
        return "text-green-600"
      case "debit":
        return "text-red-600"
      case "refund":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/student" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
            <p className="text-gray-600">Manage your shuttle credits and view transaction history</p>
          </div>
        </div>

        {/* Wallet Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{walletData?.walletBalance} pts</div>
              <div
                className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${balanceStatus.bgColor} ${balanceStatus.color}`}
              >
                {balanceStatus.status}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletData?.totalRides || 0}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletData ? `${walletData.totalSpent} pts` : <span className="text-gray-400">--</span>}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime spending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Allocation</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{walletData?.monthlyAllocation} pts</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="recharge" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recharge">Recharge Wallet</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
            <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
          </TabsList>

          {/* Recharge Tab */}
          <TabsContent value="recharge" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Money
                  </CardTitle>
                  <CardDescription>Recharge your wallet with points</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (Points)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount (50-2000)"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      min="50"
                      max="2000"
                    />
                    <p className="text-xs text-gray-500">Minimum: 50 pts • Maximum: 2000 pts</p>
                  </div>

                  <Button
                    onClick={handleRazorpay}
                    disabled={isProcessing}
                    className="w-full bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Recharge Wallet
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Recharge</CardTitle>
                  <CardDescription>Popular recharge amounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {[100, 250, 500, 1000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        className="justify-between"
                        onClick={() => setRechargeAmount(amount.toString())}
                      >
                        <span>{amount} points</span>
                        <span className="text-sm text-gray-500">₹{amount}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transaction History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <History className="mr-2 h-5 w-5" />
                    Transaction History
                  </CardTitle>
                  <CardDescription>Your recent wallet transactions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactionsLoading && <p className="text-center text-gray-500">Loading transactions...</p>}
                  {transactionsError && <p className="text-center text-red-500">{transactionsError}</p>}
                  {!transactionsLoading && !transactionsError && transactions.length === 0 && (
                    <p className="text-center text-gray-500">No transactions found</p>
                  )}
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(transaction.date)} • {formatTime(transaction.date)}
                            {transaction.bookingId && <span className="ml-2">ID: {transaction.bookingId}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-3">
                        <div>
                          <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === "debit" ? "-" : "+"}
                            {transaction.amount} pts
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Spending Pattern</CardTitle>
                  <CardDescription>Your monthly spending breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Shuttle Bookings</span>
                      <span className="font-medium">680 pts (91%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#1e3a5f] h-2 rounded-full" style={{ width: "91%" }}></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cancellation Fees</span>
                      <span className="font-medium">45 pts (6%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: "6%" }}></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Peak Hour Charges</span>
                      <span className="font-medium">25 pts (3%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "3%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>Your travel patterns this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="text-center text-gray-500">Loading analytics...</div>
                  ) : analyticsError ? (
                    <div className="text-center text-red-500">{analyticsError}</div>
                  ) : analytics ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Trips</span>
                        <span className="font-semibold">{analytics.totalTrips ?? '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Cost per Trip</span>
                        <span className="font-semibold">{analytics.avgCostPerTrip ? `${analytics.avgCostPerTrip} pts` : '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Most Used Route</span>
                        <span className="font-semibold">{analytics.mostUsedRoute ?? '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Peak Usage Time</span>
                        <span className="font-semibold">{analytics.peakUsageTime ?? '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Points Saved</span>
                        <span className="font-semibold text-green-600">{analytics.pointsSaved ? `+${analytics.pointsSaved} pts` : '--'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">No analytics data</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Razorpay script to the page */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
    </div>
  )
}
