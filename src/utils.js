// Generate unique referral code
export function generateReferralCode(telegramId) {
  // Use last 8 digits of telegram_id + random 4 digits
  const idPart = String(telegramId).slice(-8);
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REF${idPart}${randomPart}`.toUpperCase();
}

// Validate Ethereum/BSC wallet address
export function isValidWalletAddress(address) {
  if (!address || typeof address !== 'string') return false;
  
  // Remove whitespace
  address = address.trim();
  
  // Check if it's a valid Ethereum address format (0x followed by 40 hex characters)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
}

// Generate BNB amount for payment (fixed 0.1 BNB)
export function generateUniqueAmount() {
  return 0.1;
}
  