"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.Results = exports.CardType = void 0;
const canvas_1 = require("canvas");
const discord_js_1 = require("discord.js");
var CardType;
(function (CardType) {
    CardType["S"] = "spade";
    CardType["C"] = "club";
    CardType["H"] = "heart";
    CardType["D"] = "diamond";
})(CardType || (exports.CardType = CardType = {}));
var Results;
(function (Results) {
    Results["PLAYER_WIN"] = "You Win!!!";
    Results["PLAYER_BUSTED"] = "Busted!";
    Results["PLAYER_LOST"] = "You Lose!!!";
    Results["DEALER_BUSTED"] = "Dealer Busted!";
    Results["DRAW"] = "Draw";
})(Results || (exports.Results = Results = {}));
var Status;
(function (Status) {
    Status["DEALING"] = "DEALING";
    Status["PLAYER_STOOD"] = "PLAYER_STOOD";
    Status["FINISHED"] = "FINISHED";
})(Status || (exports.Status = Status = {}));
// =================
// Object to handle the game
class Game {
    constructor() {
        this.deck = this.shuffleDeck(this.createDeck());
        this.playersHand = this.drawCards(2);
        this.dealersHand = this.drawCards(2);
        this.dealerHidden = true;
        this.result = null;
        this.status = Status.DEALING;
    }
    selectCardType(typeValue) {
        const values = {
            1: CardType.S,
            2: CardType.C,
            3: CardType.H,
            4: CardType.D
        };
        return values[typeValue];
    }
    createCardCode(cardValue, cardType) {
        let v = "A";
        if (cardValue > 1 && cardValue < 11) {
            v = `${cardValue}`;
        }
        else {
            switch (cardValue) {
                case 11:
                    v = "J";
                    break;
                case 12:
                    v = "Q";
                    break;
                case 13:
                    v = "K";
                    break;
                default:
                    break;
            }
        }
        return `${v}${cardType.substring(0, 1).toUpperCase()}`;
    }
    createDeck() {
        const deck = [];
        for (let i = 1; i < 14; i++) {
            for (let y = 1; y < 5; y++) {
                const cardType = this.selectCardType(y);
                deck.push({
                    type: cardType,
                    value: i > 10 ? 10 : i,
                    card: this.createCardCode(i, cardType)
                });
            }
        }
        return deck;
    }
    shuffleDeck(deck) {
        const shuffledDeck = [...deck]; // Create a shallow copy of the array
        // Fisher-Yates shuffle algorithm
        for (let i = shuffledDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
        }
        return shuffledDeck;
    }
    drawCard() {
        if (this.deck.length < 1) {
            this.deck = this.shuffleDeck(this.createDeck());
        }
        const newCard = this.deck.pop();
        return newCard;
    }
    drawCards(numOfCards) {
        let hand = [];
        for (let i = 1; i <= numOfCards; i++) {
            const drawnCard = this.drawCard();
            if (drawnCard)
                hand.push(drawnCard);
        }
        return hand;
    }
    hit(player) {
        const newCard = this.drawCard();
        if (newCard) {
            if (player === "dealer")
                this.dealersHand.push(newCard);
            if (player === "player")
                this.playersHand.push(newCard);
        }
    }
    stand() {
        this.status = Status.PLAYER_STOOD;
    }
    // CANVAS
    getCardPosition(cardNum, player) {
        const yInc = player === "dealer" ? 0 : 500;
        switch (cardNum) {
            case 1:
                return [10, yInc + 10, 200, 200];
            case 2:
                return [220, yInc + 10, 200, 200];
            case 3:
                return [430, yInc + 10, 200, 200];
            case 4:
                return [640, yInc + 10, 200, 200];
            case 5:
                return [10, 260 + yInc, 200, 200];
            case 6:
                return [220, 260 + yInc, 200, 200];
            case 7:
                return [430, 260 + yInc, 200, 200];
            case 8:
                return [640, 260 + yInc, 200, 200];
            default: return null;
        }
    }
    async createBoard(imgs) {
        const canvas = (0, canvas_1.createCanvas)(1500, 1000);
        const ctx = canvas.getContext('2d');
        ctx.font = '50px Georgia';
        ctx.fillStyle = 'blue';
        if (!imgs['bg']) {
            console.log("background image not loaded");
            imgs['bg'] = await (0, canvas_1.loadImage)(`./cards/backGround.jpg`);
        }
        ctx.drawImage(imgs['bg'], 0, 0, canvas.width, canvas.height);
        // Players hand
        for (let i = 0; i < this.playersHand.length; i++) {
            if (!imgs[this.playersHand[i].card]) {
                console.log(`${this.playersHand[i].card} card not loaded`);
                imgs[this.playersHand[i].card] == await (0, canvas_1.loadImage)(`./cards/${this.playersHand[i].card}.png`);
            }
            const imgCoords = this.getCardPosition(i + 1, "player");
            if (imgCoords)
                ctx.drawImage(imgs[this.playersHand[i].card], ...imgCoords);
        }
        // dealers hand
        for (let i = 0; i < this.dealersHand.length; i++) {
            if (i === 1 && this.dealerHidden) {
                if (!imgs['fd']) {
                    console.log("face down card not loaded yet");
                    imgs['fd'] = await (0, canvas_1.loadImage)(`./cards/FD.png`);
                }
                const imgCoords = this.getCardPosition(i + 1, "dealer");
                if (imgCoords)
                    ctx.drawImage(imgs['fd'], ...imgCoords);
                continue;
            }
            if (!imgs[this.dealersHand[i].card]) {
                console.log(`${this.dealersHand[i].card} card not loaded`);
                imgs[this.dealersHand[i].card] == await (0, canvas_1.loadImage)(`./cards/${this.dealersHand[i].card}.png`);
            }
            // const img = await loadImage(`./cards/${this.dealersHand[i].card}.png`);
            const imgCoords = this.getCardPosition(i + 1, "dealer");
            if (imgCoords)
                ctx.drawImage(imgs[this.dealersHand[i].card], ...imgCoords);
        }
        if (this.result !== null) {
            ctx.font = '200px Georgia';
            ctx.fillStyle = this.result === Results.PLAYER_WIN || this.result === Results.DEALER_BUSTED ? 'Blue' : 'Red';
            this.result ? ctx.fillText(this.result, 200, 500, 800) : ctx.fillText('You Lose!!', 0, 500);
        }
        // ctx.fillText("Players Hand", 0, 40)
        const attachment = new discord_js_1.AttachmentBuilder(canvas.toBuffer(), { name: 'image.png' });
        return attachment;
    }
    playDealer() {
        let dealersTotal = this.evalHand(this.dealersHand);
        console.log("dealers total", dealersTotal);
        if (dealersTotal < 17) {
            this.hit("dealer");
            return this.playDealer();
        }
        let dealerBusted = this.checkBust("dealer");
        if (dealerBusted) {
            this.status = Status.FINISHED;
            this.result = Results.DEALER_BUSTED;
            return;
        }
        let playersTotal = this.evalHand(this.playersHand);
        if (dealersTotal > playersTotal) {
            this.status = Status.FINISHED;
            this.result = Results.PLAYER_LOST;
            return;
        }
        if (dealersTotal === playersTotal) {
            this.status = Status.FINISHED;
            this.result = Results.DRAW;
            return;
        }
        if (dealersTotal < playersTotal) {
            this.status = Status.FINISHED;
            this.result = Results.PLAYER_WIN;
            return;
        }
    }
    evalHand(hand) {
        let total = 0;
        const aces = hand.filter(card => card.value === 1);
        const nonAces = hand.filter(card => card.value !== 1);
        total = nonAces.reduce((prev, cur) => {
            return prev + cur.value;
        }, 0);
        for (let i = 0; i < aces.length; i++) {
            if (total + 11 > 21) {
                total += 1;
            }
            else if (total + 1 > 21 && i > 0) {
                total -= 9;
            }
            else {
                total += 11;
            }
        }
        return total;
    }
    checkBust(player) {
        let hand = [];
        if (player === "player")
            hand = this.playersHand;
        if (player === "dealer")
            hand = this.dealersHand;
        return this.evalHand(hand) > 21;
    }
    checkGameStatus() {
        if (this.status === Status.DEALING) {
            const checkPayerHand = this.checkBust("player");
            if (checkPayerHand) {
                this.dealerHidden = false;
                this.status = Status.FINISHED;
                this.result = Results.PLAYER_BUSTED;
            }
        }
        if (this.status === Status.PLAYER_STOOD) {
            this.dealerHidden = false;
            this.playDealer();
        }
    }
}
exports.default = Game;
