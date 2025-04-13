'use client';
import { useState, useEffect } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SportsSoccer from '@mui/icons-material/SportsSoccer';
import Groups from '@mui/icons-material/Groups';
import SportsEsports from '@mui/icons-material/SportsEsports';
import DirectionsWalk from '@mui/icons-material/DirectionsWalk';
import Restaurant from '@mui/icons-material/Restaurant';
import Brush from '@mui/icons-material/Brush';
import Movie from '@mui/icons-material/Movie';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const ActivityTypeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: theme.spacing(1),
  cursor: 'pointer',
}));

const ActivityTypeButton = styled(IconButton)(({ theme, selected }) => ({
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  padding: '16px',
  fontSize: '2rem',
  '& .MuiSvgIcon-root': {
    fontSize: '2rem',
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ActivityTypeLabel = styled(Typography)(({ theme, selected }) => ({
  marginTop: theme.spacing(1),
  fontSize: '1rem',
  color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  fontWeight: selected ? 'bold' : 'normal',
}));

const activityTypes = [
  { type: 'ontmoeting', icon: <Groups />, label: 'Ontmoeting' },
  { type: 'spelletjes', icon: <SportsEsports />, label: 'Spelletjes' },
  { type: 'wandelen', icon: <DirectionsWalk />, label: 'Wandelen' },
  { type: 'eten', icon: <Restaurant />, label: 'Eten' },
  { type: 'creatief', icon: <Brush />, label: 'Creatief' }
];

export default function Filters({ onFilter, data = [] }) {
  const [filters, setFilters] = useState({
    category: '',
    forWho: '',
    cost: '',
    location: '',
    activityType: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Filter changed: ${name} = ${value}`);
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleActivityTypeClick = (type) => {
    const newFilters = { 
      ...filters, 
      activityType: filters.activityType === type ? '' : type 
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  // Debug: Log the first item's complete structure
  if (data.length > 0) {
    console.log('Complete first item:', data[0]);
    console.log('Available fields:', Object.keys(data[0]));
  }

  // Unique values for dropdowns (derived from data)
  const categories = [...new Set(data.map(item => {
    const value = item['Shiva Categorie'];
    if (value) console.log('Found Category:', value);
    return value || '';
  }).filter(Boolean))].sort();
  
  const forWhoOptions = [...new Set(data.map(item => {
    const value = item['Doelgroep'];
    if (value) console.log('Found Doelgroep:', value);
    return value || '';
  }).filter(Boolean))].sort();
  
  const costOptions = [...new Set(data.map(item => {
    const value = item['Kosten'];
    if (value) console.log('Found Kosten:', value);
    return value || '';
  }).filter(Boolean))].sort();

  // Debug: Log all unique values
  console.log('All unique categories:', categories);
  console.log('All unique forWho options:', forWhoOptions);
  console.log('All unique cost options:', costOptions);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Activity Types Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 1,
        mb: 2
      }}>
        {activityTypes.map(({ type, icon, label }) => (
          <ActivityTypeContainer 
            key={type}
            onClick={() => handleActivityTypeClick(type)}
          >
            <ActivityTypeButton
              selected={filters.activityType === type}
              size="medium"
            >
              {icon}
            </ActivityTypeButton>
            <ActivityTypeLabel selected={filters.activityType === type}>
              {label}
            </ActivityTypeLabel>
          </ActivityTypeContainer>
        ))}
      </Box>

      {/* Filters Section */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel>Categorie</InputLabel>
          <Select 
            name="category" 
            value={filters.category} 
            onChange={handleChange}
            MenuProps={{ style: { maxHeight: '400px' } }}
          >
            <MenuItem value="">Alle</MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel>Voor wie</InputLabel>
          <Select 
            name="forWho" 
            value={filters.forWho} 
            onChange={handleChange}
            MenuProps={{ style: { maxHeight: '400px' } }}
          >
            <MenuItem value="">Alle</MenuItem>
            {forWhoOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel>Kosten</InputLabel>
          <Select 
            name="cost" 
            value={filters.cost} 
            onChange={handleChange}
            MenuProps={{ style: { maxHeight: '400px' } }}
          >
            <MenuItem value="">Alle</MenuItem>
            {costOptions.map(cost => (
              <MenuItem key={cost} value={cost}>{cost}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}