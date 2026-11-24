require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());

app.use(express.json()); 

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;

// Solo levanta el servidor si el archivo se ejecuta directamente (npm start)
// Si lo requiere Jest/Supertest para pruebas, omite app.listen
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor del Calendario Académico corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;