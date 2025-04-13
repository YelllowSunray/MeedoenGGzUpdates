'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip, Grid, useTheme, useMediaQuery } from '@mui/material';
import {
  Groups as SocialIcon,
  DirectionsWalk as MovementIcon,
  Brush as CreativeIcon,
  Home as StabilityIcon,
  Emergency as CrisisIcon,
  Psychology as MeaningIcon
} from '@mui/icons-material';

const domainMappings = [
  { 
    domain: 'Verbinding & Co-regulatie',
    icon: <SocialIcon sx={{ fontSize: 30 }} />,
    label: 'Verbinding & Co-regulatie'
  },
  { 
    domain: 'Lichaamsritme & Vitaliteit',
    icon: <MovementIcon sx={{ fontSize: 30 }} />,
    label: 'Lichaamsritme & Vitaliteit'
  },
  { 
    domain: 'Expressie & Zelfregie',
    icon: <CreativeIcon sx={{ fontSize: 30 }} />,
    label: 'Expressie & Zelfregie'
  },
  { 
    domain: 'Voorziening & Stabiliteit',
    icon: <StabilityIcon sx={{ fontSize: 30 }} />,
    label: 'Voorziening & Stabiliteit'
  },
  { 
    domain: 'Crisis & Overgangsbegeleiding',
    icon: <CrisisIcon sx={{ fontSize: 30 }} />,
    label: 'Crisis & Overgangsbegeleiding'
  },
  { 
    domain: 'Zingeving & Structuur',
    icon: <MeaningIcon sx={{ fontSize: 30 }} />,
    label: 'Zingeving & Structuur'
  }
];

export default function Filters({ onFilterChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedDomain, setSelectedDomain] = useState(null);

  const handleDomainClick = (domain) => {
    const newDomain = selectedDomain === domain ? null : domain;
    setSelectedDomain(newDomain);
    onFilterChange({ domain: newDomain });
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Grid container spacing={2} justifyContent="center">
        {domainMappings.map(({ domain, icon, label }) => (
          <Grid item xs={6} sm={4} md={2} key={domain}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => handleDomainClick(domain)}
            >
              <Tooltip title={label} placement="top">
                <IconButton
                  sx={{
                    width: '100%',
                    height: '100%',
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: selectedDomain === domain ? 'primary.main' : 'background.paper',
                    color: selectedDomain === domain ? 'primary.contrastText' : 'text.secondary',
                    '&:hover': {
                      backgroundColor: selectedDomain === domain ? 'primary.dark' : 'action.hover',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  size="large"
                >
                  {icon}
                </IconButton>
              </Tooltip>
              <Typography
                sx={{
                  mt: 1,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: selectedDomain === domain ? 'primary.main' : 'text.secondary',
                }}
              >
                {label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}