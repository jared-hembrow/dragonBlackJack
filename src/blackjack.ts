import { Image, createCanvas, loadImage } from "canvas";
import { AttachmentBuilder, Channel, User } from "discord.js";

// Types
export type Card = {
    type: CardType,
    value: number
    card: string
}
export enum CardType {
    S = "spade",C=  "club", H= "heart",D=  "diamond"
}
export enum Results {
    PLAYER_WIN = "You Win!!!",
    PLAYER_BUSTED = "Busted!",
    PLAYER_LOST = "You Lose!!!",
    DEALER_BUSTED = "Dealer Busted!",
    DRAW = "Draw"
}
export enum Status {
    DEALING = "DEALING",
    PLAYER_STOOD = "PLAYER_STOOD",
    FINISHED = "FINISHED"
}
export type Cords = [number, number, number, number]
// =================

// Object to handle the game
export default class Game  {
    private deck: Card[]
    public playersHand: Card[]
    public dealersHand: Card[]
    private dealerHidden: boolean
    public result: null | Results
    public status: Status
    constructor() {
        this.deck = this.shuffleDeck(this.createDeck())
        this.playersHand = this.drawCards(2)
        this.dealersHand = this.drawCards(2)
        this.dealerHidden = true
        this.result = null
        this.status = Status.DEALING

    }

    private selectCardType(typeValue: number):CardType {
        const values: {[key:number]: CardType} = {
            1: CardType.S,
            2: CardType.C,
            3: CardType.H,
            4: CardType.D
        }
        return values[typeValue]
    }
    private createCardCode(cardValue: number, cardType:CardType): string {
        let v = "A"
        if (cardValue > 1 && cardValue < 11) {
            v = `${cardValue}`
        } else {
            switch (cardValue) {
                case 11:
                    v = "J"
                    break
                case 12:
                    v = "Q"
                    break
                case 13:
                    v = "K"
                    break
                default: 
                break
            }
        }
        return `${v}${cardType.substring(0,1).toUpperCase()}`
    }
    public createDeck():Card[] {
        const deck: Card[] = []
        for (let i = 1; i < 14; i++) {
            for (let y = 1; y < 5; y++) {
                const cardType = this.selectCardType(y)
                deck.push({
                    type: cardType,
                    value: i > 10 ? 10  : i ,
                    card: this.createCardCode(i, cardType)
                })
            }
        }
        return deck
    }
    private shuffleDeck(deck: Card[]): Card[] {
        const shuffledDeck = [...deck]; // Create a shallow copy of the array
        // Fisher-Yates shuffle algorithm
        for (let i = shuffledDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
        }

  return shuffledDeck;
}

    private drawCard(): Card | undefined {
        if (this.deck.length < 1) {
            this.deck = this.shuffleDeck(this.createDeck())
        }
        const newCard = this.deck.pop()
        return newCard
    } 
    private drawCards(numOfCards: number): Card[] {
        let hand: Card[] = []
        for (let i = 1; i <= numOfCards; i++) {
            const drawnCard = this.drawCard()
            if (drawnCard) hand.push(drawnCard)
        }
        return hand
    }
    public hit(player: "dealer" | "player") {
        const newCard = this.drawCard()
        if (newCard) {
            if (player === "dealer") this.dealersHand.push(newCard)
            if (player === "player") this.playersHand.push(newCard)
        }
    } 

    public stand() {
        this.status = Status.PLAYER_STOOD
    }



    // CANVAS
    private getCardPosition(cardNum: number, player: "dealer" | "player"): Cords | null {
        const yInc: number = player === "dealer" ? 0 : 500
        switch (cardNum) {
            case 1:
                return [10, yInc + 10,200, 200]
            case 2:
                return [220, yInc + 10, 200, 200]
            case 3:
                return [430, yInc + 10, 200, 200]
            case 4:
                return [640, yInc + 10, 200, 200]
            case 5:
                return [10, 260 + yInc,200, 200]
            case 6:
                return [220, 260 + yInc, 200, 200]
            case 7:
                return [430, 260 + yInc, 200, 200]
            case 8:
                return [640, 260 + yInc, 200, 200]
            
            default: return null
        }
    }

    public async createBoard(imgs: {[card:string]: Image}) {
        const canvas = createCanvas(1500,1000)
        const ctx = canvas.getContext('2d');
        ctx.font = '50px Georgia';
        ctx.fillStyle = 'blue';
        if (!imgs['bg']) {
            console.log("background image not loaded")
            imgs['bg'] = await loadImage(`./cards/backGround.jpg`);
        }

        ctx.drawImage(imgs['bg'], 0, 0, canvas.width, canvas.height);

        // Players hand
        for (let i = 0; i < this.playersHand.length; i++) {
            if (!imgs[this.playersHand[i].card]) {
                console.log(`${this.playersHand[i].card} card not loaded`)
                imgs[this.playersHand[i].card] == await loadImage(`./cards/${this.playersHand[i].card}.png`);
            }
            const imgCoords = this.getCardPosition(i + 1, "player")
            if (imgCoords) ctx.drawImage(imgs[this.playersHand[i].card], ...imgCoords)
        }
        // dealers hand
        for (let i = 0; i < this.dealersHand.length; i++) {
            if (i === 1 && this.dealerHidden) {
                if (!imgs['fd']) {
                    console.log("face down card not loaded yet")
                    imgs['fd'] = await loadImage(`./cards/FD.png`);

                }
                const imgCoords = this.getCardPosition(i + 1, "dealer")
            if (imgCoords) ctx.drawImage(imgs['fd'], ...imgCoords)
            continue
            }
            
            if (!imgs[this.dealersHand[i].card]) {
                console.log(`${this.dealersHand[i].card} card not loaded`)
                imgs[this.dealersHand[i].card] == await loadImage(`./cards/${this.dealersHand[i].card}.png`);
            }
            // const img = await loadImage(`./cards/${this.dealersHand[i].card}.png`);
            const imgCoords = this.getCardPosition(i + 1, "dealer")
            if (imgCoords) ctx.drawImage( imgs[this.dealersHand[i].card], ...imgCoords)
        }

        if (this.result !== null) {
            ctx.font = '200px Georgia';
            ctx.fillStyle = this.result === Results.PLAYER_WIN || this.result === Results.DEALER_BUSTED ? 'Blue' : 'Red';
            this.result ? ctx.fillText(this.result, 200, 500, 800) : ctx.fillText('You Lose!!', 0, 500)
        }

        // ctx.fillText("Players Hand", 0, 40)
        const attachment = new AttachmentBuilder(
            canvas.toBuffer(),
            {name: 'image.png'}
          );
          return attachment;
    }
    private playDealer(): any {
        let dealersTotal = this.evalHand(this.dealersHand)
        console.log("dealers total", dealersTotal)
        if (dealersTotal < 17) {
            this.hit("dealer")
            return this.playDealer()
        }
        let dealerBusted = this.checkBust("dealer")
        if (dealerBusted) {
            this.status = Status.FINISHED
            this.result = Results.DEALER_BUSTED
            return
        }
        let playersTotal = this.evalHand(this.playersHand)
        if (dealersTotal > playersTotal) {
            this.status = Status.FINISHED
            this.result = Results.PLAYER_LOST
            return
        }
        if (dealersTotal === playersTotal) {
            this.status = Status.FINISHED
            this.result = Results.DRAW
            return
        }
        if (dealersTotal < playersTotal) {
            this.status = Status.FINISHED
            this.result = Results.PLAYER_WIN
            return
        }
    }
    private evalHand(hand: Card[]): number {
        let total = 0
        const aces = hand.filter(card => card.value === 1)
        const nonAces = hand.filter(card => card.value !== 1)
        total = nonAces.reduce((prev, cur) => {
            return prev + cur.value
        }, 0)
        for (let i = 0; i < aces.length; i++) {
            if (total + 11 > 21) {
                total += 1
            } else if (total + 1 > 21 && i > 0) {
                total -= 9
            } else {
                total += 11
            }
        }
        return total
    }
    private checkBust(player: "dealer" | "player"): boolean {
        let hand:Card[] = []
        if (player === "player") hand = this.playersHand
        if (player === "dealer") hand = this.dealersHand
        return this.evalHand(hand) > 21
    }

    public checkGameStatus() {
        if (this.status === Status.DEALING) {
            const checkPayerHand = this.checkBust("player")
            if (checkPayerHand) {
                this.dealerHidden = false
                this.status = Status.FINISHED
                this.result = Results.PLAYER_BUSTED
            }
        }
        if (this.status === Status.PLAYER_STOOD) {
            this.dealerHidden = false
            this.playDealer()
        }
    }
}
