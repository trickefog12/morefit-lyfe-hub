import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// English profanity list (common offensive words)
const englishProfanity = [
  'fuck', 'shit', 'ass', 'bitch', 'bastard', 'damn', 'crap', 'dick', 'cock', 
  'pussy', 'cunt', 'whore', 'slut', 'fag', 'nigger', 'nigga', 'retard', 
  'idiot', 'moron', 'stupid', 'dumb', 'kill', 'die', 'hate', 'racist',
  'asshole', 'motherfucker', 'bullshit', 'piss', 'prick', 'wanker',
  'twat', 'bollocks', 'arse', 'bugger', 'bloody', 'scam', 'fraud', 'fake'
];

// Greek profanity list (common offensive words in Greek)
const greekProfanity = [
  'γαμώ', 'γαμημένο', 'γαμημένη', 'σκατά', 'μαλάκας', 'μαλάκα', 'πουτάνα',
  'πούστης', 'πούστη', 'καριόλης', 'καριόλα', 'μουνί', 'πούτσα', 'αρχίδι',
  'αρχίδια', 'βλάκας', 'ηλίθιος', 'ηλίθια', 'κερατάς', 'παλιο', 'παλιά',
  'βρωμιάρη', 'σιχαμένος', 'σιχαμένη', 'άχρηστος', 'άχρηστη', 'χαζός', 'χαζή',
  'βλαμμένος', 'βλαμμένη', 'τρελός', 'ψυχοπαθής', 'απατεώνας', 'κλέφτης'
];

// Common l33t speak substitutions
const leetSubstitutions: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', 
  '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i'
};

// Normalize text for comparison (handle l33t speak, spacing tricks)
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  
  // Replace l33t speak characters
  for (const [leet, char] of Object.entries(leetSubstitutions)) {
    normalized = normalized.split(leet).join(char);
  }
  
  // Remove spaces between letters (to catch "f u c k" style evasion)
  normalized = normalized.replace(/\s+/g, '');
  
  // Remove repeated characters (to catch "fuuuuck" style)
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');
  
  return normalized;
}

// Check for spam patterns
function hasSpamPatterns(text: string): boolean {
  // Excessive caps (more than 70% uppercase in text longer than 10 chars)
  const alphaChars = text.replace(/[^a-zA-Zα-ωΑ-Ω]/g, '');
  if (alphaChars.length > 10) {
    const upperCount = (alphaChars.match(/[A-ZΑ-Ω]/g) || []).length;
    if (upperCount / alphaChars.length > 0.7) {
      return true;
    }
  }
  
  // Excessive repeated characters (more than 5 of the same character)
  if (/(.)\1{5,}/i.test(text)) {
    return true;
  }
  
  return false;
}

// Check if text contains profanity
function containsProfanity(text: string): { found: boolean; reason?: string } {
  const normalized = normalizeText(text);
  const originalLower = text.toLowerCase();
  
  // Check English profanity
  for (const word of englishProfanity) {
    if (normalized.includes(word) || originalLower.includes(word)) {
      return { found: true, reason: 'inappropriate_language' };
    }
  }
  
  // Check Greek profanity
  for (const word of greekProfanity) {
    if (normalized.includes(word) || originalLower.includes(word)) {
      return { found: true, reason: 'inappropriate_language' };
    }
  }
  
  // Check for spam patterns
  if (hasSpamPatterns(text)) {
    return { found: true, reason: 'spam_pattern' };
  }
  
  return { found: false };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { comment } = await req.json();
    
    if (!comment || typeof comment !== 'string') {
      return new Response(
        JSON.stringify({ approved: false, reason: 'invalid_input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = containsProfanity(comment);
    
    if (result.found) {
      return new Response(
        JSON.stringify({ approved: false, reason: result.reason }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ approved: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ approved: false, reason: 'server_error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
