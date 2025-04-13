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

    // Helper function to check activity type
    const checkActivityType = (item, type) => {
      if (!type) return true; // No filter applied
      
      const activityTypeFields = ['Activity type', 'What', 'Wat', 'Activiteit'];
      const itemType = item[activityTypeFields.find(field => item[field]) || ''];
      const tags = item['Tags'] || '';
      
      if (!itemType && !tags) return false;
      
      // Map activity types to their corresponding filter values
      const typeMappings = {
        'sport': ['sport', 'voetbal', 'tennis', 'zwemmen', 'hardlopen', 'koersbal', 'darten'],
        'ontmoeting': ['ontmoeting', 'ontmoeten', 'sociaal', 'huiskamer', 'koffie', 'thee', 'maatje', 'sociaal isolement'],
        'spelletjes': ['spelletjes', 'kaart', 'sjoelen', 'koersbal', 'darten', 'spel'],
        'wandelen': ['wandelen', 'wandeling', 'lopen'],
        'eten': ['eten', 'koken', 'bakken', 'culinair', 'maaltijd', 'lunch'],
        'creatief': ['creatief', 'schilderen', 'tekenen', 'knutselen', 'handwerken']
      };
      
      const matchingTypes = typeMappings[type] || [];
      
      // Check both the activity type and tags
      const itemTypeLower = itemType ? itemType.toLowerCase() : '';
      const tagsLower = tags.toLowerCase();
      
      return matchingTypes.some(t => 
        itemTypeLower.includes(t) || 
        tagsLower.includes(t)
      );
    };
    
    return (
      fieldEquals(['Shiva Categorie', 'Category', 'Categorie', 'Unnamed: 1'], filters.category) &&
      fieldContains(['Doelgroep', 'For Who', 'Voor wie'], filters.forWho) &&
      fieldEquals(['Kosten', 'How much?'], filters.cost) &&
      fieldContains(['Address', 'Where', 'Waar'], filters.location) &&
      checkActivityType(item, filters.activityType)
    );
  });
}

export function searchAndFilter(query, filters, data) {
  if (!data || !Array.isArray(data)) {
    console.warn('Invalid data provided to searchAndFilter');
    return [];
  }

  return data.filter(item => {
    // Check activity type first
    if (filters.activityType && !checkActivityType(item, filters.activityType)) {
      return false;
    }

    // Check time filter
    if (filters.time) {
      const itemTime = item['Tijd'] || item['Time'] || '';
      if (!itemTime.toLowerCase().includes(filters.time.toLowerCase())) {
        return false;
      }
    }

    // Check category filter
    if (filters.category) {
      const itemCategory = item['Shiva Categorie'] || item['Category'] || item['Categorie'] || item['Unnamed: 1'] || '';
      if (!itemCategory.toLowerCase().includes(filters.category.toLowerCase())) {
        return false;
      }
    }

    // Check search query
    if (query) {
      const searchFields = [
        item['What'] || '',
        item['Where'] || '',
        item['When'] || '',
        item['How much?'] || '',
        item['For Who'] || '',
        item['Shiva Categorie'] || '',
        item['Category'] || '',
        item['Categorie'] || '',
        item['Unnamed: 1'] || '',
        item['Tijd'] || '',
        item['Time'] || ''
      ];
      
      const searchText = searchFields.join(' ').toLowerCase();
      if (!searchText.includes(query.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

// Function to analyze activity type frequency
export function analyzeActivityTypes(data) {
  if (!data || !Array.isArray(data)) return [];
  
  const activityTypeCounts = {};
  
  data.forEach(item => {
    const activityTypeFields = ['Activity type', 'What', 'Wat', 'Activiteit'];
    const itemType = item[activityTypeFields.find(field => item[field]) || ''];
    
    if (itemType) {
      const normalizedType = itemType.toLowerCase().trim();
      activityTypeCounts[normalizedType] = (activityTypeCounts[normalizedType] || 0) + 1;
    }
  });
  
  // Convert to array and sort by frequency
  return Object.entries(activityTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));
}

// Updated type mappings based on most frequent activity types
const typeMappings = {
  'sport': ['sport', 'voetbal', 'tennis', 'zwemmen', 'hardlopen', 'koersbal', 'darten'],
  'ontmoeting': ['ontmoeting', 'ontmoeten', 'sociaal', 'huiskamer', 'koffie', 'thee', 'maatje', 'sociaal isolement'],
  'spelletjes': ['spelletjes', 'kaart', 'sjoelen', 'koersbal', 'darten', 'spel'],
  'wandelen': ['wandelen', 'wandeling', 'lopen'],
  'eten': ['eten', 'koken', 'bakken', 'culinair', 'maaltijd', 'lunch'],
  'creatief': ['creatief', 'schilderen', 'tekenen', 'knutselen', 'handwerken']
};

// Helper function to check activity type
const checkActivityType = (item, type) => {
  if (!type) return true; // No filter applied
  
  const activityTypeFields = ['Activity type', 'What', 'Wat', 'Activiteit'];
  const itemType = item[activityTypeFields.find(field => item[field]) || ''];
  const tags = item['Tags'] || '';
  
  if (!itemType && !tags) return false;
  
  const matchingTypes = typeMappings[type] || [];
  
  // Check both the activity type and tags
  const itemTypeLower = itemType ? itemType.toLowerCase() : '';
  const tagsLower = tags.toLowerCase();
  
  return matchingTypes.some(t => 
    itemTypeLower.includes(t) || 
    tagsLower.includes(t)
  );
};