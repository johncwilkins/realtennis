# The Royal Court

Internal 3D real tennis browser prototype. Static ES modules, with vendored Three.js 0.170.0. Serve `dist/` over HTTP.

Mouse/touch aim, hold and release for power and a queued swing. Automatic footwork. Drive, cut and lob. Space swings; 1/2/3 choose shots; P pauses.

Includes a procedural court, penthouse collisions, angled tambour rebound, winning openings, simplified singles chases, changing ends, two service attempts and tennis scoring. The initial end is selected by a racket spin. Sets are first to six games in this introductory build.

This is a prototype, not a certified full implementation of the laws. Court-specific geometry, exact chase marking, serve types, chase edge cases, hazard chase exceptions and uncommon laws require further validation. No multiplayer yet.

Primary renderer uses WebGL. A Canvas 2D projection fallback uses the same Three.js scene geometry when WebGL is unavailable; textures and labels are reduced in that mode.

Validation: JS syntax checks; deterministic core scoring/chase scenarios; serve trajectory at multiple time steps; browser interaction and mobile-sized layout checks. Test browser had WebGL disabled, so GPU rendering remains unverified in that environment.

Official rules: https://www.tennisandrackets.com/real-tennis/play/laws-of-tennis

## Second court pass

Penthouses now slope from high outer walls to low court edges, on all three sides. Rendering and collision code share their dimensions. The tambour is a continuous angled profile narrowing the hazard end, with normal-based reflections. The net uses open cord geometry and a canvas top band; a recessed trough collects netted balls and rolls them toward a basket at the gallery side.

Direct aiming: choose Floor, Wall, Grille, Tambour, Gallery, or Dedans as appropriate to your end. Wall aim follows the visible 3D wall; the target-height slider changes elevation. Shots use a ballistic solution ending at the chosen point, with enough arc to clear the sagging net. Committed returns persist until contact. Optional Auto return and incoming-ball slowdown are in settings.

Checks: `node checks/physics.mjs` validates roof slopes, tambour collision normals, target accuracy and net clearance, serves at multiple time steps, and no-bounce grille/dedans winners.

Court layout references: T&RA Plan of a Court and Radley elevations; USCTA Court Panorama. Geometry is inspired by those references rather than an exact surveyed recreation of one club.

## Manual movement / wheel stroke playtest

The human now follows the mouse on their own half with acceleration, braking, and a 6.2 m/s speed cap. Scroll toward yourself to draw the right-handed racket back, then away to swing forward. Wheel event rate sets speed; contact is possible only in a short active forward-swing window and within physical reach. Late contact goes to the player's right, early contact left, centered contact straight, with directions reversed in world coordinates after changing ends. Height remains automatic. AI retains its own positioning and shot selection.

Old target circles, preset aiming, automated human positioning, and queued returns have been removed. Wheel direction and sensitivity are adjustable in Settings. Touch has independent movement and stroke pads. The serve is still the standard penthouse serve; players walk back into position before it.

Court updates: aged basket-weave oak parquet with wood grain, board variations, scratches and rubber skid marks; both players wear whites; enclosed, warmly lit gallery rooms with benches and rear walls replace dark green openings.

Validation: `node checks/controls.mjs` tests acceleration/braking, frame-rate independence, capped velocity, backswing and contact window requirements, wheel-rate power, physical reach, and direction at both ends. `node checks/physics.mjs` retains court collision and serve regression checks.

## Forgiving swings and practice partner

Practice is now the default session. Start practice to receive gentle feeds near your current position. The partner alternates a small left/right offset, covers the court quickly and returns toward you instead of aiming away. Misses automatically feed another ball without scoring, chases or changing ends; the scoreboard shows current and best return counts. Use the Practice/Match button in the header to switch sessions.

Both forehand and backhand sides now have a symmetric 1.8 m lateral reach and 1.6 m timing range. The forward swing contact window is 280 ms. A 0.64 m centered-contact band goes straight, with gentler angles outside it. The racket automatically anticipates which side the ball is approaching, and the visible right arm reaches across for the backhand. Backhand timing angles mirror the forehand. Mouse movement and wheel-rate power remain manual.

`node checks/practice.mjs` verifies gentle feed targeting and changing player positions; the control checks cover automatic side selection and symmetric reach at both ends.

## Articulated elbow and predictive racket side

The racket arm now uses fixed-length upper-arm/forearm segments with an elbow, wrist and separate wooden racket. Full backswing puts the racket clearly behind the body. At stroke phase zero, the shaft points perpendicular to the court length. Wheel input drives a continuous animated stroke; the hit window opens when that animation reaches zero, with a short contact hold for readable feedback.

Side anticipation simulates the live ball collision function (including wall, tambour, roof and floor bounces) alongside the human's acceleration toward the current cursor target. It selects forehand/backhand at the predicted meeting point with hysteresis, then keeps that side through the forward stroke.

`node checks/arm-and-prediction.mjs` validates elbow lengths, poses, rendered racket alignment, contact at multiple frame rates, moving-player anticipation and bounce-aware side selection.

## Main-wall rallies and grounded movement

Match AI now favors deep main-wall targets, using crosscourt shots when the opponent has moved toward that wall and taking occasional conditional shots at winning openings. Practice retains friendly returns near the human player. Human contact has a wider 0.9 m straight band and less sideways steering outside it; timing still controls direction. Shots clear the net lower, with cut reducing vertical rebound while retaining more forward speed.

Gallery collisions use shared opening dimensions and swept tests. Balls rebound from the solid sill, bandeau and wall; reaching the gallery net or a post counts as gallery contact. Crossing the front plane through an opening alone no longer prematurely ends the shot.

Players have articulated knees, speed-dependent shuffles and running steps, planted feet during contact, hip/shoulder rotation and smoother racket-side transitions. This is procedural animation and remains a playtest, rather than captured tennis movement.

Validation: controls, arm/prediction, practice and court-physics checks pass. `node checks/rally-and-motion.mjs` adds seeded AI-target checks, gallery aperture/post scenarios, bounce comparisons, contact deadband and articulated-leg checks. A controlled comparison of 252 human-shot scenarios using the same collision model produced 24 gallery entries with the previous contact formula and 6 with this one; this is a parameter comparison, not an observed match statistic. Browser movement and wheel inputs were checked with the Canvas fallback; GPU rendering remains unverified in the test browser.

## Click-once drives/lobs and two practice feeds

During an incoming ball, left-click the court for Drive or right-click for Lob. The selection is independent of wheel input: choose before, during or after the backswing, change it before contact, and let go of the button. A successful hit consumes the choice and resets the next shot to Drive. New feeds/points also reset it. Court right-click suppresses the browser context menu. Drive/Lob buttons provide the same selection on touch screens. The selected shot appears beside the forehand/backhand label, and Lob opens the visible racket face.

Human launch elevation now comes from the selected racket face and the contact position ahead of/behind the body; it has no net-clearance correction. Wheel rate still supplies power and contact timing still controls horizontal direction. Lobs use a slower, higher launch; low/weak drives can hit the net. Slice coefficients now propagate into the live ball on contact.

Play mode offers Practice: right at me, Practice: left & right, and Match. Straight practice follows the human's position with no intentional lateral offset. Footwork practice alternates a 2.3 m lateral landing offset, constrained by court width, so a small reposition is needed from a central stance. Both use controlled-speed friendly returns and automatic replacement balls after misses.

`node checks/shot-choice.mjs` checks selection persistence independently of scrolling, replacement and one-time consumption, distinct drive/lob trajectories, real net risk, retained lateral steering/power, and both practice targets at either end. Existing controls, arm/prediction, practice, rally/motion and court-physics checks also pass. Browser QA covers both practice selectors and click/wheel selection using the Canvas compatibility renderer; GPU rendering is not verified in the test browser.

## Comfortable power and ten-shot calibration

Human drives now use a gentler 10–22 m/s horizontal speed range (previously 10–36), with a smooth capped mapping of measured forward wheel rate. A normal calibrated swing maps to half strength, roughly 17 m/s for a drive. Slower swings remain soft and faster swings increase power progressively. Shot timing, lateral direction and the lack of automatic net clearance remain unchanged. Lobs retain their higher launch with a slightly reduced power range.

Choose Calibrate power in the play-mode menu or Calibrate / recalibrate in Settings. The drill uses steady feeds and records ten actual human contacts, including returns that subsequently hit the net. Missed swings and AI contacts do not count. It takes the median raw forward-scroll rate as normal effort and then returns to steady practice. A partial/cancelled drill preserves the previous calibration. Results save in versioned browser-local storage; blocked storage falls back to session use with a visible notice. Recalibrate and Reset calibration are in Settings. Wheel sensitivity adjusts stroke travel without changing the measured scroll rate used for calibration.

`node checks/calibration.mjs` verifies ten-contact completion, outlier handling, cancellation, progressive power, storage reload/failure handling, raw-rate capture, speed limits, and the actual game's contact handler completing/saving a drill. Controls, shot choice, practice, arm/prediction, rally/motion and physics checks also pass. Browser QA checks entering/cancelling/restarting the drill and Settings using the Canvas renderer; the full ten-contact sequence is verified in the contact-handler test, not a manual browser rally. GPU rendering remains unverified in this test environment.

## Lit targets, softer penthouses, readable court and service pickup

The grille has a warm-lit recess, visible timber surround and lighter metal bars. Both ends retain their actual openings; the near wall and penthouse now become transparent rather than disappearing, with a stronger dedans frame/net and a lightly ghosted rear room. End materials are independent so fading the near end does not fade the opposite wall or side galleries.

Roof collisions absorb much more normal impact (restitution 0.20, previously 0.66) and damp tangential speed to 0.84. Floor rebound is also lower. The preset penthouse serve is retuned for these ball properties and remains legal at four integration steps. These are game tuning values, not measured ball/material coefficients.

Court markings follow the T&RA plan/law hierarchy: six numbered whole-yard service lines, short half-yard edge ticks, named gallery lines, and two numbered hazard lines measured from the service line. Floor paint is black; numbers are anchored to the main wall, with a slight viewing cant to keep them readable from the high camera. Side galleries are compacted near the net so the service gallery ordering follows the numbered chase marks. Hazard service/fault markings, serve checks and the chase boundary share a seven-yard service-line offset from the hazard back wall. This is still an approximate club layout, not a surveyed recreation.

References: https://www.tennisandrackets.com/real-tennis/court-development/court-plan and https://www.tennisandrackets.com/real-tennis/play/laws-of-tennis (Law 6).

Human service starts with a left-click anywhere on the canvas, without moving to the footer button. Alternatively, between points when the human has service, walk to the central dedans (within 1.65 m of centre, beyond z=10.6). The player bends to collect a ball and walks to the usual service position before serving. This is restricted to a ready human server; moving there during a rally cannot restart play. Players also have shaped shoulders/collars, facial features, hands, clothing seams and a relaxed articulated supporting arm.

Validation: roof-bounce checks, legal serve trajectories, direct grille/dedans winners, click-to-serve state gates, chase marking/boundary tests, collection eligibility, and all prior control/calibration/practice/arm/rally tests pass. Browser QA uses the Canvas fallback and confirms visible court changes and court-click service. The full retrieval animation and GPU lighting remain playtest verification items.

## Straight-on camera, receiving visibility and daylight

The play camera is centred at x=0 and lowered to 13.5 m on desktop, preserving the higher portrait framing. Changing ends snaps to the correct side so the camera does not sweep through walls. The receiving-end near back wall, roof and roof seams are hidden entirely; service-end near geometry keeps the ghosted dedans outline. Far-end geometry is restored when changing ends.

The former compact court now uses a 29.26 m floor length and about 9.85 m playing width. The Radley reference roof heights remain 2.25/3.4 m, with the penthouse run widened to 2.325 m. Side gallery bays now use the reference widths 1.647, 1.14, 2.775, 2.775 m from the net outward, starting 1.075 m from centre, with sills at 1.05 m and heads at 2.15 m. Floor/roof/end geometry, gallery collisions, chase marks, service boundary, movement limits, pickup zone, AI opening targets and the preset serve share the revised coordinates. This remains a Radley-inspired playable approximation, not a surveyed model of that club.

The upper main wall has real window apertures, clear physical glass with slim mullions, and a bright exterior beyond. Sun direction comes from the window side; four soft projected pane highlights per window create patterned light on the parquet. Highlights are a static visual treatment, not a changing time-of-day simulation.

Reference: T&RA Radley Service Wall Elevation and Grille/Dedans Elevations, linked from https://www.tennisandrackets.com/real-tennis/court-development/court-plan .

`checks/view-and-daylight.mjs` checks gallery/roof dimensions, projected light inside the court and receiving-end visibility restoration. Updated physics checks verify legal serves and direct winning openings at the revised court length; all control, calibration, practice, arm, roof, marking/collection and click-service checks pass. Browser QA uses the Canvas fallback; GPU glass transmission and shadow-map lighting remain unverified in that browser.

## Consistent near-end transparency and livelier bounce

Both near back walls now use the same unobstructed viewing treatment: wall/room opacity 0.015, opening details at most 0.10, roof opacity 0.035 and faint roof seams. All near geometry disables depth writing and shadow casting; the far end restores its normal appearance when changing ends. This removes the previously much stronger service-end dedans frame/roof that could obscure play.

Bounce is slightly livelier: floor normal restitution is 0.64 minus 0.19 times cut (previously 0.60 minus 0.20 times cut), and penthouse normal restitution is 0.28 with 0.88 tangential retention (previously 0.20/0.84). These are playtest tuning coefficients. The preset serve is adjusted to remain legal with the revised roof rebound. Roof, floor, visibility and four-time-step serve regressions pass.

Court paint visibility pass: near-black unlit ink, 65 mm chase/fault lines, 45 mm half-yard ticks and a 75 mm service line improve contrast against the parquet. Geometry positions and rules are unchanged.

Near-wall visibility is now definitive: each complete back-end assembly (wall pieces, opening details, label, roof and seams) belongs to an end group. The near group is hidden completely at either end, rather than relying on low opacity. Session resets apply visibility immediately, and every rendered frame reapplies it from the actual camera side. This covers Match/Practice/Calibration transitions and removes the remaining near-end outlines. Repeated-switch visibility regression checks pass.

## Match drive carry and shaped footwear

Human power uses the same calibration in every session. Match balls can arrive lower and farther from the net than friendly practice feeds; the old fixed 10-degree drive face made those contacts net even on firm swings. Drives now open the face modestly with contact depth and low ball height, with a smaller vertical contribution from fore/aft timing. Horizontal direction, wheel power calibration, maximum horizontal speed and lob selection are unchanged. There is no net-clearance solver: soft deep shots and awkward contacts can still hit the net.

`checks/match-drives-and-shoes.mjs` compares 54 centered medium-power contacts spanning both ends, several depths/heights and lateral positions. Modeled net failures fall from 44 with the prior flat launch to zero with the revised face; this is a controlled scenario comparison, not a measured match success rate. Soft deep drives still net. Existing contact, calibration and footwork checks pass.

Box shoes are replaced with mirrored rounded soles, lofted uppers, tapered toes, curved heels and laces. A little toe/heel pitch follows the stride, while planted shoes remain level. Shoe bounds, normals and foot proportions are checked. Browser QA uses the compatibility renderer.

## Placement, one-shot selection and player ready stance

Regular is the default shot. An incoming-ball left click queues one Drive; right click queues one Lob. Successful contact consumes that choice and returns to Regular. Main-wall timing angles have more range than gallery-side angles. Lobs use independent forward and upward speeds to carry deeper. Match opponents now react after a difficulty-dependent delay, accelerate toward reachable intercepts, recover deeper, and have bounded contact reach. Friendly practice feeds retain their existing behavior.

Court markings now follow `docs/reference-chase-plan.png`: six numbered service chases, gallery marks, one full-width worse-than-last-gallery line, receiving one/two-yard chases, and a single receiving fault line. Half-yard ticks and the extra longitudinal line are removed. The serving boundary shares the visible fault-line coordinate.

Players hold an upright racket in front with both hands close to the grip between strokes. Articulated elbows blend into forehand/backhand preparation, shoulders have a rounded profile, and shoes stay aligned with the body during retreat and shuffling. The net mesh drapes between its fixed edges. Racket rims and shafts use separate ash-grain color/bump textures; grips remain dark.

Validation: control, calibration, shot-choice, physics, practice, markings, camera/daylight, roof bounce, arm, motion, footwear and new placement/lob/ready/net checks pass. Controlled physics simulations demonstrate wall-side passes against a net-positioned club opponent from both ends, while centered shots remain returnable. These are tuning scenarios, not match win-rate measurements. Browser checks confirm Regular defaults, Drive/Lob selection and mode reset, visible ready stance and court rendering with no game-script errors. The browser uses Canvas compatibility rendering; GPU lighting and wood-grain detail still need a normal-device playtest.

## Video-reference movement and court-surface rally play

Reference: uploaded IMG_0163.mp4, sampled across its 76 seconds with closer movement sequences. The screen recording is useful for stance and recovery; it is not a precise ball-speed or spin measurement. User additionally emphasized the substantial use of back walls, side walls and penthouses.

Match shot planning now samples side-wall banks, deep back-wall shots, penthouse shots and direct returns against the live collision function. Selection weights are tuning choices (30/20/17/33 percent), not measured video frequencies. Each selected surface route must cross the net, have a receiving-side first bounce and actually hit the requested surface in simulation. If no candidate works, the previous target solver remains the fallback. Roof and ball restitution are unchanged. Practice keeps its controlled friendly feeds.

The opponent can select a reachable post-back-wall intercept for a fast incoming ball, waits for that rebound before striking, and otherwise takes the earlier reachable contact. Recovery positions are deeper. Shoes take shorter adjustment steps at low speeds and while planting, stance widens, low-contact knee flex increases, and torso/hip rotation and forward weight transfer accompany the stroke. Aligned retreating shoes and existing mouse/wheel/one-shot controls are preserved.

Validation: all 16 checks pass, including live-physics surface routes and post-back-wall interception from both ends, passing-shot opportunities, controls, rules, service, practice and camera regressions. These are controlled trajectories rather than a measured rally distribution. Visual QA uses the compatibility renderer; GPU rendering and game balance need a normal-device playtest.

## Camera-side back-wall rebound guides

Both ends have a dedicated translucent wall guide on the actual back-wall collision plane, with an outlined dedans/grille opening and penthouse silhouette. The wall tint is 4.5% and the roof tint 2.5%; stronger edges locate the rebound plane without obscuring players. The opaque near assembly remains hidden, the far assembly remains normal, and the guide follows the same per-frame/reset camera-side rule in all modes. Physics and opening collision bounds are unchanged.

Validation: view/daylight checks cover both guide planes and openings plus repeated camera-end/mode reset sequences. Browser compatibility-renderer inspection confirms a readable near outline with the court visible through it. GPU transparency remains a device playtest item.

## Ready racket, soft end rebounds and visible point endings

The neutral ready racket rolls 90 degrees about its shaft, keeping the strings edge-on to the face while preserving both-hand grip position and swing contact orientation. Tambour impacts now retain 38% of normal rebound velocity and further damp horizontal travel; back-wall impacts retain 48% normal speed and damp tangential motion. Departing back-wall balls are not reflected again. Plain side-wall restitution is 72%. These are playtest coefficients, not measured ball properties.

Match endings use a 3.2-second presentation phase. The final ball makes a small damped hop and settles (net-trough balls stay collected); no scoring physics runs during this phase. The camera/player end stays on its previous side even if the rule engine has changed service. A chase end switch happens once after the pause, with a Change Ends message and a further interval before the next point.

Validation: rebound energy/exit directions, ready face orientation, final-ball settling, delayed one-time end switch, and the existing controls, chase, service, practice, court-play and visibility checks pass. Browser inspection uses the compatibility renderer.

## Hazard wall at the penthouse lip

The hazard lower back wall and grille now sit at z=-endRoofInner, directly beneath the low penthouse edge. The roof still slopes upward behind that wall. Low balls rebound on the forward wall plane; high balls can pass over the lip onto the roof. The grille target/reveal/lighting, translucent wall guide, player limits, intercept prediction, hazard chase reference and floor/service-fault stripe termination follow that forward boundary. The service end retains its existing dedans geometry.

Desktop framing uses a 44-degree field of view and moves half a metre closer, using more of the available screen while retaining portrait framing. Validation includes direct grille winners, low hazard-wall rebound and high roof access, player limits and both-end guide geometry.

## Service wall, opponent levels and serve length

The service-end penthouse now begins at the top of the service wall (z=halfLength, y=roofLow) and slopes upward behind it. The dedans mouth, frame and front wall remain flush at halfLength, with the gallery room behind. This preserves service chase markings, court length and pickup position. The near guide now ends at the low lip. High balls can reach the rear penthouse, while players stop in front of the wall. Hazard geometry retains its previous correction.

Opponent choices are Amateur, Pro and Champ. Champ is the previous default club profile (5.6 m/s, 0.19 s reaction, 1.1 m reach) and receives no added mishit modifier. Pro and Amateur react/move more slowly and have 4.5%/11% mishit chances on eligible returns after the opening rally exchange. Mishits alter launch lift using ball flight, rather than awarding a point directly; wall/roof interaction still applies. These are tuning probabilities, not promised match error rates.

Long/Short serve buttons appear for the ready human server. Both touch the penthouse and land legally: controlled first bounces are roughly 11.3/8.9 m deep into the hazard half. The selection persists for the next service, including second attempts. The opponent mixes both lengths. Four-time-step tests verify legal distinct first bounces; other tests cover unchanged Champ behavior, the opening rally grace, graduated error counts and actual netted mishits.

Supporting-arm refinement: the free hand now moves across/back during backhand preparation and opens for balance through contact; forehand motion has its own balance path. Fixed-length elbow solving follows the torso parent, with a moving thumb/palm and a modeled sleeve edge. Ready hands still meet at the grip. Pose tests check both stroke sides and bone lengths.

## Service penthouse valley junction

The service/side roof corner now has two triangular sloping panels joined diagonally from the low inner corner to the high outer corner. The service roof starts at the side roof's inner x edge; the corner panels fill the remaining region without overlap. A dark seam marks the valley, and its translucent counterpart follows near-end visibility. Corner collisions select the upper matching roof plane and avoid double impacts along the seam.

Validation: shared valley endpoints lie exactly on both roof planes. Drop trajectories on each face and along the seam rebound once without gaining energy. Existing service-length, wall, opening, court-play and visibility regressions pass.

## Solid side-panel extension and livelier roof valleys

The service corner side panel now stays solid with the side roof when the near end ghosts. Its panel seams and outer upper wall continue back to the valley; only the end-facing surface becomes transparent. Roof normal restitution increases from 0.28 to 0.42 and tangential retention from 0.88 to 0.90. A 10 cm height band blends both valley normals, encouraging an outward bounce instead of repeated face-to-face chatter. Collisions select the upper visible surface at both corners and lose energy.

Long/Short serve velocities are retuned to preserve legal distinct first bounces, about 11.1/8.9 m into the hazard half. Regression checks cover both seam rebound directions, energy loss, roof faces, legal service at four time steps and match/visibility behavior. Browser QA uses the compatibility renderer.

### Radley openings, roof returns and player refinements

The T&RA's Radley **Grille and Dedans Elevations** is the dimension reference for this update, rather than claiming one universal aperture size across historic courts:
https://www.tennisandrackets.com/real-tennis/court-development/court-plan

- Dedans: 6.035 m clear width; grille: 1.000 m clear width. Both openings have a 1.050 m sill and 2.150 m head (1.100 m clear height). Shared dimensions now drive the meshes, frames, transparent guides, winning detection, AI target height and ball collection width.
- Service end roof is a full trapezoid from its front lip to the gallery-side high corner; the ghost roof uses that same upper-left extent. The main/window wall now continues to the rear high edge and remains part of the side assembly when the near end hides.
- Players randomly receive colored terry headbands and wristbands at creation. Clothing stays white, with a fine cotton weave; faces have softer jaw/cheek transitions and brows, shoulders are less bulbous, and skin tones vary. These are refined procedural models, not scanned photorealistic characters.
- The central ready grip is 14 cm lower. The articulated support arm stays comfortably bent during strokes, and its hand/fingers follow the forearm instead of pointing down.
- All 21 check files pass, including new live-physics opening-entry tests (wider dedans, raised grille, below-sill rebounds) and accessory/arm/roof-outline checks. Browser preview was inspected with the compatibility renderer; GPU rendering was not available in this environment. Preview: `docs/court-openings-and-players.jpg`.

### Three selectable court schemes

Game settings now offers Court 1 (the original parquet club), Court 2 (terracotta, grey walls, green binding and a timber gable inspired by the first supplied photo), and Court 3 (red/green paint, slate walls, green edging and long clerestory bands inspired by the second). These are visual schemes, not replicas of the photographed buildings. The Court 3 green receiving box follows the existing service and fault lines; court dimensions, collision surfaces, rules and shot behavior are shared.

The selection updates immediately without restarting the point and persists in browser storage, with a Court 1 fallback for unavailable storage or invalid values. Painted textures are generated/cached once per scheme. Court 1's maps and material colors restore on return; alternative upper-wall assemblies obey the camera setting and end assemblies retain the transparent-near-end behavior. Browser checks covered all choices, reload persistence, restoration and calibration. Screenshots `docs/court-2.jpg` and `docs/court-3.jpg` show the compatibility renderer; GPU lighting was not available for verification. All 22 check files pass, including court-choice persistence and receiving-box boundaries.

### Court 4, match formats, celebrations and remembered settings

Court 4 uses the fourth photo's visible olive-grey walls, ivory upper walls, scarlet trim and elevated spectator windows. The supplied photo does not show the floor, so its muted mineral-grey surface is an interpretation. Existing court options remain available.

Matches support first to 3 or 6 games per set, with one set or best of 3/5 sets. The scoreboard tracks games and sets, set scores are retained for the final result, and terminal matches cannot award further points. Format changes apply to the next match. Final-ball settling still precedes the trophy/result overlay, confetti and optional fanfare. A point winner occasionally gives a timed free-arm fist pump (23% chance); the match winner always does.

All visible settings, including court, game mode, opponent, match format, speed, camera, sound, sensitivity, wheel reversal, labels and serve length, now save on change and restore on reload. Reloading returns to the selected mode's start screen rather than resuming an active rally. Calibration's existing saved power baseline is retained; the drill restarts at 0/10 if that mode is restored. Storage failures fall back to safe defaults.

Drives have a modest 7–9% horizontal-speed increase, capped at 24 m/s; regular shots and lobs keep their prior behavior. Players now wear wider contrasting colored headbands outside the hair surface; the ready racket sits lower at the chest, and capsule limb ends / smaller joint blends reduce seams. Browser QA checked Court 4, restored settings, match/practice/calibration modes and the real victory presenter using a temporary deterministic scoring fixture. That fixture was removed before packaging. GPU rendering was unavailable, so visual QA used the compatibility renderer. All 23 check files pass, including every match format, comeback/deuce, terminal scoring, settings recovery, boost limits and deferred victory.

### Raised backswing, distinct windows and Grey Expectations

Court 2 now has three high, broad paired windows with transoms; Court 4 has four tall three-pane window banks. Their upper-wall geometry replaces the original five-window wall and follows the tambour profile without gaps. Court 4's upper end galleries contain varied articulated spectators with lathed torsos, capsule arms, modeled faces/hair, skin/clothing variation and different resting poses.

The stroke draws the elbow back with the wrist above it: the forearm rises at exactly 45 degrees on a full forehand or backhand backswing, with a raised normal 80% draw. A separate bug in the ready-to-stroke blend was replacing the stroke's elbow plane even at a nearly-zero ready blend. It now blends the elbow plane as well as the wrist, preserving the raised pose. Bone lengths and the perpendicular contact pose remain unchanged.

Court 5 is **Grey Expectations**: grey hull walls with a red bootstripe (per the user's correction), warm white topsides, caulked teak deck boards, stainless portholes on both long walls, and a yacht-club name plaque. It is selectable and persists with all other settings. Court dimensions/collisions, match format, shot choices and controls are shared with the other courts.

All 24 check files pass, including measured forearm pitch through the actual arm rig, the near-zero ready blend, unique window layouts, Court 5 reload settings and modeled spectator geometry. Browser QA covered Courts 2/4/5, restored Court 5 selection, and a live backswing. Visual QA used the compatibility renderer because GPU rendering was unavailable. Screenshots: `docs/court-2-unique-windows.jpg`, `docs/court-4-spectators.jpg`, `docs/court-5-grey-expectations.jpg`.

### Circular porthole light and animated spectators

Court 5's floor light now projects the actual 0.48 m circular porthole aperture into a 64-segment ellipse, instead of using the rectangular window helper. The wall pieces surrounding each circular opening also cast shadows so the GPU shadow pass respects the round hole. The geometric projection is checked by reconstructing each boundary point in the window plane; browser visual QA used the compatibility renderer, so GPU shadows remain unverified here.

Court 4 spectators now make staggered head turns, blinks and small leaning/breathing movements. A varying subset clap for about 2.7 seconds after scored points, using articulated arms; chase announcements do not trigger applause. Their clock advances with active game time, so pausing stops their motion. All 24 check files pass, including finite animated/applauding spectator poses and the circular-aperture projection. Preview: `docs/court-5-round-light.jpg`.


### Fictional player roster and match energy

The level selector is replaced by 24 fixed first-name characters, shared by the human and computer pickers. Each shows the rounded average of seven 1–100 skills, with expandable individual ratings. Higher unforced-error ratings mean fewer mistakes. Characters keep their generated ratings and appearance between sessions: 5′6″–6′6″, 160–200 lb, varied skin/hair and colored bands, with two caps. The existing player mesh is scaled from the 6′/180 lb reference; cap and band materials are applied to the actual model. Pairings persist alongside all existing court/mode/format settings. Changing a pairing during play applies at the next session.

Acceleration and velocity affect both players, power and accuracy affect their strokes, consistency controls occasional net errors, and computer intelligence affects placement and chase tactics. Human intelligence supplies chase guidance. Practice keeps energy at 100% and suppresses forced net errors while retaining steady feeds and manual swing controls.

Both athletes start each new session at 100% energy. Stamina moderates the cost of distance, acceleration and strokes, including missed human swings; drives/lobs cost slightly more. Energy gently affects speed, acceleration, power and accuracy. A chase change of ends restores 0.18 percentage points, a game break 0.12 and a set break 1.12 (summed when applicable, capped at 100). Recovery applies once after the final-ball settling interval, before a camera/end switch. Resetting positions alone does not replenish energy. A synthetic 1,000-stroke mixed workload with movement and breaks leaves a midpoint-stamina athlete at 64.4%; this is a balance benchmark, not an observed five-set match result.

All 25 check files pass. New checks cover fixed roster bounds/averages, actual model scaling/colors/caps, rating effects, gentle fatigue, recovery/caps, frame-rate-independent movement, missed-swing costs, net-error probabilities and settings migration. Live collision-physics tests distinguish strong/weak intelligence on a demanding chase. The actual end-transition handler verifies recovery happens once only after ball settling. Browser QA verified both 24-player selectors, expanded skills, saved pairing and practice mode after reload, named match HUD, differing player builds/cap, and small live energy depletion. Visual QA used the compatibility renderer; GPU rendering remains unverified. Screenshot: `docs/court-player-roster.jpg`.


### Recessed viewing windows, compact settings and Courts 6–7

Court 4's upper end walls are now constructed around true openings. The windows have deep reveals and sills, with the animated spectators behind the court face and their lower torsos hidden at the sill. The previous solid wall/pasted-panel combination is hidden only for that scheme; end visibility still follows the camera. Court 7 uses a wider version of the same recessed room at the service end.

Settings use Players & match and Controls & view pages with a persistent start action. Skill inspection opens a separate dialog, preserving access to the main controls. Browser measurements found no internal scrolling and a visible start button at 1363×936, 390×844 and 844×390 (the latter two through an iframe with those actual layout viewport dimensions). Existing choices and calibration remain saved.

Court 6 is a playable fantasy inspired by the George Peabody Library in Baltimore: five tiers of iron balustrades and books, cream columns and gilded details, a gridded frosted skylight and worn stone-tone playing floor. Static architecture is batched by material to reduce draw calls. Court 7 draws from the supplied 19 November four-minute match clip: orange-red floor, dark lower walls, powder-blue trim, pale brickwork, tall windows and a broad service-end viewing room. Both use the existing court dimensions/collision model and persist like Courts 1–5. Reference for Court 6: https://www.library.jhu.edu/library-departments/special-collections/historic-collection-at-george-peabody-library/

### Named serves and left-hand toss

Service now has five styles, with both long and short placement: Bobble (roof-bouncing change of pace), Railroad (low along the roof edge), Giraffe (high underarm loop), Demi-piqué (crosscourt to the roof/service wall), and Side-wall (wall/roof route). The computer varies styles, with safer Bobbles for weak intelligence or second serves. The selected human style persists. These are simplified versions of traditional techniques, without a full spin simulation.

The previous z=6 m launch was legal but only just behind the modeled second-gallery line (5.2495 m). New starts vary with style: body position around 6.8 m for the main-wall Demi-piqué and 9.8–12.4 m for the others, all safely behind that line and inside the playing end. The player walks there, holds the ball in his left hand, lifts/releases it, draws the racket with a bent elbow and racket drop, accelerates into contact, follows through, and settles into the ready pose. The ball uses a ballistic toss and the physical serve starts only at 1.05 seconds, with no duplicate release. It pauses with the game and works for human/computer and all 24 builds. The clip's serves (around 45–48 s and other service sequences) guided the distinct preparation, quick strike and subsequent recovery rather than an instant generic swing.

Receivers can now volley once a serve has touched the hazard-side penthouse and crossed the net. Previously the entire contact/prediction chain waited for the first floor bounce. Human hit gating, hand prediction and computer interception now share the same legal-service condition. Serves are still checked for the required roof contact and service-box first bounce if not volleyed.

Rules/technique references: T&RA Law 8.1 https://www.tennisandrackets.com/real-tennis/play/laws-of-tennis ; USCTA glossary https://uscourttennis.org/laws-of-court-tennis/ ; head professional Nick Wood’s serving notes, Royal Tennis Court Autumn 2010 newsletter p7 https://static1.squarespace.com/static/5be6ceb0b105985523f1bfed/t/5cb20f1fa4222f2c69de0a21/1555173183060/RTC-Newsletter-Autumn-2010.pdf .

Validation: all 26 check files pass. New coverage traces every style/length through live collision physics at five time steps, verifies legal body positions, checks actual racket/toss contact and finite articulated poses for all 24 players, checks recovery to ready, ray-tests the recessed apertures and checks spectator sill placement, exercises library visibility/batching, persists Courts 6/7 and serves, and verifies the live toss clock releases once and freezes while paused. A computer-interception test reaches a serve after the roof and before its first floor bounce. Browser QA checked the new court schemes, both settings pages, skill dialog, reload, service selection and taking the deeper service position; a temporary pose viewer inspected preparation/contact in the actual rigs. Browser visual checks used the compatibility renderer because WebGL was unavailable; GPU lighting/shadows remain unverified. Preview screenshots are in docs/court-settings-fit.jpg, docs/court-4-recessed-windows.jpg, docs/court-6-peabody.jpg and docs/court-7-video.jpg.


### Court 6: Camden brick and iron; direct serve choices; marker calls

Court 6 now replaces the library scheme with a Baltimore warehouse/ballpark-inspired setting: weathered red brick with real arched window apertures, dark forest-green iron frames and roof trusses, stone cornices, warm lanterns and a worn red-brown playing floor. The former library geometry/module is removed. Roof trusses fade so their projection does not obscure rallies; camera-side end architecture follows the existing visibility switching. Court ID 6 and every saved game/player/control preference remain compatible. Architectural inspiration: Camden Yards' warehouse and steel construction, https://www.mlb.com/orioles/news/featured/celebrating-30-years-at-oriole-park-at-camden-yards .

The five serve types are direct buttons in two rows. Clicking one immediately highlights it, replaces the previous choice, updates the short tactical description and saves the selection. Long/short placement and the existing toss/serve action remain intact.

A shared chase-call formatter now drives the board, laid-chase announcement and intelligence guidance. Calls use the T&RA marker vocabulary: Better than five / Five / Worse than five, half-yard calls and One and two through Five and six, gallery names, nearly/more than a yard worse than Last Gallery, The Line, and the hazard suffix. Hazard yard calls are measured from the service line, while the stored target remains its original physical distance from the back wall. Only the wording changes; scoring and the visual chase target use the unrounded measurement. Exact-line labels use a 3 cm paint-width tolerance. Source: T&RA Markers’ Protocol, Appendix 1, https://tandra.b-cdn.net/downloads/Markers-Protocol-Apr17-v7.pdf?v=1751726048 .

Validation: all 27 check files pass, including the shared chase formatter across floor/gallery/hazard boundaries, unchanged precise chase scoring, and the actual five button click handlers and save calls. Warehouse geometry/visibility and prior serve-action/physics tests pass. Browser QA covered Court 6 selection, reload with saved court/style, and single-click replacement/highlighting of Giraffe, Railroad and Side-wall. Visual QA used the compatibility renderer; GPU lighting/shadows remain unverified. Screenshot: docs/court-6-camden-buttons.jpg.

### Higher Camden windows, controls lesson and contact pressure

Camden's side windows are shortened and raised to 6.15 m, with sills and lamps raised above ordinary rebound heights. End windows retain their previous proportions. Continuous brick follows the shared tambour collision profile; low projecting trim is removed. All courts receive brighter indoor ambient/fill lighting and lighter contact/cast shadows. The compatibility renderer also uses gentler surface shading.

The five serve buttons, long/short placement and Serve here now float beside the projected human player and stay within the viewport. The controls tutorial is available from the welcome screen, Help and play-mode selector. It assumes court-tennis rules are known and gates movement, backswing, forward swing, actual regular/drive/lob hits and a legal roof/crossing serve. It uses steady practice feeds without scoring or energy loss; exiting restores the previous session mode and preferences.

Velocity and acceleration ratings now produce more distinct crosscourt coverage. At 60% energy, speed is 10% lower and acceleration 14% lower than the same player's fresh profile. Existing stamina consumption and break recovery remain intact. Hard balls crowding the torso produce varied return yaw/height and reduced pace; good lateral spacing or soft incoming balls avoid this effect. Accuracy moderates the difficulty and fatigue increases it. The rule applies to both match players and human ordinary practice; tutorial/calibration and the practice feeder retain predictable returns.

Validation: all 29 check files pass. New coverage ray-tests bare brick including the tambour, checks tutorial action gates and panel placement bounds, simulates fresh/slow/tired court coverage and checks body-shot perturbations with deterministic random values. Browser QA verified welcome entry, reaching the movement marker, wheel backswing and forward-swing progression, exit restoring match mode, nearby serve-style selection and Serve here starting the service-position walk. Later tutorial hit/serve gates were checked programmatically rather than completing the whole lesson manually. Visual QA used the compatibility renderer; GPU shadows remain unverified. Screenshot: docs/court-camden-local-serve.jpg.


### Visitor analytics

The game loads GoatCounter asynchronously using `https://realtennis.goatcounter.com/count`. Page views are recorded by the standard GoatCounter script; no custom player names, ratings, saved settings or gameplay events are sent. Dashboard: https://realtennis.goatcounter.com . Analytics blocking does not prevent the game from starting.

### Fixed service reminder, spectator coverage and readable chase numbers

The serve reminder is now a compact two-row panel fixed at the bottom center of the court. It appears only for a ready human server, remembers the previous style/length, and leaves canvas left-click service intact: ignoring the panel and clicking the court starts the saved serve. Movement no longer changes its screen position. The tutorial uses the new location and explains that drives hit harder and cost more energy in matches; practice/tutorial energy remains full.

Spectator idle motion and point applause now discover all visible spectator rigs in the scene, without filtering by court number. Both existing spectator courts (4 and 7), and any subsequently added spectator group, use the same animation path. Hidden viewing rooms are skipped and paused time does not advance movement.

The eight numbered chase marks retain their existing measured coordinates: six service-end yard marks and two hazard marks measured from the service line. Numbers sit near the foot of the wall and face the actual camera from their wall-side anchors, with enough inset to keep the full glyph clear of the wall. Far-end glyphs scale down to avoid crowding between adjacent yard lines. The former fixed end-dependent cant foreshortened the hazard view. Numbering does not reverse when ends change; the main wall appears on the left when looking from the hazard end.

Validation: all 30 checks pass, including actual canvas click-away service, fixed CSS positioning, visible/hidden spectator animation and pause behavior, precise yard offsets, inward-facing number normals and full-glyph wall clearance from both viewing ends. Browser QA confirmed the menu remains at the identical 520×116 bounding box while the player moves, clicking outside starts the previous Giraffe service, and Camden's numbers are readable from both ends. Screenshots: docs/court-fixed-serve-menu.jpg and docs/court-camden-hazard-numbers.jpg. Browser checks use the compatibility renderer; WebGL lighting remains unverified.


### Chase numerals painted on the wall

The eight chase numerals now sit 8 mm in front of the actual main-wall surface, directly at each numbered floor line’s z coordinate. They retain the same low height, physical size and inward-facing wall orientation on every court and after either end switch. Camera-facing rotation, variable sizing and the 42 cm inset into the playing area are removed. Number values and line/rule coordinates are unchanged. Updated checks verify exact line alignment, surface offset, fixed rotation/scale and visibility from inside the court.

### Intelligence-based opening defence, idle receiver and inline skills

The dedans dimensions and opening scoring have not changed in these recent updates. Movement/fatigue and crowded-contact tuning made defenders less forgiving; inspection also found that even strong characters recovered relatively far forward and had a low volley-height cutoff. Intelligence now increases defensive recovery depth (6.5–9 m), the ability to volley higher/rising balls (up to 35 cm extra contact height), and urgency when live collision prediction identifies a route into the dedans or grille. Intelligent defenders prefer an early reachable interception over waiting for a back-wall rebound on those threats. Physical lateral reach, acceleration, speed and fatigue remain enforced. Opening prediction uses the same roof/wall/floor physics as play, rather than granting an automatic save.

In a controlled set of 243 varied hazard-end drives against fresh Prescott, the prior low contact-height/7 m starting configuration allowed 70 dedans winners and 165 returns; the deeper, intelligence-adjusted configuration allows 26 winners and 209 returns. The comparison isolates positioning/volley eligibility and does not include the extra urgency response; it is not a measured match win rate. The unchanged opening receives 80 of those trajectories with no defender.

After a complete computer-served point with less than 15 cm of actual human footwork, further computer services wait. A Waiting for you message and disabled Receive button remain until the user moves the player at least 15 cm. End resets, score changes, clicking a menu, scrolling the racket and repeated Receive requests do not count as movement. Actual movement resumes service after a normal short delay. Second-service attempts retain movement recorded during the same point. New sessions reset the hold; practice/tutorial feeds are unchanged.

Skills & build now opens as native inline details on each player card. Both may stay expanded and update when switching players; no popup dialog is created. Desktop and portrait retain the two comparison cards; short landscape uses compact one-row skill bars and keeps the Start action fixed outside the content area.

Validation: all 31 checks pass, including opening recognition and reachable volleys at both winning openings, intelligence differences without added lateral reach, the 243-drive comparison, idle-point/movement/reset/second-serve guards and the actual service request gate. Browser QA observed the computer stop at 15–0 after an untouched point and resume after footwork. It also confirmed inline ratings remain open when changing opponents and visible expanded comparison layouts at desktop, 390×844 portrait and 844×390 landscape. Browser visual checks use the compatibility renderer. Screenshots: docs/court-waiting-for-player.jpg and docs/court-inline-skills.jpg.

### Net-risk and end-penthouse balance

Human regular shots use a 0.5-degree lower baseline racket face and drives a 1-degree lower face; depth lift increases at 0.60 rather than 0.65 degrees per metre beyond six metres. Horizontal power, timing direction and lob launch remain unchanged. This reintroduces net risk on low, weak and wide contacts while keeping firm central drives playable. The pre-existing rating-based unforced-net-error model also has a small 0.4% baseline per eligible return after the opening rally grace, so top consistency no longer means effectively error-free play. Practice/tutorial still suppress those modeled net errors.

Hard impacts on either end penthouse now dissipate additional energy when the outgoing vertical velocity exceeds 4.2 m/s. A smooth response limits steep upward exits to below 5.2 m/s, scaling the entire outgoing velocity to retain its direction and avoid adding energy or re-entering the roof. Ordinary end impacts and side-penthouse bounce remain unchanged. The existing out-of-court line remains active for excessively high shots; the change addresses roof-generated vertical launches rather than removing out points.

Validation: all 32 checks pass, including legal services and the existing roof/valley/energy, openings, AI defence, calibration and controls regressions. In 32 controlled hard end-roof trajectories, out-of-court losses fall from 24 under the prior roof response to zero; these are selected stress cases, not a claimed match frequency. In 360 sampled drive contacts spanning power, height, depth and lateral position, net crossings below the cord increase from 70 to 98. The earlier 54-case medium-power comparison now has four net failures instead of zero, with most contacts still clearing. Actual collision-physics tests preserve ordinary central drive clearance and direct excessive-height out calls.

### Session chooser, impact reveals and Court 8 (2026-11-20)

- The opening chooser groups Learn controls, Practice (straight / footwork) and Match with the corresponding Start action. Change session pauses the current session until starting or closing; selecting a card alone does not restart play. Settings return to the chooser; calibration lives in Controls & view beside wheel sensitivity. Current players/court/format are summarized in the chooser. Existing settings remain device-persistent, including Court 8.
- Actual camera-side end-wall and end-roof collisions briefly reveal the hidden surface at 25% opacity, with brighter guide edges. The half-second reveal refreshes on repeat hits, fades to the existing guide, pauses with play, and clears for new sessions/end changes. Prediction never triggers it. High rear-wall impacts reveal the upper plane separately. No physics or court dimensions changed.
- Court 6 restores long arched side windows, with bottoms raised to 4.95 m and clear brick below. End windows and the brick tambour profile are retained.
- Court 8 interprets Veterans Stadium as an indoor concrete bowl: concrete piers, recessed rectangular concourses, stepped yellow/orange/brown seats, high light banks and green painted hardcourt. This is an architectural theme, not a reconstruction. Historical inspiration: [Phillies: Remembering Veterans Stadium](https://www.mlb.com/phillies/news/ten-years-later-remembering-veterans-stadium/c-61578404), [NIST concrete stadium investigation](https://nvlpubs.nist.gov/nistpubs/Legacy/TN/nbstechnicalnote1541.pdf).
- Validation: all 33 Node checks pass, including actual live/predicted collision callbacks, reveal materials at both camera ends, fade/refresh/reset, Court 8 preferences, and raised long Camden windows. Browser checks cover practice, tutorial, match, settings return, and chooser fit at desktop, 390×844 and 844×390. This environment uses the software renderer; GPU transparency remains a real-device visual check.

### Veterans concourses, longer reveals and player refinement (2026-11-20)

- Court 8's colored seats are replaced with deep concrete concourses: eased panel edges, fine aggregate and formwork texture, subtle runoff marks, shaded rear doors, slender round steel railings and warm recessed fixtures. Muted mustard/orange/brown remain only on small section plaques. Lower walls, court floor and collision geometry are preserved.
- Hidden-wall and roof impact reveals now last 1.1 seconds: a 0.2-second hold followed by a 0.9-second fade. Opacity remains 25%; another impact refreshes the reveal. The material checks verify visibility beyond the previous half-second duration, fading and reset at both ends.
- Players have smaller adult-proportioned heads (including aligned headbands/caps), oval chests, softer cloth folds, flatter shorts waists, tapered legs, modeled polo collars and gripping hands. Face shading follows each character's skin. Skin beneath sleeves/shorts/socks is trimmed out to reduce visible mesh overlap. Rig motion, roster ratings and controls are retained.
- Validation: all 33 existing checks pass. Browser QA inspected Court 8 in play and player close-ups in ready and backswing poses. Rendering here uses the existing software fallback; GPU lighting is not visually verified in this environment.



## Palestra and Sphere courts

Court 9 uses navy wainscoting, red wall bands, recessed arched glazing, honey maple flooring and steel roof trusses. Court 10 puts its animated artwork on solid walls that follow the full tambour profile, with the surrounding dome continuing the show above. Select either in Settings → Players & match → Court. Augusta has been removed; a saved Augusta selection falls back to Court 1.

Balls entering the dedans or grille stay on the opening’s lower sill through the point-ending pause. Racket heads have a longer, narrower offset shape. Lower-intelligence opponents sometimes anticipate a flat-wall rebound at the tambour, then hesitate before correcting after the actual ricochet.
