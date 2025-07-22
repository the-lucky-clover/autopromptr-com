
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
    "Your automation empire awaits. Let's build the future! 🏗️",
    "Discipline is the bridge between goals and accomplishment. - Jim Rohn",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Success is nothing more than a few simple disciplines practiced every day. - Jim Rohn",
    "You don't have to be great to get started, but you have to get started to be great. - Les Brown",
    "Procrastination is the thief of time. - Edward Young",
    "A year from now you may wish you had started today. - Karen Lamb",
    "The secret to getting ahead is getting started. - Mark Twain",
    "Don't put off tomorrow what you can do today. - Benjamin Franklin",
    "Hard work beats talent when talent doesn't work hard. - Tim Notke",
    "The only impossible journey is the one you never begin. - Tony Robbins",
    "Excellence is not a skill, it's an attitude. - Ralph Marston",
    "Success isn't given. It's earned in the gym, on the field, in every difficult decision. - Unknown",
    "Discipline is choosing between what you want now and what you want most. - Abraham Lincoln",
    "The pain of discipline weighs ounces while the pain of regret weighs tons. - Jim Rohn",
    "Do something today that your future self will thank you for. - Sean Patrick Flanery",
    "The time for action is now. It's never too late to do something. - Antoine de Saint-Exupéry",
    "Your limitation—it's only your imagination. Stop making excuses and start making progress.",
    "Great things never come from comfort zones. Push yourself to achieve more.",
    "Dream it. Wish it. Do it. Action is the foundational key to all success.",
    "Success is the sum of small efforts repeated day in and day out. - Robert Collier",
    "The difference between ordinary and extraordinary is that little extra. - Jimmy Johnson",
    "Motivation gets you started. Habit keeps you going. - Jim Ryun"
  ];
  
  const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
  
  return {
    greeting: `Good ${timeOfDay}`,
    firstName,
    encouragement: randomEncouragement
  };
};
