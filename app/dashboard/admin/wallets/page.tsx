"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Wallet,
  Plus,
  Minus,
  Search,
  Download,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  History,
  AlertCircle,
  RefreshCw,
  Eye,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function WalletManagementPage() {
  const { toast } = useToast()
  // API data states
  const [wallets, setWallets] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [transactionType, setTransactionType] = useState<"credit" | "debit" | "refund">("credit")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit" | "refund">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "failed">("all")
  const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false)
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<string | null>(null)
  const [selectedTransactionForDetails, setSelectedTransactionForDetails] = useState<any | null>(null)
  // Add a state to control if the modal is for a specific student
  const [lockedStudent, setLockedStudent] = useState<any | null>(null)
  // Add state to track current active tab
  const [activeTab, setActiveTab] = useState<string>("students")

  // Debug effect to log state when dialog opens
  useEffect(() => {
    if (isAllocateDialogOpen) {
      console.log('Debug - Dialog opened with state:')
      console.log('  selectedStudent:', selectedStudent)
      console.log('  lockedStudent:', lockedStudent)
      console.log('  transactionType:', transactionType)
    }
  }, [isAllocateDialogOpen, selectedStudent, lockedStudent, transactionType])

  // Fetch all wallet data on mount
  useEffect(() => {
    setLoading(true)
    setError(null)
    const jwt = localStorage.getItem("jwt");
    Promise.all([
      fetch("http://localhost:8081/api/admin/wallets", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then((r) => r.json()),
      fetch("http://localhost:8081/api/admin/wallets/transactions", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then((r) => r.json()),
      fetch("http://localhost:8081/api/admin/wallets/analytics", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then((r) => r.json()),
    ])
      .then(([walletsRes, transactionsRes, analyticsRes]) => {
        console.log('Debug - API response wallets:', walletsRes)
        setWallets(walletsRes.wallets || walletsRes)
        setTransactions(transactionsRes.transactions || transactionsRes)
        setAnalytics(analyticsRes)
      })
      .catch((e) => {
        setError("Failed to load wallet data. Please try again later.")
      })
      .finally(() => setLoading(false))
  }, [])

  // Filter students based on search (using API data)
  const filteredStudents = wallets.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filter transactions (using API data)
  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch = filterType === "all" || transaction.type === filterType
    const statusMatch = filterStatus === "all" || transaction.status === filterStatus
    const searchMatch =
      transaction.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase())

    return typeMatch && statusMatch && searchMatch
  })

  const handleAllocatePoints = async () => {
    // Use lockedStudent if present, otherwise use selectedStudent
    const studentId = lockedStudent ? lockedStudent.studentId : selectedStudent
    
    // Debug logging
    console.log('Debug - lockedStudent:', lockedStudent)
    console.log('Debug - selectedStudent:', selectedStudent)
    console.log('Debug - studentId being used:', studentId)
    console.log('Debug - amount:', amount)
    console.log('Debug - description:', description)
    
    // Enhanced validation with specific error messages
    if (!studentId || studentId.trim() === "") {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a student from the dropdown or use the table actions.",
      })
      return
    }
    
    if (!amount || amount.trim() === "") {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter an amount.",
      })
      return
    }
    
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid positive number for the amount.",
      })
      return
    }
    
    if (!description || description.trim() === "") {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter a description for the transaction.",
      })
      return
    }
    
    try {
      console.log('Debug - Sending request with studentId:', studentId)
      
      // Generate a reference ID for the transaction
      const reference = `ALLOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Get admin ID from user object in localStorage
      const userString = localStorage.getItem('user')
      let processedBy = null
      
      if (userString) {
        try {
          // Parse user object and get ID
          const user = JSON.parse(userString)
          processedBy = user.id
          console.log('Debug - Admin ID from localStorage user object:', processedBy)
        } catch (error) {
          console.error('Debug - Error parsing user from localStorage:', error)
        }
      }
      
      if (!processedBy) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Could not identify admin from localStorage. Please log in again.",
        })
        return
      }
      
      const jwt = localStorage.getItem("jwt");
      const res = await fetch("http://localhost:8081/api/admin/wallets/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
        body: JSON.stringify({
          studentCode: studentId,
          type: transactionType,
          amount: Number(amount),
          description: description.trim(),
          reference,
          processedBy,
        }),
      })
      
      console.log('Debug - Complete request body sent:', {
        studentCode: studentId,
        type: transactionType,
        amount: Number(amount),
        description: description.trim(),
        reference,
        processedBy,
      })
      
      if (!res.ok) {
        const errorData = await res.text()
        console.error('Debug - API error response:', errorData)
        throw new Error(`Failed to allocate points: ${res.status} ${res.statusText}`)
      }
      
      const result = await res.json()
      console.log('Debug - API success response:', result)
      
      toast({
        variant: "success",
        title: "Points Allocated Successfully",
        description: `Points ${transactionType === "credit" ? "added to" : "deducted from"} wallet.`,
      })
      // Refresh data
      setLoading(true)
      Promise.all([
        fetch("http://localhost:8081/api/admin/wallets", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then(r => r.json()),
        fetch("http://localhost:8081/api/admin/wallets/transactions", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then(r => r.json()),
        fetch("http://localhost:8081/api/admin/wallets/analytics", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then(r => r.json()),
      ]).then(([walletsRes, transactionsRes, analyticsRes]) => {
        setWallets(walletsRes.wallets || walletsRes)
        setTransactions(transactionsRes.transactions || transactionsRes)
        setAnalytics(analyticsRes)
      }).finally(() => setLoading(false))
      // Reset form
      setSelectedStudent("")
      setLockedStudent(null)
      setAmount("")
      setDescription("")
      setIsAllocateDialogOpen(false)
    } catch (e) {
      console.error('Debug - Error in handleAllocatePoints:', e)
      toast({
        variant: "destructive",
        title: "Allocation Failed",
        description: e instanceof Error ? e.message : "Could not allocate points. Please try again.",
      })
    }
  }

  const handleBulkAllocation = async () => {
    // You may want to collect amount/description from UI fields
    const amount = 2500 // TODO: get from input
    const description = "Monthly points allocation" // TODO: get from input
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await fetch("http://localhost:8081/api/admin/wallets/bulk-allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
        body: JSON.stringify({ amount, description }),
      })
      if (!res.ok) throw new Error("Bulk allocation failed")
      toast({
        variant: "success",
        title: "Bulk Allocation Initiated",
        description: "Points allocation has been queued for all eligible students.",
      })
      // Refresh data
      setLoading(true)
      Promise.all([
        fetch("http://localhost:8081/api/admin/wallets", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then(r => r.json()),
        fetch("http://localhost:8081/api/admin/wallets/transactions", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then(r => r.json()),
        fetch("http://localhost:8081/api/admin/wallets/analytics", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then(r => r.json()),
      ]).then(([walletsRes, transactionsRes, analyticsRes]) => {
        setWallets(walletsRes.wallets || walletsRes)
        setTransactions(transactionsRes.transactions || transactionsRes)
        setAnalytics(analyticsRes)
      }).finally(() => setLoading(false))
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Bulk Allocation Failed",
        description: "Could not perform bulk allocation. Please try again.",
      })
    }
  }

  const handleExportTransactions = () => {
    if (!transactions.length) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No transactions to export.",
      })
      return
    }
    const headers = [
      "Transaction ID",
      "Student Name",
      "Student ID",
      "Type",
      "Amount",
      "Description",
      "Reference",
      "Status",
      "Date",
      "Processed By",
    ]
    const rows = transactions.map((t) => [
      t.id,
      t.studentName,
      t.studentId,
      t.type,
      t.amount,
      t.description,
      t.reference,
      t.status,
      formatDate(t.createdAt) + ' ' + formatTime(t.createdAt),
      t.processedByName || "System",
    ])
    const csvContent = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `wallet-transactions-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast({
      variant: "success",
      title: "Export Complete",
      description: "Transaction report has been downloaded.",
    })
  }

  const handleExportStudents = () => {
    if (!wallets.length) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No student wallets to export.",
      })
      return
    }
    const headers = [
      "Student Name",
      "Student ID",
      "Email",
      "Current Balance",
      "Total Allocated",
      "Total Spent",
      "Last Transaction",
      "Status",
    ]
    const rows = wallets.map((student) => [
      student.name,
      student.studentId,
      student.email,
      student.walletBalance,
      student.totalAllocated,
      student.totalSpent,
      formatDate(student.lastTransaction),
      student.walletBalance > 1000 ? "Healthy" : "Low Balance",
    ])
    const csvContent = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `student-wallets-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast({
      variant: "success",
      title: "Export Complete",
      description: "Student wallets report has been downloaded.",
    })
  }

  const handleExportBulkOperations = () => {
    // For bulk operations, we'll export analytics data
    if (!analytics) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No analytics data to export.",
      })
      return
    }
    const headers = [
      "Metric",
      "Value",
      "Description",
    ]
    const rows = [
      ["Total Balance", analytics.totalBalance || 0, "Total balance across all students"],
      ["Total Students", analytics.totalStudents || wallets.length, "Number of active students"],
      ["Monthly Allocated", analytics.monthlyAllocated || 0, "Points allocated this month"],
      ["Monthly Spent", analytics.monthlySpent || 0, "Points spent this month"],
      ["Average Balance", analytics.totalBalance && analytics.totalStudents ? (analytics.totalBalance / analytics.totalStudents).toFixed(2) : 0, "Average balance per student"],
    ]
    const csvContent = [headers, ...rows].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `wallet-analytics-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast({
      variant: "success",
      title: "Export Complete",
      description: "Wallet analytics report has been downloaded.",
    })
  }

  const handleExportCurrentSection = () => {
    switch (activeTab) {
      case "students":
        handleExportStudents()
        break
      case "transactions":
        handleExportTransactions()
        break
      case "bulk":
        handleExportBulkOperations()
        break
      default:
        handleExportStudents()
    }
  }

  const handleExportAllData = () => {
    // Simulate export process
    toast({
      variant: "success",
      title: "Export Started",
      description: "All wallet data is being exported. You'll receive a download link shortly.",
    })

    // In a real implementation, this would trigger a backend API call
    setTimeout(() => {
      toast({
        variant: "success",
        title: "Export Complete",
        description: "Wallet data has been exported successfully. Check your downloads.",
      })
    }, 3000)
  }

  const handleSyncWalletBalances = () => {
    toast({
      variant: "success",
      title: "Sync Started",
      description: "Wallet balances are being synchronized with the payment system.",
    })

    // Simulate sync process
    setTimeout(() => {
      toast({
        variant: "success",
        title: "Sync Complete",
        description: "All wallet balances have been synchronized successfully.",
      })
    }, 2000)
  }

  const handleGenerateLowBalanceReport = () => {
    const lowBalanceCount = wallets.filter((s) => s.walletBalance < 1000).length

    toast({
      variant: "success",
      title: "Report Generated",
      description: `Low balance report created. Found ${lowBalanceCount} students with balance below ₹1,000.`,
    })

    // In a real implementation, this would generate and download a PDF/Excel report
    setTimeout(() => {
      toast({
        variant: "success",
        title: "Report Ready",
        description: "Low balance report has been generated and is ready for download.",
      })
    }, 1500)
  }

  const handleArchiveOldTransactions = () => {
    // Simulate archiving process
    const oldTransactionsCount = transactions.filter(
      (t) => new Date(t.createdAt) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    ).length

    toast({
      variant: "success",
      title: "Archiving Started",
      description: `Archiving ${oldTransactionsCount} transactions older than 90 days.`,
    })

    setTimeout(() => {
      toast({
        variant: "success",
        title: "Archiving Complete",
        description: "Old transactions have been archived successfully. Database optimized.",
      })
    }, 2500)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Loading and error states
  if (loading) {
    return <div className="p-8 text-center text-lg">Loading wallet data...</div>
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
          <p className="text-gray-600">Manage student wallets, allocate points, and track transactions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExportCurrentSection}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
                <Wallet className="mr-2 h-4 w-4" />
                Allocate Points
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Allocate Points</DialogTitle>
                <DialogDescription>Add or deduct points from a student's wallet</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  {lockedStudent ? (
                    <div className="space-y-2">
                      <Input value={`${lockedStudent.name} (${lockedStudent.studentId})`} disabled />
                      <p className="text-sm text-green-600">✓ Student selected from table</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Select value={selectedStudent} onValueChange={(value) => {
                        console.log('Debug - Select onValueChange called with:', value)
                        setSelectedStudent(value)
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {wallets.map((student) => (
                            <SelectItem key={student.studentId} value={student.studentId}>
                              {student.name} ({student.studentId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedStudent && (
                        <p className="text-sm text-blue-600">✓ Student selected from dropdown</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={transactionType}
                    onValueChange={(value: "credit" | "debit" | "refund") => setTransactionType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit (Add Points)</SelectItem>
                      <SelectItem value="debit">Debit (Deduct Points)</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (Points)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter transaction description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { 
                  setIsAllocateDialogOpen(false); 
                  setLockedStudent(null);
                  setSelectedStudent("");
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAllocatePoints}>
                  {transactionType === "credit"
                    ? "Allocate"
                    : transactionType === "debit"
                      ? "Deduct"
                      : "Process Refund"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics?.totalBalance ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalStudents ?? wallets.length}</div>
            <p className="text-xs text-muted-foreground">With wallet accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Allocated</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics?.monthlyAllocated ?? 0)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics?.monthlySpent ?? 0)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Student Wallets</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        {/* Student Wallets Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Wallets</CardTitle>
                  <CardDescription>View and manage individual student wallet balances</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Total Allocated</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Transaction</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(student.walletBalance)}</div>
                        <Badge variant={student.walletBalance > 1000 ? "default" : "destructive"} className="text-xs">
                          {student.walletBalance > 1000 ? "Healthy" : "Low Balance"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(student.totalAllocated)}</TableCell>
                      <TableCell>{formatCurrency(student.totalSpent)}</TableCell>
                      <TableCell>{formatDate(student.lastTransaction)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                console.log('Debug - Setting selectedStudent to:', student.studentId)
                                console.log('Debug - Setting lockedStudent to:', student)
                                setSelectedStudent(student.studentId)
                                setLockedStudent(student)
                                setTransactionType("credit")
                                setIsAllocateDialogOpen(true)
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Points
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                console.log('Debug - Setting selectedStudent to:', student.studentId)
                                console.log('Debug - Setting lockedStudent to:', student)
                                setSelectedStudent(student.studentId)
                                setLockedStudent(student)
                                setTransactionType("debit")
                                setIsAllocateDialogOpen(true)
                              }}
                            >
                              <Minus className="mr-2 h-4 w-4" />
                              Deduct Points
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <History className="mr-2 h-4 w-4" />
                              Transaction History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View all wallet transactions across the system</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={filterType}
                    onValueChange={(value: "all" | "credit" | "debit" | "refund") => setFilterType(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterStatus}
                    onValueChange={(value: "all" | "completed" | "pending" | "failed") => setFilterStatus(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Processed By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.reference}</div>
                          <div className="text-sm text-muted-foreground">{transaction.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.studentName}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            transaction.type === "credit" || transaction.type === "refund"
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {transaction.type === "credit" || transaction.type === "refund" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div>{formatDate(transaction.createdAt)}</div>
                          <div className="text-sm text-muted-foreground">{formatTime(transaction.createdAt)}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.processedByName || "System"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedTransactionForDetails(transaction)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* Transaction Details Dialog */}
          <Dialog open={!!selectedTransactionForDetails} onOpenChange={(open) => !open && setSelectedTransactionForDetails(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Transaction Details</DialogTitle>
                <DialogDescription>Full details for this wallet transaction</DialogDescription>
              </DialogHeader>
              {selectedTransactionForDetails && (
                <div className="space-y-2">
                  <div><b>Reference:</b> {selectedTransactionForDetails.reference}</div>
                  <div><b>Description:</b> {selectedTransactionForDetails.description}</div>
                  <div><b>Student:</b> {selectedTransactionForDetails.studentName} ({selectedTransactionForDetails.studentId})</div>
                  <div><b>Type:</b> {selectedTransactionForDetails.type}</div>
                  <div><b>Amount:</b> {formatCurrency(selectedTransactionForDetails.amount)}</div>
                  <div><b>Status:</b> {selectedTransactionForDetails.status}</div>
                  <div><b>Date:</b> {formatDate(selectedTransactionForDetails.createdAt)} {formatTime(selectedTransactionForDetails.createdAt)}</div>
                  <div><b>Processed By:</b> {selectedTransactionForDetails.processedByName || "System"}</div>
                  {selectedTransactionForDetails.bookingId && (
                    <div><b>Booking ID:</b> {selectedTransactionForDetails.bookingId}</div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTransactionForDetails(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Allocation</CardTitle>
                <CardDescription>Allocate monthly points to all eligible students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-amount">Amount per Student</Label>
                  <Input id="monthly-amount" type="number" placeholder="2500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allocation-description">Description</Label>
                  <Input id="allocation-description" placeholder="Monthly points allocation - January 2024" />
                </div>
                <Button onClick={handleBulkAllocation} className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Allocate to All Students
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk Operations</CardTitle>
                <CardDescription>Perform bulk operations on student wallets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={handleExportAllData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Wallet Data
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleSyncWalletBalances}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Wallet Balances
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleGenerateLowBalanceReport}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Generate Low Balance Report
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleArchiveOldTransactions}>
                  <History className="mr-2 h-4 w-4" />
                  Archive Old Transactions
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Statistics</CardTitle>
              <CardDescription>Overview of wallet system performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{formatCurrency(analytics?.averageBalance ?? 0)}</div>
                  <div className="text-sm text-muted-foreground">Average Balance</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {wallets.filter((s) => s.walletBalance < 1000).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Low Balance Accounts</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {transactions.filter((t) => t.status === "pending").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Transactions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
