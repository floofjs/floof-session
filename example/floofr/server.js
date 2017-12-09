const {Floof} = require('floof');
const floofr = require('./floofr.js');

const config = {
  username: 'admin',
  password: 'password',
};
floofr.config = config;

const floof = new Floof();
floof.ball(floofr);
floof.go().then(() => console.log('Started up server'));
