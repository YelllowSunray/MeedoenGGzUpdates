'use client';
import { useState, useEffect } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';

export default function Filters({ onFilter, data = [] }) {
  const [filters, setFilters] = useState({
    category: '',
    forWho: '',
    cost: '',
    location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    
    // Debug logging
    if (name === 'category') {
      console.log('Selected category:', value);
      console.log('Available categories:', categories);
    }
    
    setFilters(newFilters);
    onFilter(newFilters);
  };

  // Unique values for dropdowns (derived from data)
  const categories = [...new Set(data.map(item => item['Shiva Categorie'] || '').filter(Boolean))];
  const forWhoOptions = [...new Set(data.map(item => item['Doelgroep'] || item['For Who'] || '').filter(Boolean))];
  const costOptions = [...new Set(data.map(item => item['Kosten'] || item['How much?'] || '').filter(Boolean))];

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
      <FormControl style={{ minWidth: 200 }}>
        <InputLabel>Categorie</InputLabel>
        <Select name="category" value={filters.category} onChange={handleChange}>
          <MenuItem value="">Alle</MenuItem>
          {categories.map(category => (
            <MenuItem key={category} value={category}>{category}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl style={{ minWidth: 200 }}>
        <InputLabel>Voor wie</InputLabel>
        <Select name="forWho" value={filters.forWho} onChange={handleChange}>
          <MenuItem value="">Alle</MenuItem>
          {forWhoOptions.map(option => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl style={{ minWidth: 200 }}>
        <InputLabel>Kosten</InputLabel>
        <Select name="cost" value={filters.cost} onChange={handleChange}>
          <MenuItem value="">Alle</MenuItem>
          {costOptions.map(cost => (
            <MenuItem key={cost} value={cost}>{cost}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Locatie (bijv. Hilversum)"
        name="location"
        value={filters.location}
        onChange={handleChange}
        style={{ minWidth: 200 }}
      />
    </div>
  );
}