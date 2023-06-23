//CONSTANTS

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mysql = require('mysql');
const app = express();
const path = require('path');
const ejs = require('ejs');

const secret = uuid.v4();
const port = 3000;

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'tp_account_1',
  password: 'test',
  database: 'db_store'
});

//VARIABLE

let isDBloaded = false;

//TABLES DEFINITIONS

//First time run delete and create and use new schema
const deleteSchemaQuery = 'DROP SCHEMA IF EXISTS db_store;';const createSchemaQuery = 'CREATE SCHEMA db_store;';
const useSchemaQuery = 'USE db_store;';

const createClientsTable = `
  CREATE TABLE clients (
    id_client INT AUTO_INCREMENT,
    paypalId VARCHAR(128),
    nom VARCHAR(255),
    prenom VARCHAR(255),
    courriel VARCHAR(255),
    password VARCHAR(255),
    status BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id_client)
  );
`;

const createProduitsTable = `
  CREATE TABLE produits (
    id_produit INT AUTO_INCREMENT,
    nom VARCHAR(255),
    categorie VARCHAR(255),
    prix DECIMAL(10,2),
    materiel VARCHAR(255),
    pierre VARCHAR(255),
    carat DECIMAL(4,2),
    image_url VARCHAR(256),
    PRIMARY KEY (id_produit)
  );
`;

const createCommandeTable = `
  CREATE TABLE Commande (
    id_commande INT AUTO_INCREMENT,
    id_client INT,
    date_commande DATE,
    PRIMARY KEY (id_commande),
    FOREIGN KEY (id_client) REFERENCES clients (id_client)
  );
`;

const createProduitCommandeTable = `
  CREATE TABLE Produit_Commande (
    id_produit_commande INT AUTO_INCREMENT,
    id_produit INT,
    id_commande INT,
    quantite INT,
    PRIMARY KEY (id_produit_commande),
    FOREIGN KEY (id_produit) REFERENCES produits (id_produit),
    FOREIGN KEY (id_commande) REFERENCES Commande (id_commande)
  );
`;

const insertProduits = `
  INSERT INTO produits (nom, categorie, prix, materiel, pierre, carat, image_url)
  VALUES
    ('Collier en diamant', 'Collier', 1500, 'Or blanc 18 carats', 'Diamant', 1.5, '/assets/1_collier_diamand.jpg'),
    ('Bague en rubis', 'Bague', 800, 'Or jaune 14 carats', 'Rubis', 0.75, '/assets/2_bague_rubis.jpg'),
    ('Boucles d''oreilles en émeraude', 'Boucles d''oreilles', 1200, 'Platine', 'Émeraude', 1.0, '/assets/3_boucle_emeraud.jpg'),
    ('Bracelet en saphir', 'Bracelet', 1800, 'Argent sterling', 'Saphir', 2.0, '/assets/4_bracelet_saphyr.jpg'),
    ('Pendentif en améthyste', 'Pendentif', 400, 'Or rose 10 carats', 'Améthyste', 0.5, '/assets/5_pendantif_amethyst.jpg'),
    ('Boucles d''oreilles en perle', 'Boucles d''oreilles', 250, 'Argent sterling', 'Perle', NULL, '/assets/6_boucle_perle.jpg'),
    ('Bague en topaze', 'Bague', 350, 'Or blanc 10 carats', 'Topaze', 1.25, '/assets/7_bague_topaze.jpg'),
    ('Bracelet en grenat', 'Bracelet', 500, 'Argent', 'Grenat', 0.75, '/assets/8_bracelet_grenat.jpg'),
    ('Collier en opale', 'Collier', 900, 'Or blanc 14 carats', 'Opale', 1.8, '/assets/9_collierOpale.jpg'),
    ('Boucles d''oreilles en citrine', 'Boucles d''oreilles', 300, 'Or jaune', 'Citrine', 1.5, '/assets/10_citrine.jpg');
`;

//ROUTES CONFIGURATION

app.listen(port, (res, req) => {
  console.log(`Serveur express sur le port ${port}`);
  console.log(req);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(bodyParser.json());

app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: true
}));

app.use((req, res, next) => {
  console.log('Session ID:', req.session.id);
  next();
});

//ROUTES

app.get('/', (req, res) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }

  connection.query('SELECT * FROM produits', (err, rows) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).send('Internal Server Error');
    }

    const cart = req.session.cart; // Get the cart from the session

    res.render('index', { produits: rows, cart: cart }); // Pass the cart variable to the EJS template
  });
});

app.post('/subscribe');

app.post('/login');

app.post('/cart/add', function(req, res) {
  const { id_produit, quantity } = req.body;

  // Perform any necessary validation or checks on the received data

  const cart = req.session.cart || [];
  cart.push({ id_produit, quantity });
  req.session.cart = cart;

  console.log('Cart:', cart); // Log the content of the cart

  res.send('Item added to cart');
});


//FUNCTIONS

function createDBTable() {

  connection.connect((err) => {

    if (err) {
      console.error('Error connecting to the database: ', err);
      return;
    }

    console.log('Connected to the database!');

    // DEL + CREATE + USE

    connection.query(deleteSchemaQuery, (err) => {
      if (err) {
        console.error('Error deleting schema:', err);
        return;
      }});
    
    connection.query(createSchemaQuery, (err) => {
      if (err) {
        console.error('Error creating schema:', err);
        return;
      }});

    connection.query(useSchemaQuery, (err) => {
      if (err) {
        console.error('Error setting default schema:', err);
        return;
      }});
    
    console.log('Default schema set to db_store');

    // Create Tables

    connection.query(createClientsTable, function(err, result) {
      if (err) throw err;
      console.log("TABLE Client créée");
    });

    connection.query(createProduitsTable, function(err, result) {
      if (err) throw err;
      console.log("TABLE Produit créée");
      });
    
    connection.query(insertProduits, (err, result) => {
      if (err) throw err;
      console.log('Produits inserted');
    });
    
    connection.query(createCommandeTable, function(err, result) {
      if (err) throw err;
      console.log("TABLE Produit créée");
      });

    connection.query(createProduitCommandeTable, function(err, result) {
      if (err) throw err;
      console.log("TABLE Produit/commandes créée");
      });
  });
}

function userConnection() {}

//CONTROL FLOW

createDBTable();
