export const THEME_PROMPTS = {
  'math-algebra-beginner': {
    theme: 'Mathématiques',
    subTheme: 'Algèbre',
    difficulty: 'beginner',
    title: 'Les bases de l\'algèbre',
    description: 'Résoudre des équations simples, comprendre les variables et les termes algébriques',
    prompt: `Génère un quiz sur les bases de l'algèbre pour collège : équations simples, variables, coefficients, termes algébriques.`
  },
  'math-algebra-intermediate': {
    theme: 'Mathématiques',
    subTheme: 'Algèbre',
    difficulty: 'intermediate',
    title: 'Équations du premier degré',
    description: 'Équations avec parenthèses, fractions et inéquations',
    prompt: `Génère un quiz sur les équations du premier degré : résolutions d'équations avec parenthèses, fractions et inéquations.`
  },
  'math-algebra-advanced': {
    theme: 'Mathématiques',
    subTheme: 'Algèbre',
    difficulty: 'advanced',
    title: 'Équations du second degré',
    description: 'Factorisation, discriminant et résolution d\'équations quadratiques',
    prompt: `Génère un quiz sur les équations du second degré : factorisation, calcul du discriminant et résolution complète.`
  },
  'math-geometry-beginner': {
    theme: 'Mathématiques',
    subTheme: 'Géométrie',
    difficulty: 'beginner',
    title: 'Figures géométriques de base',
    description: 'Noms et propriétés des formes planes et solides',
    prompt: `Génère un quiz sur les figures géométriques de base : carrés, triangles, cercles, cubes, pyramides et leurs propriétés.`
  },
  'math-geometry-intermediate': {
    theme: 'Mathématiques',
    subTheme: 'Géométrie',
    difficulty: 'intermediate',
    title: 'Calculs géométriques',
    description: 'Théorème de Pythagore et calcul d\'aires et volumes',
    prompt: `Génère un quiz sur les calculs géométriques : théorème de Pythagore, aires des figures planes, volumes des solides.`
  },
  'math-geometry-advanced': {
    theme: 'Mathématiques',
    subTheme: 'Géométrie',
    difficulty: 'advanced',
    title: 'Trigonométrie',
    description: 'Sinus, cosinus, tangente et leurs applications',
    prompt: `Génère un quiz sur la trigonométrie : définition et calcul des sinus, cosinus, tangente dans le triangle rectangle.`
  },
  'math-calculation-beginner': {
    theme: 'Mathématiques',
    subTheme: 'Calcul',
    difficulty: 'beginner',
    title: 'Opérations de base',
    description: 'Addition, soustraction, multiplication et division',
    prompt: `Génère un quiz sur les opérations de base : additions, soustractions, multiplications et divisions avec nombres entiers.`
  },
  'math-calculation-intermediate': {
    theme: 'Mathématiques',
    subTheme: 'Calcul',
    difficulty: 'intermediate',
    title: 'Fractions et décimaux',
    description: 'Calcul avec fractions, nombres décimaux et pourcentages',
    prompt: `Génère un quiz sur les fractions et décimaux : calculs avec fractions, conversions décimales et pourcentages.`
  },
  'math-calculation-advanced': {
    theme: 'Mathématiques',
    subTheme: 'Calcul',
    difficulty: 'advanced',
    title: 'Puissances et racines',
    description: 'Calculs avec exposants, puissances et racines carrées',
    prompt: `Génère un quiz sur les puissances et racines : propriétés des exposants, calculs avec puissances et racines carrées.`
  },
  'sciences-biology-beginner': {
    theme: 'Sciences',
    subTheme: 'Biologie',
    difficulty: 'beginner',
    title: 'Le monde du vivant',
    description: 'Découvrez les bases de la biologie et l\'organisation du vivant',
    prompt: `Génère un quiz sur les bases de la biologie : cellules, tissus, organes, systèmes et photosynthèse.`
  },
  'sciences-biology-intermediate': {
    theme: 'Sciences',
    subTheme: 'Biologie',
    difficulty: 'intermediate',
    title: 'Le corps humain',
    description: 'Anatomie et physiologie du corps humain',
    prompt: `Génère un quiz sur le corps humain : systèmes digestif, respiratoire, cardiovasculaire et fonctions de chaque organe.`
  },
  'sciences-biology-advanced': {
    theme: 'Sciences',
    subTheme: 'Biologie',
    difficulty: 'advanced',
    title: 'Évolution et génétique',
    description: 'La théorie de l\'évolution et les mécanismes de l\'hérédité',
    prompt: `Génère un quiz sur l'évolution et la génétique : sélection naturelle, mutations, ADN et transmission des caractères.`
  },
  'sciences-chemistry-beginner': {
    theme: 'Sciences',
    subTheme: 'Chimie',
    difficulty: 'beginner',
    title: 'Éléments et atomes',
    description: 'Comprends la composition de la matière',
    prompt: `Génère un quiz sur les atomes et les éléments : structure atomique, tableau périodique, liaisons chimiques.`
  },
  'sciences-chemistry-intermediate': {
    theme: 'Sciences',
    subTheme: 'Chimie',
    difficulty: 'intermediate',
    title: 'Réactions chimiques',
    description: 'Équilibres, acides/bases et réactions d\'oxydoréduction',
    prompt: `Génère un quiz sur les réactions chimiques : équations chimiques, acides et bases, réactions de combustion.`
  },
  'sciences-chemistry-advanced': {
    theme: 'Sciences',
    subTheme: 'Chimie',
    difficulty: 'advanced',
    title: 'Chimie organique',
    description: 'Molécules carbonées et fonction chimiques',
    prompt: `Génère un quiz sur la chimie organique : chaînes carbonées, alcools, acides carboxyliques et leurs réactions.`
  },
  'sciences-physics-beginner': {
    theme: 'Sciences',
    subTheme: 'Physique',
    difficulty: 'beginner',
    title: 'Les lois de Newton',
    description: 'Comprends les principes fondamentaux de la physique',
    prompt: `Génère un quiz sur les lois de Newton : première, deuxième et troisième loi, force, masse et accélération.`
  },
  'sciences-physics-intermediate': {
    theme: 'Sciences',
    subTheme: 'Physique',
    difficulty: 'intermediate',
    title: 'Énergie et mouvement',
    description: 'Travail, puissance, énergie cinétique et potentielle',
    prompt: `Génère un quiz sur l'énergie et le mouvement : travail mécanique, puissance, types d'énergie et conservation.`
  },
  'sciences-physics-advanced': {
    theme: 'Sciences',
    subTheme: 'Physique',
    difficulty: 'advanced',
    title: 'Électricité',
    description: 'Courant électrique, tension et résistance',
    prompt: `Génère un quiz sur l'électricité : courant électrique, tension, résistance, loi d'Ohm et circuits.`
  },
  'history-ancient-beginner': {
    theme: 'Histoire',
    subTheme: 'Antiquité',
    difficulty: 'beginner',
    title: 'Les civilisations anciennes',
    description: 'Voyage dans le temps vers l\'Antiquité',
    prompt: `Génère un quiz sur les civilisations antiques : Égypte pharaonique, Grèce antique, Rome antique et leurs inventions.`
  },
  'history-ancient-intermediate': {
    theme: 'Histoire',
    subTheme: 'Antiquité',
    difficulty: 'intermediate',
    title: 'La démocratie athénienne',
    description: 'L\'organisation politique et sociale de la Grèce antique',
    prompt: `Génère un quiz sur la démocratie athénienne : assemblée, tribunaux, esclavage et organisation sociale grecque.`
  },
  'history-ancient-advanced': {
    theme: 'Histoire',
    subTheme: 'Antiquité',
    difficulty: 'advanced',
    title: 'L\'Empire romain',
    description: 'Gouvernement, armée et administration romaine',
    prompt: `Génère un quiz sur l'Empire romain : républiques, empereurs, conquêtes militaires et organisation administrative.`
  },
  'history-medieval-beginner': {
    theme: 'Histoire',
    subTheme: 'Moyen Âge',
    difficulty: 'beginner',
    title: 'Le Moyen Âge européen',
    description: 'La vie au Moyen Âge en Europe',
    prompt: `Génère un quiz sur le Moyen Âge : châteaux forts, chevaliers, manoirs, seigneurs et paysans.`
  },
  'history-medieval-intermediate': {
    theme: 'Histoire',
    subTheme: 'Moyen Âge',
    difficulty: 'intermediate',
    title: 'Les croisades',
    description: 'Les guerres saintes et leurs conséquences',
    prompt: `Génère un quiz sur les croisades : causes des croisades, principales batailles et conséquences culturelles.`
  },
  'history-medieval-advanced': {
    theme: 'Histoire',
    subTheme: 'Moyen Âge',
    difficulty: 'advanced',
    title: 'La Renaissance',
    description: 'Transition entre Moyen Âge et Temps modernes',
    prompt: `Génère un quiz sur la Renaissance : humanisme, invention de l'imprimerie, grands artistes et scientifiques.`
  },
  'history-modern-beginner': {
    theme: 'Histoire',
    subTheme: 'Époque moderne',
    difficulty: 'beginner',
    title: 'Les grandes découvertes',
    description: 'Exploration et conquêtes européennes',
    prompt: `Génère un quiz sur les grandes découvertes : Christophe Colomb, Vasco de Gama, conquistadors et conséquences.`
  },
  'history-modern-intermediate': {
    theme: 'Histoire',
    subTheme: 'Époque moderne',
    difficulty: 'intermediate',
    title: 'La Révolution française',
    description: 'Causes et déroulement de la Révolution',
    prompt: `Génère un quiz sur la Révolution française : états généraux, prise de la Bastille, révolution et empire napoléonien.`
  },
  'history-modern-advanced': {
    theme: 'Histoire',
    subTheme: 'Époque moderne',
    difficulty: 'advanced',
    title: 'Les deux guerres mondiales',
    description: 'Causes, déroulement et conséquences des conflits mondiaux',
    prompt: `Génère un quiz sur les deux guerres mondiales : Première Guerre mondiale, Seconde Guerre mondiale, leurs causes et conséquences.`
  },
  'geography-maps-beginner': {
    theme: 'Géographie',
    subTheme: 'Cartes',
    difficulty: 'beginner',
    title: 'Lire une carte',
    description: 'Apprends à t\'orienter avec les cartes',
    prompt: `Génère un quiz sur la lecture de cartes : points cardinaux, échelle, légendes et courbes de niveau.`
  },
  'geography-maps-intermediate': {
    theme: 'Géographie',
    subTheme: 'Cartes',
    difficulty: 'intermediate',
    title: 'Cartes thématiques',
    description: 'Population, climat et relief à travers les cartes',
    prompt: `Génère un quiz sur les cartes thématiques : cartes de population, climatiques, physiques et économiques.`
  },
  'geography-maps-advanced': {
    theme: 'Géographie',
    subTheme: 'Cartes',
    difficulty: 'advanced',
    title: 'Géolocalisation',
    description: 'GPS, coordonnées et systèmes de projection',
    prompt: `Génère un quiz sur la géolocalisation : système GPS, latitude/longitude, fuseaux horaires et projections cartographiques.`
  },
  'geography-capitals-beginner': {
    theme: 'Géographie',
    subTheme: 'Capitales',
    difficulty: 'beginner',
    title: 'Capitales européennes',
    description: 'Les capitales des pays européens',
    prompt: `Génère un quiz sur les capitales européennes : localise et nomme les capitales des principaux pays d'Europe.`
  },
  'geography-capitals-intermediate': {
    theme: 'Géographie',
    subTheme: 'Capitales',
    difficulty: 'intermediate',
    title: 'Capitales du monde',
    description: 'Capitales des continents et pays importants',
    prompt: `Génère un quiz sur les capitales mondiales : Asie, Afrique, Amérique, Océanie et principales capitales politiques.`
  },
  'geography-capitals-advanced': {
    theme: 'Géographie',
    subTheme: 'Capitales',
    difficulty: 'advanced',
    title: 'Capitales et géopolitique',
    description: 'Histoire et rôle géopolitique des capitales',
    prompt: `Génère un quiz sur les capitales et leur rôle géopolitique : capitales anciennes, nouvelles capitales et enjeux territoriaux.`
  },
  'geography-demography-beginner': {
    theme: 'Géographie',
    subTheme: 'Démographie',
    difficulty: 'beginner',
    title: 'Population mondiale',
    description: 'Comprendre les nombres et la répartition des populations',
    prompt: `Génère un quiz sur la démographie mondiale : population par continents, pays les plus peuplés et croissance démographique.`
  },
  'geography-demography-intermediate': {
    theme: 'Géographie',
    subTheme: 'Démographie',
    difficulty: 'intermediate',
    title: 'Pyramides des âges',
    description: 'Analyse des populations par âge et sexe',
    prompt: `Génère un quiz sur les pyramides des âges : interprétation des pyramides, vieillissement, fécondité et espérance de vie.`
  },
  'geography-demography-advanced': {
    theme: 'Géographie',
    subTheme: 'Démographie',
    difficulty: 'advanced',
    title: 'Migrations',
    description: 'Flux migratoires et conséquences démographiques',
    prompt: `Génère un quiz sur les migrations : causes des migrations, flux migratoires mondiaux et conséquences sociales.`
  },
  'languages-vocabulary-beginner': {
    theme: 'Langues',
    subTheme: 'Vocabulaire',
    difficulty: 'beginner',
    title: 'Enrichis ton vocabulaire',
    description: 'Apprends de nouveaux mots en français',
    prompt: `Génère un quiz de vocabulaire français niveau collège : synonymes, antonymes, familles de mots et orthographe.`
  },
  'languages-vocabulary-intermediate': {
    theme: 'Langues',
    subTheme: 'Vocabulaire',
    difficulty: 'intermediate',
    title: 'Expressions et idiomes',
    description: 'Expressions courantes et figures de style',
    prompt: `Génère un quiz sur les expressions françaises : locutions, proverbes courants et sens figuré des expressions.`
  },
  'languages-vocabulary-advanced': {
    theme: 'Langues',
    subTheme: 'Vocabulaire',
    difficulty: 'advanced',
    title: 'Vocabulaire littéraire',
    description: 'Mots savants et vocabulaire littéraire',
    prompt: `Génère un quiz sur le vocabulaire littéraire français : mots d'origine grecque/latine, champs lexicaux et figures de rhétorique.`
  },
  'languages-grammar-beginner': {
    theme: 'Langues',
    subTheme: 'Grammaire',
    difficulty: 'beginner',
    title: 'Les bases de la grammaire',
    description: 'Sujets, verbes et compléments',
    prompt: `Génère un quiz sur les bases de la grammaire française : sujet/verbe, compléments d'objet, adjectifs qualificatifs.`
  },
  'languages-grammar-intermediate': {
    theme: 'Langues',
    subTheme: 'Grammaire',
    difficulty: 'intermediate',
    title: 'Conjugaison',
    description: 'Temps et modes des verbes',
    prompt: `Génère un quiz sur la conjugaison française : présent, passé composé, imparfait, futur et conditionnel.`
  },
  'languages-grammar-advanced': {
    theme: 'Langues',
    subTheme: 'Grammaire',
    difficulty: 'advanced',
    title: 'Subordonnées et discours',
    description: 'Phrases complexes et discours indirect',
    prompt: `Génère un quiz sur les subordonnées et le discours indirect : propositions relatives, causales, consécutives.`
  },
  'languages-conjugation-beginner': {
    theme: 'Langues',
    subTheme: 'Conjugaison',
    difficulty: 'beginner',
    title: 'Verbes en -er',
    description: 'Conjugaison des verbes du premier groupe',
    prompt: `Génère un quiz sur les verbes en -er : conjugaison au présent, futur et passé composé des verbes réguliers.`
  },
  'languages-conjugation-intermediate': {
    theme: 'Langues',
    subTheme: 'Conjugaison',
    difficulty: 'intermediate',
    title: 'Verbes irréguliers',
    description: 'Conjugaison des verbes du deuxième et troisième groupe',
    prompt: `Génère un quiz sur les verbes irréguliers : être, avoir, aller, faire, prendre et verbes en -ir/-re irréguliers.`
  },
  'languages-conjugation-advanced': {
    theme: 'Langues',
    subTheme: 'Conjugaison',
    difficulty: 'advanced',
    title: 'Tous les temps',
    description: 'Maîtrise complète de la conjugaison française',
    prompt: `Génère un quiz complet de conjugaison : subjonctif, formes passives, impératif et temps composés.`
  }
};

export const getThemeData = (themeId) => {
  return THEME_PROMPTS[themeId];
};

export const getThemesByCategory = () => {
  const themes = {};
  Object.entries(THEME_PROMPTS).forEach(([id, data]) => {
    if (!themes[data.theme]) {
      themes[data.theme] = {};
    }
    if (!themes[data.theme][data.subTheme]) {
      themes[data.theme][data.subTheme] = {};
    }
    themes[data.theme][data.subTheme][data.difficulty] = {
      id,
      title: data.title,
      description: data.description
    };
  });
  return themes;
};
