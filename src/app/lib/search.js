import Fuse from 'fuse.js';

const fuseOptions = {
  keys: [
    { name: 'Activity name', weight: 0.9 },
    { name: 'Activiteit long', weight: 0.8 },
    { name: 'Beschrijving', weight: 0.7 },
    { name: 'Tags', weight: 0.6 },
    { name: 'Document Categorie', weight: 0.5 },
    { name: 'Doelgroep', weight: 0.4 },
    { name: 'Domein / Intentie', weight: 0.3 },
    { name: 'Activity type', weight: 0.2 }
  ],
  threshold: 0.3,
  distance: 100,
  includeScore: true,
  findAllMatches: true,
  useExtendedSearch: true
};

// Map of domains to their subcategories
const domainSubcategories = {
  'Verbinding & Co-regulatie': [
    'Ontmoetingsplekken',
    'Maatjesprojecten',
    'Groepsbijeenkomsten',
    'Buurthulp / informele zorg'
  ],
  'Lichaamsritme & Vitaliteit': [
    'Sport & beweging',
    'Wandelen & buitenlucht',
    'Samen koken / eten',
    'Slaap & herstel',
    'Mindfulness / meditatie'
  ],
  'Expressie & Zelfregie': [
    'Creatieve workshops',
    'Schrijven / muziek / tekenen',
    'Zelfhulp tools (WRAP, apps)',
    'Persoonlijke reflectie'
  ],
  'Voorziening & Stabiliteit': [
    'Woonbegeleiding',
    'Geld & administratie',
    'Digitale vaardigheden',
    'Praktische klussen',
    'Vervoer / mobiliteit'
  ],
  'Crisis & Overgangsbegeleiding': [
    'Opvang / nachtopvang',
    'Outreach / soepbus',
    'Verslavingszorg',
    'Forensische zorg',
    'Acute GGZ hulp'
  ],
  'Zingeving & Structuur': [
    'Vrijwilligerswerk',
    'Daginvulling / ritme',
    'Herstelcursussen (WRAP, etc.)',
    'Werken met eigen ervaring',
    'Re-integratie / werktrajecten'
  ]
};

// Keywords associated with each subcategory
const subcategoryKeywords = {
  'Ontmoetingsplekken': ['ontmoeting', 'inloop', 'koffie', 'thee', 'samen'],
  'Maatjesprojecten': ['maatje', 'maatjes', 'buddy', 'buddyproject'],
  'Groepsbijeenkomsten': ['groep', 'groepsbijeenkomst', 'bijeenkomst', 'samen'],
  'Buurthulp / informele zorg': ['buurthulp', 'informele zorg', 'buren', 'hulp'],
  'Sport & beweging': ['sport', 'beweging', 'fitness', 'sporten'],
  'Wandelen & buitenlucht': ['wandelen', 'buitenlucht', 'natuur', 'wandeling'],
  'Samen koken / eten': ['koken', 'eten', 'maaltijd', 'kookclub'],
  'Slaap & herstel': ['slaap', 'herstel', 'rust', 'ontspanning'],
  'Mindfulness / meditatie': ['mindfulness', 'meditatie', 'yoga', 'ontspanning'],
  'Creatieve workshops': ['creatief', 'workshop', 'kunst', 'maken'],
  'Schrijven / muziek / tekenen': ['schrijven', 'muziek', 'tekenen', 'creatief'],
  'Zelfhulp tools (WRAP, apps)': ['WRAP', 'app', 'zelfhulp', 'tool'],
  'Persoonlijke reflectie': ['reflectie', 'persoonlijk', 'ontwikkeling'],
  'Woonbegeleiding': ['woonbegeleiding', 'wonen', 'begeleiding'],
  'Geld & administratie': ['geld', 'administratie', 'financiën'],
  'Digitale vaardigheden': ['digitaal', 'computer', 'internet', 'vaardigheden'],
  'Praktische klussen': ['klus', 'praktisch', 'doe-het-zelf'],
  'Vervoer / mobiliteit': ['vervoer', 'mobiliteit', 'reizen'],
  'Opvang / nachtopvang': ['opvang', 'nacht', 'crisis'],
  'Outreach / soepbus': ['outreach', 'soepbus', 'straat'],
  'Verslavingszorg': ['verslaving', 'verslavingszorg', 'afkicken'],
  'Forensische zorg': ['forensisch', 'justitie', 'reclassering'],
  'Acute GGZ hulp': ['acute', 'GGZ', 'crisis', 'hulp'],
  'Vrijwilligerswerk': ['vrijwilliger', 'vrijwilligerswerk'],
  'Daginvulling / ritme': ['daginvulling', 'ritme', 'dagbesteding'],
  'Herstelcursussen (WRAP, etc.)': ['herstel', 'cursus', 'WRAP'],
  'Werken met eigen ervaring': ['ervaringsdeskundige', 'ervaring'],
  'Re-integratie / werktrajecten': ['re-integratie', 'werk', 'traject']
};

export function searchActivities(query, data) {
  if (!query || !data || !Array.isArray(data)) {
    return data || [];
  }

  console.log('Searching with query:', query);
  console.log('Total items to search:', data.length);

  const fuse = new Fuse(data, fuseOptions);
  const results = fuse.search(query);

  console.log('Search results:', {
    total: data.length,
    found: results.length,
    query: query
  });

  if (results.length > 0) {
    console.log('First 3 results:', results.slice(0, 3).map(r => ({
      name: r.item['Activity name'],
      score: r.score
    })));
  }

  return results.map(result => result.item);
}

export function filterActivities(filters, data) {
  if (!data || !Array.isArray(data)) {
    console.log('No data provided to filterActivities');
    return [];
  }
  
  console.log('Filtering with:', filters);
  console.log('Total items to filter:', data.length);
  
  // If no filters are selected, return all data
  if (!filters.domain) {
    console.log('No filters selected, returning all activities');
    return data;
  }
  
  const filteredData = data.filter(item => {
    if (!item) return false;
    
    // Check if the domain matches exactly
    return item['Domein / Intentie']?.toLowerCase() === filters.domain?.toLowerCase();
  });

  console.log('Items after filtering:', filteredData.length);
  return filteredData;
}

export function searchAndFilter(data, searchQuery, filters) {
  if (!data || !Array.isArray(data)) {
    console.log('No data provided to searchAndFilter');
    return [];
  }

  console.log('Starting searchAndFilter with:', {
    searchQuery,
    filters,
    totalItems: data.length
  });

  // First apply filters
  let filteredData = filterActivities(filters, data);
  console.log('Items after filtering:', filteredData.length);

  if (!searchQuery) {
    return filteredData;
  }

  // Then apply search
  const searchResults = searchActivities(searchQuery, filteredData);
  console.log('Final results count:', searchResults.length);
  
  return searchResults;
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