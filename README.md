Repository of [Polish Go Championships Archive](https://mp.go.art.pl)

## Development

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000) to see the result.

## Deployment

The build produces static HTML, JS and CSS files. Additionally, it has `index.php` and `.htaccess` file for standard PHP servers to ensure that all routes would lead to `index.html`.

1. Create `.env.production` file with `SGF_URL_PREFIX=https://mp.go.art.pl/sgf/` (or other deployment server address)
2. Run `npm run build`
3. Copy contents of `out` to the server

## Adding a new tournament

Create `[year].yml` file in `public/data` directory

```yaml
location: Poznan # location name
referee: John Smith # optional referee name
website: https://mp.go.art.pl/2025 # optional website
players: # players in format: [id]: [name] [surname] [rank] 
  id1: Player Name 5d
  id2: Second Name 4d
  id3: Third Name 1k
  id4: Fourth Name 2d
top: # medalists; can be comma separated if more players were rewarded  
  - id1
  - id2
  - id3,id4
stages: # tournament can have multiple stages
  - type: league # stage type: one of league, ladder-table, round-robin-table or final 
    date: 2024-11-07 - 2024-11-10 # date of tournament in format of single YYYY-MM-DD, or range of YYYY-MM-DD - YYYY-MM-DD
    egd: https://www.europeangodatabase.eu/EGD/Tournament_Card.php?&key=T241107A # optional EGD link
    time: fischer 60m + 30s # string with time setup for the stage
    komi: 6.5
    breakers: # order of breakers, supported: wins, sos, sodos, sosos, direct, starting, rank
      - wins
      - sodos
      - direct
      - starting
    rounds: # array of rounds with array of games in format `[black player id]-[white player id] [winner-player-id]:[result] [game props]`
      - # rounds
        - id1-id2 id1:B+2.5
        - id3-id4 id3:B+1.5
```

### Game properties:

Supported game properties:

* `sgf` - path to sgf file relative to `public` directory, e.g. `sgf:sgf/2025/black-vs-white.sgf`
* `ai` - link to AI analysis, e.g. `ai:https://ai-sensei.com/game/iTdWZbZ7L5Yu4Lh0v6hEYhfUtvq2/G51DzNwBgA77fbZIiIxm`
* `yt` - link to YouTube video, e.g. `yt:https://youtube.com/watch?v=FhK57HL7ijI`
* `ogs` - link to OGS game, e.g. `ogs:https://online-go.com/review/772950`

### Preparing a sgf

Use `cleanSgf` function from `tools/sgf.js` to remove all comments and alternative paths from sgf file (the longest will
be kept). 
