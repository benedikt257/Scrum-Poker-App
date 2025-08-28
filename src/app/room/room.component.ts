import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { Player, Room } from '../core/modules/openapi';
import { RoomService } from '../services/room.service';
import { v4 as uuidv4 } from 'uuid';
import { FormsModule } from '@angular/forms';   

/**
 * The room component displays a single Scrum Poker session. It shows all
 * participating players and their selected cards. The current user can
 * choose a card from a Fibonacci sequence. 
 */
@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, FormsModule],  
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {
  /** Id of the current room extracted from the route */
  roomId = '';
  /** Name of the current room extracted from the route */
  roomName = '';
  /** Current player's name stored in session storage */
  currentPlayer : {id: string, name: string} = {
    id: '',
    name: ''
  } ;
  /** Observable representing the room state */
  room$?: Observable<Room>;
  /** Value selected by the player */

  showInputScreen  = true;

  currentSelection?: number = undefined;
  /** Sequence of Fibonacci numbers available for estimation */
  readonly fibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];

  playerName = ''; 
  error?: string; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService
  ) {}

ngOnInit(): void {
  this.roomId = this.route.snapshot.paramMap.get('roomId') || '';
  if (!this.roomId) {
    this.router.navigate(['/']);
    return;
  }

  // Se non ho nome → mostro popup per inserire i dati
  this.showInputScreen = !(this.currentPlayer.id && this.currentPlayer.name);

  this.initializeRoom();
}




  ngOnDestroy(): void {
  }

onSubmitInput(): void {
  const name = (this.playerName ?? '').trim();
  if (!name) {
    this.error = 'Your name is required.';
    return;
  }

  const playerId = this.currentPlayer.id || uuidv4();
  
  
  this.currentPlayer = { id: playerId, name };
  this.showInputScreen = false;
  
  this.room$ = this.roomService.joinRoom(this.roomId, playerId, name);
  

}

  /**
   * Determine if the given player is the current user.
   */ 
  isCurrent(player: Player): boolean {
    return player.id === this.currentPlayer.id;
  }


  initializeRoom(): void {
  const stream = this.roomService.getRoomStream(this.roomId);
  if (!stream) {
    this.router.navigate(['/']);
    return;
  }
  this.room$ = stream;
}




  /**
   * Handle selecting a card for the current user. Only allowed if the
   * estimates have not been revealed yet.
   */
  selectCard(card: number) {
    this.roomService.selectCard(this.roomId, this.currentPlayer.id, card).subscribe(() => this.currentSelection = card);
  }

  /**
   * Request the service to reveal all cards.
   */
  reveal() {
    this.room$ = this.roomService.reveal(this.roomId);
  }

  /**
   * Reset the session to start a new round of estimates.
   */
  reset() {
    this.room$ = this.roomService.reset(this.roomId);
  }

  /**
   * Compute statistics for the current room and return formatted values.
   */
  getStats(room: Room): { mean: string; sd: string; min: number; max: number } | null {
    const stats = this.roomService.getStatistics(this.roomId);
    if (!stats) return null;
    return {
      mean: stats.mean.toFixed(2),
      sd: stats.sd.toFixed(2),
      min: stats.min,
      max: stats.max
    };
  }
}
