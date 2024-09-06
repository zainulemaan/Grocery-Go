// utils/squareClient.js
const { Client, Environment } = require('square');

const Squareclient = new Client({
  environment: Environment.Sandbox,
  accessToken: 'EAAAl8loEdWbMIa-ddCYvcA8zRgll9axSQEoPfMqjrQoD1YY-45C4iVBeYdyEi-x',
});

module.exports = Squareclient;
