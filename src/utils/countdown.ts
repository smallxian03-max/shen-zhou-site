export function getNextBirthdayCountdown(birthdayMMDD: string): number {
  const today = new Date();
  const thisYear = today.getFullYear();
  const [month, day] = birthdayMMDD.split("-").map(Number);
  
  // This year's birthday
  const thisYearBirthday = new Date(thisYear, month - 1, day);
  
  if (thisYearBirthday >= today) {
    // Not yet passed
    return Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    // Passed, use next year
    const nextYearBirthday = new Date(thisYear + 1, month - 1, day);
    return Math.ceil((nextYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
}

export function getEventCountdown(eventDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  return Math.ceil((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
