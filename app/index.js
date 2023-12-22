"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const canvas_1 = require("canvas");
const dotenv = __importStar(require("dotenv"));
const blackjack_1 = __importDefault(require("./blackjack"));
// Load in env
dotenv.config();
// Create discord client
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.IntentsBitField.Flags.Guilds,
        discord_js_1.IntentsBitField.Flags.GuildMembers,
        discord_js_1.IntentsBitField.Flags.GuildMessages,
        discord_js_1.IntentsBitField.Flags.MessageContent,
    ],
});
const prefix = "*";
// Set games according to user/author
const games = {};
// Load in all images
const images = {};
const loadImages = async () => {
    let g = new blackjack_1.default();
    const deck = g.createDeck();
    for (const card of deck) {
        images[card.card] = await (0, canvas_1.loadImage)(`./cards/${card.card}.png`);
    }
    images['bg'] = await (0, canvas_1.loadImage)(`./cards/backGround.jpg`);
    images['fd'] = await (0, canvas_1.loadImage)(`./cards/FD.png`);
};
loadImages();
// Start bot by logging in with token
client.login(process.env.BOT_TOKEN);
// user enters text
client.on("messageCreate", async (msg) => {
    // Check if is valid prefix
    if (!msg.content.startsWith(prefix))
        return;
    // Get channel
    const channel = msg.channel;
    let command;
    command = msg.content.substring(1);
    const player = msg.author;
    console.log(command);
    switch (command) {
        case "help":
            channel.send("To start game -- *play game \n To draw card -- *hit me \n To stand -- *stand");
            break;
        case "start game":
            games[player.id] = new blackjack_1.default();
            const playersCanvas = await games[player.id].createBoard(images);
            await channel.send({
                files: [playersCanvas],
            });
            break;
        case "hit me":
            if (!games.hasOwnProperty(player.id))
                break;
            const game = games[player.id];
            game.hit("player");
            game.checkGameStatus();
            const playersHitmeCanvas = await games[player.id].createBoard(images);
            await channel.send({
                files: [playersHitmeCanvas],
            });
            break;
        case "stand":
            if (!games.hasOwnProperty(player.id))
                break;
            const standGame = games[player.id];
            standGame.stand();
            standGame.checkGameStatus();
            const playersStandCanvas = await games[player.id].createBoard(images);
            await channel.send({
                files: [playersStandCanvas],
            });
        default:
            break;
    }
});
