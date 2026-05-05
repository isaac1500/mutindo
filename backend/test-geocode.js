const fetch = require('node-fetch');

async function testGeocode() {
  const address = 'Kampala, Uganda';
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
    { headers: { 'User-Agent': 'MutindoTest/1.0' } }
  );
  const data = await response.json();
  console.log('Address:', address);
  console.log('Coordinates:', data[0]?.lat, data[0]?.lon);
}

testGeocode();