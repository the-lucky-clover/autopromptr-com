
interface Greeting {
  text: string;
  language: string;
  languageName: string;
}

export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

export const getMultilingualGreetings = (name: string = "there", timeOfDay: string): Greeting[] => {
  const greetings: Greeting[] = [
    {
      text: `Good ${timeOfDay}, ${name}! Ready to automate your way to success? 💰`,
      language: 'en',
      languageName: 'English'
    },
    {
      text: `¡Buen${timeOfDay === 'morning' ? 'os días' : timeOfDay === 'afternoon' ? 'as tardes' : 'as noches'}, ${name}! ¿Listo para automatizar tu camino al éxito? 💰`,
      language: 'es',
      languageName: 'Español'
    },
    {
      text: `Bon${timeOfDay === 'morning' ? 'jour' : 'soir'}, ${name}! Prêt à automatiser votre chemin vers le succès? 💰`,
      language: 'fr',
      languageName: 'Français'
    },
    {
      text: `Guten ${timeOfDay === 'morning' ? 'Morgen' : timeOfDay === 'afternoon' ? 'Tag' : 'Abend'}, ${name}! Bereit, Ihren Weg zum Erfolg zu automatisieren? 💰`,
      language: 'de',
      languageName: 'Deutsch'
    },
    {
      text: `Buon${timeOfDay === 'morning' ? 'giorno' : 'asera'}, ${name}! Pronti ad automatizzare la strada verso il successo? 💰`,
      language: 'it',
      languageName: 'Italiano'
    },
    {
      text: `おはよう${timeOfDay === 'morning' ? 'ございます' : timeOfDay === 'afternoon' ? 'こんにちは' : 'こんばんは'}, ${name}さん！成功への道を自動化する準備はできていますか？💰`,
      language: 'ja',
      languageName: '日本語'
    }
  ];

  return greetings;
};

export const getRandomGreeting = (name: string = "there", preferredLanguage: string = 'en'): Greeting => {
  const timeOfDay = getTimeBasedGreeting();
  const greetings = getMultilingualGreetings(name, timeOfDay);
  
  // Try to find preferred language, fallback to random
  const preferredGreeting = greetings.find(g => g.language === preferredLanguage);
  if (preferredGreeting && Math.random() > 0.3) { // 70% chance to use preferred language
    return preferredGreeting;
  }
  
  // 30% chance to use random language for variety
  return greetings[Math.floor(Math.random() * greetings.length)];
};
