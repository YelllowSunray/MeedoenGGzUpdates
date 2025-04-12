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
    <div style={{ 
      display: 'flex', 
      gap: '15px', 
      marginBottom: '10px',
      padding: '15px',
      backgroundColor: '#F5F9FF', // Pale blue for main content
      borderRadius: '8px'
    }}>
      <TextField
        label="Zoeken op activiteit, locatie of groep"
        variant="outlined"
        value={query}
        onChange={handleChange}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#8BA888', // Muted sage green for hover
            },
            '& .MuiOutlinedInput-input': {
              color: '#333333', // Dark gray for main text
            }
          },
          '& .MuiInputLabel-root': {
            color: '#4A4A4A', // Softer text color for label
          }
        }}
      />
      <Button 
        variant="contained" 
        onClick={handleSearch}
        sx={{ 
          backgroundColor: '#8BA888', // Muted sage green for CTA
          padding: '12px 24px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          textTransform: 'none',
          color: 'white',
          '&:hover': {
            backgroundColor: '#7A9778', // Darker sage green on hover
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        ZOEKEN
      </Button>
    </div>
  );
}