const express = require('express');
const mysql = require('mysql2'); // Use mysql2 instead of mysql cause authentification mecanism problem


const app = express();
const port = 3000;
  
app.listen(port, () => {
  console.log(`Serveur express sur le port ${port}`)
})


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'MySQL181',
  database: 'labo2'
});

app.get('/mysql', (req, res) => {

  console.log("Route /mysql");
  connection.connect();

  // Création des tables
  var createClientTable = `
    CREATE TABLE Client (
      id_client INT AUTO_INCREMENT,
      nom VARCHAR(255),
      prenom VARCHAR(255),
      courriel VARCHAR(255),
      password VARCHAR(255),
      PRIMARY KEY (id_client)
    );`;

  connection.query(createClientTable, function(err, result) {
    if (err) throw err;
    console.log("TABLE Client créée");
  });

  var createProduitTable = `
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

  connection.query(createProduitTable, function(err, result) {
    if (err) throw err;
    console.log("TABLE Produit créée");
  });


  // Fonctionne pas yé tard à regarder
  // var createCommandeTable = `
  //   CREATE TABLE Commande (
  //     id_commande INT AUTO_INCREMENT,
  //     quantite INT,
  //     PRIMARY KEY (id_commande),
  //     FOREIGN KEY (id_client) REFERENCES Client(id_client),
  //     FOREIGN KEY (id_produit) REFERENCES Produit(id_produit)
  //   );`;

  // connection.query(createCommandeTable, function(err, result) {
  // if (err) throw err;
  // console.log("TABLE Commande créée");
  // });
  
  connection.end(); 

});


// ********** POT DE CODE / COPY_PASTE **********

// *** Peut être utile mais utiliser si necessaire ***
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));

// const cors = require('cors')
// app.use(cors())

// **********************************************
// Exemple du prof - relation avec index.ejs

// app.set("view engine", "ejs");
 
//   // Initialisation du tableau avec les valenodemonrs
//   var langues = ["français", "anglais", "espanol"];

//   app.get('/ejs', (req, res) => {
//     res.render("index", {myLanguages: langues})
//   })

// //Recevoir la réponse du formulaire a partir du ejs
//   app.post('/ejs', (req, res) => {
//     // Ajouter une langue
//     langues.push(req.body.newLanguage)
//     res.redirect("/ejs")
//   })

// **** Code isa qui servait pas pour l'instant ****
// connection.query('SELECT * FROM Departement', function (error, results) {
//   if (error) throw error;
//   console.log('Les départements sont: ', results);
// });

// var createCartTable = `
//   CREATE TABLE panier (
//     id_panier INT AUTO_INCREMENT,
//     id_client INT,
//     id_produit INT,
//     quantite INT,
//     PRIMARY KEY (id_panier),
//     FOREIGN KEY (id_client) REFERENCES client(id),
//     FOREIGN KEY (id_produit) REFERENCES produits(id_produit)
//   );`;

// connection.query(createCartTable, function(err, result) {
//   if (err) throw err;
//   console.log("Table panier créée");
// });

// var createPaypalTable = `
//   CREATE TABLE paypal (
//     id_client INT,
//     info_paiement VARCHAR(255),
//     FOREIGN KEY (id_client) REFERENCES client(id_client)
//   );`;

// connection.query(createPaypalTable, function(err, result) {
//   if (err) throw err;
//   console.log("Table paypal créée");
// });
