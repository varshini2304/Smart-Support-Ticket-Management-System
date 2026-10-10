#!/usr/bin/env node

/**
 * Script to create an admin user
 * Usage: node create-admin.js
 */

import mongoose from "mongoose";
import { createUser } from "./src/services/authService.js";
import User from "./src/models/User.js";
import { connectDB } from "./src/config/db.js";
import "dotenv/config";

async function createAdminUser() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await connectDB();

    const adminEmail = "admin@ticketsystem.com";
    const adminPassword = "admin123";

    // Check if admin already exists and delete old one
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("ℹ️  Existing admin found. Deleting old admin user...");
      await User.findByIdAndDelete(existingAdmin._id);
      console.log("✅ Old admin deleted");
    }

    console.log("👤 Creating admin user...");

    // Create admin user (initially as CUSTOMER due to createUser logic)
    const adminUser = await createUser(
      "System Administrator",
      adminEmail,
      adminPassword,
    );

    // Update role to ADMIN
    await User.findByIdAndUpdate(adminUser._id, { role: "ADMIN" });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", adminEmail);
    console.log("🔒 Password:", adminPassword);
    console.log("👑 Role: ADMIN");
    console.log("");
    console.log("🌐 You can now login at: http://localhost:5173/login");
    console.log("🏛️  Admin dashboard: http://localhost:5173/admin/dashboard");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  } finally {
    console.log("🔌 Disconnecting from MongoDB...");
    await mongoose.disconnect();
    console.log("✅ Done!");
  }
}

// Run the script
createAdminUser();
