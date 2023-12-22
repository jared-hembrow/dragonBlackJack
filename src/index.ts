import { Client, IntentsBitField, User } from "discord.js";
import { Image, loadImage } from "canvas";
import * as dotenv from "dotenv";
import Game from "./blackjack";
// Load in env
dotenv.config();
// Create discord client
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});
const prefix = process.env.PREFIX ||  "*";
// Set games according to user/author
const games: {
  [playerId: string]: Game;
} = {};

// Load in all images
const images:{[card:string]: Image} = {}

const loadImages = async () => {
  let g = new Game()
  const deck = g.createDeck()
  for (const card of deck) {
    images[card.card] = await loadImage(`./cards/${card.card}.png`)
  }
  images['bg'] = await loadImage(`./cards/backGround.jpg`)
  images['fd'] = await loadImage(`./cards/FD.png`)
}
loadImages()

// Start bot by logging in with token
client.login(
  process.env.BOT_TOKEN
);


// user enters text
client.on("messageCreate", async (msg) => {
  // Check if is valid prefix
  if (!msg.content.startsWith(prefix)) return;
  // Get channel
  const channel = msg.channel;
  let command: string;
  command = msg.content.substring(1);
  const player: User = msg.author;
  console.log(command);
  switch (command) {
    case "help":
      channel.send(
        "To start game -- *play game \n To draw card -- *hit me \n To stand -- *stand"
      );
      break;
    case "start game":
      games[player.id] = new Game();
      const playersCanvas = await games[player.id].createBoard(images);

      await channel.send({
        files: [playersCanvas],
      });

      break;
    case "hit me":
      if (!games.hasOwnProperty(player.id)) break
      const game = games[player.id]
      game.hit("player")
      game.checkGameStatus()
      const playersHitmeCanvas = await games[player.id].createBoard(images);

      await channel.send({
        files: [playersHitmeCanvas],
      });

      break
    case "stand":
      if (!games.hasOwnProperty(player.id)) break
      const standGame = games[player.id]      
      standGame.stand()

      standGame.checkGameStatus()

      const playersStandCanvas = await games[player.id].createBoard(images);

      await channel.send({
        files: [playersStandCanvas],
      });
    default:
      break;
  }

});

