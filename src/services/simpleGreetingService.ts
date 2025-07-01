
export const getTimeBasedGreeting = (firstName: string = 'there') => {
  const hour = new Date().getHours();
  
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17) {
    timeOfDay = 'evening';
  }
  
  const encouragements = [
    "Ready to turn ideas into reality? Let's make today productive! 🚀",
    "Your automation journey starts here. Time to build something amazing! ⚡",
    "Every great achievement begins with a single step. Let's automate! 🎯",
    "Success is built one automation at a time. You've got this! 💪",
    "Today's the day to streamline your workflow. Let's get started! ✨",
    "Transform your productivity with smart automation. Ready to excel! 🌟",
    "Efficiency meets innovation. Time to make things happen! 🔥",
    "Your automation empire awaits. Let's build the future! 🏗️"
  ];
  
  const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
  
  return {
    greeting: `Good ${timeOfDay}`,
    firstName,
    encouragement: randomEncouragement
  };
};
