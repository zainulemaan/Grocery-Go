
document.addEventListener('DOMContentLoaded', () => {
  // Ensure Mapbox GL JS is loaded
  if (typeof mapboxgl !== 'undefined') {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiemFpbnVsZW1hYW4iLCJhIjoiY2x6ZDBhODd1MDM0ZzJxczhrcG1jenpvaiJ9.bD2lheR8XS89b12ue28_YA';

    // Initialize the map
    const map = new mapboxgl.Map({
      container: 'map', // Container ID
      style: 'mapbox://styles/mapbox/streets-v11', // Map style
      center: [73.0166, 33.6844], // Starting position [lng, lat] for Islamabad I-10
      zoom: 14, // Initial zoom level
    });

    // Add a marker to the map
    new mapboxgl.Marker()
      .setLngLat([73.0166, 33.6844])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setText('Grocery Store Location'),
      )
      .addTo(map);
  } else {
    console.error('Mapbox GL JS is not loaded.');
  }
});
