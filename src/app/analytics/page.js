'use client';
import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching analytics data...');
        const [analyticsRes, sessionsRes] = await Promise.all([
          fetch('/api/analytics/dashboard?limit=1000'),
          fetch('/api/analytics/sessions?limit=100')
        ]);

        if (!analyticsRes.ok) {
          const errorData = await analyticsRes.json();
          throw new Error(`Analytics fetch failed: ${errorData.error || analyticsRes.statusText}`);
        }

        if (!sessionsRes.ok) {
          const errorData = await sessionsRes.json();
          throw new Error(`Sessions fetch failed: ${errorData.error || sessionsRes.statusText}`);
        }

        const [analyticsData, sessionsData] = await Promise.all([
          analyticsRes.json(),
          sessionsRes.json()
        ]);

        console.log('Analytics data received:', analyticsData);
        console.log('Sessions data received:', sessionsData);

        setAnalytics(analyticsData.events || []);
        setSessions(sessionsData.sessions || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data for charts
  const processData = () => {
    const searchData = analytics.filter(item => item.action === 'search');
    const categoryData = analytics.filter(item => item.action === 'category_click');
    const filterData = analytics.filter(item => item.action === 'filter_apply');

    // Process search data
    const searchCounts = searchData.reduce((acc, item) => {
      // Adapt to MongoDB structure - query might be directly on the item or nested in data
      const query = item.query || (item.data && item.data.query);
      if (query) {
        acc[query] = (acc[query] || 0) + 1;
      }
      return acc;
    }, {});

    // Process category data
    const categoryCounts = categoryData.reduce((acc, item) => {
      // Adapt to MongoDB structure - category might be directly on the item or nested in data
      const category = item.category || (item.data && item.data.category);
      if (category) {
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, {});

    // Process filter data
    const filterCounts = filterData.reduce((acc, item) => {
      // Adapt to MongoDB structure - filters might be directly on the item or nested in data
      const filters = item.filters || (item.data && item.data.filters);
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (!acc[key]) acc[key] = {};
          if (value) {
            acc[key][value] = (acc[key][value] || 0) + 1;
          }
        });
      }
      return acc;
    }, {});

    // Process session data
    const sessionDurations = sessions.map(session => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      return (end - start) / 1000; // Convert to seconds
    });

    const pageViewsByPage = sessions.reduce((acc, session) => {
      if (session.pageViews && Array.isArray(session.pageViews)) {
        session.pageViews.forEach(view => {
          const page = view.page || view.path;
          if (page) {
            if (!acc[page]) acc[page] = 0;
            acc[page]++;
          }
        });
      }
      return acc;
    }, {});

    return {
      searchCounts,
      categoryCounts,
      filterCounts,
      sessionDurations,
      pageViewsByPage
    };
  };

  const { 
    searchCounts, 
    categoryCounts, 
    filterCounts,
    sessionDurations,
    pageViewsByPage
  } = processData();

  // Prepare chart data
  const searchChartData = {
    labels: Object.keys(searchCounts),
    datasets: [
      {
        label: 'Search Queries',
        data: Object.values(searchCounts),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  const sessionDurationData = {
    labels: sessions.map((_, i) => `Session ${i + 1}`),
    datasets: [
      {
        label: 'Session Duration (seconds)',
        data: sessionDurations,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Search Analytics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Search Queries
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={searchChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Category Analytics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Category Clicks
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Session Duration */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Session Durations
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={sessionDurationData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Page Views Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Page Views
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Page</TableCell>
                    <TableCell align="right">Views</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(pageViewsByPage).map(([page, views]) => (
                    <TableRow key={page}>
                      <TableCell>{page}</TableCell>
                      <TableCell align="right">{views}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Filter Analytics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filter Usage
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(filterCounts).map(([filter, values]) => (
                <Grid item xs={12} md={4} key={filter}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {filter}
                    </Typography>
                    {Object.entries(values).map(([value, count]) => (
                      <Typography key={value} variant="body2">
                        {value}: {count}
                      </Typography>
                    ))}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 