// Environment configuration with fallbacks for development
export const env = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "development-secret-key-change-in-production",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  // Razorpay configuration
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "rzp_test_YourKeyHere",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "your_secret_key_here",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "your_webhook_secret_here",
}

// Validate required environment variables in production
if (env.NODE_ENV === "production") {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is required in production")
  }
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required in production")
  }
}
