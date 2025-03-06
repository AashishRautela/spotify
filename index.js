const { connectDB } = require('./src/database/database');
require('dotenv').config({ path: 'config.env' });
const { app } = require('./app');

const PORT=process.env.PORT || 3001;
console.log('PORT', PORT)


connectDB()
  .then(() => {
    console.log('Connected to database successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });
