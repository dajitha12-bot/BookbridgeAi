const CATEGORIES = [
  'Programming',
  'Artificial Intelligence',
  'Database',
  'Web Development',
  'Operating Systems',
  'Computer Networks',
  'Mathematics',
  'Management',
  'Novels',
  'Competitive Exams'
];

export async function getAllCategories(): Promise<string[]> {
  return CATEGORIES;
}
