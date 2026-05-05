const express = require('express');
const app = express();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is running' });
});

app.get('/api/menu', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Test Rolex',
      description: 'Test description',
      price: 5000,
      category: 'Test',
      available: true,
      image: 'https://via.placeholder.com/300x200'
    }
  ]);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
});