import { Injectable } from '@angular/core';
import { Board } from '../models/board';
import { Player } from '../models/player';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  playerId: number = 1;
  boards: Board[] = [];
  
  constructor() { }

  createBoard(size: number = 5): BoardService {

    // create tiles
    let tiles = [];
    for (let x = 0; x < size; x++) {
      tiles[x] = [];
      for (let y = 0; y < size; y++) {
        tiles[x][y] = { used: false, value: 0, status: '' };
      }
    }

    //generate ships and place randomly on board
    for (let i = 0; i < size * 2; i++) {
      tiles = this.placeShipsOnBoardAtRandom(tiles, size);
    }

    // create board
    let board = new Board({
      player: new Player({ id: this.playerId++ }),
      tiles: tiles
    });

    //append board to property 
    this.boards.push(board);
    return this;
  }

  placeShipsOnBoardAtRandom(tiles: Object[], len: number): Object[] {
    len = len - 1;
    let randomRow = this.getRandomInt(0, len);
    let randomCol = this.getRandomInt(0, len);

    if (tiles[randomRow][randomCol].value == 1) {
      return this.placeShipsOnBoardAtRandom(tiles, len);
    } else {
      tiles[randomRow][randomCol].value = 1;
      return tiles;
    }
  }

  // random int between ${max} and ${min}
  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getBoards(): Board[] {
    return this.boards;
  }
}


