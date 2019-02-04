import { Component, ViewContainerRef } from "@angular/core";
import { BoardService } from "./board.service";
import { ToastrService } from "ngx-toastr";
import { Board } from "./board";

const NUMBER_OF_PLAYERS: number = 2;
const BOARD_SIZE: number = 6;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  providers: [BoardService]
})
export class AppComponent {
  canPlay: boolean = false;
  player: number = 0;
  players: number = 0;

  gameId: number;
  gameUrl: string =
    location.protocol +
    "//" +
    location.hostname +
    (location.port ? ":" + location.port : "");

  constructor(
    private toastr: ToastrService,
    private boardService: BoardService
  ) {
    this.createBoards();
  }

  fireTorpedo(e: any): AppComponent {
    let id = e.target.id,
      boardId = id.substring(1, 2),
      row = id.substring(2, 3),
      col = id.substring(3, 4),
      tile = this.boards[boardId].tiles[row][col];

    if (!this.isHit(boardId, tile)) {
      return;
    }

    if (tile.value == 1) {
      this.toastr.success("You got this.", "YOU SUNK A SHIP!");
      this.boards;
    }
    return this;
  }

  isHit(boardId: number, tile: any): boolean {
    if (boardId == this.player) {
      this.toastr.error("You can't attack your own board");
      return false;
    }

    if (this.winner) {
      this.toastr.error("The game is already over");
      return false;
    }

    if (!this.canPlay) {
      this.toastr.error("It's not your turn.");
      return false;
    }

    if ((tile.value = "X")) {
      this.toastr.error("You've already guessed this tile.");
      return false;
    }

    return true;
  }

  createBoards(): AppComponent {
    for (let i = 0; i < NUMBER_OF_PLAYERS; i++) {
      this.boardService.createBoard(BOARD_SIZE);
    }
    return this;
  }

  get winner(): Board {
    return this.boards.find(board => board.player.score >= BOARD_SIZE);
  }

  get boards(): Board[] {
    return this.boardService.getBoards();
  }
}
