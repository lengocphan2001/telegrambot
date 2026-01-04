import "dotenv/config";
import { db } from "./db.js";
import crypto from "crypto";

async function seedAdmin() {
  try {
    console.log("🌱 Seeding admin user...");

    // Default admin credentials
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

    // Hash password using SHA256 (temporary, should use bcrypt in production)
    // Note: This is a simple hash for seeding. After installing bcrypt,
    // you should update the password using the API or re-seed with bcrypt.
    const passwordHash = crypto
      .createHash("sha256")
      .update(adminPassword)
      .digest("hex");

    // Check if admin already exists
    const existingAdmin = await db.query(
      `SELECT id FROM admins WHERE username = $1`,
      [adminUsername]
    );

    if (existingAdmin.rows.length > 0) {
      console.log("ℹ️  Admin user already exists. Updating password...");
      await db.query(
        `UPDATE admins SET password_hash = $1, email = $2 WHERE username = $3`,
        [passwordHash, adminEmail, adminUsername]
      );
      console.log("✅ Admin password updated!");
    } else {
      // Create admin user
      await db.query(
        `INSERT INTO admins (username, password_hash, email)
         VALUES ($1, $2, $3)`,
        [adminUsername, passwordHash, adminEmail]
      );
      console.log("✅ Admin user created!");
    }

    console.log(`📝 Admin credentials:
      Username: ${adminUsername}
      Password: ${adminPassword}
      Email: ${adminEmail}
    `);
    console.log("⚠️  Please change the default password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();

