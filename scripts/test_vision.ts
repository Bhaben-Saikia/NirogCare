import * as fs from 'fs';

async function test() {
  const imgPath = 'C:/Users/bhabe/.gemini/antigravity/brain/8238e3b5-6352-402f-a6d3-980332c1096f/.user_uploaded/media_1791873504936_3c954792.png';
  const buffer = fs.readFileSync(imgPath);
  const base64Data = buffer.toString('base64');
  const apiKey = process.env.GEMINI_API_KEY || '';

  const prompt = `You are a medical OCR specialist. Accurately transcribe and extract all clinical information from this prescription image:
1. Patient Name and age if visible
2. Doctor Name / clinic if visible
3. Date
4. All Prescribed Medicines: name with strength (e.g. Augmentin 625mg), dosage form (Tablet/Syrup/etc), dosage timing/frequency (e.g. 1-0-1 or twice daily), duration (e.g. 5 days), food instructions (before/after meals).
5. Non-pharmacological Advice / instructions (e.g. gargles, inhalation).

Return strictly a JSON object:
{
  "rawText": "full transcribed text from top to bottom",
  "doctorName": "doctor name or null",
  "patientName": "patient name or null",
  "date": "date or null",
  "medicines": [
    {
      "name": "Augmentin 625mg",
      "dosage": "1 tablet",
      "frequency": "1-0-1 (Twice daily)",
      "duration": "5 days",
      "instructions": "After meals",
      "confidence": 0.95,
      "type": "Antibiotic"
    }
  ],
  "notes": "Advice and instructions"
}`;

  console.log('Sending prescription image to Gemini Flash Vision...');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/png', data: base64Data } }
        ]
      }]
    })
  });

  console.log('Status:', res.status);
  const data = await res.json() as any;
  if (!res.ok) {
    console.error('Error:', JSON.stringify(data, null, 2));
    return;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('Gemini Extraction:');
  console.log(text);
}

test().catch(console.error);
