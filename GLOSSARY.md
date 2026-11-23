# Go Tournaments Archive

A static or standalone multi-event archive of Go tournament results, all-time statistics, and SGF game records.

## Language

### Archive structure

**Archive**:
A deployed site built from a configuration preset, hosting either a single event or a multi-event collection with a selector page.
_Avoid_: Site, instance, portal

**Archive Domain**:
The canonical origin (scheme and host, without `basePath` or event prefix) where an archive is hosted.
_Avoid_: Site URL, base URL

**Event**:
A recurring Go competition series (such as WAGC, EGC, or PGC) with its own branding, translations, editions, and statistics.
_Avoid_: Tournament series, competition

**External Event**:
An event listed in a multi-event archive's selector and cross-links whose pages and assets are hosted at its own external domain rather than built internally.

**Edition**:
A single year or numbered occurrence of an event, containing stages, standings, and games, or an upcoming announcement before results exist.
_Avoid_: Tournament, year

### Visual assets

**Share Image**:
The landscape preview image emitted for social media links, available in archive, event overview, edition, statistics, and game-records variants.
_Avoid_: Thumbnail, OG banner, social preview

**Board Thumbnail**:
A small Go board diagram of a single game's position displayed next to game entries.
_Avoid_: Game preview, share image

**Hero Background**:
An event's wide atmospheric banner artwork displayed behind the event homepage header and used as the visual base for event share images.
_Avoid_: Banner, cover
