'use client';

import React from 'react';
import { TextField, Box, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function SearchBar({ onSearch, selectedCategory, onClearCategory }) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        width: '100%',
        gap: 1,
        alignItems: 'center'
      }}
    >
      <Box sx={{ flex: 1, maxWidth: '400px' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={selectedCategory ? `Zoeken binnen ${selectedCategory}` : "Zoek binnen alle activiteiten..."}
          onChange={(e) => onSearch(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '30px',
              backgroundColor: 'background.paper',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            },
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
        />
      </Box>
      {selectedCategory && (
        <Button
          variant="outlined"
          onClick={onClearCategory}
          startIcon={<ClearIcon />}
          sx={{
            borderRadius: '30px',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            height: '40px'
          }}
        >
          Terug naar Alles
        </Button>
      )}
    </Box>
  );
}