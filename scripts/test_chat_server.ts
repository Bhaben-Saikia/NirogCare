import { processHealthChat } from '../src/server/geminiBackend';

async function main() {
  console.log('Testing processHealthChat with Gemini backend...');
  const res = await processHealthChat({
    message: 'I have had a mild headache and fever since yesterday, what should I do?',
    language: 'en-IN'
  });

  console.log('Is Emergency:', res.isEmergency);
  console.log('Language Code:', res.languageCode);
  console.log('Reply:\n', res.reply);
}

main().catch(console.error);
