/** "Year.4 Term.1 - 2026 Fall" → { stage: "Year 4 · Term 1", season: "Fall 2026" } */
export function parseSemesterName(name: string) {
  const match = /Year\.?\s*(\d+)\s*Term\.?\s*(\d+)\s*-\s*(\d{4})\s+(\w+)/i.exec(name);
  if (!match) return { stage: "", season: name };
  const [, year, term, calendarYear, season] = match;
  return { stage: `Year ${year} · Term ${term}`, season: `${season} ${calendarYear}` };
}
