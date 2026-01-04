import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { db } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  try {
    console.log("📦 Setting up database...");
    
    // Read schema file
    const schemaPath = join(__dirname, "..", "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");
    
    // Execute schema
    await db.query(schema);
    
    console.log("✅ Database setup completed successfully!");
    console.log("📊 Tables created: users, withdrawals");
    
    process.exit(0);
  } catch (error) {
    // Check if tables already exist
    if (error.code === "42P07") {
      console.log("ℹ️  Tables already exist. Checking for language column...");
      
      // Try to add new columns if they don't exist
      try {
        await db.query(`
          DO $$ 
          BEGIN
            -- Add language column
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'users' AND column_name = 'language'
            ) THEN
              ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'vi';
            END IF;
            
            -- Add referral_code column
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'users' AND column_name = 'referral_code'
            ) THEN
              ALTER TABLE users ADD COLUMN referral_code VARCHAR(20);
              CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
            END IF;
            
            -- Add referred_by column
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'users' AND column_name = 'referred_by'
            ) THEN
              ALTER TABLE users ADD COLUMN referred_by INTEGER REFERENCES users(id);
              CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
            END IF;
            
            -- Add balance column
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'users' AND column_name = 'balance'
            ) THEN
              ALTER TABLE users ADD COLUMN balance INTEGER DEFAULT 0;
            END IF;
          END $$;
        `);
        console.log("✅ New columns added (if they didn't exist)");
        
        // Create withdrawals table if it doesn't exist
        try {
          await db.query(`
            CREATE TABLE IF NOT EXISTS withdrawals (
              id SERIAL PRIMARY KEY,
              user_id INTEGER NOT NULL REFERENCES users(id),
              amount INTEGER NOT NULL,
              wallet_address TEXT NOT NULL,
              status VARCHAR(20) DEFAULT 'pending',
              created_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
            CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
          `);
          console.log("✅ Withdrawals table created (if it didn't exist)");
        } catch (withdrawalsError) {
          console.log("ℹ️  Withdrawals table may already exist or error:", withdrawalsError.message);
        }

        // Create admins table if it doesn't exist
        try {
          await db.query(`
            CREATE TABLE IF NOT EXISTS admins (
              id SERIAL PRIMARY KEY,
              username VARCHAR(50) UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              email VARCHAR(100),
              created_at TIMESTAMP DEFAULT NOW(),
              last_login TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
          `);
          console.log("✅ Admins table created (if it didn't exist)");
        } catch (adminsError) {
          console.log("ℹ️  Admins table may already exist or error:", adminsError.message);
        }
      } catch (alterError) {
        console.log("ℹ️  Columns may already exist or error:", alterError.message);
      }
      
      process.exit(0);
    } else {
      console.error("❌ Error setting up database:", error.message);
      console.error("Full error:", error);
      process.exit(1);
    }
  }
}

setupDatabase();

