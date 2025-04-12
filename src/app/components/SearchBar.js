'use client';

import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  // Add debounce functionality to avoid excessive searches
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300); // 300ms delay after user stops typing

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      <TextField
        label="Zoek activiteit (bijv. wandelen, jongeren)"
        variant="outlined"
        value={query}
        onChange={handleChange}
        fullWidth
      />
      <Button variant="contained" onClick={handleSearch}>
        Zoeken
      </Button>
    </div>
  );
}