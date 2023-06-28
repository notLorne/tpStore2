#PRENEZ NOTE

    For development purpose use paypal account: user="sb-fyyzh26379554@personal.example.com" password="paypal123" for approval
    Avant présentation: 
        - Mettre dropDB=false
        - Et faire le cycle de vie de l'app 1 fois ou deux 
   
    TO DO important
        - Lors d'une erreur de client ou de mot de passe au Login on sort de la loop normal, il faudrait faire un redirect("/") aussi

    Voir autre TO DO...
 
#GIT INSTRUCTIONS FOR UPDATE FROM MAIN

    FROM TERMINAL:

    step 1:
    Ensure that you have the latest changes from the main branch by running the following commands in the terminal:
    
    git checkout main
    
    git pull origin main
    
    step 2:
    Switch to the branch you want to sync with the main branch by running the following command:
    git checkout branch-name
    
    "branch-name" = isabelle_branch, mathieu_branch, jospeh_branch
    
    step 3:
    Merge the changes from the main branch into your branch by running the following command:
    git merge main
    
    step 4:
    Push the updated branch to GitHub by running the following command:
    git push origin <branch-name>

#LANCER L'APPLICATION

    cd backend
    nodemon

#ÉNONCÉ

    À remettre le 27 juin 2023 avant 23h59 | Équipe de 2 (40%)
    TP2 : Boutique Ahuntsic

    Introduction
    Vous devez construire une application web en utilisant les concepts de RestAPI qui permettra de
    gérer une boutique en ligne vendant les articles de votre choix (vêtements, articles de piscine,
    articles de bureau etc.). Voici la liste des fonctionnalités requises :

    Cas 1 : Modéliser et implémenter le SGBD (20 points)
    D’abord, il faut faire la modélisation de votre base de données SQL. Il faut tenir compte des
    exigences des autres cas afin de ne rien oublier. Une fois la modélisation complétée, il faudra
    produire le script qui permettra de créer tous vos objets de base de données.

    Cas 2 : Afficher les produits (20 points)
    Il s’agit ici d’afficher la liste de vos produits (au moins 10, sous forme de tableau). Il doit y avoir
    au moins 7 champs décrivant le produit en question. Vous devez pouvoir afficher l’image de
    votre produit à l’écran.

    Cas 3 : Intégrer un module de paiement (20 points)
    Lorsqu’on a terminé d’ajouter nos articles au panier d’achat, il doit y avoir un bouton qui permet
    de payer nos articles. Pour ce faire, il faudra faire l’intégration avec l’API de Paypal. Vous devrez
    effectuer vos recherches et lire la documentation pour savoir comment l’utiliser.

    Cas 4 : Afficher les produits achetés par le client (20 points)
    On doit pouvoir garder la trace de tous les produits achetés par un client. Ici, il s’agit donc
    d’afficher une liste à l’écran (sous forme de tableau) de tous les produits ayant déjà été achetés
    par le client connecté.
    s
    Cas 5 : Authentification et Inscription (20 points)
    Il faut pouvoir s’authentifier à votre application ou pouvoir s’inscrire si l’on n’a pas de compte.
    Une fois connecté, il faut pouvoir garder en mémoire les articles déposés dans le panier d’achat,
    et ce, même lorsqu’on rafraichit la page (concept de session).

#NOTES IMPLANTATION

#TO DO

    Si vous ajouter un to do indiquer le dans le code et dans le readme.md
    TO REMOVE indique que ça doit être retirer avant la mise en prod

    13. Il est possible de créer deux clients identique présentement. Un client avec le même email ne devrait pas pouvoir être créé
    1. Améliorer l'aspect visuel global (ex: les modal,...)    
    8. Relire le pdf du tp2 s'assurer qu'on répond bien à tout
    10. Indice sur le bouton Panier compteur d'items

    6. (ok) Question bonus? Salt-Hash
    2. (ok) Éventuellement, ne plus détruire le BD au complet car on pert les commandes et les nouveaux clients  
    11.(ok) S'inscrire ne devrait plus être disponible quand on est login
    5. (ok) Logout?
    0. (ok) cart dans variable de session et non variable global ds app.js
    3. (ok) Retirer paypalId dans la table client

    12. (pas ok mais pas grave) Regarder bouton paypal erreur: b.sbox.stats.paypal.com/v2/counter.cgi?p=uid_8ddcb4ced1_mde6mde6mdm&s=SMART_PAYMENT_BUTTONS:1     GET https://b.sbox.stats.paypal.com/v2/counter.cgi?p=uid_8ddcb4ced1_mde6mde6mdm&s=SMART_PAYMENT_BUTTONS net::ERR_CONNECTION_TIMED_OUT

    Question (steve):


#ENTÊTE
   
    Projet: Boutique Ahuntsic
    Codeurs: Joseph, Isabelle, Mathieu
    Cours : Programmation Web côté serveur (420-289-AH)