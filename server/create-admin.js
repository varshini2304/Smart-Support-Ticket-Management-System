import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User.js";
import { hashPassword } from "./src/services/authService.js";
import { connectDB } from "./src/config/db.js";

async function upsertAdminUser(name, email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!password || password.length < 8) {
    throw new Error(`Password for ${normalizedEmail} must be at least 8 characters.`);
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  const passwordHash = await hashPassword(password);

  if (existingUser) {
    existingUser.role = "ADMIN";
    existingUser.name = name || existingUser.name;
    existingUser.passwordHash = passwordHash;
    await existingUser.save();
    console.log(`✓ Existing account updated to Administrator: ${normalizedEmail}`);
    return existingUser;
  } else {
    const newUser = await User.create({
      name: name || "System Administrator",
      email: normalizedEmail,
      passwordHash,
      role: "ADMIN",
    });
    console.log(`✓ New Administrator account created: ${normalizedEmail}`);
    return newUser;
  }
}

async function run() {
  try {
    await connectDB();

    // 1. Create or update admin from .env if specified
    const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD;

    if (envEmail && envPassword) {
      await upsertAdminUser("System Administrator", envEmail, envPassword);
    }

    // 2. Also ensure standard admin@supporthub.com exists as a primary administrator account
    const standardEmail = "admin@supporthub.com";
    const standardPassword = envPassword || "admin123";
    if (standardEmail !== envEmail) {
      await upsertAdminUser("SupportHub Admin", standardEmail, standardPassword);
    }

    console.log("\n========================================");
    console.log("Admin accounts ready in database:");
    if (envEmail) {
      console.log(`• Email: ${envEmail} | Password: ${envPassword}`);
    }
    if (standardEmail !== envEmail) {
      console.log(`• Email: ${standardEmail} | Password: ${standardPassword}`);
    }
    console.log("========================================\n");
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("✗ Admin creation failed:", error.message);
  process.exitCode = 1;
});
