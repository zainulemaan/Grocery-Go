async function translateText(text, targetLanguage) {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: 'en', // Source language
        target: targetLanguage
      })
    });
  
    if (!response.ok) {
      throw new Error('Translation failed');
    }
  
    const data = await response.json();
    return data.translatedText;
  }
  
  async function translateAllTexts(texts, targetLanguage) {
    const translatedTexts = {};
  
    for (const [key, text] of Object.entries(texts)) {
      try {
        translatedTexts[key] = await translateText(text, targetLanguage);
      } catch (error) {
        console.error(`Error translating ${key}:`, error);
        translatedTexts[key] = text; // fallback to original text if translation fails
      }
    }
  
    return translatedTexts;
  }
  
  // Example usage
  const textsToTranslate = {
    "welcome_message": "Welcome to GroceryGo",
    "hero_subtitle": "Your ultimate grocery shopping experience",
    // Add all other text keys here
  };
  
  translateAllTexts(textsToTranslate, 'ur').then(translations => {
    console.log('Translated texts:', translations);
    // You would then update the page with these translations
  });
  