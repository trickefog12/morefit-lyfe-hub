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

// Greek profanity list (common offensive words in Greek with variants)
const greekProfanity = [
  // Main profanity with variants
  'γαμώ', 'γαμω', 'γαμημένο', 'γαμημενο', 'γαμημένη', 'γαμημενη', 'γάμα', 'γαμα', 'γαμήσου', 'γαμησου',
  'σκατά', 'σκατα', 'σκατό', 'σκατο', 'σκατένιος', 'σκατενιος',
  'μαλάκας', 'μαλακας', 'μαλάκα', 'μαλακα', 'μαλακία', 'μαλακια', 'μαλακίες', 'μαλακιες', 'μαλακισμένος', 'μαλακισμενος',
  'πουτάνα', 'πουτανα', 'πουτάνας', 'πουτανας', 'πουτανιά', 'πουτανια',
  'πούστης', 'πουστης', 'πούστη', 'πουστη', 'πουστιά', 'πουστια',
  'καριόλης', 'καριολης', 'καριόλα', 'καριολα', 'καριόλι', 'καριολι',
  'μουνί', 'μουνι', 'μουνάρα', 'μουναρα',
  'πούτσα', 'πουτσα', 'πούτσο', 'πουτσο',
  'αρχίδι', 'αρχιδι', 'αρχίδια', 'αρχιδια', 'αρχιδάτος', 'αρχιδατος',
  'βλάκας', 'βλακας', 'βλακεία', 'βλακεια',
  'ηλίθιος', 'ηλιθιος', 'ηλίθια', 'ηλιθια', 'ηλιθιότητα', 'ηλιθιοτητα',
  'κερατάς', 'κερατας', 'κέρατο', 'κερατο',
  'παλιο', 'παλιά', 'παλια', 'παλιόμουνο', 'παλιομουνο', 'παλιοπούστης', 'παλιοπουστης',
  'βρωμιάρη', 'βρωμιαρη', 'βρωμιάρης', 'βρωμιαρης', 'βρωμιά', 'βρωμια',
  'σιχαμένος', 'σιχαμενος', 'σιχαμένη', 'σιχαμενη', 'σιχαμάρα', 'σιχαμαρα',
  'άχρηστος', 'αχρηστος', 'άχρηστη', 'αχρηστη',
  'χαζός', 'χαζος', 'χαζή', 'χαζη', 'χαζομάρα', 'χαζομαρα',
  'βλαμμένος', 'βλαμμενος', 'βλαμμένη', 'βλαμμενη',
  'τρελός', 'τρελος', 'τρελή', 'τρελη',
  'ψυχοπαθής', 'ψυχοπαθης', 'ψυχάκιας', 'ψυχακιας',
  'απατεώνας', 'απατεωνας', 'απάτη', 'απατη',
  'κλέφτης', 'κλεφτης', 'κλέφτρα', 'κλεφτρα',
  // Additional common offensive terms
  'κωλο', 'κώλος', 'κωλος', 'κωλόπαιδο', 'κωλοπαιδο',
  'μπάσταρδος', 'μπασταρδος', 'μπαστάρδα', 'μπασταρδα',
  'ζώο', 'ζωο', 'ζώα', 'ζωα',
  'κοπρίτης', 'κοπριτης', 'κοπριά', 'κοπρια',
  'βρομιάρη', 'βρομιαρη', 'βρόμα', 'βρομα'
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
