'use client';

import { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const documentCategories = [
  'Sociale- en welzijnsactiviteiten',
  'Dagbesteding & Re-integratie',
  'Begeleiding & Coaching',
  'Crisisopvang & Maatschappelijke opvang',
  'Wonen & Beschermd wonen',
  'Overig'
];

export default function DocumentCategoryFilter({ onFilterChange }) {
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);
    onFilterChange({ category: newCategory });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <FormControl fullWidth>
        <InputLabel id="category-select-label">Document Categorie</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-select"
          value={selectedCategory}
          label="Document Categorie"
          onChange={handleCategoryChange}
        >
          <MenuItem value="">
            <em>Alle categorieën</em>
          </MenuItem>
          {documentCategories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
} 