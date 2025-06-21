import type { Stop, Route, Student, Booking, WalletTransaction } from "@/types"

export const mockStops: Stop[] = [
  {
    id: "stop-1",
    name: "Main Gate",
    coordinates: { lat: 40.7128, lng: -74.006 },
    facilities: ["Shelter", "Seating", "Digital Display"],
    isActive: true,
    description: "Primary entrance to the university",
  },
  {
    id: "stop-2",
    name: "Library Complex",
    coordinates: { lat: 40.713, lng: -74.0055 },
    facilities: ["Shelter", "Seating", "WiFi"],
    isActive: true,
    description: "Central library and study areas",
  },
  {
    id: "stop-3",
    name: "Student Dormitories",
    coordinates: { lat: 40.7125, lng: -74.007 },
    facilities: ["Shelter", "Seating"],
    isActive: true,
    description: "Residential area for students",
  },
  {
    id: "stop-4",
    name: "Science Building",
    coordinates: { lat: 40.7135, lng: -74.005 },
    facilities: ["Shelter", "Digital Display"],
    isActive: true,
    description: "Science and engineering departments",
  },
  {
    id: "stop-5",
    name: "Sports Complex",
    coordinates: { lat: 40.712, lng: -74.0075 },
    facilities: ["Shelter", "Seating", "Water Fountain"],
    isActive: true,
    description: "Athletic facilities and gymnasium",
  },
  {
    id: "stop-6",
    name: "Medical Center",
    coordinates: { lat: 40.714, lng: -74.0045 },
    facilities: ["Shelter", "Seating", "Emergency Phone"],
    isActive: true,
    description: "Campus health services",
  },
]

export const mockRoutes: Route[] = [
  {
    id: "route-1",
    name: "Campus Loop",
    stops: [mockStops[0], mockStops[1], mockStops[3], mockStops[5], mockStops[0]], // Circular route
    estimatedDuration: 25,
    operatingHours: { start: "07:00", end: "22:00" },
    peakHours: [
      { start: "08:00", end: "10:00" },
      { start: "17:00", end: "19:00" },
    ],
    fareStructure: { basePrice: 2, peakMultiplier: 1.5 },
    isActive: true,
    color: "#3B82F6",
  },
  {
    id: "route-2",
    name: "Residential Express",
    stops: [mockStops[2], mockStops[0], mockStops[1], mockStops[2]], // Dorm to main areas
    estimatedDuration: 15,
    operatingHours: { start: "06:30", end: "23:00" },
    peakHours: [
      { start: "07:30", end: "09:30" },
      { start: "16:30", end: "18:30" },
    ],
    fareStructure: { basePrice: 1, peakMultiplier: 1.3 },
    isActive: true,
    color: "#10B981",
  },
  {
    id: "route-3",
    name: "Sports & Recreation",
    stops: [mockStops[0], mockStops[4], mockStops[2]], // Main gate to sports to dorms
    estimatedDuration: 20,
    operatingHours: { start: "08:00", end: "21:00" },
    peakHours: [{ start: "17:00", end: "20:00" }],
    fareStructure: { basePrice: 2, peakMultiplier: 1.2 },
    isActive: true,
    color: "#F59E0B",
  },
]

export const mockStudents: Student[] = [
  {
    id: "student-1",
    email: "john.doe@university.edu",
    name: "John Doe",
    role: "student",
    studentId: "STU001",
    walletBalance: 150,
    profileImage: "/placeholder.svg?height=100&width=100",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "student-2",
    email: "jane.smith@university.edu",
    name: "Jane Smith",
    role: "student",
    studentId: "STU002",
    walletBalance: 200,
    profileImage: "/placeholder.svg?height=100&width=100",
    createdAt: new Date("2024-01-20"),
  },
]

export const mockBookings: Booking[] = [
  {
    id: "booking-1",
    studentId: "student-1",
    fromStopId: "stop-2",
    toStopId: "stop-3",
    routeId: "route-1",
    scheduledTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    status: "confirmed",
    pointsDeducted: 2,
    transferRequired: false,
    createdAt: new Date(),
  },
  {
    id: "booking-2",
    studentId: "student-1",
    fromStopId: "stop-1",
    toStopId: "stop-4",
    routeId: "route-1",
    scheduledTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: "completed",
    pointsDeducted: 3,
    transferRequired: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
]

export const mockTransactions: WalletTransaction[] = [
  {
    id: "txn-1",
    studentId: "student-1",
    type: "credit",
    amount: 100,
    description: "Monthly allocation",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "txn-2",
    studentId: "student-1",
    type: "debit",
    amount: 2,
    bookingId: "booking-1",
    description: "Shuttle booking - Library to Dorms",
    createdAt: new Date(),
  },
]
