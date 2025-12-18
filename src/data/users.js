const COLLEGES = [
  "Stanford University",
  "UCLA",
  "UC Berkeley",
  "NYU",
  "University of Michigan",
  "UT Austin",
  "Georgia Tech",
  "Carnegie Mellon",
  "USC",
  "Boston University"
];

const SKILLS = [
  "Design",
  "Product",
  "iOS",
  "React",
  "Data Science",
  "Marketing",
  "Photography",
  "UI/UX",
  "Writing",
  "Finance",
  "Music",
  "Film"
];

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickCollege() {
  return COLLEGES[randInt(0, COLLEGES.length - 1)];
}

function pickYear() {
  return YEARS[randInt(0, YEARS.length - 1)];
}

function pickSkills() {
  const count = Math.random() < 0.4 ? 1 : 2;
  const result = new Set();
  while (result.size < count) {
    result.add(SKILLS[randInt(0, SKILLS.length - 1)]);
  }
  return Array.from(result);
}

const MALE_NAMES = [
  "Aarav",
  "Ethan",
  "Liam",
  "Noah",
  "Arjun",
  "Rohan",
  "Lucas",
  "Mateo",
  "Jay",
  "Kian",
  "Owen",
  "Isaac",
  "Leo",
  "Mason",
  "Vihaan",
  "Aditya",
  "Nate",
  "Ryan",
  "Aiden",
  "Kabir",
  "Neil",
  "Dev",
  "Sam",
  "Jordan",
  "Eli",
  "Reid",
  "Caleb",
  "Ian",
  "Zane",
  "Aaron",
  "Ishaan",
  "Varun",
  "Ravi",
  "Kunal",
  "Rishi",
  "Arnav",
  "Pranav",
  "Rayan",
  "Ritik",
  "Arman",
  "Dhruv",
  "Reyansh",
  "Yash",
  "Vir",
  "Rohit",
  "Advik",
  "Vivaan",
  "Tejas",
  "Sid"
];

const FEMALE_NAMES = [
  "Anya",
  "Maya",
  "Zoe",
  "Leah",
  "Aanya",
  "Sara",
  "Emily",
  "Sophia",
  "Ava",
  "Olivia",
  "Chloe",
  "Isla",
  "Ariana",
  "Sienna",
  "Kiara",
  "Lila",
  "Riya",
  "Nyra",
  "Hannah",
  "Layla",
  "Meera",
  "Isha",
  "Nora",
  "Amy",
  "Alina",
  "Tara",
  "Jasmine",
  "Lana",
  "Mira",
  "Natasha",
  "Priya",
  "Neha",
  "Radhika",
  "Kavya",
  "Dhriti",
  "Ira",
  "Aditi",
  "Kaira"
];

// 60 male, 40 female
const users = [];

let idCounter = 1;

for (let i = 0; i < 60; i += 1) {
  const name = MALE_NAMES[i % MALE_NAMES.length];
  users.push({
    id: idCounter++,
    name,
    gender: "male",
    college: pickCollege(),
    year: pickYear(),
    age: randInt(18, 23),
    skills: pickSkills(),
    imageUrl: `https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=800&q=80`
  });
}

for (let i = 0; i < 40; i += 1) {
  const name = FEMALE_NAMES[i % FEMALE_NAMES.length];
  users.push({
    id: idCounter++,
    name,
    gender: "female",
    college: pickCollege(),
    year: pickYear(),
    age: randInt(18, 23),
    skills: pickSkills(),
    imageUrl: `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800&q=80`
  });
}

// Logged-in user is id 1 by convention, already in the list.

export const USERS = users;


