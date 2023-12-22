# Dragon Black Jack

Enjoy playing black jack in your discord server

# Commands

- \*play game - to start a new game
- \*hit me - to draw a card
- \*stand - to stand

# How to set up
### Step 1
Clone repo
### Step 2
Set up the bot with discord
1. Follow instuctions at the offical discord docs [here](https://discordpy.readthedocs.io/en/stable/discord.html)
2. From the discord develops application menu go to app and within this page there will be a token or an option to reset it which will give it a new token, copy this token
3. save token into a .env file at the root directory of the repo in a env called 'BOT_TOKEN'
```env
BOT_TOKEN="example-token"
``` 

### Step 3
Run command
```bash
npm install
```

### step 4
Run the bot
```bash
npm run start
```

Now you should be able to run the commands at the top of this page to play blackjack in you discord server


## What i learnt from this project
- How to read through documentation to understand the library
- How to interact with the discord API
- How to create an image from the canvas library