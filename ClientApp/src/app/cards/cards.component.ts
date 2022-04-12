import { Component, Input, OnInit } from '@angular/core';
import { CardInfo, House } from '../speed-game/speed-game.component';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
})
export class CardsComponent implements OnInit {
  cardImgUrl!: string;
  @Input()
  cardInfo!: CardInfo;

  ngOnInit(): void {
    this.cardInfo.suiteNumber;
    if (this.cardInfo.faceUp) {
      this.cardImgUrl = `../../assets/cardImages/${
        this.cardInfo.suiteNumber
      }_of_${House[this.cardInfo.house - 1]?.toLowerCase()}s.png`;
    } else {
      this.cardImgUrl = '../../assets/cardImages/back_brad.png';
    }
  }
}
