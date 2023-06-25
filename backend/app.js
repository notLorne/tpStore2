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
let cart = [];
let isLoggedIn = false;

//TABLES DEFINITIONS

//DEL + CREATE + USE
const deleteSchemaQuery = 'DROP SCHEMA IF EXISTS db_store;';const createSchemaQuery = 'CREATE SCHEMA db_store;';
const useSchemaQuery = 'USE db_store;';

const createClientsTable = `
  CREATE TABLE clients (
    id_client INT AUTO_INCREMENT,
    paypalId VARCHAR(128),
    nom VARCHAR(32),
    prenom VARCHAR(24),
    courriel VARCHAR(96),
    password VARCHAR(32),
    status BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id_client)
  );
`;

const createClientAccounts = `
  INSERT INTO clients (paypalId, nom, prenom, courriel, password, status)
  VALUES
    ('paypal_id_1', 'Tremblay', 'Jean', 'email1@example.com', 'password1', FALSE),
    ('paypal_id_2', 'Gagnon', 'Marie', 'email2@example.com', 'password2', FALSE),
    ('paypal_id_3', 'Roy', 'Claude', 'email3@example.com', 'password3', FALSE),
    ('paypal_id_4', 'Côté', 'Yvonne', 'email4@example.com', 'password4', FALSE),
    ('paypal_id_5', 'Bélanger', 'Pierre', 'email5@example.com', 'password5', FALSE),
    ('paypal_id_6', 'Leblanc', 'Simone', 'email6@example.com', 'password6', FALSE),
    ('paypal_id_7', 'Gauthier', 'Jacques', 'email7@example.com', 'password7', FALSE),
    ('paypal_id_8', 'Lavoie', 'Louise', 'email8@example.com', 'password8', FALSE),
    ('paypal_id_9', 'Beaudoin', 'René', 'email9@example.com', 'password9', FALSE),
    ('paypal_id_10', 'Bergeron', 'Cécile', 'email10@example.com', 'password10', FALSE);
`;

const createProduitsTable = `
  CREATE TABLE produits (
    id_produit INT AUTO_INCREMENT,
    nom VARCHAR(72),
    categorie VARCHAR(32),
    prix DECIMAL(10,2),
    materiel VARCHAR(32),
    pierre VARCHAR(32),
    carat DECIMAL(4,2),
    image_url VARCHAR(192),
    origine VARCHAR(56),
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
  INSERT INTO produits (nom, categorie, prix, materiel, pierre, carat, origine, image_url)
  VALUES
    ('Collier en diamant', 'Collier', 1500, 'Or blanc 18 carats', 'Diamant', 1.5, 'Burundi', '/assets/1_collier_diamand.jpg'),
    ('Bague en rubis', 'Bague', 800, 'Or jaune 14 carats', 'Rubis', 0.75, 'Malawi', '/assets/2_bague_rubis.jpg'),
    ('Boucles d''oreilles en émeraude', 'Boucles d''oreilles', 1200, 'Platine', 'Émeraude', 1.0, 'Liberia', '/assets/3_boucle_emeraud.jpg'),
    ('Bracelet en saphir', 'Bracelet', 1800, 'Argent sterling', 'Saphir', 2.0, 'Mozambique', '/assets/4_bracelet_saphyr.jpg'),
    ('Pendentif en améthyste', 'Pendentif', 400, 'Or rose 10 carats', 'Améthyste', 0.5, 'République centrafricaine', '/assets/5_pendantif_amethyst.jpg'),
    ('Boucles d''oreilles en perle', 'Boucles d''oreilles', 250, 'Argent sterling', 'Perle', NULL, 'Madagascar', '/assets/6_boucle_perle.jpg'),
    ('Bague en topaze', 'Bague', 350, 'Or blanc 10 carats', 'Topaze', 1.25, 'Sierra Leone', '/assets/7_bague_topaze.jpg'),
    ('Bracelet en grenat', 'Bracelet', 500, 'Argent', 'Grenat', 0.75, 'Éthiopie', '/assets/8_bracelet_grenat.jpg'),
    ('Collier en opale', 'Collier', 900, 'Or blanc 14 carats', 'Opale', 1.8, 'Éthiopie', '/assets/9_collierOpale.jpg'),
    ('Boucles d''oreilles en citrine', 'Boucles d''oreilles', 300, 'Or jaune', 'Citrine', 1.5, 'Niger', '/assets/10_citrine.jpg');
`;


//ROUTES CONFIGURATION

app.listen(port, (res, req) => {
  console.log(`Serveur express sur le port ${port}`);
  console.log(req);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(bodyParser.urlencoded({ extended: true }));
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

  const isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false;
  const userEmail = req.session.userEmail ? req.session.userEmail : null;

  connection.query('SELECT * FROM produits', (err, rows) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).send('Internal Server Error');
    }

    const cart = req.session.cart;

    res.render('index', { produits: rows, cart: cart, isLoggedIn: isLoggedIn, userEmail: userEmail });
  });
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Data received:', { email, password });

  // Query the database to check if the user exists
  connection.query(
    'SELECT * FROM clients WHERE courriel = ?',
    [email],
    (err, results) => {
      if (err) {
        console.error('Error querying the database:', err);
        res.sendStatus(500);
        return;
      }

      // Check if a user was found with the given email
      if (results.length === 0) {
        res.status(401).send('Invalid email or password');
        return;
      }

      const client = results[0];

      // Check if the password is correct
      if (client.password !== password) {
        res.status(401).send('Invalid email or password');
        return;
      }

      // Authentication successful
      console.log('Login successful:', client); // Log successful login with client information

      // Update the status for the logged-in client
      connection.query(
        'UPDATE clients SET status = ? WHERE id_client = ?',
        [true, client.id_client],
        (err) => {
          if (err) {
            console.error('Error updating client status:', err);
            res.sendStatus(500);
            return;
          }

          // Status updated successfully
          connection.query('SELECT * FROM produits', (err, rows) => {
            if (err) {
              console.error('Error executing the query:', err);
              res.status(500).send('Internal Server Error');
              return;
            }

            // Set the session variables for logged-in user
            req.session.isLoggedIn = true;
            req.session.userEmail = client.courriel;

            // Render the index page with the updated rows and cart
            const cart = req.session.cart;
            res.render('index', { produits: rows, cart: cart, isLoggedIn: true, userEmail: client.courriel });
          });
        }
      );
    }
  );
});


app.post('/cart/add', function(req, res) {

  const { id_produit, quantity, price} = req.body;
  const cart = req.session.cart ? req.session.cart : [];

  cart.push({ id_produit, quantity, price });
  req.session.cart = cart;

  console.log('Cart:', cart); //TO REMOVE

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

    connection.query(createClientAccounts, (err, result) => {
      if (err) throw err;
      console.log('Clients ajoutes');

    });

    connection.query(createProduitsTable, function(err, result) {
      if (err) throw err;
      console.log("TABLE Produit créée");
      });
    
    connection.query(insertProduits, (err, result) => {
      if (err) throw err;
      console.log('Produits ajoutes');
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
