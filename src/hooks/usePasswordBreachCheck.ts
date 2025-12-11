import { useState, useEffect, useCallback } from "react";

interface BreachCheckResult {
  isBreached: boolean;
  isChecking: boolean;
  breachCount: number | null;
}

// Uses Have I Been Pwned API with k-anonymity model
// Only sends first 5 chars of SHA-1 hash, never the full password
async function checkPasswordBreach(password: string): Promise<number> {
  if (!password || password.length < 4) return 0;
  
  // Convert password to SHA-1 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  
  // k-anonymity: only send first 5 chars
  const prefix = hashHex.substring(0, 5);
  const suffix = hashHex.substring(5);
  
  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        "Add-Padding": "true", // Prevents response size analysis
      },
    });
    
    if (!response.ok) return 0;
    
    const text = await response.text();
    const lines = text.split("\n");
    
    for (const line of lines) {
      const [hashSuffix, count] = line.split(":");
      if (hashSuffix.trim() === suffix) {
        return parseInt(count.trim(), 10);
      }
    }
    
    return 0;
  } catch {
    // Fail silently - don't block signup if API is unavailable
    return 0;
  }
}

export function usePasswordBreachCheck(password: string, debounceMs: number = 500): BreachCheckResult {
  const [isBreached, setIsBreached] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [breachCount, setBreachCount] = useState<number | null>(null);

  const checkPassword = useCallback(async (pwd: string) => {
    if (!pwd || pwd.length < 4) {
      setIsBreached(false);
      setBreachCount(null);
      setIsChecking(false);
      return;
    }
    
    setIsChecking(true);
    const count = await checkPasswordBreach(pwd);
    setBreachCount(count);
    setIsBreached(count > 0);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkPassword(password);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [password, debounceMs, checkPassword]);

  return { isBreached, isChecking, breachCount };
}
