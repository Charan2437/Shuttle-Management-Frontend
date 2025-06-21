"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, MoreHorizontal, CreditCard, User, Mail, TrendingUp, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function StudentManagement() {
  const [students, setStudents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [isAllocatePointsOpen, setIsAllocatePointsOpen] = useState(false)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
  })
  const [addStudentLoading, setAddStudentLoading] = useState(false)
  const { toast } = useToast()
  // Add state for stats
  const [studentStats, setStudentStats] = useState<any[]>([])

  // Fetch students and stats
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    // Fetch both students and stats in parallel
    Promise.all([
      fetch("http://localhost:8081/api/admin/students", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then((res) => res.json()),
      fetch("http://localhost:8081/api/admin/students/stats", jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined).then((res) => res.json()),
    ])
      .then(([studentsData, statsData]) => {
        const statsMap = new Map(statsData.map((s: any) => [s.studentId, s]))
        const merged = studentsData.map((student: any) => {
          const stat = statsMap.get(student.studentId);
          return {
            ...student,
            totalRides: (stat as any)?.totalRides ?? 0,
            totalSpent: (stat as any)?.totalSpent ?? 0,
          }
        })
        setStudents(merged)
        setStudentStats(statsData)
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Failed to load students or stats",
          description: "Could not fetch students or stats from the server.",
        })
      })
  }, [])

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAllocatePoints = (studentId: string, points: number) => {
    const student = students.find((s) => s.id === studentId)
    setStudents(
      students.map((student) =>
        student.id === studentId ? { ...student, walletBalance: student.walletBalance + points } : student,
      ),
    )
    setIsAllocatePointsOpen(false)

    toast({
      variant: "success",
      title: "Points Allocated",
      description: `${points} points have been added to ${student?.name}'s wallet.`,
    })
  }

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.password || !newStudent.studentId) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill all fields to add a student.',
      })
      return
    }
    setAddStudentLoading(true)
    try {
      const requestBody = {
        ...newStudent,
        role: 'student', // changed to lowercase
      }
      console.log('Add Student - Request Body:', requestBody)
      const jwt = localStorage.getItem("jwt");
      const res = await fetch('http://localhost:8081/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify(requestBody),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || 'Failed to add student')
      }
      toast({
        variant: 'success',
        title: 'Student Added',
        description: 'Student registered successfully.',
      })
      setIsAddStudentOpen(false)
      setNewStudent({ name: '', email: '', password: '', studentId: '' })
      // Refresh students and stats
      Promise.all([
        fetch('http://localhost:8081/api/admin/students').then((res) => res.json()),
        fetch('http://localhost:8081/api/admin/students/stats').then((res) => res.json()),
      ]).then(([studentsData, statsData]) => {
        const statsMap = new Map(statsData.map((s: any) => [s.studentId, s]))
        const merged = studentsData.map((student: any) => {
          const stat = statsMap.get(student.studentId) || {}
          return {
            ...student,
            totalRides: stat.totalRides ?? 0,
            totalSpent: stat.totalSpent ?? 0,
          }
        })
        setStudents(merged)
        setStudentStats(statsData)
      })
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Add Student Failed',
        description: e instanceof Error ? e.message : 'Could not add student. Please try again.',
      })
    } finally {
      setAddStudentLoading(false)
    }
  }

  const handleEditStudent = async () => {
    if (!selectedStudent) return
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await fetch(`http://localhost:8081/api/admin/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify(selectedStudent),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || 'Failed to update student')
      }
      toast({
        variant: 'success',
        title: 'Student Updated',
        description: 'Student details updated successfully.',
      })
      setSelectedStudent(null)
      // Refresh students and stats
      Promise.all([
        fetch('http://localhost:8081/api/admin/students').then((res) => res.json()),
        fetch('http://localhost:8081/api/admin/students/stats').then((res) => res.json()),
      ]).then(([studentsData, statsData]) => {
        const statsMap = new Map(statsData.map((s: any) => [s.studentId, s]))
        const merged = studentsData.map((student: any) => {
          const stat = statsMap.get(student.studentId) || {}
          return {
            ...student,
            totalRides: stat.totalRides ?? 0,
            totalSpent: stat.totalSpent ?? 0,
          }
        })
        setStudents(merged)
        setStudentStats(statsData)
      })
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: e instanceof Error ? e.message : 'Could not update student. Please try again.',
      })
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await fetch(`http://localhost:8081/api/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || 'Failed to delete student')
      }
      setStudents(students.filter((student) => student.id !== studentId))
      toast({
        variant: 'success',
        title: 'Student Deleted',
        description: 'Student removed successfully.',
      })
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: e instanceof Error ? e.message : 'Could not delete student. Please try again.',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">Manage student accounts, wallets, and usage analytics</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={isAllocatePointsOpen} onOpenChange={setIsAllocatePointsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Bulk Allocate Points
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Point Allocation</DialogTitle>
                <DialogDescription>Allocate points to multiple students at once</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="allocation-type" className="text-right">
                    Allocation Type
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select allocation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Allocation</SelectItem>
                      <SelectItem value="bonus">Bonus Points</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="points-amount" className="text-right">
                    Points Amount
                  </Label>
                  <Input id="points-amount" type="number" placeholder="100" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="student-filter" className="text-right">
                    Students
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="active">Active Students Only</SelectItem>
                      <SelectItem value="low-balance">Low Balance Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAllocatePointsOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">Allocate Points</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90" onClick={() => setIsAddStudentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
          <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Student</DialogTitle>
                <DialogDescription>Register a new student account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Name</Label>
                  <Input id="student-name" value={newStudent.name} onChange={e => setNewStudent(s => ({ ...s, name: e.target.value }))} placeholder="Student Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input id="student-email" type="email" value={newStudent.email} onChange={e => setNewStudent(s => ({ ...s, email: e.target.value }))} placeholder="student@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input id="student-password" type="password" value={newStudent.password} onChange={e => setNewStudent(s => ({ ...s, password: e.target.value }))} placeholder="Password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-id">Student ID</Label>
                  <Input id="student-id" value={newStudent.studentId} onChange={e => setNewStudent(s => ({ ...s, studentId: e.target.value }))} placeholder="stud5" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddStudentOpen(false)} disabled={addStudentLoading}>Cancel</Button>
                <Button onClick={handleAddStudent} disabled={addStudentLoading}>
                  Add Student
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(students.length * 0.85)}</div>
            <p className="text-xs text-muted-foreground">85% activity rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallet Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.reduce((acc, student) => acc + student.walletBalance, 0)} pts
            </div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Balance Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.filter((s) => s.walletBalance < 50).length}</div>
            <p className="text-xs text-muted-foreground">Students need top-up</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search students by name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students ({filteredStudents.length})</CardTitle>
          <CardDescription>Manage student accounts and monitor their activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead>Total Rides</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.profileImage || "/placeholder.svg"} alt={student.name} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.studentId}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className={student.walletBalance < 50 ? "text-red-600 font-medium" : ""}>
                          {student.walletBalance} pts
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{student.totalRides}</TableCell>
                    <TableCell>{student.totalSpent} pts</TableCell>
                    <TableCell>
                      <Badge variant={student.walletBalance > 50 ? "default" : "destructive"}>
                        {student.walletBalance > 50 ? "Active" : "Low Balance"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}>
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsAllocatePointsOpen(true)
                          }}
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
