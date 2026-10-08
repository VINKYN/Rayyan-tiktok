# 🎬 Ballzs Studio — Générateur Automatique de Vidéos TikTok Satisfaisantes

Application web complète conçue pour créer et exporter des vidéos TikTok / Reels / Shorts virales et monétisables inspirées du compte **@ballzs7** (animations physiques satisfaisantes avec rebonds de balles, destruction de briques et notes musicales polyphoniques).

---

## 🚀 Démarrage Rapide

Le serveur de développement tourne sur votre machine locale :

- **URL Locale :** [http://localhost:3000/](http://localhost:3000/)

Pour relancer l'application à tout moment :
```bash
npm run dev
```

---

## 💎 Nouveautés & Fonctionnalités Clés

### 1. ⚔️ Système de Paris & Compteur par Bille (Engagement Viral)
- **Compteur de score en direct :** Chaque bille détruit des briques et accumule son propre score affiché en direct sur le HUD en haut de l'écran :
  - `🔵 BLEUE : 48 👑`
  - `🔴 ROUGE : 41`
  - `🟡 JAUNE : 35`
- **Couronne Dorée 👑 :** La bille qui mène le score porte une couronne dorée animée en direct.
- **Podium & Call-to-Action de Fin :** À la fin du chrono, un écran de victoire sacre la bille championne et invite les spectateurs à commenter : *"Aviez-vous parié sur la bonne bille en commentaire ? 👇"*.
- **Modes de Jeu en 1 Clic :**
  - 🎯 **Solo** : Quête 100% destruction avec 1 bille.
  - ⚔️ **Duo (Duel)** : Duel acharné 🔵 Bleue vs 🔴 Rouge.
  - 🏆 **Trio** : Bataille à 3 (🔵 vs 🔴 vs 🟡).
  - 👑 **4 Joueurs** : Squad Royale à 4 billes.
  - 🌪️ **Chaos** : 6 billes simultanées pour un spectacle pyrotechnique.

### 2. 💰 Durée 60s - 75s Optimisée pour la Monétisation TikTok
- **Eligibilité Creator Rewards Program :** Les vidéos font par défaut **65 secondes** (presets : 60s, 65s, 70s, 75s) pour dépasser le seuil strict de 1 minute exigé par TikTok pour la monétisation.
- **Rythme & Climax équilibrés :** La vitesse et l'accélération progressive (+1.5% par rebond) sont calibrées pour créer une montée d'adrénaline jusqu'aux 5 dernières secondes du décompte.

### 3. 🌀 22 Mini-Jeux & Dispositions de Briques
1. **Anneaux d'Évasion** (Concentric Rings)
2. **Hexagone Rotatif** (Rotating Hexagon Cage)
3. **Spirale Cosmique** (Archimedes Spiral)
4. **Cible Fléchette** (Bullseye Target)
5. **Matrice Casse-Briques** (Dense Neon Matrix)
6. **Le Diamant / Losange** (Diamond Arena)
7. **Le Cœur de Briques** (Heart Breaker)
8. **La Forteresse Médiévale** (Castle Fortress)
9. **Pachinko Cascade** (Gravity Peg Drop — Chute du haut)
10. **Plinko Pyramid** (Cascade pyramidale avec gravité)
11. **Le Sablier du Destin** (Hourglass à double réservoir)
12. **Chute Gravitationnelle** (Gravity Well Platforms)
13. **Pyramide Égyptienne** (Tiered Funnel Pyramid)
14. **L'Arène Yin-Yang** (Courbe S fluide)
15. **La Croisée des 4 Piliers** (Cross Roads)
16. **Le Double Vortex** (Twin Orbits)
17. **L'Étoile Cosmique** (8-Pointed Star)
18. **Vagues Sinusoïdales** (Ocean Waves)
19. **Le Circuit Donut** (Double Torus)
20. **Les Îlots Flottants** (Floating Islands)
21. **Le Flipper Néon** (Pinball Bumpers)
22. **L'Octogone Mortel** (8-Sided Rotating Cage)

### 4. 🎨 22 Thèmes & Palettes Visuelles
- Cyberpunk Néon, Sunset Synthwave, Matrix Émeraude, Bubblegum Pop, Galaxie Profonde, Lave & Magma, Glace Arctique, Améthyste Royale, Tokyo Night, Forêt Enchantée, Pêche & Pastel, Or Noir Luxe, Acid Toxic, Miami Vice, Rubis & Sangria, Rétro 80s Arcade, Aurore Boréale, Minimaliste Titanium, Barbe à Papa, Hyper Vitesse, Abysses Océaniques, Crépuscule Désertique.

### 5. 🎵 10 Instruments Synthétisés & 7 Gammes Musicales
- **10 Instruments :**
  1. *Marimba Acoustique* (Boisé et doux, signature @ballzs7)
  2. *Kalimba / Sanza* (Lames métalliques résonnantes)
  3. *Goutte d'Eau / Bubble Pop* (Effet liquide ultra satisfaisant)
  4. *Carillon de Cristal* (Pur et aérien)
  5. *Synthé Rêveur 80s* (Pluck atmosphérique)
  6. *Vibraphone Jazz* (Avec modulation trémolo)
  7. *Boîte à Musique Féerique*
  8. *Pluck Acoustique Harmonieuse*
  9. *Rétro Arcade 8-bit*
  10. *Cyber Bass Pluck* (Grave punchy)
- **7 Gammes :** Pentatonique Majeure, Pentatonique Mineure, Hirajoshi Japonaise, Lydienne Cosmique, Cyber Bass, Dorienne Mélodique, Pentatonique Blues.

### 6. 📹 Export Vidéo Garanti en .MP4 HD 60 FPS
- Format standard **1080 x 1920 (9:16 vertical)**.
- Débit élevé de **10 Mbps à 60 images par seconde**.
- Piste audio synthétisée intégrée en direct dans le conteneur MP4.
- Téléchargement automatique dès que les 65 secondes sont écoulées.

---

## 📁 Structure du Projet

- [index.html](file:///c:/Users/vince/Desktop/Rayyan/index.html) — Structure de l'interface studio, sélecteur de modes et smartphone 9:16
- [src/style.css](file:///c:/Users/vince/Desktop/Rayyan/src/style.css) — Design sombre luxe, glassmorphism, grilles à défilement et HUD
- [src/audio.js](file:///c:/Users/vince/Desktop/Rayyan/src/audio.js) — Moteur de synthèse avec 10 instruments et routing direct
- [src/physics.js](file:///c:/Users/vince/Desktop/Rayyan/src/physics.js) — 22 motifs, gestion des scores par bille et rendu Canvas 1080x1920
- [src/recorder.js](file:///c:/Users/vince/Desktop/Rayyan/src/recorder.js) — Moteur d'exportation MP4 60 FPS
- [src/main.js](file:///c:/Users/vince/Desktop/Rayyan/src/main.js) — Contrôleur principal et liaisons interactives
