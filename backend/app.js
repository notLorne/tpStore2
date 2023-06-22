//CONSTANTS

const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;
const ejs = require('ejs');

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
const deleteSchemaQuery = 'DROP SCHEMA IF EXISTS db_store;';
const createSchemaQuery = 'CREATE SCHEMA db_store;';
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
    ('Collier en diamant', 'Collier', 1500, 'Or blanc 18 carats', 'Diamant', 1.5, 'webpage'),
    ('Bague en rubis', 'Bague', 800, 'Or jaune 14 carats', 'Rubis', 0.75, 'webpage'),
    ('Boucles d''oreilles en émeraude', 'Boucles d''oreilles', 1200, 'Platine', 'Émeraude', 1.0, 'webpage'),
    ('Bracelet en saphir', 'Bracelet', 1800, 'Argent sterling', 'Saphir', 2.0, 'webpage'),
    ('Pendentif en améthyste', 'Pendentif', 400, 'Or rose 10 carats', 'Améthyste', 0.5, 'webpage'),
    ('Boucles d''oreilles en perle', 'Boucles d''oreilles', 250, 'Argent sterling', 'Perle', NULL, 'webpage'),
    ('Bague en topaze', 'Bague', 350, 'Or blanc 10 carats', 'Topaze', 1.25, 'webpage'),
    ('Bracelet en grenat', 'Bracelet', 500, 'Argent', 'Grenat', 0.75, 'webpage'),
    ('Collier en opale', 'Collier', 900, 'Or blanc 14 carats', 'Opale', 1.8, 'webpage'),
    ('Boucles d''oreilles en citrine', 'Boucles d''oreilles', 300, 'Or jaune', 'Citrine', 1.5, 'webpage');
`;

//METHODS

app.listen(port, (res, req) => {
  console.log(`Serveur express sur le port ${port}`);
  console.log(req);
});

app.set('view engine', 'ejs');

app.get('/products', (req, res) => {
  // Retrieve data from the MySQL database
  connection.query('SELECT * FROM produits', (err, rows) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).send('Internal Server Error');
    }

    // Render the 'products' view with the retrieved data
    res.render('products', { products: rows });
  });
});

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

    connection.end((err) => {
      if (err) {
        console.error('Error closing the database connection: ', err);
        return;
      }
      console.log('Connection closed.');
    });
  });
}

createDBTable();
