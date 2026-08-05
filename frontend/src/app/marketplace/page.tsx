'use client';

import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  latitude: number | null;
  longitude: number | null;
}

interface Listing {
  id: string;
  title: string;
  cropType: string;
  quantityKg: number;
  pricePerKg: number;
  distanceKm?: number | null;
  createdAt: string;
  user: User;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<string>('100');

  // Default buyer position (e.g., Hyderabad)
  const buyerLat = 17.3850;
  const buyerLon = 78.4867;

  const fetchListings = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/listings?userLat=${buyerLat}&userLon=${buyerLon}`;
      if (selectedCrop) url += `&cropType=${selectedCrop}`;
      if (maxDistance) url += `&maxDistanceKm=${maxDistance}`;

      const response = await fetch(url);
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Failed to fetch marketplace listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCrop, maxDistance]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#1b4332' }}>🌾 AgriContact Marketplace</h1>
        <p style={{ color: '#555', marginTop: '0.5rem' }}>Direct farm-to-buyer crop access with location proximity filtering</p>
      </header>

      {/* Filter Controls */}
      <div style={{ display: 'flex', gap: '1rem', background: '#f4f9f4', padding: '1.25rem', borderRadius: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Filter by Crop Type:</label>
          <select 
            value={selectedCrop} 
            onChange={(e) => setSelectedCrop(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="">All Crops</option>
            <option value="Rice">Rice</option>
            <option value="Onion">Onion</option>
            <option value="Wheat">Wheat</option>
            <option value="Cotton">Cotton</option>
          </select>
        </div>

        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Max Distance (km):</label>
          <input 
            type="number" 
            value={maxDistance} 
            onChange={(e) => setMaxDistance(e.target.value)}
            placeholder="e.g. 50"
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>Loading fresh crop listings...</p>
      ) : listings.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777' }}>No crop listings match your filter criteria.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {listings.map((item) => (
            <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: '600', fontSize: '0.85rem' }}>
                  {item.cropType}
                </span>
                {item.distanceKm !== undefined && item.distanceKm !== null && (
                  <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
                    📍 {item.distanceKm} km away
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.title}</h3>
              
              <div style={{ margin: '1rem 0', fontSize: '1rem' }}>
                <p><strong>Available Quantity:</strong> {item.quantityKg.toLocaleString()} kg</p>
                <p style={{ fontSize: '1.2rem', color: '#166534', fontWeight: 'bold', marginTop: '0.25rem' }}>
                  ₹{item.pricePerKg} / kg
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '1rem', fontSize: '0.9rem', color: '#555' }}>
                <p>👨‍🌾 <strong>Farmer:</strong> {item.user?.name || 'Verified Farmer'}</p>
                <p>📞 <strong>Contact:</strong> {item.user?.phone}</p>
              </div>

              <button 
                onClick={() => alert(`Initiating direct contract offer with ${item.user.name} for ${item.title}`)}
                style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', backgroundColor: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Connect & Propose Contract
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}