import "dotenv/config";
import express from "express";
import cors from "cors";
import { db } from "../db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const app = express();
const PORT = process.env.API_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("Login attempt:", req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      console.log("Missing username or password");
      return res.status(400).json({ error: "Username and password required" });
    }

    // Get admin from database
    const adminRes = await db.query(
      `SELECT id, username, password_hash, email FROM admins WHERE username = $1`,
      [username]
    );

    if (adminRes.rows.length === 0) {
      console.log("❌ Admin not found:", username);
      console.log("💡 Make sure to run 'npm run seed-admin' to create admin user");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = adminRes.rows[0];

    // Verify password
    // Note: Using SHA256 for compatibility. After installing bcrypt,
    // you should re-seed admin with bcrypt hash and update this to use bcrypt.compare
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    console.log("🔐 Password verification:");
    console.log("   Provided hash (first 20 chars):", passwordHash.substring(0, 20));
    console.log("   Stored hash (first 20 chars):", admin.password_hash?.substring(0, 20) || "NULL");
    console.log("   Match:", admin.password_hash === passwordHash);
    
    if (!admin.password_hash) {
      console.log("❌ Admin password_hash is NULL!");
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    if (admin.password_hash !== passwordHash) {
      console.log("❌ Password mismatch!");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("Login successful for:", username);

    // Update last login
    await db.query(
      `UPDATE admins SET last_login = NOW() WHERE id = $1`,
      [admin.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const adminRes = await db.query(
      `SELECT id, username, email, created_at, last_login FROM admins WHERE id = $1`,
      [req.user.id]
    );

    if (adminRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: adminRes.rows[0] });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Dashboard stats
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    // Total users
    const usersRes = await db.query(`SELECT COUNT(*) as count FROM users`);
    const totalUsers = parseInt(usersRes.rows[0].count);

    // Total withdrawals
    const withdrawalsRes = await db.query(`SELECT COUNT(*) as count FROM withdrawals`);
    const totalWithdrawals = parseInt(withdrawalsRes.rows[0].count);

    // Pending withdrawals
    const pendingRes = await db.query(
      `SELECT COUNT(*) as count FROM withdrawals WHERE status = 'pending'`
    );
    const pendingWithdrawals = parseInt(pendingRes.rows[0].count);

    // Total balance
    const balanceRes = await db.query(`SELECT SUM(balance) as total FROM users`);
    const totalBalance = parseInt(balanceRes.rows[0].total) || 0;

    // Total withdrawal amount
    const withdrawalAmountRes = await db.query(
      `SELECT SUM(amount) as total FROM withdrawals WHERE status != 'rejected'`
    );
    const totalWithdrawalAmount = parseInt(withdrawalAmountRes.rows[0].total) || 0;

    // Recent users (last 7 days)
    const recentUsersRes = await db.query(
      `SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '7 days'`
    );
    const recentUsers = parseInt(recentUsersRes.rows[0].count);

    res.json({
      totalUsers,
      totalWithdrawals,
      pendingWithdrawals,
      totalBalance,
      totalWithdrawalAmount,
      recentUsers,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get users with pagination
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let query = `
      SELECT 
        u.id,
        u.telegram_id,
        u.telegram_username,
        u.language,
        u.referral_code,
        u.balance,
        u.created_at,
        ref.telegram_username as referred_by_username
      FROM users u
      LEFT JOIN users ref ON u.referred_by = ref.id
    `;
    const params = [];

    if (search) {
      query += ` WHERE u.telegram_username ILIKE $1 OR u.telegram_id::text LIKE $1 OR u.referral_code ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const usersRes = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM users`;
    if (search) {
      countQuery += ` WHERE telegram_username ILIKE $1 OR telegram_id::text LIKE $1 OR referral_code ILIKE $1`;
    }
    const countRes = await db.query(
      countQuery,
      search ? [`%${search}%`] : []
    );
    const total = parseInt(countRes.rows[0].count);

    res.json({
      users: usersRes.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user by ID
app.get("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const userRes = await db.query(
      `SELECT 
        u.*,
        ref.telegram_username as referred_by_username
      FROM users u
      LEFT JOIN users ref ON u.referred_by = ref.id
      WHERE u.id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's withdrawals
    const withdrawalsRes = await db.query(
      `SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      user: userRes.rows[0],
      withdrawals: withdrawalsRes.rows,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get withdrawals with pagination
app.get("/api/withdrawals", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || "";

    let query = `
      SELECT 
        w.*,
        u.telegram_id,
        u.telegram_username,
        u.balance as user_balance
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
    `;
    const params = [];

    if (status) {
      query += ` WHERE w.status = $1`;
      params.push(status);
    }

    query += ` ORDER BY w.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const withdrawalsRes = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM withdrawals`;
    if (status) {
      countQuery += ` WHERE status = $1`;
    }
    const countRes = await db.query(
      countQuery,
      status ? [status] : []
    );
    const total = parseInt(countRes.rows[0].count);

    res.json({
      withdrawals: withdrawalsRes.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update withdrawal status
app.patch("/api/withdrawals/:id/status", authenticateToken, async (req, res) => {
  try {
    const withdrawalId = parseInt(req.params.id);
    const { status } = req.body;

    if (!["pending", "completed", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await db.query(
      `UPDATE withdrawals SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, withdrawalId]
    );

    res.json({ message: "Withdrawal status updated successfully" });
  } catch (error) {
    console.error("Update withdrawal status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`✅ CORS enabled for: http://localhost:5173, http://localhost:3000`);
});

