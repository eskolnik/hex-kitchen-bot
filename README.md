# Hex Kitchen Discord Bot

## Setup
  1. Run `yarn install`
  2. Create an `.env.development` file and add the line `DISCORD_TOKEN=<your_discord_app_token>` (Create an application and get your token at https://discordapp.com/developers/applications/)
  3. Open up `config.js` and change `prefix: "!"` to whatever your desired command prefix is.
  
## Running the server
`yarn start`

## Deploying
`fly deploy`

## Status checks
`fly status`

# Roadmap
https://docs.google.com/document/d/16K7SH8hZS9uq354kulsQ0QPyd3jEkE7j45ooeByJbnw

## Game (Feature development on hold until game mechanics are reworked)
Bot command handlers
Game state management
- Multiple games / servers
- 

## Discord integration
Emoji "button" controls
- Replace roll command with a button?
- Use emoji to select ingredients?
- How to target a recipe with a collected ingredient to apply it?

## Game Admin
Server setup
- Establish admin users (+mod / -mod)
- Establish roles
- Create rooms and set initial hidden / visible status

Server reset function?

## Utilities
Convert game representations
CSV -> JSON?
JSON -> CSV
Maybe build a separate game setup UI

## Stack
Upgrade from raw SQL to query builder or full ORM
Figure out hosting solution

# Attribution
Based on https://github.com/Denyed/sample-discord-bot


 
