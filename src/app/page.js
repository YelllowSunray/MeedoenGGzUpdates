'use client';
import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import ResultsList from './components/ResultsList';
import { searchAndFilter } from './lib/search';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Script from 'next/script';

export default function Home() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    forWho: '',
    cost: '',
    location: ''
  });
  const [results, setResults] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Google Sheets data
  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const response = await fetch('/api/sheets');
        const sheetsData = await response.json();
        setData(sheetsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sheet data:', error);
        setLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  // Update search results when query, filters, or data changes
  useEffect(() => {
    if (data.length > 0) {
      const filteredResults = searchAndFilter(query, filters, data);
      setResults(filteredResults);
    }
  }, [query, filters, data]);

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" style={{ padding: '20px' }}>
        <Typography>Loading data...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Vind een Activiteit
      </Typography>
      <SearchBar onSearch={handleSearch} />
      <Filters onFilter={handleFilter} data={data} />
      <ResultsList activities={results} />
    </Container>
  );
}