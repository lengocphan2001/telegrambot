import { db } from "./db.js";
import { generateReferralCode, isValidWalletAddress, generateUniqueAmount } from "./utils.js";
import { bot } from "./bot/server.js";
import { messages } from "./messages.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Track users who are in withdraw process (telegram_id -> {address: string, step: 'address' | 'amount'})
const withdrawPendingUsers = new Map();

// Check if user has joined Telegram group/channel
async function checkTelegramMembership(userId, chatId) {
  try {
    // Telegram group/channel username from env or default
    const telegramGroup = process.env.TELEGRAM_GROUP || "Aetheriavietnam";
    
    // Get chat member status
    const member = await bot.getChatMember(`@${telegramGroup}`, userId);
    
    // Check if user is a member (member, administrator, or creator)
    const validStatuses = ["member", "administrator", "creator"];
    return validStatuses.includes(member.status);
  } catch (error) {
    console.error("Error checking Telegram membership:", error);
    // If error (e.g., bot not admin, group not found), return false
    return false;
  }
}

// Helper function to create main menu keyboard
function createMainMenuKeyboard(languageCode) {
  const keyboard = {
    keyboard: [
      [{ text: "💰 Số Dư Tài Khoản" }],
      [
        { text: "🎯 Bắt Đầu Nhiệm Vụ" },
        { text: "💵 Thu Nhập Của Tôi" }
      ],
      [
        { text: "👥 Mời Bạn Bè" },
        { text: "🎁 Phần Thưởng" }
      ],
      [{ text: "⬆️ Rút Tiền Nhanh ⬆️" }]
    ],
    resize_keyboard: true,
    persistent: true
  };

  // Update button text based on language
  if (languageCode === "en") {
    keyboard.keyboard = [
      [{ text: "💰 Account Balance" }],
      [
        { text: "🎯 Start Tasks" },
        { text: "💵 My Earnings" }
      ],
      [
        { text: "👥 Invite Friends" },
        { text: "🎁 Rewards" }
      ],
      [{ text: "⬆️ Fast Withdraw ⬆️" }]
    ];
  } else if (languageCode === "ko") {
    keyboard.keyboard = [
      [{ text: "💰 계정 잔액" }],
      [
        { text: "🎯 작업 시작" },
        { text: "💵 내 수익" }
      ],
      [
        { text: "👥 친구 초대" },
        { text: "🎁 보상" }
      ],
      [{ text: "⬆️ 빠른 출금 ⬆️" }]
    ];
  } else {
    // Vietnamese (default)
    keyboard.keyboard = [
      [{ text: "💰 Số Dư Tài Khoản" }],
      [
        { text: "🎯 Bắt Đầu Nhiệm Vụ" },
        { text: "💵 Thu Nhập Của Tôi" }
      ],
      [
        { text: "👥 Mời Bạn Bè" },
        { text: "🎁 Phần Thưởng" }
      ],
      [{ text: "⬆️ Rút Tiền Nhanh ⬆️" }]
    ];
  }

  return keyboard;
}

// Helper function to create confirm keyboard
function createConfirmKeyboard(userId, languageCode) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Đã hoàn thành", callback_data: `confirm_${userId}_done` },
        { text: "❌ Chưa hoàn thành", callback_data: `confirm_${userId}_not_done` }
      ]
    ]
  };

  // Update keyboard text based on language
  if (languageCode === "en") {
    keyboard.inline_keyboard[0] = [
      { text: "✅ Completed", callback_data: `confirm_${userId}_done` },
      { text: "❌ Not completed", callback_data: `confirm_${userId}_not_done` }
    ];
  } else if (languageCode === "ko") {
    keyboard.inline_keyboard[0] = [
      { text: "✅ 완료함", callback_data: `confirm_${userId}_done` },
      { text: "❌ 미완료", callback_data: `confirm_${userId}_not_done` }
    ];
  }

  return keyboard;
}

export async function handleMessage(msg) {
  try {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const username = msg.from.username || "";
    const text = msg.text || "";

    console.log(`🔍 Processing message: "${text}" from user ${telegramId}`);

    // If user is in withdraw process and sends a command, cancel withdraw
    if (withdrawPendingUsers.has(telegramId) && (text.startsWith("/") || text.includes("Account Balance") || text.includes("Số Dư") || text.includes("계정 잔액") || text.includes("Invite Friends") || text.includes("Mời Bạn Bè") || text.includes("친구 초대"))) {
      withdrawPendingUsers.delete(telegramId);
      const userRes = await db.query(
        `SELECT language FROM users WHERE telegram_id = $1`,
        [telegramId]
      );
      const userLanguage = userRes.rows[0]?.language || "vi";
      const langMessages = messages[userLanguage] || messages.vi;
      const mainMenu = createMainMenuKeyboard(userLanguage);
      await bot.sendMessage(chatId, langMessages.withdrawCancelled, {
        reply_markup: mainMenu
      });
    }

    // Handle /balance or /bal command
    if (text === "/balance" || text === "/bal") {
      await handleBalanceCommand(chatId, telegramId);
      return;
    }

    // Handle /ref or /referral or /link command
    if (text === "/ref" || text === "/referral" || text === "/link" || text.startsWith("/ref ") || text.startsWith("/referral ") || text.startsWith("/link ")) {
      await handleReferralLinkCommand(chatId, telegramId);
      return;
    }

    // Handle menu button clicks
    const menuUserRes = await db.query(
      `SELECT language FROM users WHERE telegram_id = $1`,
      [telegramId]
    );
    const menuUserLanguage = menuUserRes.rows[0]?.language || "vi";
    const menuLangMessages = messages[menuUserLanguage] || messages.vi;

    // Check which button was clicked
    if (text.includes("Account Balance") || text.includes("Số Dư") || text.includes("계정 잔액")) {
      await handleBalanceCommand(chatId, telegramId);
      return;
    }

    if (text.includes("Invite Friends") || text.includes("Mời Bạn Bè") || text.includes("친구 초대")) {
      await handleReferralLinkCommand(chatId, telegramId);
      return;
    }

    if (text.includes("My Earnings") || text.includes("Thu Nhập") || text.includes("내 수익")) {
      await handleBalanceCommand(chatId, telegramId);
      return;
    }

    if (text.includes("Start Tasks") || text.includes("Bắt Đầu") || text.includes("작업 시작")) {
      // Start task flow
      await handleStartTasks(chatId, telegramId, menuUserLanguage);
      return;
    }

    if (text.includes("Rewards") || text.includes("Phần Thưởng") || text.includes("보상")) {
      const mainMenu = createMainMenuKeyboard(menuUserLanguage);
      await bot.sendMessage(chatId, "🎁 Phần thưởng sẽ được cập nhật sớm!\n\n💡 Hoàn thành nhiệm vụ và mời bạn bè để nhận phần thưởng!", {
        parse_mode: "Markdown",
        reply_markup: mainMenu
      });
      return;
    }

    if (text.includes("Fast Withdraw") || text.includes("Rút Tiền") || text.includes("빠른 출금")) {
      await handleWithdrawRequest(chatId, telegramId, menuUserLanguage);
      return;
    }

    // Check if user is in withdraw process
    if (withdrawPendingUsers.has(telegramId)) {
      const withdrawData = withdrawPendingUsers.get(telegramId);
      if (withdrawData.step === 'address') {
        // User is entering wallet address
        await handleWithdrawAddress(chatId, telegramId, text, menuUserLanguage);
      } else if (withdrawData.step === 'amount') {
        // User is entering amount
        await handleWithdrawAmount(chatId, telegramId, text, menuUserLanguage);
      }
      return;
    }

    // Check if message is /start command
    const isStartCommand = text.startsWith("/start");

    if (!isStartCommand) {
      // Ignore non-start messages
      console.log("⏭️  Ignoring non-start message");
      return;
    }

    console.log("✅ Start command detected, processing...");

      // Send introduction message with image FIRST (for all users)
      const introductionText = `🌟 Hello!

We are launching a $100,000 Airdrop program for the community.

✅ Complete tasks
🔁 Share the program
💰 Get valuable rewards

Start today and don't miss the opportunity!`;
    
    try {
      const imagePath = join(__dirname, "images", "intriduce.jpeg");
      const photo = readFileSync(imagePath);
      await bot.sendPhoto(chatId, photo, {
        caption: introductionText,
        parse_mode: "Markdown"
      });
      console.log(`📸 Introduction message sent to user ${telegramId}`);
    } catch (error) {
      console.error("Error sending introduction image:", error);
      // If image fails, send text only
      await bot.sendMessage(chatId, introductionText, {
        parse_mode: "Markdown"
      });
    }

    // Extract referral code from /start command (e.g., /start REF12345678)
    const parts = text.split(" ");
    const inputReferralCode = parts.length > 1 ? parts[1] : null;

    // Check if referral code exists and get referrer user_id
    let referredByUserId = null;
    if (inputReferralCode) {
      const referrerRes = await db.query(
        `SELECT id FROM users WHERE referral_code = $1`,
        [inputReferralCode]
      );
      if (referrerRes.rows.length > 0) {
        referredByUserId = referrerRes.rows[0].id;
        console.log(`🔗 User ${telegramId} referred by user ${referredByUserId} with code ${inputReferralCode}`);
      }
    }

    // Upsert user - create referral code if new user
    let userRes = await db.query(
      `SELECT id, language, referral_code, balance FROM users WHERE telegram_id = $1`,
      [telegramId]
    );

    let userId, userLanguage, referralCode, balance;
    
    if (userRes.rows.length === 0) {
      // New user - create with referral code
      referralCode = generateReferralCode(telegramId);
      userRes = await db.query(
        `INSERT INTO users (telegram_id, telegram_username, referral_code, referred_by)
         VALUES ($1, $2, $3, $4)
         RETURNING id, language, referral_code, balance`,
        [telegramId, username, referralCode, referredByUserId]
      );
      userId = userRes.rows[0].id;
      userLanguage = userRes.rows[0].language || "vi";
      referralCode = userRes.rows[0].referral_code;
      balance = userRes.rows[0].balance || 0;
      console.log(`👤 New user ${telegramId} created with referral code ${referralCode}`);
    } else {
      // Existing user
      userId = userRes.rows[0].id;
      userLanguage = userRes.rows[0].language || "vi";
      referralCode = userRes.rows[0].referral_code;
      balance = userRes.rows[0].balance || 0;
      
      // Update username if changed
      await db.query(
        `UPDATE users SET telegram_username = $1 WHERE telegram_id = $2`,
        [username, telegramId]
      );
      
      // If user was referred but referred_by is null, update it
      if (referredByUserId && !userRes.rows[0].referred_by) {
        await db.query(
          `UPDATE users SET referred_by = $1 WHERE id = $2`,
          [referredByUserId, userId]
        );
        console.log(`🔗 Updated referred_by for user ${telegramId}`);
      }
    }

    const langMessages = messages[userLanguage] || messages.vi;

    // Start new flow with language selection
    const languageKeyboard = {
      inline_keyboard: [
        [
          { text: "🇻🇳 Tiếng Việt", callback_data: "lang_vi" },
          { text: "🇬🇧 English", callback_data: "lang_en" },
          { text: "🇰🇷 한국어", callback_data: "lang_ko" }
        ]
      ]
    };

    // Send language selection buttons only (minimal text)
    await bot.sendMessage(chatId, "•", {
      reply_markup: languageKeyboard
    });

    console.log(`✅ Language selection sent to user ${telegramId}`);
  } catch (error) {
    console.error("Error handling message:", error);
    try {
      await bot.sendMessage(msg.chat.id, messages.vi.error);
    } catch (sendError) {
      console.error("Error sending error message:", sendError);
    }
  }
}

async function handleBalanceCommand(chatId, telegramId) {
  try {
    const userRes = await db.query(
      `SELECT balance, language FROM users WHERE telegram_id = $1`,
      [telegramId]
    );

    if (userRes.rows.length === 0) {
      await bot.sendMessage(chatId, "❌ Bạn chưa đăng ký. Vui lòng sử dụng /start");
      return;
    }

    const balance = userRes.rows[0].balance || 0;
    const language = userRes.rows[0].language || "vi";
    const langMessages = messages[language] || messages.vi;

    // Show menu
    const mainMenu = createMainMenuKeyboard(language);

    await bot.sendMessage(chatId, langMessages.balanceInfo(balance), {
      parse_mode: "Markdown",
      reply_markup: mainMenu
    });
  } catch (error) {
    console.error("Error handling balance command:", error);
    await bot.sendMessage(chatId, messages.vi.error);
  }
}

async function handleReferralLinkCommand(chatId, telegramId) {
  try {
    const userRes = await db.query(
      `SELECT referral_code, language FROM users WHERE telegram_id = $1`,
      [telegramId]
    );

    if (userRes.rows.length === 0) {
      await bot.sendMessage(chatId, "❌ Bạn chưa đăng ký. Vui lòng sử dụng /start");
      return;
    }

    const referralCode = userRes.rows[0].referral_code;
    const language = userRes.rows[0].language || "vi";
    const langMessages = messages[language] || messages.vi;

    const botUsername = process.env.BOT_USERNAME || (await bot.getMe()).username;
    const referralLink = `https://t.me/${botUsername}?start=${referralCode}`;

    // Show menu
    const mainMenu = createMainMenuKeyboard(language);

    await bot.sendMessage(chatId, langMessages.referralLink(referralCode, referralLink), {
      parse_mode: "Markdown",
      reply_markup: mainMenu
    });
  } catch (error) {
    console.error("Error handling referral link command:", error);
    await bot.sendMessage(chatId, messages.vi.error);
  }
}

async function handleWithdrawRequest(chatId, telegramId, languageCode) {
  try {
    const userRes = await db.query(
      `SELECT balance, language FROM users WHERE telegram_id = $1`,
      [telegramId]
    );

    if (userRes.rows.length === 0) {
      await bot.sendMessage(chatId, "❌ Bạn chưa đăng ký. Vui lòng sử dụng /start");
      return;
    }

    const balance = userRes.rows[0].balance || 0;
    const userLanguage = userRes.rows[0].language || languageCode || "vi";
    const langMessages = messages[userLanguage] || messages.vi;
    const MIN_WITHDRAW = 1000;

    const mainMenu = createMainMenuKeyboard(userLanguage);

    if (balance < MIN_WITHDRAW) {
      await bot.sendMessage(chatId, langMessages.withdrawNotEnough(balance, MIN_WITHDRAW), {
        parse_mode: "Markdown",
        reply_markup: mainMenu
      });
      return;
    }

    // Mark user as in withdraw process (step: address)
    withdrawPendingUsers.set(telegramId, { step: 'address' });

    await bot.sendMessage(chatId, langMessages.withdrawRequestAddress(balance), {
      parse_mode: "Markdown"
    });
  } catch (error) {
    console.error("Error handling withdraw request:", error);
    withdrawPendingUsers.delete(telegramId);
    await bot.sendMessage(chatId, messages.vi.error);
  }
}

async function handleWithdrawAddress(chatId, telegramId, address, languageCode) {
  try {
    const userRes = await db.query(
      `SELECT id, balance, language FROM users WHERE telegram_id = $1`,
      [telegramId]
    );

    if (userRes.rows.length === 0) {
      withdrawPendingUsers.delete(telegramId);
      await bot.sendMessage(chatId, "❌ Bạn chưa đăng ký. Vui lòng sử dụng /start");
      return;
    }

    const balance = userRes.rows[0].balance || 0;
    const userLanguage = userRes.rows[0].language || languageCode || "vi";
    const langMessages = messages[userLanguage] || messages.vi;
    const MIN_WITHDRAW = 1000;

    // Validate wallet address
    if (!isValidWalletAddress(address)) {
      await bot.sendMessage(chatId, langMessages.withdrawInvalidAddress, {
        parse_mode: "Markdown"
      });
      return; // Keep user in withdraw process
    }

    // Check balance again (in case it changed)
    if (balance < MIN_WITHDRAW) {
      withdrawPendingUsers.delete(telegramId);
      const mainMenu = createMainMenuKeyboard(userLanguage);
      await bot.sendMessage(chatId, langMessages.withdrawNotEnough(balance, MIN_WITHDRAW), {
        parse_mode: "Markdown",
        reply_markup: mainMenu
      });
      return;
    }

    // Save address and move to amount step
    withdrawPendingUsers.set(telegramId, { address, step: 'amount' });

    // Request amount
    await bot.sendMessage(chatId, langMessages.withdrawRequestAmount(balance, MIN_WITHDRAW), {
      parse_mode: "Markdown"
    });

    console.log(`✅ User ${telegramId} entered address ${address}, waiting for amount`);
  } catch (error) {
    console.error("Error handling withdraw address:", error);
    withdrawPendingUsers.delete(telegramId);
    await bot.sendMessage(chatId, messages.vi.error);
  }
}

async function handleWithdrawAmount(chatId, telegramId, amountText, languageCode) {
  try {
    const withdrawData = withdrawPendingUsers.get(telegramId);
    if (!withdrawData || withdrawData.step !== 'amount') {
      withdrawPendingUsers.delete(telegramId);
      await bot.sendMessage(chatId, "❌ Phiên làm việc đã hết hạn. Vui lòng bắt đầu lại.");
      return;
    }

    const address = withdrawData.address;
  const userRes = await db.query(
      `SELECT id, balance, language FROM users WHERE telegram_id = $1`,
      [telegramId]
    );

    if (userRes.rows.length === 0) {
      withdrawPendingUsers.delete(telegramId);
      await bot.sendMessage(chatId, "❌ Bạn chưa đăng ký. Vui lòng sử dụng /start");
      return;
    }

  const userId = userRes.rows[0].id;
    const balance = userRes.rows[0].balance || 0;
    const userLanguage = userRes.rows[0].language || languageCode || "vi";
    const langMessages = messages[userLanguage] || messages.vi;
    const MIN_WITHDRAW = 1000;

    // Parse and validate amount
    const amount = parseFloat(amountText);
    if (isNaN(amount) || amount < MIN_WITHDRAW || amount > balance || amount % 1 !== 0) {
      await bot.sendMessage(chatId, langMessages.withdrawInvalidAmount(balance, MIN_WITHDRAW), {
        parse_mode: "Markdown"
      });
      return; // Keep user in withdraw process
    }

    // Deduct balance
    const newBalance = balance - amount;
    await db.query(
      `UPDATE users SET balance = $1 WHERE id = $2`,
      [newBalance, userId]
    );

    // Save withdrawal to database
    await db.query(
      `INSERT INTO withdrawals (user_id, amount, wallet_address, status)
       VALUES ($1, $2, $3, 'pending')`,
      [userId, amount, address]
    );
    console.log(`💾 Withdrawal saved to database: user_id=${userId}, amount=${amount}, address=${address}`);

    // Get user info for notification
    const userInfoRes = await db.query(
      `SELECT telegram_username FROM users WHERE id = $1`,
      [userId]
    );
    const userUsername = userInfoRes.rows[0]?.telegram_username || `User ${telegramId}`;

    // Send notification to admin
    const adminUsername = process.env.ADMIN_USERNAME || "tonyctyp";
    const notificationMessage = `🔔 *YÊU CẦU RÚT TIỀN MỚI*

👤 Người dùng: @${userUsername} (ID: ${telegramId})
💰 Số HERO: *${amount} HERO*
📥 Địa chỉ ví: \`${address}\`
💵 Số dư còn lại: *${newBalance} HERO*

⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;

    try {
      await bot.sendMessage(`@${adminUsername}`, notificationMessage, {
        parse_mode: "Markdown"
      });
      console.log(`📤 Withdrawal notification sent to @${adminUsername}`);
    } catch (error) {
      console.error(`❌ Error sending notification to @${adminUsername}:`, error);
      // Try with chat_id if username fails
      const adminChatId = process.env.ADMIN_CHAT_ID;
      if (adminChatId) {
        try {
          await bot.sendMessage(adminChatId, notificationMessage, {
            parse_mode: "Markdown"
          });
          console.log(`📤 Withdrawal notification sent to chat_id ${adminChatId}`);
        } catch (chatIdError) {
          console.error("❌ Error sending notification to chat_id:", chatIdError);
        }
      }
    }

    // Remove from pending
    withdrawPendingUsers.delete(telegramId);

    // Show main menu
    const mainMenu = createMainMenuKeyboard(userLanguage);

    // Send success message
    await bot.sendMessage(chatId, langMessages.withdrawSuccess(amount, address, newBalance), {
      parse_mode: "Markdown",
      reply_markup: mainMenu
    });

    console.log(`✅ User ${telegramId} withdrew ${amount} HERO to ${address}, new balance: ${newBalance}`);
  } catch (error) {
    console.error("Error handling withdraw amount:", error);
    withdrawPendingUsers.delete(telegramId);
    await bot.sendMessage(chatId, messages.vi.error);
  }
}

async function handleStartTasks(chatId, telegramId, languageCode) {
  try {
    const userRes = await db.query(
      `SELECT language FROM users WHERE telegram_id = $1`,
      [telegramId]
    );

    if (userRes.rows.length === 0) {
      await bot.sendMessage(chatId, "❌ Bạn chưa đăng ký. Vui lòng sử dụng /start");
      return;
    }

    const userLanguage = userRes.rows[0]?.language || languageCode || "vi";
    const langMessages = messages[userLanguage] || messages.vi;

    // Show main menu
    const mainMenu = createMainMenuKeyboard(userLanguage);

    // Send tasks message only (no confirmation buttons)
    await bot.sendMessage(chatId, langMessages.tasks, {
      parse_mode: "Markdown",
      reply_markup: mainMenu
    });
  } catch (error) {
    console.error("Error handling start tasks:", error);
    await bot.sendMessage(chatId, messages.vi.error);
  }
}

export async function handleLanguageSelection(callbackQuery) {
  try {
    const chatId = callbackQuery.message.chat.id;
    const telegramId = callbackQuery.from.id;
    const languageCode = callbackQuery.data.replace("lang_", ""); // vi, en, or ko
    const username = callbackQuery.from.username || "";

    console.log(`🌐 User ${telegramId} selected language: ${languageCode}`);

    // Update user language
  await db.query(
      `UPDATE users SET language = $1 WHERE telegram_id = $2`,
      [languageCode, telegramId]
    );

    // Get user ID
    const userRes = await db.query(
      `SELECT id FROM users WHERE telegram_id = $1`,
      [telegramId]
    );
    const userId = userRes.rows[0].id;

    // Answer callback query
    await bot.answerCallbackQuery(callbackQuery.id);

    // Delete language selection message
    await bot.deleteMessage(chatId, callbackQuery.message.message_id);

    // Get messages for selected language
    const langMessages = messages[languageCode] || messages.vi;

    // Show main menu first - this will make it persistent
    const mainMenu = createMainMenuKeyboard(languageCode);
    await bot.sendMessage(chatId, "✅ Menu đã được kích hoạt!", {
      reply_markup: mainMenu
    });

    // Send tasks message with menu
    await bot.sendMessage(chatId, langMessages.tasks, {
      parse_mode: "Markdown",
      reply_markup: mainMenu
    });

    // Send confirmation message with buttons (inline keyboard)
    const confirmKeyboard = createConfirmKeyboard(userId, languageCode);

    await bot.sendMessage(chatId, langMessages.confirmTasks, {
      reply_markup: confirmKeyboard
    });

    console.log(`✅ Tasks sent to user ${telegramId}, waiting for confirmation`);
  } catch (error) {
    console.error("Error handling language selection:", error);
    try {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: messages.vi.error,
        show_alert: true
      });
    } catch (sendError) {
      console.error("Error sending error message:", sendError);
    }
  }
}

export async function handleTaskConfirmation(callbackQuery) {
  try {
    const chatId = callbackQuery.message.chat.id;
    const telegramId = callbackQuery.from.id;
    const data = callbackQuery.data; // confirm_${userId}_done or confirm_${userId}_not_done
    
    const [, userIdStr, status] = data.split("_");
    const userId = parseInt(userIdStr);
    const isDone = status === "done";

    console.log(`✅ User ${telegramId} confirmed tasks: ${isDone ? "done" : "not done"}`);

    // Get user language
    const userRes = await db.query(
      `SELECT language FROM users WHERE telegram_id = $1`,
      [telegramId]
    );
    const languageCode = userRes.rows[0]?.language || "vi";
    const langMessages = messages[languageCode] || messages.vi;

    // Answer callback query
    await bot.answerCallbackQuery(callbackQuery.id);

    // Delete confirmation message
    await bot.deleteMessage(chatId, callbackQuery.message.message_id);

    if (!isDone) {
      // User hasn't completed tasks yet - show confirmation buttons again
      const mainMenu = createMainMenuKeyboard(languageCode);
      const confirmKeyboard = createConfirmKeyboard(userId, languageCode);
      await bot.sendMessage(chatId, langMessages.notCompleted, {
        reply_markup: mainMenu
      });
      await bot.sendMessage(chatId, langMessages.confirmTasks, {
        reply_markup: confirmKeyboard
      });
      return;
    }

    // Check if user has joined Telegram group
    const hasJoinedTelegram = await checkTelegramMembership(telegramId, chatId);
    
    if (!hasJoinedTelegram) {
      // User hasn't joined Telegram group
      const mainMenu = createMainMenuKeyboard(languageCode);
      await bot.sendMessage(chatId, langMessages.notJoinedTelegram, {
        parse_mode: "Markdown",
        reply_markup: mainMenu
      });
      
      // Show confirmation buttons again
      const confirmKeyboard = createConfirmKeyboard(userId, languageCode);
      await bot.sendMessage(chatId, langMessages.confirmTasks, {
        reply_markup: confirmKeyboard
      });
      
      console.log(`❌ User ${telegramId} hasn't joined Telegram group`);
      return;
    }

    // User confirmed they completed tasks and has joined Telegram
    // Give reward to referrer if exists
    const userInfoRes = await db.query(
      `SELECT referred_by FROM users WHERE id = $1`,
      [userId]
    );

    if (userInfoRes.rows[0]?.referred_by) {
      const referrerId = userInfoRes.rows[0].referred_by;
      
      // Update referrer's balance
      await db.query(
        `UPDATE users SET balance = balance + 10 WHERE id = $1`,
        [referrerId]
      );

      // Get referrer's new balance and telegram_id
      const referrerRes = await db.query(
        `SELECT telegram_id, balance, language FROM users WHERE id = $1`,
        [referrerId]
      );

      if (referrerRes.rows.length > 0) {
        const referrerTelegramId = referrerRes.rows[0].telegram_id;
        const referrerBalance = referrerRes.rows[0].balance;
        const referrerLanguage = referrerRes.rows[0].language || "vi";
        const referrerLangMessages = messages[referrerLanguage] || messages.vi;

        // Notify referrer
        try {
          await bot.sendMessage(referrerTelegramId, referrerLangMessages.referralReward(referrerBalance), {
            parse_mode: "Markdown"
          });
        } catch (error) {
          console.error("Error notifying referrer:", error);
        }

        console.log(`🎁 Referrer ${referrerTelegramId} received 10 HERO, new balance: ${referrerBalance}`);
      }
    }

    // Show main menu
    const mainMenu = createMainMenuKeyboard(languageCode);

    // Send completion message
    await bot.sendMessage(chatId, langMessages.taskCompleted, {
      parse_mode: "Markdown",
      reply_markup: mainMenu
    });

    // Generate BNB amount and send payment info with dividend program details
    const amount = generateUniqueAmount();
    const heroContract = process.env.HERO_CONTRACT || "0x15E7ca18F73574112A5fd1d29c93cec0B42C1AAD";
    await bot.sendMessage(chatId, langMessages.payment(amount, process.env.RECEIVE_WALLET, heroContract), {
      parse_mode: "Markdown",
      reply_markup: mainMenu
    });

    // Send referral info
    const userInfoRes2 = await db.query(
      `SELECT referral_code, balance FROM users WHERE id = $1`,
      [userId]
    );
    const userReferralCode = userInfoRes2.rows[0].referral_code;
    const userBalance = userInfoRes2.rows[0].balance || 0;
    const botUsername = process.env.BOT_USERNAME || (await bot.getMe()).username;
    const referralLink = `https://t.me/${botUsername}?start=${userReferralCode}`;

    await bot.sendMessage(chatId, langMessages.referralInfo(userReferralCode, userBalance, referralLink), {
      parse_mode: "Markdown",
      reply_markup: mainMenu
    });

    console.log(`✅ User ${telegramId} confirmed completion and joined Telegram, payment amount: ${amount} BNB`);
  } catch (error) {
    console.error("Error handling task confirmation:", error);
    try {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: messages.vi.error,
        show_alert: true
      });
    } catch (sendError) {
      console.error("Error sending error message:", sendError);
    }
  }
}
