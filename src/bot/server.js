import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import { handleMessage, handleLanguageSelection, handleTaskConfirmation } from "../handlers.js";

export const bot = new TelegramBot(process.env.TG_BOT_TOKEN, { polling: true });

// Set bot commands (will show suggestions when user types "/")
async function setBotCommands() {
  try {
    await bot.setMyCommands([
      {
        command: "start",
        description: "Bắt đầu sử dụng bot / Start using the bot"
      },
      {
        command: "balance",
        description: "Xem số dư hoa hồng / Check referral balance"
      },
      {
        command: "ref",
        description: "Lấy link giới thiệu / Get referral link"
      }
    ]);
    console.log("✅ Bot commands registered successfully");
  } catch (error) {
    console.error("❌ Error setting bot commands:", error);
  }
}

bot.on("message", (msg) => {
  console.log("📨 Received message:", msg.text, "from user:", msg.from?.id);
  handleMessage(msg);
});

bot.on("callback_query", (callbackQuery) => {
  console.log("🔘 Callback query:", callbackQuery.data, "from user:", callbackQuery.from?.id);
  
  if (callbackQuery.data.startsWith("lang_")) {
    handleLanguageSelection(callbackQuery);
  } else if (callbackQuery.data.startsWith("confirm_")) {
    handleTaskConfirmation(callbackQuery);
  }
});

bot.on("polling_error", (error) => {
  // Handle network errors gracefully
  if (error.code === "EFATAL" || error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
    console.warn("⚠️ Network error (will retry):", error.message);
    // Bot will automatically retry, no need to crash
    return;
  }
  
  // Log other errors
  console.error("❌ Polling error:", error);
  
  // For critical errors, you might want to restart the bot
  if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
    console.error("❌ Critical connection error, check your internet connection");
  }
});

// Set bot commands when bot starts
setBotCommands();

// Polling mode - bot automatically starts polling
console.log("🤖 Telegram bot started");
console.log("✅ Bot is ready to receive messages!");
console.log("📡 Polling mode active");
