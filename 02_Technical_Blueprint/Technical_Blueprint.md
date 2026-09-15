My corrected recommendation
We should design the game as:
A platform-independent simulation architecture
with:
Android V1 as the first consumer platform 
PC/web/desktop-capable architecture from the beginning 
offline career simulation as the core 
manual physical-darts input in V1 
statistical simulation in V1 
camera detection added later 
online architecture reserved from the beginning 
multiplayer implemented later 
no Gemini/API dependency in the finished game 
And I would keep the Kotlin Android domain architecture rather than abandoning it, because AI Studio officially supports native Android generation now. The problem with Gemini's previous work was not "Kotlin is wrong"; it was that it created Kotlin files inside your existing Vite web project, which was the wrong project structure.
That is the thing we need to fix.
DARTS CAREER SIM
MASTER TECHNICAL BLUEPRINT
Version 2.0 — Fully Reviewed Architecture
This is the version I would now save as the official technical blueprint.
1. PROJECT OBJECTIVE
Darts Career Sim is a long-term single-player darts career simulation in which the player begins as a low-level darts player and attempts to build a career toward the highest level of professional darts.
The game combines:
career simulation 
realistic statistical performance 
physical darts gameplay 
manual scoring 
future camera-based scoring 
tournaments 
rankings 
player development 
ageing 
injuries 
fatigue 
confidence 
equipment 
finances 
lifestyle 
AI competitors 
rivalries 
statistics 
achievements 
retirement 
successor generation 
The architecture must support future expansion without requiring the core game to be rewritten.
2. DEVELOPMENT PRIORITY
The development priorities are:
Priority 1
A believable career simulation.
Priority 2
A fully functional darts match engine.
Priority 3
Manual physical-darts gameplay.
Priority 4
A convincing AI-player world.
Priority 5
A stable, replayable career mode.
Priority 6
Camera-based automatic scoring.
Priority 7
Online functionality.
The camera and multiplayer systems are important future goals, but they must not destabilise the core career simulation.
3. PLATFORM STRATEGY
The project should be designed for:
Primary initial platform
Android
Secondary platform
PC
The PC version should eventually allow a player to play the same fundamental career game using:
keyboard 
mouse 
manual scoring 
PC camera 
potentially a phone camera linked to the PC in a future version 
The architecture must not assume that a camera exists.
4. TWO TYPES OF PLATFORM
There are actually two separate concepts.
Game platform
Where the game runs:
Android 
PC 
Input platform
How physical darts are detected:
statistical simulation 
manual input 
future camera input 
These must remain separate.
For example:
Android + Manual
or:
Android + Camera
or:
PC + Manual
or:
PC + Camera
or:
PC + Phone Camera
can all eventually use the same Match Engine.
5. OFFLINE-FIRST PRINCIPLE
The core game must work without an internet connection.
Offline functionality includes:
creating a player 
career mode 
AI players 
tournaments 
matches 
manual darts 
statistical simulation 
rankings 
finances 
training 
equipment 
injuries 
ageing 
saves 
statistics 
achievements 
The player should never lose access to their core career simply because they are offline.
6. ONLINE SYSTEM
Online functionality is a future layer.
Potential future systems include:
online career worlds 
online multiplayer 
online tournaments 
leaderboards 
cloud saves 
friends 
shared competitions 
hybrid multiplayer 
The architecture should reserve the necessary boundaries now, but V1 does not need to implement these systems.
7. AI SERVICES ARE NOT PART OF THE GAME ENGINE
This is critical.
Gemini/AI Studio is a development tool.
It should not be required for the finished game to calculate:
matches 
rankings 
AI players 
tournaments 
stats 
careers 
The game should use normal programmed simulation systems.
That keeps running costs at £0.
The Gemini API itself has a free tier, but it has usage limits, so we should not build a game whose operation depends on it. Google's current documentation confirms free Gemini API access exists with limits, while paid usage is token-based. 
8. HIGH-LEVEL ARCHITECTURE
DARTS CAREER SIM
│
├── PLATFORM
│   ├── Android
│   └── PC
│
├── PRESENTATION
│   ├── Screens
│   ├── Menus
│   ├── Match UI
│   └── Career UI
│
├── APPLICATION
│   ├── Career Flow
│   ├── Match Flow
│   ├── Tournament Flow
│   └── Save Flow
│
├── GAME DOMAIN
│   ├── Player
│   ├── Career
│   ├── Match
│   ├── Tournament
│   ├── Ranking
│   ├── Finance
│   ├── Training
│   ├── Injury
│   ├── Equipment
│   ├── Statistics
│   ├── Rivalry
│   └── World
│
├── SIMULATION
│   ├── Performance
│   ├── Confidence
│   ├── Fatigue
│   ├── Ageing
│   ├── Injury
│   ├── AI Development
│   └── Randomness
│
├── INPUT
│   ├── Statistical
│   ├── Manual
│   └── Camera
│
├── STORAGE
│   ├── Saves
│   ├── Settings
│   └── Content
│
└── FUTURE ONLINE
    ├── Accounts
    ├── Multiplayer
    ├── Cloud
    └── Online World
9. DOMAIN LAYER
The Domain layer contains the rules and data that define the game.
It must not know:
what screen is currently displayed 
what device is being used 
whether a camera exists 
whether the player clicked a button 
whether the game is Android or PC 
10. PLAYER MODEL
Player must contain structured information.
Player
│
├── Identity
│   ├── id
│   ├── name
│   ├── gender
│   ├── nationality
│   ├── date of birth
│   └── age
│
├── Ability
│   ├── base stats
│   └── development stats
│
├── Dynamic State
│   ├── confidence
│   ├── fatigue
│   └── form
│
├── Career
│   ├── status
│   ├── ranking
│   ├── ranking points
│   └── prize money
│
├── Equipment
│
├── Injuries
│
├── Statistics
│
├── Achievements
│
├── Rivalries
│
└── History
11. PLAYER BASE STATS
Core stats:
Scoring 
Doubling 
Consistency 
Pressure 
Stamina 
All use a 0–100 scale.
General interpretation:
50 = approximately tour-average baseline
70+ = elite-level territory
85+ = world-class territory
These values are guidelines for simulation balancing, not rigid guarantees.
12. DEVELOPMENT STATS
Hidden or partially hidden:
Potential 
Work Ethic 
Professionalism 
These influence how a player develops.
A player with:
85 potential + 90 work ethic
should have a different career trajectory from:
85 potential + 40 work ethic.
13. DYNAMIC STATS
Dynamic states:
Confidence 
Fatigue 
Form 
These can change frequently without permanently changing underlying ability.
14. STARTING PLAYER CREATION
The player flow should eventually be:
Choose Name
↓
Choose Gender
↓
Choose Nationality
↓
Create Player
↓
Choose Starting Profile
↓
Distribute Limited Customisation
↓
Randomise Remaining Attributes
↓
Career Begins
The player should have meaningful control without being able to manufacture an unrealistically perfect starting character.
15. RANDOMISATION
Player creation should use a mixture of:
Player choice
The user chooses some starting attributes.
Controlled randomness
Other attributes are generated within defined ranges.
This creates replayability.
Two players selecting the same general starting profile should not necessarily produce identical careers.
16. MATCH ARCHITECTURE
The Match Engine is one of the most important systems.
Match
│
├── Sets
│   └── Legs
│       └── Visits
│           └── Darts
The engine should support:
501 
double-out 
configurable legs 
configurable sets 
future match formats 
17. DART
A DartResult represents one dart.
Example fields:
DartResult
playerId
matchId
legId
visitId
dartNumber
segment
multiplier
score
isMiss
isDouble
isTreble
isBull
source
confirmed
18. VISIT
A visit consists of up to three darts.
Visit
player
dartResults
scoreBefore
visitScore
scoreAfter
bust
checkoutAttempt
19. BUST RULE
The match engine must implement proper 501 bust behaviour.
If a player:
exceeds the remaining score 
leaves 1 
fails to finish correctly when required 
the visit can be declared a bust according to the configured rules.
The player's score returns to the value before the visit.
This must be tested extensively.
20. CHECKOUT SYSTEM
Checkout rules must be configurable.
V1:
Double Out
Future architecture can support:
single out 
double out 
master out 
other variants 
without rewriting the Match Engine.
21. MATCH INPUT PROVIDERS
This is the core hybrid architecture.
             MATCH ENGINE
                  │
            Input Provider
                  │
       ┌──────────┼──────────┐
       │          │          │
 Statistical   Manual     Camera
Every provider produces the same type:
DartResult
22. STATISTICAL PROVIDER
Used when the user chooses to simulate.
The simulation determines the player's dart outcomes using:
scoring 
doubling 
consistency 
pressure 
stamina 
confidence 
fatigue 
equipment 
injury 
opponent 
tournament importance 
random variance 
23. MANUAL PROVIDER
V1 feature.
The player physically throws darts.
After each dart or visit, they enter the result.
Example:
Dart 1: T20
Dart 2: T19
Dart 3: D12
CONFIRM VISIT
The game then processes those results.
24. CAMERA PROVIDER
Future feature.
The camera:
captures the board 
identifies the board 
identifies dart positions 
maps positions to board segments 
calculates scores 
presents proposed results 
waits for confirmation 
sends confirmed results to Match Engine 
25. CAMERA CONFIRMATION
The camera must never silently alter the match.
Example:
CAMERA RESULT
Dart 1: T20
Dart 2: T19
Dart 3: D12
Total: 141
[CONFIRM]
[EDIT]
If edited:
Dart 2
Detected: T19
Change to:
[19]
[T19]
[D19]
[Miss]
Then confirm.
26. CAMERA ERROR TOLERANCE
The architecture must assume camera detection will sometimes fail.
Possible causes:
poor lighting 
camera angle 
dart obstruction 
unusual board 
shadows 
low resolution 
multiple darts close together 
Therefore manual correction is mandatory.
27. CAMERA CALIBRATION
Future camera system must support:
board identification 
board centre 
board radius 
orientation 
camera position 
perspective correction 
Calibration should be stored for the relevant device/setup where appropriate.
28. PC + PHONE CAMERA
The architecture should eventually allow a phone to act as a camera source for a PC game.
Potential architecture:
PHONE CAMERA
     ↓
Camera Detection
     ↓
Network/Local Connection
     ↓
PC GAME
     ↓
Confirmation
     ↓
Match Engine
This is future functionality.
It should not be required for V1.
29. CPU MATCH TURN
In a physical/manual match:
PLAYER
↓
3 darts
↓
Confirm
↓
Score updated
↓
CPU turn
↓
CPU generates result
↓
Score updated
↓
Player turn
The CPU must use the same match rules.
30. CPU PERFORMANCE
CPU performance should not simply be:
Difficulty = Easy / Medium / Hard
Instead CPU players are actual simulated players with:
attributes 
form 
confidence 
fatigue 
equipment 
injuries 
age 
Difficulty should emerge from player quality and context.
31. PERFORMANCE PIPELINE
The statistical system should follow:
Base Ability
↓
Development State
↓
Age Modifier
↓
Injury Modifier
↓
Equipment Profile
↓
Fatigue
↓
Confidence
↓
Pressure
↓
Opponent
↓
Tournament Importance
↓
Random Variance
↓
Performance Distribution
↓
Dart/Visit Outcome
This is deliberately more sophisticated than simply adding and subtracting modifiers.
32. EQUIPMENT PERFORMANCE SHAPE
Equipment changes how a player performs, not merely their rating.
For example:
Player A:
High average
Low variance
Reliable doubling
Player B:
Similar average
Higher variance
More explosive scoring
Different equipment can influence those distributions.
33. FATIGUE SYSTEM
Fatigue should respond to:
matches 
tournament length 
travel 
training 
rest 
injuries 
age 
workload 
It can affect:
scoring 
doubling 
consistency 
pressure performance 
variance 
34. CONFIDENCE SYSTEM
Confidence responds to:
wins 
losses 
major victories 
poor performances 
rivalries 
finals 
ranking pressure 
recent form 
It modifies performance temporarily.
35. FORM SYSTEM
Form should represent recent performance rather than permanent ability.
For example:
A player with 85 scoring ability can currently be:
in poor form 
average form 
excellent form 
without their underlying 85 changing.
36. AGEING SYSTEM
Career ages:
16–65
But:
65 is an upper career boundary, not a guarantee that a player remains elite until 65.
Players can:
peak early 
peak normally 
peak late 
decline early 
decline gradually 
retire earlier 
37. AGEING REALISM
Ageing should affect different players differently.
Variables include:
genetics/potential 
professionalism 
stamina 
injury history 
workload 
career management 
recovery 
fatigue 
This prevents an artificial:
Age 40 = -10
Age 41 = -11
system.
38. INJURY SYSTEM
Injuries can be:
temporary 
severe 
recurring 
career-altering 
permanently damaging 
Repeated injuries can eventually cause permanent attribute loss.
39. TRAINING
Training choices:
scoring 
doubling 
consistency 
pressure 
stamina 
general development 
recovery 
Training effectiveness depends upon:
potential 
work ethic 
professionalism 
coach 
facilities 
fatigue 
age 
40. TRAINING RISK
Training while exhausted should:
produce reduced benefit 
increase fatigue 
potentially increase injury risk 
This creates meaningful career management.
41. CAREER STATUS
The career system should track progression through:
casual 
amateur 
semi-professional 
professional 
elite professional 
The exact thresholds should be configuration-driven.
42. EARLY CAREER PACING
The amateur/non-professional career should progress faster.
The player has fewer events.
Once professional:
more tournaments 
more travel 
more ranking events 
more decisions 
more detailed scheduling 
This prevents the beginning from feeling like a grind.
43. TOURNAMENT ENGINE
Each tournament contains:
name 
tier 
dates 
location 
entry requirements 
format 
rounds 
prize money 
ranking points 
participant rules 
44. TOURNAMENT AVAILABILITY
Tournament availability depends on player status.
The game determines whether the player can enter based on:
qualification 
ranking 
professional status 
tour status 
invitations 
entry requirements 
45. REAL-WORLD-INSPIRED STRUCTURE
The professional structure should be heavily inspired by real professional darts.
However, the game should use fictionalised names and content where necessary to avoid unnecessary licensing/copyright/trademark problems.
The rules and competitive structure can be designed to feel familiar without requiring us to reproduce protected branding.
46. RANKING SYSTEM
The ranking engine must be independent.
It should process:
tournament results 
ranking points 
prize money where appropriate 
time periods 
ranking rules 
The exact professional ranking implementation should be specified separately and validated against the real-world rules we are trying to emulate.
We should not tell AI Studio "make realistic rankings".
We will eventually give it exact formulas and rules.
47. AI WORLD
The world contains:
player population 
professionals 
semi-pros 
amateurs 
fictional lower-level players 
major professional archetypes 
future generations 
Players must develop over time.
48. AI CAREERS
AI players can:
train 
improve 
decline 
become injured 
change equipment 
win 
lose 
earn money 
change ranking 
retire 
The world therefore evolves.
49. WORLD GENERATION
The initial world should contain approximately:
200–300 AI players
with different:
ability 
potential 
age 
nationality 
personality 
work ethic 
professionalism 
career status 
50. PLAYER ARCHETYPES
AI generation should produce different career types.
Examples:
Wonderkid
High potential, young.
Journeyman
Average ability, long career.
Late Bloomer
Average early career, improves later.
Flash Player
High peak, inconsistent.
Grinder
High consistency, modest scoring.
Veteran
Declining ability but exceptional experience/pressure.
These are examples of data-driven archetypes rather than rigid classes.
51. RETIREMENT
Retirement can occur because of:
age 
declining performance 
injuries 
finances 
career choice 
loss of competitiveness 
52. SUCCESSOR SYSTEM
Retired important players can be replaced by successor players.
Successors should not simply copy the original.
They should be generated with:
some inherited/archetypal similarities 
substantial randomness 
their own personality 
their own potential 
their own career trajectory 
53. RIVALRY SYSTEM
Rivalries emerge through history.
Possible triggers:
repeated matches 
close matches 
major tournament meetings 
finals 
ranking battles 
significant defeats 
revenge opportunities 
54. STATISTICS
The game should retain deep career statistics.
Examples:
matches 
wins 
losses 
legs 
averages 
checkout % 
highest checkout 
180s 
140s 
100s 
nine-darters 
tournament wins 
finals 
ranking history 
prize money 
55. SPECIAL ACHIEVEMENTS
Special statistics should remain separate from core attributes.
Examples:
Big Fish 
Nine Dart Finish 
Highest Checkout 
Longest Winning Streak 
Major Finals 
Comebacks 
First Title 
This prevents the Player model becoming bloated.
56. CALENDAR
The calendar drives:
tournaments 
training 
rest 
travel 
ageing 
injuries 
finances 
ranking periods 
career events 
57. DECISION SYSTEM
At important moments the game should stop and let the player decide.
Examples:
TRAIN
REST
ENTER EVENT
SKIP EVENT
BUY EQUIPMENT
HIRE COACH
TRAVEL
PLAY PUB EVENT
MANAGE LIFESTYLE
The simulation should not automate every meaningful decision.
58. PUB / AMATEUR SYSTEM
The beginning of the career should offer lower-level ways to progress.
Examples:
pub games 
local events 
amateur tournaments 
semi-pro events 
These can provide:
money 
experience 
confidence 
reputation 
ranking progression where appropriate 
59. FINANCE
Money should affect:
equipment 
coaching 
training 
travel 
accommodation 
lifestyle 
recovery 
facilities 
Better finances should improve the player's career opportunities without becoming an automatic stat cheat.
60. SAVE SYSTEM
Multiple saves.
Each save contains:
SaveGame
├── version
├── player
├── world
├── calendar
├── tournaments
├── rankings
├── finances
├── statistics
├── equipment
├── injuries
├── history
└── settings
61. SAVE VERSIONING
Every save must include a version number.
Future updates can migrate:
V1 save
↓
Migration
↓
V2 save
This is essential if we intend to add paid content and major expansions.
62. EXPANSION ARCHITECTURE
The project should remain open for:
equipment expansions 
new tournaments 
new mini-games 
technique systems 
advanced match engine 
online mode 
hybrid camera 
career expansions 
new countries 
additional statistics 
sponsorships 
contracts 
facilities 
coaching 
multiplayer 
63. MINI-GAMES
The architecture should reserve a MiniGame module.
Potential future games:
301 
Cricket 
Killer 
Shanghai 
High Score 
Around the Clock 
These should not contaminate the core 501 Match Engine.
64. TECHNIQUE SYSTEM
Future expansion.
Possible attributes:
stance 
throw speed 
release consistency 
grip 
rhythm 
These should eventually affect performance distributions rather than simply adding flat bonuses.
65. EQUIPMENT EXPANSION
Future content may include:
barrels 
shafts 
flights 
weights 
grips 
Equipment should alter performance characteristics.
66. ONLINE CAREER
Future architecture:
Local Career
     │
     ├── Offline World
     │
     └── Online World
             │
             ├── Player Accounts
             ├── Server State
             ├── Multiplayer
             └── Leaderboards
The local simulation should remain independent.
67. ONLINE MULTIPLAYER
Future match:
Player A
   ↓
Confirmed DartResult
   ↓
Server
   ↓
Match State
   ↓
Player B
The server becomes authoritative.
This prevents cheating and desynchronisation.
68. CAMERA + ONLINE FUTURE
Eventually:
Physical Dart
↓
Camera
↓
Detection
↓
Player Confirmation
↓
Server
↓
Opponent
This is the ultimate hybrid system.
69. UI ARCHITECTURE
UI should never contain game rules.
For example:
Bad
Button clicked
→ subtract 60 from score
Good
Button clicked
→ Application submits DartResult
→ MatchEngine validates
→ Match state updates
→ UI displays new state
70. APPLICATION LAYER
The Application layer manages actions such as:
CreateCareer 
StartMatch 
SubmitDart 
ConfirmVisit 
SimulateMatch 
EnterTournament 
Train 
Rest 
BuyEquipment 
SaveCareer 
LoadCareer 
71. CONFIGURATION
Game balance should be configurable.
Examples:
ageing curves 
fatigue penalties 
confidence effects 
injury probabilities 
training rates 
tournament rewards 
ranking rules 
AI generation 
equipment effects 
Avoid hardcoding these throughout the program.
72. RANDOMNESS
One central random provider.
It should support:
random number 
probability 
weighted choice 
seeded random 
Seeded simulation is particularly useful for debugging.
73. TESTING
Every major subsystem needs automated tests.
Minimum tests eventually include:
Player
Creation, stat ranges, ageing.
Match
501, scoring, bust, checkout.
Tournament
Entry, progression, results.
Ranking
Correct ordering and updates.
Finance
Income and expenses.
Training
Stat development and fatigue.
Injury
Recovery and permanent damage.
Save
Save/load integrity.
World
AI development and retirement.
74. DEBUG MODE
Developer tools should eventually allow us to:
set player age 
change stats 
change confidence 
change fatigue 
change money 
force injury 
force tournament result 
advance calendar 
inspect rankings 
This will make balancing dramatically easier.
75. PERFORMANCE
The game should not simulate every dart of every player in the entire world unnecessarily.
For example:
A background AI tournament can usually resolve statistically.
The user's actual match can use detailed dart-level simulation.
This keeps the simulation fast.
76. WORLD SIMULATION LEVELS
We can eventually have:
Level 1
Fast statistical result.
Level 2
Detailed match simulation.
Level 3
Full dart-level simulation.
The player uses Level 3-equivalent detail when physically playing manually/camera.
77. DEVELOPMENT PROJECT STRUCTURE
I would now recommend something conceptually like:
DartsCareerSim
│
├── app
│
├── core
│   ├── player
│   ├── career
│   ├── match
│   ├── leg
│   ├── tournament
│   ├── ranking
│   ├── world
│   ├── ai
│   ├── finance
│   ├── equipment
│   ├── training
│   ├── injury
│   ├── statistics
│   ├── rivalry
│   ├── ageing
│   ├── confidence
│   ├── fatigue
│   ├── random
│   └── configuration
│
├── application
│
├── input
│   ├── statistical
│   ├── manual
│   └── camera
│
├── storage
│
├── ui
│
└── tests
The actual Android project structure will necessarily include Android-specific directories, but these logical boundaries should remain.
78. AI STUDIO DEVELOPMENT RULE
AI Studio must never be asked to build multiple major systems simultaneously.
Each chunk must:
inspect the current project 
inspect existing architecture 
identify relevant files 
make the smallest necessary changes 
avoid unrelated refactoring 
test the implementation 
report exactly what changed 
identify anything that remains incomplete 
79. AI STUDIO MUST NOT INVENT GAME RULES
If the prompt says:
Implement the ranking system.
that is not enough.
The development chunk must contain the exact ranking specification.
Likewise:
Build realistic AI.
is insufficient.
The actual attributes and algorithms must be specified.
80. CHANGE CONTROL
If AI Studio discovers that the architecture requires a major change, it should stop and explain the issue before making the change.
This prevents an AI agent from silently redesigning the project.
81. DEVELOPMENT LOG
You absolutely should maintain your external work file.
I recommend:
Darts Career Sim/
│
├── 01 Master Specification
├── 02 Technical Blueprint
├── 03 Development Log
│
├── Chunks
│   ├── Chunk 001
│   ├── Chunk 002
│   ├── Chunk 003
│   └── ...
│
├── Decisions
├── Backups
└── Testing
Each chunk should contain:
CHUNK NUMBER
DATE
OBJECTIVE
PROMPT SENT TO AI STUDIO
AI STUDIO RESPONSE
FILES CREATED
FILES MODIFIED
TEST RESULTS
BUILD RESULT
PROBLEMS
DECISIONS MADE
NEXT CHUNK
I strongly recommend doing this.
82. DEVELOPMENT PHASES
This is the part I think was missing most from my previous blueprint.
We actually have a lot more development stages than I listed previously.
PHASE 0 — PROJECT FOUNDATION
0.1 Choose project type0.2 Create clean Android project0.3 Establish package structure0.4 Establish core/application/UI boundaries0.5 Establish testing0.6 Establish configuration0.7 Establish save architecture0.8 Establish version control strategy
PHASE 1 — PLAYER FOUNDATION
1.1 Player identity1.2 Name1.3 Gender1.4 Nationality1.5 DOB/age1.6 Base stats1.7 Development stats1.8 Dynamic stats1.9 Player creation1.10 Controlled randomisation
PHASE 2 — CAREER FOUNDATION
2.1 Career state2.2 Career status2.3 Calendar2.4 Age progression2.5 Career history2.6 Decision system2.7 Career events
PHASE 3 — DART ENGINE
3.1 DartResult3.2 Visit3.3 Leg3.4 5013.5 Scoring3.6 Busts3.7 Double-out3.8 Checkout3.9 Match3.10 Match formats3.11 Automated tests
PHASE 4 — MANUAL HYBRID
4.1 Manual input provider4.2 Dart entry UI4.3 Visit confirmation4.4 Correction4.5 Turn switching4.6 CPU turn4.7 Match completion4.8 Physical-darts testing
This is our first major hybrid milestone.
PHASE 5 — PERFORMANCE SIMULATION
5.1 Performance model5.2 Scoring5.3 Doubling5.4 Consistency5.5 Pressure5.6 Stamina5.7 Variance5.8 Confidence5.9 Fatigue5.10 Form5.11 Injuries5.12 Equipment5.13 Opponent effects5.14 Tournament pressure
PHASE 6 — AI PLAYERS
6.1 AI data model6.2 Player generation6.3 Archetypes6.4 Development6.5 Training6.6 Ageing6.7 Injuries6.8 Retirement6.9 Successors
PHASE 7 — TOURNAMENTS
7.1 Tournament model7.2 Entry requirements7.3 Qualification7.4 Draws7.5 Rounds7.6 Formats7.7 Prize money7.8 Ranking points7.9 Results7.10 Tournament history
PHASE 8 — RANKINGS
8.1 Ranking data8.2 Ranking calculations8.3 Ranking updates8.4 Ranking history8.5 Qualification thresholds8.6 Professional status
PHASE 9 — WORLD SIMULATION
9.1 World generation9.2 AI tournaments9.3 Background results9.4 Player development9.5 Rankings9.6 Rivalries9.7 Retirement9.8 Successor generation
PHASE 10 — CAREER DEPTH
10.1 Finance10.2 Training10.3 Coaching10.4 Equipment10.5 Lifestyle10.6 Injury management10.7 Statistics10.8 Achievements10.9 Career history
PHASE 11 — PUB/AMATEUR CAREER
11.1 Pub events11.2 Amateur events11.3 Semi-pro events11.4 Income11.5 Reputation11.6 Progression11.7 Early-career pacing
PHASE 12 — CAREER UI
12.1 Home12.2 Player profile12.3 Calendar12.4 Tournament screen12.5 Match screen12.6 Training12.7 Equipment12.8 Finance12.9 Rankings12.10 Statistics12.11 Rivals12.12 History
PHASE 13 — SAVE SYSTEM
13.1 Save slots13.2 Save creation13.3 Save loading13.4 Save validation13.5 Save versioning13.6 Migration13.7 Backup/export
PHASE 14 — BALANCING
14.1 Match realism14.2 AI strength14.3 Career progression14.4 Ranking competitiveness14.5 Prize money14.6 Training14.7 Injuries14.8 Ageing14.9 Equipment14.10 Fatigue14.11 Confidence
PHASE 15 — CAMERA RESEARCH/PROTOTYPE
15.1 Camera access15.2 Board detection15.3 Calibration15.4 Dart detection15.5 Coordinate mapping15.6 Segment detection15.7 Score calculation15.8 Multiple dart detection15.9 Confidence scoring15.10 Manual correction
PHASE 16 — CAMERA INTEGRATION
16.1 Camera InputProvider16.2 Camera → DartResult16.3 Confirmation16.4 Correction16.5 Match integration16.6 Error handling16.7 Real-world testing
PHASE 17 — PC
17.1 Desktop build17.2 Keyboard/mouse17.3 PC camera17.4 Desktop UI17.5 Save compatibility
PHASE 18 — PHONE-AS-CAMERA
18.1 Phone camera mode18.2 Local connection18.3 Pairing18.4 Camera stream18.5 Detection18.6 PC integration
PHASE 19 — ONLINE FOUNDATION
19.1 Account system19.2 Server architecture19.3 Authentication19.4 Online save19.5 Server state19.6 Security
PHASE 20 — ONLINE CAREER
20.1 Online world20.2 Player profiles20.3 Shared rankings20.4 Online tournaments20.5 Scheduling
PHASE 21 — MULTIPLAYER
21.1 Match server21.2 Match synchronisation21.3 DartResult networking21.4 Anti-cheat21.5 Disconnect handling21.6 Camera multiplayer
PHASE 22 — EXPANSION SYSTEM
22.1 DLC architecture22.2 Paid equipment22.3 New game modes22.4 Mini-games22.5 Career expansions22.6 Cosmetic content
83. WHAT I WOULD CHANGE FROM THE PREVIOUS GEMINI WORK
There are three things I would not let Gemini continue doing yet.
1. Don't let it mix Android and Vite.
The previous project has:
React/Vite
+
raw Kotlin files
That's not a proper Android application.
AI Studio now supports native Android projects directly, so we should start a clean Android project through the Android platform option, rather than attempting to turn the current Vite project into Android manually. 
2. Don't build the entire architecture immediately.
Gemini created placeholders for almost everything:
Player
Career
Match
Tournament
Ranking
AI
Training
Injury
Finance
Equipment
Statistics
...
That looks impressive, but it can actually make the project harder to control.
We want:
small number of correct systems → tested → next system.
3. Don't build the camera yet.
The manual input system should come first.
That gives us a genuine test:
Can I physically throw darts, enter the results, play a CPU opponent, finish a match and have the career system correctly process the result?
If the answer becomes yes, then we have proved the foundation.
Then we attack camera detection separately.
84. THE MOST IMPORTANT THING WE NOW KNOW
The current AI Studio documentation actually makes our strategy better than I originally thought.
AI Studio can now create native Android Kotlin/Compose projects, preview them in an Android emulator, and install them on a physical Android device. 
However, the Android environment currently has limitations around server-side functionality and multiplayer, while the web/full-stack environment can provide server-side functionality and real-time multiplayer. 
So Android should be our first game client, while the future online architecture should remain a separate service/backend rather than being baked into the offline Android simulation.
That is a much cleaner architecture.
Bottom line
No, I wouldn't use my previous shorter blueprint as the final version.
This reviewed version is the one I'd save.
And I don't think we've lost anything important from your earlier decisions. In fact, we've now explicitly accounted for the things that were previously only implied:
Android 
PC 
offline operation 
manual hybrid V1 
future camera hybrid 
phone-as-camera possibility 
statistical matches 
CPU opponents 
501 
dart/visit/leg/match hierarchy 
confidence 
fatigue 
form 
pressure 
equipment performance shape 
injuries 
permanent injury effects 
ageing 
16–65 career range 
realistic career decline 
AI development 
200–300-player world 
professional/semipro/amateur progression 
tournaments 
qualification 
rankings 
finances 
lifestyle 
training 
coaching 
pub/amateur career 
rivalries 
statistics 
achievements 
retirement 
successors 
multiple saves 
save migration 
offline-first 
future online career 
future multiplayer 
future DLC/paid content 
future mini-games 
future technique system 
future equipment expansion 
future camera 
future phone-camera-to-PC mode 
testing 
debugging 
balancing 
version control 
AI Studio chunk discipline 
external development logs