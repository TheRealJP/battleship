import { Component } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { BoardService } from "./services/board.service";
import { Board } from "./models/board";

const NUMBER_OF_PLAYERS: number = 2;
const BOARD_SIZE: number = 6;

declare const Pusher: any;
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

  pusherChannel: any;
  constructor(
    private toastr: ToastrService,
    private boardService: BoardService
  ) {
    this.createBoards();
    this.initializePusher();
    this.listenForChanges();
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

  initializePusher(): AppComponent {
    let id = this.getQueryParam("id");
    if (!id) {
      id = this.uniqueId;
      location.search = location.search ? "&id=" + id : "id" + id;
    }
    this.gameId = id;

    const pusher = new Pusher("46c9f1be32afa28af4a9", {
      authEndpoint: '/pusher/auth',
      cluster: 'us2',
    });

    this.pusherChannel = pusher.subscribe(this.gameId);
    this.pusherChannel.bind("pusher:member_added", (member: any) => {
      this.players++;
    });
    this.pusherChannel.bind("subscription_succeeded", (members: any) => {
      this.players = members.count;
      this.setPlayer(this.players);
      this.toastr.success("Success", "Connected!");
    });
    this.pusherChannel.bind("pusher:member_removed", (member: any) => {
      this.players--;
    });
    return this;
  }

  listenForChanges(): AppComponent {
    this.pusherChannel.bind("channel-fire", (obj: any) => {
      this.canPlay = !this.canPlay;
      this.boards[obj.boardId] = obj.board;
      this.boards[obj.playerId].player.score = obj.score;
    });
    return this;
  }

  createBoards(): AppComponent {
    for (let i = 0; i < NUMBER_OF_PLAYERS; i++) {
      this.boardService.createBoard(BOARD_SIZE);
    }
    return this;
  }

  setPlayer(players: number = 0): AppComponent {
    this.player = players - 1;
    if (players == 1) {
      this.canPlay = true;
    } else if (players == 2) {
      this.canPlay = false;
    }
    return this;
  }

  get winner(): Board {
    return this.boards.find(board => board.player.score >= BOARD_SIZE);
  }

  get boards(): Board[] {
    return this.boardService.getBoards();
  }

  get validPlayer(): boolean {
    return this.players >= NUMBER_OF_PLAYERS && this.player < NUMBER_OF_PLAYERS;
  }

  get uniqueId(): any {
    return (
      "presence-" +
      Math.random()
        .toString(36)
        .substr(2, 8)
    );
  }

  getQueryParam(name: string): any {
    const match = RegExp("[?&]" + name + "=([^&]*)").exec(
      window.location.search
    );
    return match && decodeURIComponent(match[1].replace(/\+/g, ""));
  }
}
