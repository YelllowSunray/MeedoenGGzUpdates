'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Grid, Button } from '@mui/material';
import { Card, CardContent } from '@mui/material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Helper function to get website favicon
const getWebsiteFavicon = (url) => {
  if (!url || url === 'Not specified') return null;
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return null;
  }
};

export default function Organisaties() {
  const [organizations, setOrganizations] = useState([]);
  const [displayedOrganizations, setDisplayedOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchOrganizations = async () => {
      try {
        console.log('Fetching organizations...');
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/sheets', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        
        console.log('Raw data:', data);
        
        // Extract unique organizations with their details
        const uniqueOrgs = data.reduce((acc, item) => {
          const orgName = item['By who'] || item['by who'] || item['Organisatie'] || item['organisatie'];
          console.log('Processing item:', item);
          console.log('Organization name:', orgName);
          
          if (orgName && !acc[orgName]) {
            acc[orgName] = {
              name: orgName,
              address: item['Address'] || item['address'] || 'Not specified',
              contact: item['Contact'] || item['contact'] || item['Unnamed: 11'] || 'Not specified',
              website: item['website'] || 'Not specified',
              description: item['Beschrijving'] || item['Activiteit long '] || 'Not specified'
            };
          }
          return acc;
        }, {});
        
        console.log('Unique organizations:', uniqueOrgs);
        const orgList = Object.values(uniqueOrgs);
        console.log('Organization list:', orgList);
        
        if (orgList.length === 0) {
          console.warn('No organizations found in the data');
        }
        
        setOrganizations(orgList);
        setDisplayedOrganizations(orgList.slice(0, itemsPerPage));
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [mounted]);

  const loadMore = () => {
    const nextPage = page + 1;
    const startIndex = 0;
    const endIndex = nextPage * itemsPerPage;
    setDisplayedOrganizations(organizations.slice(0, endIndex));
    setPage(nextPage);
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  const hasMore = displayedOrganizations.length < organizations.length;

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Organisaties
      </Typography>
      
      <Grid 
        container 
        spacing={3} 
        sx={{ 
          maxWidth: '1000px',
          margin: '0 auto',
          justifyContent: 'center'
        }}
      >
        {displayedOrganizations.map((org, index) => {
          const faviconUrl = getWebsiteFavicon(org.website);

          return (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={`${org.name}-${index}`}
              sx={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Card sx={{ 
                width: '100%', 
                maxWidth: '300px',
                height: '350px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    minHeight: '40px'
                  }}>
                    {faviconUrl && (
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        mr: 2,
                        position: 'relative'
                      }}>
                        <Image
                          src={faviconUrl}
                          alt={org.name}
                          fill
                          style={{ objectFit: 'contain' }}
                          unoptimized
                        />
                      </Box>
                    )}
                    <Typography variant="h6" component="div" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      fontSize: '1.125rem',
                      flex: 1
                    }}>
                      {org.name}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    flex: 1,
                    overflowY: 'auto',
                    mb: 2
                  }}>
                    <Typography color="text.secondary" sx={{ mb: 1, fontSize: '0.9375rem' }}>
                      <strong>📍</strong> {org.address}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 1, fontSize: '0.9375rem' }}>
                      <strong>📞</strong> {org.contact}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 1, fontSize: '0.9375rem' }}>
                      <strong>🔗</strong> {org.website !== 'Not specified' ? (
                        <a 
                          href={org.website.startsWith('http') ? org.website : `https://${org.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#9c27b0',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {org.website}
                        </a>
                      ) : 'Not specified'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            onClick={loadMore}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '30px',
              textTransform: 'none',
              fontSize: '1rem',
              backgroundColor: '#9c27b0',
              '&:hover': {
                backgroundColor: '#7b1fa2',
              }
            }}
          >
            Laad meer organisaties
          </Button>
        </Box>
      )}
    </Box>
  );
}
