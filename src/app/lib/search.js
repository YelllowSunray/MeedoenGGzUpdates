import Fuse from 'fuse.js';

const fuseOptions = {
  keys: [
    { name: 'Shiva Categorie', weight: 0.7 },
    { name: 'Doelgroep', weight: 0.6 },
    { name: 'Domein / Intentie', weight: 0.7 },
    { name: 'Activity type', weight: 0.8 },
    { name: 'Activity name', weight: 0.9 },
    { name: 'Activiteit long', weight: 0.9 },
    { name: 'Beschrijving', weight: 0.8 },
    { name: 'Address', weight: 0.5 },
    { name: 'organisatie', weight: 0.6 },
    { name: 'website', weight: 0.4 },
    { name: 'Contact', weight: 0.4 },
    { name: 'Wanneer? Hoe laat?', weight: 0.5 }
  ],
  threshold: 0.2,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
  useExtendedSearch: true,
  shouldSort: true,
  distance: 100,
  findAllMatches: true
};

export function searchActivities(query, data) {
  if (!query || !data || !Array.isArray(data)) return data || [];
  
  const words = query.toLowerCase().split(/\s+/);
  const fuse = new Fuse(data, fuseOptions);
  
  const allResults = new Set();
  words.forEach(word => {
    const results = fuse.search(word);
    results.forEach(result => {
      allResults.add(result.item);
      console.log('Match found:', {
        item: result.item['Activity name'] || result.item['Activiteit long'],
        score: result.score,
        matchedFields: Object.keys(result.item).filter(key => 
          result.item[key] && 
          result.item[key].toString().toLowerCase().includes(word)
        )
      });
    });
  });
  
  console.log('Search results for query:', query, Array.from(allResults));
  return Array.from(allResults);
}

export function filterActivities(filters, data) {
  if (!data || !Array.isArray(data)) {
    console.log('No data provided to filterActivities');
    return [];
  }
  
  console.log('Filtering with:', filters);
  console.log('Total items to filter:', data.length);
  
  // Debug: Log the first few items' structure
  if (data.length > 0) {
    console.log('First 3 items structure:', data.slice(0, 3));
    console.log('Available fields in first item:', Object.keys(data[0]));
  }
  
  const filteredData = data.filter(item => {
    if (!item) return false;
    
    // Debug: Log the category value when filtering
    if (filters.category) {
      console.log('Looking for category:', filters.category);
      console.log('Item category value:', item['Shiva Categorie']);
      console.log('Item:', item);
    }
    
    // Helper function to check if any field contains the value
    const fieldContains = (field, value) => {
      if (!value) return true; // No filter applied
      if (!item[field]) {
        console.log(`Field ${field} not found in item`);
        return false;
      }
      const contains = item[field].toLowerCase().includes(value.toLowerCase());
      console.log(`Checking ${field}: "${item[field]}" contains "${value}"? ${contains}`);
      return contains;
    };
    
    // Helper function for exact match
    const fieldEquals = (field, value) => {
      if (!value) return true; // No filter applied
      if (!item[field]) {
        console.log(`Field ${field} not found in item`);
        return false;
      }
      const equals = item[field].toLowerCase() === value.toLowerCase();
      console.log(`Checking ${field}: "${item[field]}" equals "${value}"? ${equals}`);
      return equals;
    };

    // Helper function to check activity type
    const checkActivityType = (item, type) => {
      if (!type) return true; // No filter applied
      
      const activityName = item['Activity name'] || item['Activiteit long'] || '';
      const description = item['Beschrijving'] || '';
      
      if (!activityName && !description) return false;
      
      // Map activity types to their corresponding filter values
      const typeMappings = {
        'ontmoeting': ['ontmoeting', 'ontmoeten', 'sociaal', 'huiskamer', 'koffie', 'thee', 'maatje', 'sociaal isolement', 'gezelschap', 'samen'],
        'spelletjes': ['spelletjes', 'kaart', 'sjoelen', 'koersbal', 'darten', 'spel', 'bordspel', 'kaarten'],
        'wandelen': ['wandelen', 'wandeling', 'lopen', 'wandelt', 'wandelingen'],
        'eten': ['eten', 'koken', 'bakken', 'culinair', 'maaltijd', 'lunch', 'diner', 'koffie', 'thee'],
        'creatief': ['creatief', 'schilderen', 'tekenen', 'knutselen', 'handwerken', 'maken', 'creëren']
      };
      
      const matchingTypes = typeMappings[type] || [];
      
      // Check activity name and description
      const activityNameLower = activityName.toLowerCase();
      const descriptionLower = description.toLowerCase();
      
      return matchingTypes.some(t => 
        activityNameLower.includes(t) || 
        descriptionLower.includes(t)
      );
    };
    
    return (
      fieldContains('Doelgroep', filters.targetAudience) &&
      fieldContains('Kosten', filters.cost) &&
      fieldEquals('Shiva Categorie', filters.category) &&
      checkActivityType(item, filters.activityType)
    );
  });

  return filteredData;
}

export function searchAndFilter(query, filters, data) {
  if (!data || !Array.isArray(data)) {
    console.log('No data provided to searchAndFilter');
    return [];
  }

  console.log('Searching with query:', query);
  console.log('Filtering with:', filters);
  console.log('Total items to search:', data.length);

  // First apply filters
  let filteredData = filterActivities(filters, data);
  console.log('Items after filtering:', filteredData.length);

  // Then apply search query if present
  if (query) {
    filteredData = searchActivities(query, filteredData);
    console.log('Items after search:', filteredData.length);
  }

  return filteredData;
}

// Function to analyze activity types
export function analyzeActivityTypes(data) {
  if (!data || !Array.isArray(data)) return [];
  
  const activityTypeCounts = {};
  
  data.forEach(item => {
    const activityName = item['What specific'] || item['What'];
    const tags = item['Unnamed: 14'];
    
    if (activityName) {
      const normalizedType = activityName.toLowerCase().trim();
      activityTypeCounts[normalizedType] = (activityTypeCounts[normalizedType] || 0) + 1;
    }
    
    if (tags) {
      const tagTypes = tags.split(',').map(t => t.toLowerCase().trim());
      tagTypes.forEach(type => {
        activityTypeCounts[type] = (activityTypeCounts[type] || 0) + 1;
      });
    }
  });
  
  return Object.entries(activityTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));
}