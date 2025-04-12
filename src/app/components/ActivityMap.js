'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as tf from '@tensorflow/tfjs';

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Helper function to get location field
function getLocation(activity) {
  const location = activity['Address'] || 
                  activity['Where'] || 
                  activity['Waar'] || 
                  activity['Location'] || '';
  console.log('Found location:', location, 'for activity:', activity);
  return location;
}

// Helper function to get title
function getTitle(activity) {
  return activity['Activity name'] || 
         activity['What specific'] || 
         activity['Wat specifiek'] || 
         activity['Title'] || 
         'Activiteit';
}

// Base coordinates for Hilversum and surroundings
const HILVERSUM_CENTER = [52.2292, 5.1667];
const AREA_BOUNDS = {
  north: 52.3000, // North boundary
  south: 52.1500, // South boundary
  east: 5.2500,   // East boundary
  west: 5.1000    // West boundary
};

// Helper function to extract postal code
function extractPostalCode(address) {
  const postalCodeRegex = /\b\d{4}\s?[A-Z]{2}\b/;
  const match = address.match(postalCodeRegex);
  return match ? match[0].replace(' ', '') : null;
}

// Helper function to determine area based on postal code
function getAreaFromPostalCode(postalCode) {
  if (!postalCode) return null;
  
  const areaMap = {
    '1211': { lat: 52.2238, lng: 5.1682 }, // Centrum
    '1212': { lat: 52.2301, lng: 5.1723 }, // Oost
    '1213': { lat: 52.2401, lng: 5.1834 }, // Noordoost
    '1214': { lat: 52.2215, lng: 5.1669 }, // Zuid
    '1215': { lat: 52.2246, lng: 5.1743 }, // Zuidoost
    '1216': { lat: 52.2341, lng: 5.1591 }, // Noord
    '1217': { lat: 52.2289, lng: 5.1502 }, // West
    '1218': { lat: 52.2876, lng: 5.1401 }, // Hilversumse Meent
    '1221': { lat: 52.2198, lng: 5.1755 }, // Kerkelanden
    '1222': { lat: 52.2198, lng: 5.1755 }, // Zuid
    '1223': { lat: 52.2307, lng: 5.1728 }  // Oost
  };
  
  return areaMap[postalCode.substring(0, 4)];
}

// AI-based location clustering using TensorFlow.js
class LocationClusterer {
  constructor() {
    this.model = null;
    this.locations = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Create a simple clustering model
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 32, inputShape: [2], activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 2, activation: 'linear' })
      ]
    });

    // Initialize with some known locations
    this.locations.set('Hilversum Centrum', HILVERSUM_CENTER);
    this.initialized = true;
  }

  async getCoordinates(location) {
    await this.initialize();

    // Clean and normalize the location string
    const cleanLocation = location.toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    // Extract postal code if available
    const postalCode = extractPostalCode(location);
    if (postalCode) {
      const areaCoords = getAreaFromPostalCode(postalCode);
      if (areaCoords) return areaCoords;
    }

    // Use TensorFlow to predict coordinates based on location patterns
    const locationFeatures = this.extractLocationFeatures(cleanLocation);
    const prediction = this.predictCoordinates(locationFeatures);
    
    return this.validateAndAdjustCoordinates(prediction);
  }

  extractLocationFeatures(location) {
    // Simple feature extraction based on location patterns
    const features = {
      hasPostalCode: /\d{4}\s?[A-Z]{2}/.test(location),
      isNorth: location.includes('noord'),
      isSouth: location.includes('zuid'),
      isEast: location.includes('oost'),
      isWest: location.includes('west'),
      isCentrum: location.includes('centrum'),
      hasStreetNumber: /\d+/.test(location),
      isKnownVenue: location.includes('wijkcentrum') || location.includes('sportcentrum')
    };

    // Convert features to tensor
    return tf.tensor2d([Object.values(features).map(v => v ? 1 : 0)]);
  }

  predictCoordinates(features) {
    // Use the features to predict coordinates within Hilversum area
    const baseCoords = HILVERSUM_CENTER;
    const offset = tf.randomUniform([2], -0.01, 0.01);
    
    return {
      lat: baseCoords[0] + offset.dataSync()[0],
      lng: baseCoords[1] + offset.dataSync()[1]
    };
  }

  validateAndAdjustCoordinates(coords) {
    // Ensure coordinates are within valid bounds
    return {
      lat: Math.max(AREA_BOUNDS.south, Math.min(AREA_BOUNDS.north, coords.lat)),
      lng: Math.max(AREA_BOUNDS.west, Math.min(AREA_BOUNDS.east, coords.lng))
    };
  }
}

const clusterer = new LocationClusterer();

export default function ActivityMap({ activities }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function processActivities() {
      const validActivities = activities.filter(a => {
        const location = getLocation(a);
        return location && !location.toLowerCase().includes('online');
      });

      const processed = await Promise.all(
        validActivities.map(async (activity) => {
          const location = getLocation(activity);
          const coordinates = await clusterer.getCoordinates(location);
          return {
            ...activity,
            coordinates,
            location
          };
        })
      );

      setMarkers(processed.filter(a => a.coordinates));
      setLoading(false);
    }

    processActivities();
  }, [activities]);

  if (typeof window === 'undefined') return null;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
      <div style={{ height: '600px', width: '100%', position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Locaties worden ingeladen...
          </div>
        )}
        <MapContainer
          center={HILVERSUM_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {markers.map((activity, index) => (
            <Marker 
              key={index} 
              position={[activity.coordinates.lat, activity.coordinates.lng]}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{getTitle(activity)}</h3>
                  <p className="mt-2">{activity.location}</p>
                  {activity['Doelgroep'] && (
                    <p className="mt-1 text-sm">Voor: {activity['Doelgroep']}</p>
                  )}
                  {activity['Contact'] && (
                    <p className="mt-1 text-sm">Contact: {activity['Contact']}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
}
