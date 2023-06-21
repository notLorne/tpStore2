//CONSTANTS

const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'tp_account_1',
  password: 'test',
  database: 'db_store'
});

//TABLES DEFINITIONS

const createClientsTable = `
  CREATE TABLE clients (
    id_client INT AUTO_INCREMENT,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    courriel VARCHAR(255),
    password VARCHAR(255),
    PRIMARY KEY (id_client)
  );`;

const createProduitTable = `
  CREATE TABLE Produit (
    id_produit INT AUTO_INCREMENT,
    nom VARCHAR(255),
    categorie VARCHAR(255),
    prix DECIMAL(10,2),
    materiel VARCHAR(255),
    gemstone VARCHAR(255),
    carat DECIMAL(4,2),
    image_url VARCHAR(1024),
    PRIMARY KEY (id_produit)
  );`;

var createCommandeTable = `
  CREATE TABLE Commande (
    id_commande INT AUTO_INCREMENT,
    quantite INT,
    PRIMARY KEY (id_commande),
    FOREIGN KEY (id_client) REFERENCES Client(id_client),
    FOREIGN KEY (id_produit) REFERENCES Produit(id_produit)
  );`;

//VARIABLE

//METHODS

app.listen(port, (res, req) => {
  console.log(`Serveur express sur le port ${port}`);
  console.log(req);
});

function createDBTable() {
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database: ', err);
      return;
    }
    console.log('Connected to the database!');
    // Create Tables

    connection.query(createClientsTable, function(err, result) {
      if (err) throw err;
      console.log("TABLE Client créée");
    });

    connection.query(createProduitTable, function(err, result) {
      if (err) throw err;
      console.log("TABLE Produit créée");
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
