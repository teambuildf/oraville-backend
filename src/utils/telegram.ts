import crypto from 'crypto';

/**
 * Validates Telegram Mini App initData according to Telegram's security requirements
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return false;
    }

    // Remove hash from params
    urlParams.delete('hash');
    
    // Sort parameters alphabetically
    const dataCheckArray: string[] = [];
    Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, value]) => {
        dataCheckArray.push(`${key}=${value}`);
      });
    
    const dataCheckString = dataCheckArray.join('\n');
    
    // Create secret key from bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating Telegram initData:', error);
    return false;
  }
}

/**
 * Parses user data from Telegram initData
 */
export function parseTelegramUser(initData: string): {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
} | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (!userParam) {
      return null;
    }
    
    return JSON.parse(userParam);
  } catch (error) {
    console.error('Error parsing Telegram user:', error);
    return null;
  }
}
