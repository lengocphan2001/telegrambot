import "dotenv/config";
import { ethers } from "ethers";
import TelegramBot from "node-telegram-bot-api";
import { db } from "../db.js";

const provider = new ethers.WebSocketProvider(
  process.env.QUICKNODE_WSS
);

const bot = new TelegramBot(process.env.TG_BOT_TOKEN);
const RECEIVE = process.env.RECEIVE_WALLET.toLowerCase();
const CONFIRMATIONS = 6;

console.log("⛓️ BNB Listener started");

provider.on("block", async (blockNumber) => {
  const targetBlock = blockNumber - CONFIRMATIONS;
  if (targetBlock <= 0) return;

  const block = await provider.getBlock(targetBlock, true);
  if (!block) return;

  for (const tx of block.transactions) {
    if (!tx.to) continue;
    if (tx.to.toLowerCase() !== RECEIVE) continue;
    if (tx.value === 0n) continue;

    const amount = Number(ethers.formatEther(tx.value));

    const res = await db.query(
      `SELECT t.id, u.telegram_id
       FROM tasks t
       JOIN users u ON u.id = t.user_id
       WHERE t.status = 'PENDING'
       AND t.expected_amount_bnb = $1
       LIMIT 1`,
      [amount]
    );

    if (res.rowCount === 0) continue;

    const task = res.rows[0];

    await db.query(
      `UPDATE tasks
       SET status = 'PAID',
           tx_hash = $1,
           paid_at = NOW()
       WHERE id = $2`,
      [tx.hash, task.id]
    );

    await bot.sendMessage(task.telegram_id, `
✅ *HOÀN THÀNH THÀNH CÔNG*

💰 Nhận được *${amount} BNB*
🔗 https://bscscan.com/tx/${tx.hash}
    `, { parse_mode: "Markdown" });

    console.log("✅ Task completed:", tx.hash);
  }
});
