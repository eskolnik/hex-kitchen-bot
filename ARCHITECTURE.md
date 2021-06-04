# Architecture

This doc describes the high level architecture of the Hex Kitchen Bot application. If you want to familiarize yourself with the codebase, you're in the right place. If you're looking for setup help, check out the [README](./README.md)

## Bird's Eye View

This bot handles all chat commands and game events for the Hex Kitchen game.
The bot can initialize a game from a JSON script file

## Game State

### Game

Global Challenge completion (Puzzles, cooking challenges)
Ingredients collected (and assigned to a recipe?)

Personal progress (skills) - might be represented in discord roles, should we also persist in game state?

### Admin

Server id
Admin users on server
Channel IDs join table for channels on server

## Code Map

### db

### src

#### models
