# Event hero background generation

These fictional test illustrations combine rooms generated with the built-in image generation tool and Go boards rendered from actual archived SGF positions. They do not depict the venues where those games were played.

All 21 final assets are `events/<event-id>/background.jpg`, 1536 × 512 pixels, JPEG quality 90. The generated 2172 × 724 room images were proportionally downscaled without cropping. The site applies the theme-aware vignette; no fade is baked into these files.

The composition uses diagonal views of a board aligned with a freestanding gaming table and opposite chairs. Windows, architecture and regional views take priority over floor space. Bowls are closed to avoid invented loose stones.

## Board rendering

The generator supplied a wooden board blank. A regular 19 × 19 grid and nine star points were projected onto its top face using its four corners. The SGF main line was replayed through the selected move, including captures, without modifying the source files. The three resulting positions are reused with quarter-turn rotations.

Each stone is an opaque, shaded rounded biconvex lens with a soft contact shadow. The renderer in [tools/backgrounds](../tools/backgrounds/README.md) samples the room window for daylight color and direction, and the blank wood beneath each stone for local exposure. Broad window reflections, restrained wood-colored bounce, and nearby-stone occlusion replace the shared studio lighting. Its contact point uses the same projective transform as its grid intersection. The intersection coordinates were checked by inverse projection. The board surface was lightly smoothed inside its boundary to remove residual generated markings, then composited at twice source resolution and downscaled.

## Source positions

| Position | SGF                                                                                   | Move | Black stones | White stones |
| -------- | ------------------------------------------------------------------------------------- | ---: | -----------: | -----------: |
| NLK      | [Zihan Yan – Rob van Zeijst](./nlk/sgf/2026/7-ZihanYan-RobvanZeijst.sgf)              |   36 |           16 |           18 |
| PGC      | [Cezary Czernecki – Stanisław Frejlak](./pgc/sgf/2025/2025-7-cczernecki-sfrejlak.sgf) |   32 |           15 |           16 |
| WAGC     | [Yu-Cheng Lai – Tianfang Ma](./wagc/sgf/2025/8-YuChengLai-TianfangMa.sgf)             |   34 |           17 |           17 |

Coordinates below use SGF letters (`aa` is the top-left intersection), before rotation.

### NLK

- Black: `hd`, `nd`, `qd`, `ce`, `df`, `ef`, `pj`, `qj`, `ok`, `no`, `oo`, `lp`, `op`, `pq`, `or`, `qr`.
- White: `dc`, `ed`, `ge`, `cg`, `dg`, `pk`, `qk`, `ol`, `rl`, `om`, `pm`, `qm`, `po`, `dp`, `np`, `qp`, `nq`, `qq`.

### PGC

- Black: `pd`, `ck`, `dk`, `cl`, `bm`, `bn`, `cn`, `en`, `do`, `fo`, `dp`, `hp`, `pp`, `eq`, `jq`.
- White: `dc`, `fk`, `dl`, `cm`, `dm`, `fm`, `dn`, `hn`, `co`, `jo`, `cp`, `bq`, `dq`, `nq`, `cr`, `dr`.

### WAGC

- Black: `oc`, `od`, `qd`, `ce`, `de`, `gg`, `eh`, `fk`, `ql`, `fo`, `op`, `cq`, `dq`, `eq`, `pq`, `fr`, `gr`.
- White: `dc`, `fc`, `cd`, `nd`, `nf`, `ci`, `ei`, `fi`, `dj`, `gn`, `qo`, `cp`, `dp`, `ep`, `fq`, `gq`, `hq`.

## Shared room prompt

For each image, this exact shared prompt was followed by the event-specific suffix below. The requests for an empty board override any board-position wording retained in the regional scene description.

Use case: photorealistic-natural.
Generate a premium natural photograph composed as a full-bleed 1536x512 (3:1) panoramic website hero banner.
The scene is a quiet Go club or championship room with warm natural timber, soft cinematic window light and beautiful regional scenery, described below. Architecture, windows and the view dominate the upper and left portions; at left use softly out-of-focus room details and furnishings. Show only a little floor in the bottom-left, approximately 10% of the whole picture. Camera looks mostly forward from a few metres away, not downward toward the floor.
On the RIGHT is a finite freestanding rectangular gaming table, with its left edge visible, and two empty opposite chairs positioned for comfortable play. The window is beside the players, not behind a trapped seat. Table edges and board edges align so both seated players face a straight board edge. Table legs and lower chair parts are cropped out naturally. The tabletop occupies only the right two-thirds, never the full image width.
On the table place a complete plain square honeywood board blank, like an unfinished high-quality goban BEFORE its playing grid is added. Beautiful matte continuous natural wood grain and a 3cm-thick wooden side. IMPORTANT: the entire upper surface is EMPTY UNMARKED WOOD: absolutely no grid lines, dots, stones, tokens, circles or writing. We will add the precise game board later. Two CLOSED wooden stone bowls sit outside the board, one beside each player.
The board has a pronounced diagonal three-quarter orientation in the photograph, near edge visibly slopes left or right; show both its adjacent wooden side faces. Use camera angle to create this diagonal view while the board remains aligned with the table. Every corner of the blank's TOP FACE and its frame is clearly visible, never obscured by a chair or bowl. The board is moderately sized, roughly 35% of the image width, centered at x=1080 y=320 on the 1536x512 canvas. Its whole upper surface fits inside x=760..1390 and y=180..440, leaving generous room below. Do not zoom in on the board.
Soft diffuse realistic lighting, tactile wooden materials, restrained atmospheric colors and natural photographic detail. Keep the blank's top face sharply focused, only distant scenery is softly blurred. No people, labels, text, logos, flags, watermarks, picture borders or vignette. Output a wide 3:1 banner.

## Event prompts and position mapping

Rotation is the number of clockwise quarter-turns applied in board coordinates.

### csgc

[background.jpg](./csgc/background.jpg) · Position: **NLK**, rotation: **0**.

Scene and regional atmosphere: Czechoslovak Go Championships: an understated 1980s Central European club room with a vintage wooden tournament Go set, softly blurred historic Prague and Bratislava architectural silhouettes beyond tall windows. Warm walnut and faded cream archival atmosphere.
Camera side: left diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### czgc

[background.jpg](./czgc/background.jpg) · Position: **WAGC**, rotation: **2**.

Scene and regional atmosphere: Czech Go Championships: a Czech cafe tournament Go set beside a window, soft out-of-focus Prague rooftops and Gothic spires across the river, cool blue morning and warm honey wood.
Camera side: right diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### czwgc

[background.jpg](./czwgc/background.jpg) · Position: **PGC**, rotation: **0**.

Scene and regional atmosphere: Czech Women's Go Championships: a finely crafted Czech club Go set on an oak table, airy modern competition room with softly blurred Prague architectural details and amber afternoon light; dignified competitive atmosphere.
Camera side: left diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### egc

[background.jpg](./egc/background.jpg) · Position: **NLK**, rotation: **2**.

Scene and regional atmosphere: European Go Championships: beautiful Go board in a spacious historic European civic tournament hall with tall arched windows, softly blurred rows of other wooden Go boards receding in the background; muted blue and warm limestone.
Camera side: right diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### epc

[background.jpg](./epc/background.jpg) · Position: **PGC**, rotation: **1**.

Scene and regional atmosphere: European Pro Go Championships: close premium tournament Go board and bowls with a blurred analog Go clock, spare elegant European competition room, concentrated quiet atmosphere, deep navy shadows and warm maple wood.
Camera side: left diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### epq

[background.jpg](./epq/background.jpg) · Position: **NLK**, rotation: **3**.

Scene and regional atmosphere: European Pro Qualifications: a Go board showing an intense middlegame with black and white stones, abstract blurred ascending stone stairway beyond a European club window, quiet aspirational mood, neutral slate and golden oak.
Camera side: right diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### esgc

[background.jpg](./esgc/background.jpg) · Position: **WAGC**, rotation: **1**.

Scene and regional atmosphere: European Student Go Championships: tournament Go set on a university library desk, closed unlabelled notebooks and books softly blurred beyond, old European university arched windows, cool daylight and natural birch wood.
Camera side: left diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### ewgc

[background.jpg](./ewgc/background.jpg) · Position: **PGC**, rotation: **2**.

Scene and regional atmosphere: European Women's Go Championships: premium Go board and wood bowls in a refined bright European tournament hall, tall windows and softly blurred empty tournament tables, calm confidence, muted slate blue and warm walnut.
Camera side: right diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### eygc

[background.jpg](./eygc/background.jpg) · Position: **WAGC**, rotation: **3**.

Scene and regional atmosphere: European Youth Go Championships: approachable wooden Go board with a sparse opening position in a bright modern European youth competition room, blurred additional boards and sunlit windows, fresh airy blue and warm wood.
Camera side: left diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### hrgc

[background.jpg](./hrgc/background.jpg) · Position: **PGC**, rotation: **3**.

Scene and regional atmosphere: Croatian Go Championships: wooden Go board in a quiet Croatian club room overlooking a softly blurred Adriatic old town of pale limestone, terracotta roofs and blue sea, airy Mediterranean morning.
Camera side: right diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### iegc

[background.jpg](./iegc/background.jpg) · Position: **WAGC**, rotation: **2**.

Scene and regional atmosphere: Irish Go Championships: Go board on a dark oak club table near a window, softly blurred green Irish landscape and Georgian brick buildings outside, gentle overcast daylight, moss green and honey wood.
Camera side: left diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### kpmc

[background.jpg](./kpmc/background.jpg) · Position: **WAGC**, rotation: **1**.

Scene and regional atmosphere: Korea Prime Minister Cup: exquisite Korean baduk board and dark wood bowls in a contemporary Korean tournament room, traditional hanok rooflines and distant mountains softly blurred through the window, quiet pale teal daylight.
Camera side: right diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### nlk

[background.jpg](./nlk/background.jpg) · Position: **NLK**, rotation: **0**.

Scene and regional atmosphere: Dutch Go Championships: tournament Go board on a light oak table by a tall Dutch window, softly blurred Amsterdam canal houses and water reflections outside, restrained brick ochre and cool grey-blue daylight.
Camera side: left diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### nlkd

[background.jpg](./nlkd/background.jpg) · Position: **NLK**, rotation: **1**.

Scene and regional atmosphere: Dutch Women's Go Championships: premium Go board in a serene bright Dutch club room, large windows overlooking softly blurred canals and elegant gabled buildings, silver morning light and warm natural maple.
Camera side: right diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### pagc

[background.jpg](./pagc/background.jpg) · Position: **NLK**, rotation: **3**.

Scene and regional atmosphere: Polish Academic Go Championships: Go board on a university library table, unobtrusive closed unlabelled notebook, softly blurred brick university courtyard and tall windows in Poland, warm scholarly light.
Camera side: left diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### pgc

[background.jpg](./pgc/background.jpg) · Position: **PGC**, rotation: **0**.

Scene: Polish Go Championships: classic tournament club setting, historic Polish old town facades and red tiled roofs softly blurred beyond the window, warm amber wood and cool blue daylight.
Camera side: from the right-hand player's diagonal. The board blank remains completely unmarked wood, ready for a precise grid and stones to be composited later.

### pwgc

[background.jpg](./pwgc/background.jpg) · Position: **PGC**, rotation: **2**.

Scene and regional atmosphere: Polish Women's Go Championships: polished wooden tournament Go board with fine bowls in a bright elegant Polish competition room, softly blurred old town windows and architectural shapes, soft ivory daylight and deep warm walnut.
Camera side: right diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### pygc

[background.jpg](./pygc/background.jpg) · Position: **PGC**, rotation: **1**.

Scene and regional atmosphere: Polish Youth Go Championships: inviting wooden Go board with an opening position in a bright Polish youth club room, rows of boards softly out of focus, sunlit brick courtyard outside, fresh blue-grey daylight and honey wood.
Camera side: left diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### skgc

[background.jpg](./skgc/background.jpg) · Position: **WAGC**, rotation: **3**.

Scene and regional atmosphere: Slovak Go Championships: wooden Go board beside a window in a Slovak club room, softly blurred Bratislava castle silhouette and gentle Carpathian hills in the distance, muted blue-green atmosphere and warm oak.
Camera side: right diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### wagc

[background.jpg](./wagc/background.jpg) · Position: **WAGC**, rotation: **0**.

Scene and regional atmosphere: World Amateur Go Championships: beautiful wooden Go board and bowls in a spacious international tournament venue, multiple Go tables receding softly out of focus, broad windows and a calm global competition feeling, rich natural walnut and cool slate blue.
Camera side: left diagonal. Keep the entire board blank completely free of grid, stones and marks. Windows and room details occupy the left background, with only a narrow incidental glimpse of floor. Output exactly the panoramic 3:1 format.

### wgl

[background.jpg](./wgl/background.jpg) · Position: **WAGC**, rotation: **0**.

Scene: Warsaw Go League: wooden club setting, softly blurred Warsaw skyline including the Palace of Culture beyond large windows, subtle warm city lights with cool evening blue and honey wood.
Camera side: from the left-hand player's diagonal. The board blank remains completely unmarked wood, ready for a precise grid and stones to be composited later.
