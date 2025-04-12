import Fuse from 'fuse.js';

const fuseOptions = {
  keys: [
    'Activity type',
    'Activity name',
    'Doelgroep',
    'Domein / Intentie',
    'Beschrijving',
    'Tags',
    'Address',
    'organisatie'
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
    
    // Helper function to check if any field contains the value
    const fieldContains = (possibleFields, value) => {
      if (!value) return true; // No filter applied
      
      for (const field of possibleFields) {
        if (item[field] && item[field].toLowerCase().includes(value.toLowerCase())) {
          return true;
        }
      }
      return false;
    };
    
    // Helper function for exact match
    const fieldEquals = (possibleFields, value) => {
      if (!value) return true; // No filter applied
      
      for (const field of possibleFields) {
        if (item[field] && item[field].toLowerCase() === value.toLowerCase()) {
          return true;
        }
      }
      return false;
    };
    
    return (
      fieldEquals(['Shiva Categorie', 'Category', 'Categorie', 'Unnamed: 1'], filters.category) &&
      fieldContains(['Doelgroep', 'For Who', 'Voor wie'], filters.forWho) &&
      fieldEquals(['Kosten', 'How much?'], filters.cost) &&
      fieldContains(['Address', 'Where', 'Waar'], filters.location)
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