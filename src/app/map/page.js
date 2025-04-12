'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import ActivityMap dynamically to avoid SSR issues with Leaflet
const ActivityMap = dynamic(
  () => import('../components/ActivityMap'),
  { ssr: false }
);

export default function MapPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/sheets');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected an array of activities');
        }
    
        console.log(`Fetched ${data.length} activities for the map`);
        setActivities(data);
        
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (error) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl text-red-600 mb-2">Error Loading Data</h2>
        <p>{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Activiteiten op de kaart</h1>
      
      {loading ? (
        <div className="text-center p-4">
          <p>Activiteiten worden geladen...</p>
        </div>
      ) : (
        <ActivityMap activities={activities} />
      )}
    </div>
  );
}

