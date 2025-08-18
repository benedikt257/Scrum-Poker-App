import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomService } from '../services/room.service';
import * as uuid from 'uuid';

@Component({
  selector: 'app-home',
  // Import CommonModule for structural directives and FormsModule for ngModel
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  /** Name of the room the user wants to create or join */
  roomName = '';
  /** Player's name used in both create and join */
  playerName = '';
  /** Error message displayed when join fails */
  error = '';

  constructor(private router: Router, private roomService: RoomService) { }

  /**
   * Handle creation of a new room. If the room already exists it is reused.
   */
  onCreate() {
    this.error = '';
    const trimmedRoom = this.roomName.trim();
    const trimmedName = this.playerName.trim();
    if (!trimmedRoom || !trimmedName) {
      this.error = 'Please provide both a room name and your name.';
      return;
    }

    const playerId = uuid.v4();
    // Persist the player's name to session storage so the room component
    // knows who the current user is.
    sessionStorage.setItem('scrumPokerPlayerName', trimmedName);
    sessionStorage.setItem('scrumPokerPlayerId', playerId);
    // Create the room and navigate to it. Creation returns an observable
    // but we don't need to subscribe here because the room page will handle
    // updates.
    
    this.roomService.createRoom(trimmedRoom, playerId, trimmedName)
    .subscribe(room => {
      console.log('room received')
      this.router.navigate(['/room', room.id]
    )
  });
  }
}
