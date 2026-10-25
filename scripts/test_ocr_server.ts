import * as fs from 'fs';
import { processPrescriptionOcr } from '../src/server/ocrBackend';

async function main() {
  const imgPath = 'C:/Users/bhabe/.gemini/antigravity/brain/8238e3b5-6352-402f-a6d3-980332c1096f/.user_uploaded/media_1791873504936_3c954792.png';
  const base64Data = 'data:image/png;base64,' + fs.readFileSync(imgPath).toString('base64');

  console.log('Testing processPrescriptionOcr with real user prescription image...');
  const res = await processPrescriptionOcr({
    imageBase64: base64Data,
    language: 'en'
  });

  console.log('Result:');
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);
