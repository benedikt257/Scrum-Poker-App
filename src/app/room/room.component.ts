import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { Player, Room } from '../core/modules/openapi';
import { RoomService } from '../services/room.service';

/**
 * The room component displays a single Scrum Poker session. It shows all
 * participating players and their selected cards. The current user can
 * choose a card from a Fibonacci sequence. 
 */
@Component({
  selector: 'app-room',
  imports: [CommonModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
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
  currentSelection?: number = undefined;
  /** Sequence of Fibonacci numbers available for estimation */
  readonly fibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55];

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

    this.currentPlayer = {
      name: sessionStorage.getItem('scrumPokerPlayerName') ?? '',
      id: sessionStorage.getItem('scrumPokerPlayerId') ?? ''
    }

    const stream = this.roomService.getRoomStream(this.roomId);
    if (!stream) {
      // Room does not exist; redirect to home with error
      this.router.navigate(['/']);
      return;
    }
    this.room$ = stream;
    // Ensure current player is still part of the room. If not present, add.
    // This handles case where user refreshes page.
    // Use joinRoom to add if missing.
    console.log('joining now')
    this.roomService.joinRoom(this.roomId, this.currentPlayer.id, this.currentPlayer.name)?.subscribe();
  }

  ngOnDestroy(): void {
  }

  /**
   * Determine if the given player is the current user.
   */ 
  isCurrent(player: Player): boolean {
    return player.id === this.currentPlayer.id;
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
