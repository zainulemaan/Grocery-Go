const app = require('./app');
const mongoose = require('mongoose');

const password = 'zainulemaan12';
const uri = `mongodb+srv://ZainUlEmaan:${password}@cluster2.jfwfxtx.mongodb.net/GroceryGo?retryWrites=true&w=majority`;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log('Port Is Running Successfully......');
});
