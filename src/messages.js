export const messages = {
  vi: {
    selectLanguage: "🌐 Vui lòng chọn ngôn ngữ của bạn / Please select your language",
    tasks: `
🎯 *NHIỆM VỤ CỦA BẠN*

Vui lòng hoàn thành các nhiệm vụ sau:

1️⃣ *Đăng ký nhóm Facebook*
👉 https://www.facebook.com/Aetheriacompany/

2️⃣ *Tham gia nhóm Zalo*
👉 https://zalo.me/g/mpqsjt318

3️⃣ *Tham gia nhóm Telegram*
👉 https://t.me/Aetheriavietnam

4️⃣ *Đăng ký kênh YouTube*
👉 https://www.youtube.com/@Aetheriacompany

─────────────────────

Sau khi hoàn thành tất cả nhiệm vụ, bạn sẽ nhận được thông tin thanh toán.
    `,
    confirmTasks: "✅ Bạn đã hoàn thành tất cả các nhiệm vụ chưa?",
    payment: (amount, wallet, heroContract) => `
📢 *THÔNG BÁO CHƯƠNG TRÌNH CỔ TỨC*

Người dùng tham gia vui lòng thanh toán ${amount} BNB để kích hoạt gói cổ tức.

💰 *Cơ chế & quyền lợi:*
• Nhận cổ tức 1% mỗi ngày
• Cổ tức được tự động trả bằng Hero
• Hệ thống phân phối hoàn toàn tự động sau khi kích hoạt

📄 *Địa chỉ hợp đồng Hero:*
\`${heroContract}\`

💰 *THANH TOÁN*

Chuyển đúng số tiền:

💰 *${amount} BNB*

📥 Ví nhận:
\`${wallet}\`

⚠️ *Gửi ĐÚNG số tiền để hệ thống xác nhận tự động*
    `,
    error: "❌ Có lỗi xảy ra, vui lòng thử lại sau.",
    notCompleted: "⚠️ Vui lòng hoàn thành tất cả các nhiệm vụ trước khi tiếp tục.",
    notJoinedTelegram: "❌ Bạn chưa tham gia nhóm Telegram!\n\nVui lòng tham gia nhóm trước:\n👉 https://t.me/Aetheriavietnam\n\nSau đó thử lại.",
    taskCompleted: "✅ Chúc mừng! Bạn đã hoàn thành tất cả nhiệm vụ!",
    referralInfo: (code, balance, referralLink) => `
🎁 *THÔNG TIN GIỚI THIỆU*

💰 Số dư của bạn: *${balance}*

🔗 Link giới thiệu của bạn:
\`${referralLink}\`

📋 Mã giới thiệu: \`${code}\`

💡 Mỗi khi có người dùng link giới thiệu của bạn và hoàn thành nhiệm vụ, bạn sẽ nhận được *10 HERO*!
    `,
    referralReward: (balance) => `🎉 Bạn đã nhận được *10 HERO* từ việc giới thiệu!\n\n💰 Số dư hiện tại: *${balance}*`,
    balanceInfo: (balance) => `💰 *SỐ DƯ HOA HỒNG*\n\nSố dư hiện tại của bạn: *${balance} HERO*\n\n💡 Bạn có thể kiếm thêm HERO bằng cách giới thiệu người dùng mới!`,
    referralLink: (code, referralLink) => `🔗 *LINK GIỚI THIỆU CỦA BẠN*\n\nLink:\n\`${referralLink}\`\n\n📋 Mã giới thiệu: \`${code}\`\n\n💡 Chia sẻ link này để nhận *10 HERO* mỗi khi có người hoàn thành nhiệm vụ!`,
    withdrawNotEnough: (balance, minAmount) => `❌ *CHƯA ĐỦ ĐIỀU KIỆN RÚT TIỀN*\n\n💰 Số dư hiện tại: *${balance} HERO*\n\n⚠️ Bạn cần ít nhất *${minAmount} HERO* để rút tiền.\n\n💡 Kiếm thêm HERO bằng cách mời bạn bè!`,
    withdrawRequestAddress: (balance) => `⬆️ *RÚT TIỀN*\n\n💰 Số dư của bạn: *${balance} HERO*\n\n✅ Bạn đủ điều kiện rút tiền!\n\n📥 Vui lòng nhập địa chỉ ví của bạn (Ethereum/BSC):\n\n⚠️ Địa chỉ ví phải bắt đầu bằng \`0x\` và có 42 ký tự.`,
    withdrawInvalidAddress: "❌ *ĐỊA CHỈ VÍ KHÔNG HỢP LỆ*\n\n⚠️ Vui lòng nhập địa chỉ ví hợp lệ (Ethereum/BSC).\n\n📝 Địa chỉ ví phải:\n• Bắt đầu bằng \`0x\`\n• Có đúng 42 ký tự\n• Chỉ chứa chữ số và chữ cái (0-9, a-f, A-F)\n\nVui lòng thử lại:",
    withdrawRequestAmount: (balance, minAmount) => `💰 *NHẬP SỐ HERO CẦN RÚT*\n\n💰 Số dư của bạn: *${balance} HERO*\n\n⚠️ Số HERO tối thiểu: *${minAmount} HERO*\n\n📝 Vui lòng nhập số HERO bạn muốn rút (chỉ nhập số, ví dụ: 1000, 5000, 10000):`,
    withdrawInvalidAmount: (balance, minAmount) => `❌ *SỐ HERO KHÔNG HỢP LỆ*\n\n⚠️ Vui lòng nhập số HERO hợp lệ:\n\n• Tối thiểu: *${minAmount} HERO*\n• Tối đa: *${balance} HERO*\n• Chỉ nhập số (ví dụ: 1000, 5000)\n\n💰 Số dư hiện tại: *${balance} HERO*\n\nVui lòng thử lại:`,
    withdrawSuccess: (amount, address, newBalance) => `✅ *YÊU CẦU RÚT TIỀN ĐÃ ĐƯỢC GỬI*\n\n💰 Số tiền: *${amount} HERO*\n📥 Địa chỉ ví: \`${address}\`\n\n⏳ Vui lòng đợi hệ thống xử lý. Bạn sẽ nhận được thông báo khi hoàn tất.\n\n💰 Số dư còn lại: *${newBalance} HERO*`,
    withdrawCancelled: "❌ Đã hủy yêu cầu rút tiền."
  },
  en: {
    selectLanguage: "🌐 Please select your language",
    tasks: `
🎯 *YOUR TASKS*

Please complete the following tasks:

1️⃣ *Join Facebook Group*
👉 https://www.facebook.com/Aetheriacompany/

2️⃣ *Join Zalo Group*
👉 https://zalo.me/g/mpqsjt318

3️⃣ *Join Telegram Group*
👉 https://t.me/Aetheriavietnam

4️⃣ *Subscribe to YouTube Channel*
👉 https://www.youtube.com/@Aetheriacompany

─────────────────────

After completing all tasks, you will receive payment information.
    `,
    confirmTasks: "✅ Have you completed all tasks?",
    payment: (amount, wallet, heroContract) => `
📢 *DIVIDEND PROGRAM NOTICE*

Participants please pay ${amount} BNB to activate the dividend package.

💰 *Mechanism & Benefits:*
• Receive 1% dividend daily
• Dividends are automatically paid in Hero
• System distribution is fully automatic after activation

📄 *Hero Contract Address:*
\`${heroContract}\`

💰 *PAYMENT*

Send the exact amount:

💰 *${amount} BNB*

📥 Receiving wallet:
\`${wallet}\`

⚠️ *Send the EXACT amount for automatic confirmation*
    `,
    error: "❌ An error occurred, please try again later.",
    notCompleted: "⚠️ Please complete all tasks before continuing.",
    notJoinedTelegram: "❌ You haven't joined the Telegram group!\n\nPlease join the group first:\n👉 https://t.me/Aetheriavietnam\n\nThen try again.",
    taskCompleted: "✅ Congratulations! You have completed all tasks!",
    referralInfo: (code, balance, referralLink) => `
🎁 *REFERRAL INFORMATION*

💰 Your balance: *${balance}*

🔗 Your referral link:
\`${referralLink}\`

📋 Referral code: \`${code}\`

💡 Every time someone uses your referral link and completes tasks, you will receive *10 HERO*!
    `,
    referralReward: (balance) => `🎉 You received *10 HERO* from referral!\n\n💰 Current balance: *${balance}*`,
    balanceInfo: (balance) => `💰 *REFERRAL BALANCE*\n\nYour current balance: *${balance} HERO*\n\n💡 You can earn more HERO by referring new users!`,
    referralLink: (code, referralLink) => `🔗 *YOUR REFERRAL LINK*\n\nLink:\n\`${referralLink}\`\n\n📋 Referral code: \`${code}\`\n\n💡 Share this link to earn *10 HERO* each time someone completes tasks!`,
    withdrawNotEnough: (balance, minAmount) => `❌ *INSUFFICIENT BALANCE FOR WITHDRAWAL*\n\n💰 Current balance: *${balance} HERO*\n\n⚠️ You need at least *${minAmount} HERO* to withdraw.\n\n💡 Earn more HERO by inviting friends!`,
    withdrawRequestAddress: (balance) => `⬆️ *WITHDRAW*\n\n💰 Your balance: *${balance} HERO*\n\n✅ You are eligible to withdraw!\n\n📥 Please enter your wallet address (Ethereum/BSC):\n\n⚠️ Wallet address must start with \`0x\` and have 42 characters.`,
    withdrawInvalidAddress: "❌ *INVALID WALLET ADDRESS*\n\n⚠️ Please enter a valid wallet address (Ethereum/BSC).\n\n📝 Wallet address must:\n• Start with \`0x\`\n• Have exactly 42 characters\n• Contain only numbers and letters (0-9, a-f, A-F)\n\nPlease try again:",
    withdrawRequestAmount: (balance, minAmount) => `💰 *ENTER HERO AMOUNT TO WITHDRAW*\n\n💰 Your balance: *${balance} HERO*\n\n⚠️ Minimum amount: *${minAmount} HERO*\n\n📝 Please enter the amount of HERO you want to withdraw (numbers only, e.g., 1000, 5000, 10000):`,
    withdrawInvalidAmount: (balance, minAmount) => `❌ *INVALID HERO AMOUNT*\n\n⚠️ Please enter a valid HERO amount:\n\n• Minimum: *${minAmount} HERO*\n• Maximum: *${balance} HERO*\n• Numbers only (e.g., 1000, 5000)\n\n💰 Current balance: *${balance} HERO*\n\nPlease try again:`,
    withdrawSuccess: (amount, address, newBalance) => `✅ *WITHDRAWAL REQUEST SUBMITTED*\n\n💰 Amount: *${amount} HERO*\n📥 Wallet address: \`${address}\`\n\n⏳ Please wait for the system to process. You will be notified when completed.\n\n💰 Remaining balance: *${newBalance} HERO*`,
    withdrawCancelled: "❌ Withdrawal request cancelled."
  },
  ko: {
    selectLanguage: "🌐 언어를 선택해주세요 / Please select your language",
    tasks: `
🎯 *귀하의 작업*

다음 작업을 완료해주세요:

1️⃣ *Facebook 그룹 가입*
👉 https://www.facebook.com/Aetheriacompany/

2️⃣ *Zalo 그룹 가입*
👉 https://zalo.me/g/mpqsjt318

3️⃣ *Telegram 그룹 가입*
👉 https://t.me/Aetheriavietnam

4️⃣ *YouTube 채널 구독*
👉 https://www.youtube.com/@Aetheriacompany

─────────────────────

모든 작업을 완료한 후 결제 정보를 받게 됩니다.
    `,
    confirmTasks: "✅ 모든 작업을 완료하셨나요?",
    payment: (amount, wallet, heroContract) => `
📢 *배당 프로그램 공지*

참가자는 배당 패키지를 활성화하려면 ${amount} BNB를 지불해주세요.

💰 *메커니즘 & 혜택:*
• 매일 1% 배당 수령
• 배당은 Hero로 자동 지급됩니다
• 활성화 후 시스템 배포가 완전 자동화됩니다

📄 *Hero 계약 주소:*
\`${heroContract}\`

💰 *결제*

정확한 금액을 보내주세요:

💰 *${amount} BNB*

📥 수신 지갑:
\`${wallet}\`

⚠️ *자동 확인을 위해 정확한 금액을 보내주세요*
    `,
    error: "❌ 오류가 발생했습니다. 나중에 다시 시도해주세요.",
    notCompleted: "⚠️ 계속하기 전에 모든 작업을 완료해주세요.",
    notJoinedTelegram: "❌ Telegram 그룹에 아직 가입하지 않았습니다!\n\n먼저 그룹에 가입해주세요:\n👉 https://t.me/Aetheriavietnam\n\n그런 다음 다시 시도해주세요.",
    taskCompleted: "✅ 축하합니다! 모든 작업을 완료했습니다!",
    referralInfo: (code, balance, referralLink) => `
🎁 *추천 정보*

💰 잔액: *${balance}*

🔗 추천 링크:
\`${referralLink}\`

📋 추천 코드: \`${code}\`

💡 누군가 귀하의 추천 링크를 사용하고 작업을 완료할 때마다 *10점*을 받게 됩니다!
    `,
    referralReward: (balance) => `🎉 추천으로 *10점*을 받았습니다!\n\n💰 현재 잔액: *${balance}*`,
    balanceInfo: (balance) => `💰 *추천 잔액*\n\n현재 잔액: *${balance} HERO*\n\n💡 새 사용자를 추천하여 더 많은 HERO를 얻을 수 있습니다!`,
    referralLink: (code, referralLink) => `🔗 *귀하의 추천 링크*\n\n링크:\n\`${referralLink}\`\n\n📋 추천 코드: \`${code}\`\n\n💡 이 링크를 공유하여 누군가 작업을 완료할 때마다 *10 HERO*를 받으세요!`,
    withdrawNotEnough: (balance, minAmount) => `❌ *출금 조건 미충족*\n\n💰 현재 잔액: *${balance} HERO*\n\n⚠️ 출금하려면 최소 *${minAmount} HERO*가 필요합니다.\n\n💡 친구를 초대하여 더 많은 HERO를 얻으세요!`,
    withdrawRequestAddress: (balance) => `⬆️ *출금*\n\n💰 잔액: *${balance} HERO*\n\n✅ 출금 자격이 있습니다!\n\n📥 지갑 주소를 입력하세요 (Ethereum/BSC):\n\n⚠️ 지갑 주소는 \`0x\`로 시작하고 42자여야 합니다.`,
    withdrawInvalidAddress: "❌ *유효하지 않은 지갑 주소*\n\n⚠️ 유효한 지갑 주소를 입력하세요 (Ethereum/BSC).\n\n📝 지갑 주소는:\n• \`0x\`로 시작\n• 정확히 42자\n• 숫자와 문자만 포함 (0-9, a-f, A-F)\n\n다시 시도해주세요:",
    withdrawRequestAmount: (balance, minAmount) => `💰 *출금할 HERO 금액 입력*\n\n💰 잔액: *${balance} HERO*\n\n⚠️ 최소 금액: *${minAmount} HERO*\n\n📝 출금할 HERO 금액을 입력하세요 (숫자만, 예: 1000, 5000, 10000):`,
    withdrawInvalidAmount: (balance, minAmount) => `❌ *유효하지 않은 HERO 금액*\n\n⚠️ 유효한 HERO 금액을 입력하세요:\n\n• 최소: *${minAmount} HERO*\n• 최대: *${balance} HERO*\n• 숫자만 (예: 1000, 5000)\n\n💰 현재 잔액: *${balance} HERO*\n\n다시 시도해주세요:`,
    withdrawSuccess: (amount, address, newBalance) => `✅ *출금 요청 제출됨*\n\n💰 금액: *${amount} HERO*\n📥 지갑 주소: \`${address}\`\n\n⏳ 시스템 처리 대기 중입니다. 완료되면 알림을 받게 됩니다.\n\n💰 남은 잔액: *${newBalance} HERO*`,
    withdrawCancelled: "❌ 출금 요청이 취소되었습니다."
  }
};

