import Fuse from 'fuse.js';

const fuseOptions = {
  keys: [
    'What',
    'What specific',
    'For Who',
    'Why',
    'Unnamed: 7', // Description
    'Unnamed: 14', // Keywords
    'Where',
    'By who'
  ],
  threshold: 0.4, // Adjust for fuzziness (0 = exact match, 1 = very loose)
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2
};

export function searchActivities(query, data) {
  if (!query || !data || !Array.isArray(data)) return data || [];
  
  const fuse = new Fuse(data, fuseOptions);
  const searchResults = fuse.search(query);
  return searchResults.map(result => result.item);
}

export function filterActivities(filters, data) {
  if (!data || !Array.isArray(data)) return [];
  
  return data.filter(item => {
    if (!item) return false;
    
    return (
      (!filters.category || (item['Unnamed: 1'] && item['Unnamed: 1'].toLowerCase() === filters.category.toLowerCase())) &&
      (!filters.forWho || (item['For Who'] && item['For Who'].toLowerCase().includes(filters.forWho.toLowerCase()))) &&
      (!filters.cost || (item['How much?'] && item['How much?'].toLowerCase() === filters.cost.toLowerCase())) &&
      (!filters.location || (item['Where'] && item['Where'].toLowerCase().includes(filters.location.toLowerCase())))
    );
  });
}

export function searchAndFilter(query, filters, data) {
  if (!data || !Array.isArray(data)) return [];
  
  let results = query ? searchActivities(query, data) : data;
  if (Object.values(filters).some(val => val)) {
    results = filterActivities(filters, results);
  }
  return results;
}