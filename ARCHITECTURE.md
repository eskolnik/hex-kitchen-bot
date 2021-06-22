# Architecture

This doc describes the high level architecture of the Hex Kitchen Bot application. If you want to familiarize yourself with the codebase, you're in the right place. If you're looking for setup help, check out the [README](./README.md)

## Bird's Eye View

This bot handles all chat commands and game events for the Hex Kitchen game. It includes script-parsing logic so that we can load and run specific version of the game script without significantly impacting older versions.

The primary interface for the bot consists of handlers for event types emitted by the Discord.js Client.
It does not make extensive use of Discord.js Collectors. Instead, we will handle each event in isolation via the same code path.

## Game State

Game state will be managed in-memory until we get much closer to production.
For the sake of debugging during a playtest, it would likely be best to have a save-file format that we can write to and hydrate from.

A **Script** will contain game state for a server, in the form of **Game Events**.
A Game Event is either an action taken by the bot, or a player action the bot expects. Once fulfilled, the bot will store the discord message or object associated with that event.

The game actions we will need to support are:

-   Collecting Ingredients
    -   Player initiates collection (input, command OR button OR emoji, REPEATABLE)
    -   Bot responds with a prompt message (message event, RANDOM, REPEATABLE)
    -   Player sends a reply (same player, need to filter for this)
    -   bot acks the reply (message event) and updates state, also updates ingredient storage message (messageEdit event, REPEATABLE)
-   Using Ingredients
    -   for now, automatically consume when cooking
-   Cooking
    -
-   Entering a password on a puzzle
    -   player enters a command with the solution (input command)
    -   IF incorrect, bot responds with an appropriate message (message event, REPEATABLE)
    -   IF correct, bot responds with a success message plus triggering subsequent events

The atomic interactions the players will have with the bot are:

-   The Bot sends a message
-   The Bot edits a message
-   The Bot emoji reacts to a message
-   The Bot unlocks a new room
-   A player types a command and:
    -   sees a success response
    -   sees a failure response
-   A player types a message in response to a prompt
    -   The bot immediately emoji reacts to it
    -   The bot does something in response to X players using the same emoji
-   A player clicks an emoji and sees a response
-   A player clicks a button and sees a response
-   A player moves into a voice channel

#### Changes Required:

-   Handle repeating events, both for input and output
-   Handle cases where its uncertain which of several inputs will be used for an event
    -   one of X message candidates gets upvoted
    -   a player joins a voice channel, then leaves, then another joins
-   Handle random events, should be easy enough with a RandomEvent type and a set of choices
-
-   Distinguish between Script and Game
    -   Script contains the event templates
    -   Game contains the actual event instances, including message ids
    -   A Game can have more than one copy of an event recorded

### Game Event Types

-   GameMessage: A message sent by the bot. A reference to the sent message is stored on the event.
-   EditGameMessage: Edits a previously sent message.
-   EmojiReact: An Emoji reaction made by the bot.
-   ChannelUnlock: The bot creates a new channel. A reference to the created channel is stored on the associated Channel object.
-

### Game

Global Challenge completion (Puzzles, cooking challenges)
Ingredients collected (and assigned to a recipe?)

Personal progress (skills) - might be represented in discord roles, should we also persist in game state

### Admin

Server id
Admin users on server
Channel IDs join table for channels on server

# Code Map

## db

## src

### models
