/**
 * NirogCare Server - PII (Personally Identifiable Information) Stripper
 * Sanitizes sensitive identifiers before prompts are sent to external LLMs.
 */

export function stripPII(text: string): { cleanText: string; strippedCount: number } {
  let cleanText = text;
  let count = 0;

  // 1. Indian Mobile Phone Numbers (+91, 0, or 10-digit formats)
  const phoneRegex = /(\+91[\s-]?)?[6789]\d{9}\b|(\b\d{3}[-\s]\d{3}[-\s]\d{4}\b)/g;
  cleanText = cleanText.replace(phoneRegex, () => {
    count++;
    return '[REDACTED_PHONE]';
  });

  // 2. Aadhaar numbers (12-digits, often formatted as 4-4-4)
  const aadhaarRegex = /\b\d{4}\s\d{4}\s\d{4}\b|\b\d{12}\b/g;
  cleanText = cleanText.replace(aadhaarRegex, (match) => {
    // Only redact if looks like Aadhaar sequence
    if (match.replace(/\s/g, '').length === 12) {
      count++;
      return '[REDACTED_AADHAAR]';
    }
    return match;
  });

  // 3. Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  cleanText = cleanText.replace(emailRegex, () => {
    count++;
    return '[REDACTED_EMAIL]';
  });

  // 4. Common Indian Name introductions: "My name is X", "Mera naam X hai", "Moi [Name]"
  const nameIntroRegex = /\b(my name is|i am|mera naam|naam hai|mor naam)\s+([A-Za-z]{3,20}(\s+[A-Za-z]{3,20})?)\b/gi;
  cleanText = cleanText.replace(nameIntroRegex, (match, prefix) => {
    count++;
    return `${prefix} [REDACTED_NAME]`;
  });

  return { cleanText, strippedCount: count };
}
