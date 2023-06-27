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

//VARIABLES

let isDBloaded = false;
let cart = [];
let isLoggedIn = false;
let historique = [];
const PAYPAL_ID = "ARPofou01ye9ITplB8G5bhwHFmmh-ltmsK9nFXQccx2-RaYllLEEnQC4exqwJZInh-h7p0YGF9GXaVhy";

//TABLES DEFINITIONS

//DEL + CREATE + USE
const deleteSchemaQuery = 'DROP SCHEMA IF EXISTS db_store;';
const createSchemaQuery = 'CREATE SCHEMA db_store;';
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
    ('ARPofou01ye9ITplB8G5bhwHFmmh-ltmsK9nFXQccx2-RaYllLEEnQC4exqwJZInh-h7p0YGF9GXaVhy', 'Tremblay', 'Jean', 'email1@example.com', 'password1', FALSE),
    ('ARPofou01ye9ITplB8G5bhwHFmmh-ltmsK9nFXQccx2-RaYllLEEnQC4exqwJZInh-h7p0YGF9GXaVhy', 'Gagnon', 'Marie', 'email2@example.com', 'password2', FALSE),
    ('ARPofou01ye9ITplB8G5bhwHFmmh-ltmsK9nFXQccx2-RaYllLEEnQC4exqwJZInh-h7p0YGF9GXaVhy', 'Roy', 'Claude', 'email3@example.com', 'password3', FALSE),
    ('ARPofou01ye9ITplB8G5bhwHFmmh-ltmsK9nFXQccx2-RaYllLEEnQC4exqwJZInh-h7p0YGF9GXaVhy', 'Côté', 'Yvonne', 'email4@example.com', 'password4', FALSE),
    ('ARPofou01ye9ITplB8G5bhwHFmmh-ltmsK9nFXQccx2-RaYllLEEnQC4exqwJZInh-h7p0YGF9GXaVhy', 'Bélanger', 'Pierre', 'email5@example.com', 'password5', FALSE),
    ('ARPofou01ye9ITplB8G5bhwHFmmh-ltmsK9nFXQccx2-RaYllLEEnQC4exqwJZInh-h7p0YGF9GXaVhy', 'Leblanc', 'Simone', 'email6@example.com', 'password6', FALSE),
    ('ARPofou01ye9ITplB8G5bhwHFmmh-ltmsK9nFXQccx2-RaYllLEEnQC4exqwJZInh-h7p0YGF9GXaVhy', 'Gauthier', 'Jacques', 'email7@example.com', 'password7', FALSE),
    ('ARPofou01ye9ITplB8G5bhwHFmmh-ltmsK9nFXQccx2-RaYllLEEnQC4exqwJZInh-h7p0YGF9GXaVhy', 'Lavoie', 'Louise', 'email8@example.com', 'password8', FALSE),
    ('ARPofou01ye9ITplB8G5bhwHFmmh-ltmsK9nFXQccx2-RaYllLEEnQC4exqwJZInh-h7p0YGF9GXaVhy', 'Beaudoin', 'René', 'email9@example.com', 'password9', FALSE),
    ('ARPofou01ye9ITplB8G5bhwHFmmh-ltmsK9nFXQccx2-RaYllLEEnQC4exqwJZInh-h7p0YGF9GXaVhy', 'Bergeron', 'Cécile', 'email10@example.com', 'password10', FALSE);
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

const createCommandeTable = `
  CREATE TABLE commande (
    id_commande INT AUTO_INCREMENT,
    id_client INT,
    id_produit INT,
    quantite INT,
    prix_unitaire DECIMAL(10,2),
    date_commande DATETIME,
    PRIMARY KEY (id_commande),
    FOREIGN KEY (id_client) REFERENCES clients (id_client),
    FOREIGN KEY (id_produit) REFERENCES produits (id_produit)
  );
`;

const insertCommande = `
  INSERT INTO commande (id_client, id_produit, quantite, prix_unitaire, date_commande)
  VALUES 
    (1, 1, 1, 1500, now()),
    (2, 2, 1, 800, now()),
    (1, 3, 1, 1200, now()),
    (1, 3, 1, 1200, now());
  `;    
    
//MIDDLEWARES

app.listen(port, (res, req) => {
  console.log(`Serveur express sur le port ${port}`);
  createDBTable();
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
  next();
});

//ROUTES

app.get('/', (req, res) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }

  const isLoggedIn = req.session.isLoggedIn ? req.session.isLoggedIn : false;
  const userEmail = req.session.userEmail ? req.session.userEmail : null;
  console.log(isLoggedIn); // TO REMOVE
  console.log(userEmail); // TO REMOVE
  
  connection.query('SELECT * FROM produits', (err, rows) => {
    if (err) {
      console.error("Impossible d'executer la demande:", err);
      res.status(500).send('Erreur de serveur.');
      return;
    }

    const cart = req.session.cart;

    // Bâtir l'historique
    const selectHistorique = `
      SELECT p.id_produit, p.nom, p.origine, c.quantite, c.prix_unitaire, c.date_commande, c.id_client
      FROM produits p, commande c
      WHERE p.id_produit = c.id_produit AND c.id_client = ?;
    `; 

    connection.query(
      selectHistorique,
      [req.session.clientId],  
      (err, histoire) => {
        if (err) {
        console.error("Impossible de bâtir l'historique:", err);
        res.status(500).send("Erreur dans historique.");
        return;
        }
  
      console.log('Historique:', histoire); // TO REMOVE
      res.render('index', { produits: rows, cart: cart, isLoggedIn: isLoggedIn, userEmail: userEmail, historique: histoire });

    });
  });
});

app.post('/login', (req, res) => {

  const { email, password } = req.body;

  connection.query(
    'SELECT * FROM clients WHERE courriel = ?',
    [email],
    (err, results) => {
      if (err) {
        console.error("Impossible de rejoindre la base de donnees : ", err);
        res.sendStatus(500);
        return;
      }

      if (results.length === 0) {
        res.status(401).send('Mot de passe ou courriel invalide');
        return;
      }

      const client = results[0];

      if (client.password !== password) {
        res.status(401).send('Mot de passe ou courriel invalide');
        return;
      }

      connection.query(
        'UPDATE clients SET status = ? WHERE id_client = ?',
        [true, client.id_client],
        (err) => {
          if (err) {
            console.error("Impossible de mettre a jour le compte client : ", err);
            res.sendStatus(500);
            return;
          } else {
            
            req.session.isLoggedIn = true;
            req.session.userEmail = client.courriel;
            req.session.clientId = client.id_client;
            const cart = req.session.cart;
            
            res.redirect("/");

          }
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

  res.send('Item ajoute au panier.');
});

app.post('/order', function(req, res) {
  let insertCommande = "INSERT INTO Commande (id_client, id_produit, quantite, prix_unitaire, date_commande) VALUES ";  
  const cart = req.session.cart;
  console.log("/order:clientId:")
  console.log(req.session.clientId)
  if (!req.session.clientId) {
    res.statusCode = 401;
    res.send("SVP vous connecter ou vous inscrire.");
  } else {
    cart.forEach(function(item, idx, array){
      if (idx + 1 === array.length){ 
        insertCommande += `(${req.session.clientId}, ${item.id_produit}, ${item.quantity}, ${item.price}, now());`;
      } else {
        insertCommande += `(${req.session.clientId}, ${item.id_produit}, ${item.quantity}, ${item.price}, now()),`;
      }
    });  
    console.log(insertCommande);
    connection.query(insertCommande, (err, result) => {
      if (err) throw err;
      console.log('Commandes ajoutes');
    });
    res.send('Commandes ajoutes dans la BD');
  }
});

app.delete('/cart', function(req, res) {
  const { destroy } = req.body;
  if (destroy == "all") {
    req.session.cart =[];
    res.send('Panier effacer');
  }  
});

app.post('/subscribe', (req, res) => {
  const { prenom, nom, courriel, password } = req.body;

  const query = 'INSERT INTO clients (paypalId, prenom, nom, courriel, password) VALUES (?, ?, ?, ?, ?)';
  const values = [PAYPAL_ID, prenom, nom, courriel, password];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Erreur de création du nouveau client:', error);
      res.status(500).send('Erreur de création du nouveau client');
    } else {
      console.log('Client créé avec succès');

      req.session.userEmail = courriel;
      req.session.isLoggedIn = true;
      cart = req.session.cart;
      req.session.clientId = results.insertId;

      res.redirect("/");
	  }

  });

});


//FUNCTIONS

function createDBTable() {

  connection.connect((err) => {

    if (err) {
      console.error('Erreur de connection a la base de donnees ', err);
      return;
    }

    console.log('Connexion reussie a la base de donnees!');

    // DEL + CREATE + USE

    connection.query(deleteSchemaQuery, (err) => {
      if (err) {
        console.error('Impossible de supprimer le schema : ', err);
        return;
      }});
    
    connection.query(createSchemaQuery, (err) => {
      if (err) {
        console.error('Impossible de creer le schema :', err);
        return;
      }});

    connection.query(useSchemaQuery, (err) => {
      if (err) {
        console.error('Impossible de definir le schema de base :', err);
        return;
      }});

    connection.query(createClientsTable, function(err, result) {
      if (err) throw err;
    });

    connection.query(createClientAccounts, (err, result) => {
      if (err) throw err;
    });

    connection.query(createProduitsTable, function(err, result) {
      if (err) throw err;
    });
    
    connection.query(insertProduits, (err, result) => {
      if (err) throw err;
    });
    
        connection.query(createCommandeTable, function(err, result) {
      if (err) throw err;
      console.log("TABLE commande créée"); // TO REMOVE
    });

    connection.query(insertCommande, (err, result) => {
      if (err) throw err;
      console.log('Commandes ajoutées'); // TO REMOVE
    });
    
    console.log("Initialisation de la base de donnees complete.")
  });
}


