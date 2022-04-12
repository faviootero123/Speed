import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  DropListRef,
} from '@angular/cdk/drag-drop';
import { SignalrService } from '../signalr.service';
import { Subject } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-speed-game',
  templateUrl: './speed-game.component.html',
  styleUrls: ['./speed-game.component.css'],
})
export class SpeedGameComponent implements OnInit, OnDestroy {
  hand1: CardInfo[] = [];
  hand2: CardInfo[] = [];
  playL: CardInfo[] = [];
  playR: CardInfo[] = [];
  continueL: CardInfo[] = [];
  continueR: CardInfo[] = [];
  hand1Stack: CardInfo[] = [];
  hand2Stack: CardInfo[] = [];
  name: FormControl = new FormControl();
  playerName: string = '';
  player2Name: string = '';
  isPlayerOne: boolean = true;
  isPlayerNameSet: boolean = false;
  gameState: number = GameState.Setup;

  isPlayerWilling: boolean = true;
  isGameOver: boolean = false;
  isGameStarted: boolean = false;
  songPlayer: HTMLAudioElement = new Audio('../../assets/sounds/game.mp3');
  constructor(private signalr: SignalrService) {
    signalr.startConnection();

    signalr.addHandler('MoveHandler', (data) => {
      this.hand1 = data.hand2.map((c) => ({
        suiteNumber: c.suiteNumber,
        house: c.house,
        faceUp: false,
      }));
      this.hand2 = data.hand1.map((c) => ({
        suiteNumber: c.suiteNumber,
        house: c.house,
        faceUp: true,
      }));
      this.continueR = data.continueL;
      this.continueL = data.continueR;
      this.hand2Stack = data.hand1Stack;
      this.hand1Stack = data.hand2Stack;
      this.playR = data.playL;
      this.playL = data.playR;
      this.updateGameState();
    });

    signalr.addHandler('NewGame', (data) => {
      this.gameState = GameState.Running;
      let connectionID = this.signalr.getConnectionId();
      if (connectionID == data.players[0].connectionId) {
        this.isPlayerOne = true;
        this.hand1 = data.playerOneHand;
        this.hand2 = data.playerTwoHand.map((c) => ({
          suiteNumber: c.suiteNumber,
          house: c.house,
          faceUp: true,
        }));
        this.continueL = data.continueL;
        this.continueR = data.continueR;
        this.hand1Stack = data.playerOneStack;
        this.hand2Stack = data.playerTwoStack;
        this.playL = data.playL;
        this.playR = data.playR;
        this.player2Name = data.players[1].userName;
      } else {
        this.isPlayerOne = false;
        this.hand2 = data.playerOneHand.map((c) => ({
          suiteNumber: c.suiteNumber,
          house: c.house,
          faceUp: true,
        }));
        this.hand1 = data.playerTwoHand;
        this.continueR = data.continueL;
        this.continueL = data.continueR;
        this.hand2Stack = data.playerOneStack;
        this.hand1Stack = data.playerTwoStack;
        this.playR = data.playL;
        this.playL = data.playR;
        this.player2Name = data.players[0].userName;
      }
    });

    signalr.addHandler('ResetHandler', (data) => {
      if (this.isPlayerOne == data.isPlayerOne) {
        this.continueR = data.continueR;
        this.continueL = data.continueL;
        this.playR = data.playR;
        this.playL = data.playL;
      } else {
        this.continueR = data.continueL;
        this.continueL = data.continueR;
        this.playR = data.playL;
        this.playL = data.playR;
      }
    });
  }

  playMySongBaby() {
    //this.songPlayer.play();
  }

  ngOnDestroy(): void {
    this.signalr.disposeHandlers('MoveHandler');
    this.signalr.disposeHandlers('NewGame');
    this.signalr.disposeHandlers('ResetHandler');
  }

  playcard() {
    this.signalr.playCard({
      hand1: this.hand1,
      hand2: this.hand2,
      playL: this.playL,
      playR: this.playR,
      continueL: this.continueL,
      continueR: this.continueR,
      hand1Stack: this.hand1Stack,
      hand2Stack: this.hand2Stack,
    });
  }

  async drop(event: CdkDragDrop<CardInfo[]>) {
    if (!this.isValidPlay(event)) {
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, 0);
    } else {
      event.previousContainer.data[event.previousIndex].faceUp = true;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        0
      );

      if (this.hand2Stack.length != 0) {
        let card: CardInfo = this.hand2Stack[this.hand2Stack.length - 1];
        card.faceUp = true;
        this.hand2.push(card);
        this.hand2Stack.pop();
      }

      while (this.check()) {
        if (this.hand1Stack.length == 0 && this.hand1.length == 0) {
          this.gameState = GameState.Lost;
          break;
        } else if (this.hand2Stack.length == 0 && this.hand2.length == 0) {
          this.gameState = GameState.Won;
          break;
        }
        if (this.continueL.length === 0 || this.continueR.length === 0) {
          await this.reset();
        } else {
          let l = this.continueL.pop();
          let r = this.continueR.pop();

          l.faceUp = true;
          r.faceUp = true;

          this.playL.unshift(l);
          this.playR.unshift(r);
        }
      }
      this.updateGameState();
      this.playcard();
    }
  }
  updateGameState() {
    if (this.hand1Stack.length == 0 && this.hand1.length == 0) {
      this.gameState = GameState.Lost;
    } else if (this.hand2Stack.length == 0 && this.hand2.length == 0) {
      this.gameState = GameState.Won;
    }
  }
  isValidPlay(event: CdkDragDrop<CardInfo[]>) {
    let valid: boolean = false;
    let container = event.container.data[0].suiteNumber;
    let pcontainer =
      event.previousContainer.data[event.previousIndex].suiteNumber;
    let element = event.container.element.nativeElement.id;
    let pelement = event.previousContainer.element.nativeElement.id;

    if (pelement == 'continueR' || pelement == 'continueL') {
      return true;
    }

    if (element == 'playL' || element == 'playR') {
      if (container + 1 === pcontainer) {
        valid = true;
      } else if (container - 1 === pcontainer) {
        valid = true;
      }
      if (container == 13 && pcontainer == 1) {
        valid = true;
      } else if (container == 1 && pcontainer == 13) {
        valid = true;
      }
    }

    return valid;
  }

  newGame() {
    this.isGameOver = false;
    this.playMySongBaby();
    this.signalr.newGame();
  }

  playAgain() {
    this.signalr.playAgain(this.playerName, this.isPlayerWilling);
  }

  newUser() {
    this.playerName = this.name.value;
    this.isPlayerNameSet = true;
    this.signalr.newUser(this.name.value);
  }

  async reset() {
    await this.signalr.reset({
      continueL: this.continueL,
      continueR: this.continueR,
      playL: this.playL,
      playR: this.playR,
      isPlayerOne: this.isPlayerOne,
    });
  }

  check() {
    for (let i = 0; i < this.hand1.length; i++) {
      if (
        this.hand1[i].suiteNumber == this.playL[0].suiteNumber + 1 ||
        this.hand1[i].suiteNumber == this.playL[0].suiteNumber - 1 ||
        this.hand1[i].suiteNumber == this.playR[0].suiteNumber + 1 ||
        this.hand1[i].suiteNumber == this.playR[0].suiteNumber - 1
      ) {
        return false;
      } else if (
        (this.hand1[i].suiteNumber == 13 && this.playL[0].suiteNumber == 1) ||
        (this.hand1[i].suiteNumber == 13 && this.playR[0].suiteNumber == 1)
      ) {
        return false;
      } else if (
        (this.hand1[i].suiteNumber == 1 && this.playL[0].suiteNumber == 13) ||
        (this.hand1[i].suiteNumber == 1 && this.playR[0].suiteNumber == 13)
      ) {
        return false;
      }
    }

    for (let i = 0; i < this.hand2.length; i++) {
      if (
        this.hand2[i].suiteNumber == this.playL[0].suiteNumber + 1 ||
        this.hand2[i].suiteNumber == this.playL[0].suiteNumber - 1 ||
        this.hand2[i].suiteNumber == this.playR[0].suiteNumber + 1 ||
        this.hand2[i].suiteNumber == this.playR[0].suiteNumber - 1
      ) {
        return false;
      } else if (
        (this.hand2[i].suiteNumber == 13 && this.playL[0].suiteNumber == 1) ||
        (this.hand2[i].suiteNumber == 13 && this.playR[0].suiteNumber == 1)
      ) {
        return false;
      } else if (
        (this.hand2[i].suiteNumber == 1 && this.playL[0].suiteNumber == 13) ||
        (this.hand2[i].suiteNumber == 1 && this.playR[0].suiteNumber == 13)
      ) {
        return false;
      }
    }
    return true;
  }

  matchPredicate(item: CdkDrag<CardInfo>) {
    return true;
  }

  noMatchPredicate() {
    return false;
  }

  ngOnInit(): void {}
}

export interface CardInfo {
  suiteNumber: number;
  house: House;
  faceUp: boolean;
}

export enum House {
  Heart,
  Spade,
  Club,
  Diamond,
}
export enum GameState {
  Running,
  Won,
  Lost,
  Setup,
}
//todo
// Tested for mobile, cards get too big when theres less than 5 cards in a players hand
// Bug with the while loop - closes the app
// game win lost screen
// only displays on one side at the end of the game, something with bool isGameStarted
