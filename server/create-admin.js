import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User.js";
import { hashPassword } from "./src/services/authService.js";
import { connectDB } from "./src/config/db.js";

/**
 * Create a new admin account. Does NOT modify existing accounts.
 * @param {string} name - Display name for the admin
 * @param {string} email - Admin email (will be normalized)
 * @param {string} password - Plain-text password (never logged)
 * @returns {Promise<object>} Created user document
 */
async function createAdminUser(name, email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!password || password.length < 8) {
    throw new Error(
      `Password for ${normalizedEmail} must be at least 8 characters.`
    );
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (existingUser.role === "ADMIN") {
      console.log(
        `⏭  Admin account already exists for ${normalizedEmail}. No changes made.`
      );
    } else {
      console.log(
        `⚠  A non-admin account exists for ${normalizedEmail}. ` +
          `Promote it manually or use a different email. No changes made.`
      );
    }
    return existingUser;
  }

  const passwordHash = await hashPassword(password);
  const newUser = await User.create({
    name: name || "System Administrator",
    email: normalizedEmail,
    passwordHash,
    role: "ADMIN",
  });

  console.log(`✓ New Administrator account created: ${normalizedEmail}`);
  return newUser;
}

async function run() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "✗ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.\n" +
        "  Set them in your .env file or export them before running this script.\n\n" +
        "  Example:\n" +
        "    ADMIN_EMAIL=admin@example.com\n" +
        "    ADMIN_PASSWORD=your_secure_password\n"
    );
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();
    await createAdminUser("System Administrator", email, password);

    console.log("\n========================================");
    console.log("Admin setup complete.");
    console.log(`  Email : ${email}`);
    console.log("  Password: (set via ADMIN_PASSWORD env var — not logged)");
    console.log("========================================\n");
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error("✗ Admin creation failed:", error.message);
  process.exitCode = 1;
});
