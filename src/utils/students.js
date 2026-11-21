// Convert graduation year to class standing
export function classStanding(graduationYear, now = new Date()) {
  // The school year ends next calendar year once August arrives.
  const schoolYearEnds = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
  const yearsLeft = Number(graduationYear) - schoolYearEnds;

  if (yearsLeft < 0) return "Graduate";
  if (yearsLeft === 0) return "Senior";
  if (yearsLeft === 1) return "Junior";
  if (yearsLeft === 2) return "Sophomore";
  return "Freshman";
}

// Convert API user into shape <StudentCard> expects
export function toCardShape(user) {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    year: `Class of ${user.graduationYear}`,
    standing: classStanding(user.graduationYear),
    major: user.major,
    bio: user.bio,
    profilePicture: user.profilePicture || "",
    halls: user.diningHalls,
    foods: user.favoriteFoods,
  };
}