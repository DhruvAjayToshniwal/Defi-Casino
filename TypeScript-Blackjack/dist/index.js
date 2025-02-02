import { Player } from "./player.js";
import { Dealer } from "./dealer.js";
import { Deck } from "./deck.js";
class Game {
    constructor() {
        var _a;
        this.deck = new Deck();
        this.player = new Player(this);
        this.dealer = new Dealer();
        this.playerScoreText = (document.querySelector("#player-score"));
        this.playerSection = (document.querySelector("#player-section"));
        this.dealerScoreText = (document.querySelector("#dealer-score"));
        this.dealerSection = (document.querySelector("#dealer-section"));
        this.resetSection = (document.querySelector("#reset-section"));
        this.hitButton = (document.querySelector("#hit-button"));
        this.stayButton = (document.querySelector("#stay-button"));
        this.gameResultText = (document.querySelector("#game-result-text"));
        this.dealerFaceDownCard = document.createElement("div");
        this.dealerFaceDownCard.id = "dealer-face-down-card";
        this.dealerFaceDownCard.classList.add("blank-card-container");
        this.rulesModal = (document.querySelector("#rules-modal"));
        this.openRulesBtn = (document.querySelector("#open-rules-button"));
        this.closeRulesBtn = (document.querySelector("#close-rules-button"));
        this.dealCardSound = new Audio("./assets/audio/deal-card-sound.wav");
        this.dealCardSound.volume = 0.5;
        this.topPayout = document.querySelector("#top-payout");
        (_a = this.hitButton) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            this.disableSelections();
            setTimeout(() => {
                this.dealCardSound.play().catch((err) => {
                    console.error(err);
                });
                this.drawCard(this.player, this.playerSection);
                if (this.player.total <= 21 &&
                    this.hitButton &&
                    this.stayButton) {
                    this.hitButton.disabled = false;
                    this.stayButton.disabled = false;
                }
            }, 750);
        });
        this.stayButton.addEventListener("click", () => {
            this.disableSelections();
            this.initiateDealerTurn();
        });
        this.openRulesBtn.addEventListener("click", () => {
            this.rulesModal.showModal();
        });
        this.closeRulesBtn.addEventListener("click", () => {
            this.rulesModal.close();
        });
    }
    startNewGame() {
        setTimeout(() => {
            var _a;
            this.dealCardSound.play().catch((err) => {
                console.error(err);
            });
            this.drawCard(this.player, this.playerSection);
            this.drawCard(this.player, this.playerSection);
            this.drawCard(this.dealer, this.dealerSection);
            (_a = this.dealerSection) === null || _a === void 0 ? void 0 : _a.append(this.dealerFaceDownCard);
            this.dealerFaceDownCard.style.display = "block";
        }, 750);
    }
    getRankValue(rank, currentTurn) {
        const numericValueRank = typeof rank === "number" ? rank : 0;
        switch (rank) {
            case "A":
                if (currentTurn.total + 11 > 21) {
                    currentTurn.total += 1;
                }
                else {
                    currentTurn.total += 11;
                    currentTurn.aceOverage += 10;
                }
                break;
            case "K":
            case "Q":
            case "J":
                currentTurn.total += 10;
                break;
            default:
                currentTurn.total += numericValueRank;
        }
        if (this.player.total > 21 &&
            this.player.aceOverage === 0 &&
            currentTurn === this.player) {
            this.checkTotals();
        }
        else if (currentTurn.total > 21 && currentTurn.aceOverage > 0) {
            currentTurn.total -= 10;
            currentTurn.aceOverage -= 10;
        }
        if (currentTurn === this.player) {
            this.playerScoreText.textContent = this.player.total.toString();
        }
        if (currentTurn === this.dealer) {
            this.dealerScoreText.textContent = this.dealer.total.toString();
        }
    }
    initiateDealerTurn() {
        this.dealerFaceDownCard.style.display = "none";
        const continueDrawing = setInterval(() => {
            if (this.dealer.total < 17) {
                this.dealCardSound.play().catch((err) => {
                    console.error(err);
                });
                this.drawCard(this.dealer, this.dealerSection);
            }
            else {
                clearInterval(continueDrawing);
                this.checkTotals();
            }
        }, 1000);
    }
    resetBoard(startNewGameBtn) {
        this.player.total = 0;
        this.dealer.total = 0;
        this.player.currentBet = 0;
        this.player.aceOverage = 0;
        this.dealer.aceOverage = 0;
        this.player.hand = [];
        this.dealer.hand = [];
        this.player.cardElements.forEach((card) => {
            card.remove();
        });
        this.dealer.cardElements.forEach((card) => {
            card.remove();
        });
        startNewGameBtn.remove();
        this.gameResultText.textContent = "";
        this.playerScoreText.textContent = "0";
        this.dealerScoreText.textContent = "0";
        this.dealerFaceDownCard.style.display = "none";
        this.player.activateBets();
    }
    activateSelections() {
        this.hitButton.disabled = false;
        this.stayButton.disabled = false;
    }
    disableSelections() {
        this.hitButton.disabled = true;
        this.stayButton.disabled = true;
    }
    drawCard(currentTurn, currentSection) {
        if (this.deck.cards.length < 1) {
            this.deck.generateDeck();
        }
        const index = this.deck.getCardIndex();
        const newCard = this.deck.cards[index];
        currentTurn.hand.push(newCard);
        this.getRankValue(newCard.rank, currentTurn);
        const cardContainer = document.createElement("div");
        currentTurn.cardElements.push(cardContainer);
        currentSection.append(cardContainer);
        cardContainer.classList.add("card-container");
        const cardRankTop = document.createElement("p");
        cardRankTop.textContent = newCard.rank.toString();
        cardRankTop.classList.add("card-rank-top");
        const cardSuit = document.createElement("img");
        cardSuit.src = `./assets/images/${newCard.suit}.png`;
        cardSuit.alt = newCard.suit;
        cardSuit.classList.add("card-suit");
        const cardRankBottom = document.createElement("p");
        cardRankBottom.textContent = newCard.rank.toString();
        cardRankBottom.classList.add("card-rank-bottom");
        cardContainer.append(cardRankTop);
        cardContainer.append(cardSuit);
        cardContainer.append(cardRankBottom);
        this.deck.cards.splice(index, 1);
    }
    checkTotals() {
        if (this.player.total > 21) {
            if (this.player.money > 0) {
                this.endGame("You lose, better luck next time!", false);
            }
            else {
                this.player.money = 100;
                this.endGame("Game over, you ran out of money! Restart with $100?", true);
            }
        }
        else if (this.dealer.total > 21) {
            this.player.money += this.player.currentBet * 2;
            this.endGame("You win, well done!", false);
        }
        else {
            if (this.player.total > this.dealer.total) {
                this.player.money += this.player.currentBet * 2;
                this.endGame("You win, well done!", false);
            }
            else if (this.player.total === this.dealer.total) {
                this.player.money += this.player.currentBet;
                this.endGame("Push. Try again?", false);
            }
            else if (this.player.total < this.dealer.total &&
                this.player.money > 0) {
                this.endGame("You lose, better luck next time!", false);
            }
            else {
                this.player.money = 100;
                this.endGame("Game over, you ran out of money! Restart with $100?", true);
            }
        }
        this.player.totalMoneyText.textContent = this.player.money.toString();
    }
    endGame(resultText, isGameOver) {
        this.gameResultText.textContent = resultText;
        this.disableSelections();
        this.player.disableBets();
        const startNewGameBtn = document.createElement("button");
        if (!isGameOver) {
            startNewGameBtn.textContent = "New Hand";
        }
        else {
            startNewGameBtn.textContent = "Start New Game";
        }
        startNewGameBtn.classList.add("start-new-game-btn");
        this.resetSection.append(startNewGameBtn);
        startNewGameBtn.addEventListener("click", () => {
            this.resetBoard(startNewGameBtn);
        });
        this.determineHighScore();
    }
    determineHighScore() {
        if (localStorage.getItem("high-score") !== null) {
            const highScore = localStorage.getItem("high-score");
            if (highScore !== null &&
                this.player.money > parseInt(JSON.parse(highScore), 10)) {
                localStorage.setItem("high-score", JSON.stringify(this.player.money));
                this.topPayout.textContent = this.player.money.toString();
            }
            else if (highScore !== null &&
                this.player.money < parseInt(JSON.parse(highScore), 10)) {
                this.topPayout.textContent = JSON.parse(highScore);
            }
        }
        else {
            localStorage.setItem("high-score", JSON.stringify(100));
        }
    }
}
const game = new Game();
game.disableSelections();
game.determineHighScore();
export { Game };
