import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';
import { CardInfo } from './speed-game/speed-game.component';
@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private hubConnection: HubConnection = new HubConnectionBuilder()
    .withUrl('/game')
    .build();

  constructor() {}
  public startConnection() {
    this.hubConnection
      .start()
      .then(() => console.log('connection started'))
      .catch((err) => console.log(`Error connecting: ${err}`));
  }

  public addHandler(funcName: string, func: any) {
    this.hubConnection.on(funcName, func);
  }

  public disposeHandlers(funcName: string) {
    this.hubConnection.off(funcName);
  }

  public playCard(data: any) {
    this.hubConnection
      .send('PlayCard', data)
      .catch((err) => console.log(`Error with play card: ${err}`));
  }

  public async reset(data: any) {
    let result = await this.hubConnection.invoke('Reset', data);
    // .catch((err) => console.log(`Error with play card: ${err}`));
  }

  public newGame() {
    this.hubConnection
      .send('NewGame')
      .catch((err) => console.log(`Error with test: ${err}`));
  }

  public playAgain(userName: string, willing: boolean) {
    this.hubConnection
      .send('PlayAgain', userName, willing)
      .catch((err) => console.log(`Error with PlayAgain: ${err}`));
  }

  public newUser(userName: string) {
    this.hubConnection
      .send('NewUser', userName)
      .catch((err) => console.log(`Error with NewUser: ${err}`));
  }

  public getConnectionId(): string {
    return this.hubConnection.connectionId;
  }
}
