import "dotenv/config";
import { db } from "./db.js";

async function checkAdmin() {
  try {
    console.log("🔍 Checking admin users in database...");
    
    const result = await db.query(`SELECT id, username, email, created_at FROM admins`);
    
    if (result.rows.length === 0) {
      console.log("❌ No admin users found in database!");
      console.log("💡 Run 'npm run seed-admin' to create an admin user.");
    } else {
      console.log(`✅ Found ${result.rows.length} admin user(s):`);
      result.rows.forEach((admin, index) => {
        console.log(`\n${index + 1}. Username: ${admin.username}`);
        console.log(`   Email: ${admin.email || 'N/A'}`);
        console.log(`   Created: ${admin.created_at}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    if (error.code === "42P01") {
      console.log("❌ 'admins' table does not exist!");
      console.log("💡 Run 'npm run setup-db' first to create the table.");
    } else {
      console.error("❌ Error checking admin:", error);
    }
    process.exit(1);
  }
}

checkAdmin();

