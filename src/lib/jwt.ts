/**
 * JWT Token'ı parse eder ve claims'leri döndürür
 */
export function parseJwtToken(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Token parse hatası:', error);
    return null;
  }
}

/**
 * Token'dan kullanıcı adını (name claim) al
 */
export function getNameFromToken(token: string): string | null {
  const payload = parseJwtToken(token);
  if (!payload) return null;
  
  return payload.name || null;
}

/**
 * Token'dan kullanıcı ID'sini (sub claim) al
 */
export function getSubFromToken(token: string): string | null {
  const payload = parseJwtToken(token);
  if (!payload) return null;
  
  return payload.sub || null;
}
