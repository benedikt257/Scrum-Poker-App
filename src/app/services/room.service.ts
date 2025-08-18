import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DefaultService, Room } from '../core/modules/openapi';

/**
 * Representation of a player in a poker session.
 */
export interface Player {
  /** Display name of the player */
  name: string;
  /** Selected estimate card. Undefined if not yet chosen */
  card?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(private defaultService: DefaultService) {
  }

  /**
   * Persist the current rooms map to local storage. This should be called
   * whenever a room is created or updated so state survives reloads.
   */
  private persist() {
  }

  /**
   * Creates a new room, adding the current player to the list of players.
   */
  createRoom(roomName: string, playerId: string, playerName: string): Observable<Room> {
    return this.defaultService.roomsPost({ name: roomName, player: { id: playerId, name: playerName } });
  }

  /**
   * Join an existing room by adding a new player. If the room does not
   * exist, undefined is returned. Duplicate players are ignored.
   */
  joinRoom(id: string, playerId: string, playerName: string): Observable<Room> | undefined {
    return this.defaultService.roomsRoomIdPlayersPost(id, { playerId: playerId, playerName: playerName });
  }

  /**
   * Get a stream for a room by name. Returns undefined if no such room
   * exists. Components can subscribe to this observable to receive
   * real‑time updates when the room changes.
   */
  getRoomStream(id: string): Observable<Room> | undefined {
    return this.defaultService.roomsRoomIdGet(id);
  }

  /**
   * Set or update the selected card for a particular player. This does not
   * automatically reveal the cards. If the room or player does not exist,
   * nothing happens.
   */
  selectCard(roomId: string, playerId: string, card: number) {
    return this.defaultService.roomsRoomIdEstimatesPut(roomId, { estimate: card, playerId: playerId })
  }

  /**
   * Reveal all selected estimates for a room. This toggles the `revealed`
   * flag. If the room does not exist, nothing happens.
   */
  reveal(roomId: string) {
    return this.defaultService.roomsRoomIdPatch(roomId, { action: 'reveal'});
  }


  /**
   * Reset all player selections and hide the cards to start a new round of
   * estimation. This sets the `revealed` flag back to false and clears
   * every player's card.
   */
  reset(roomId: string) {
    return this.defaultService.roomsRoomIdPatch(roomId, { action: 'reset' });
  }

  /**
   * Compute simple statistics (mean, standard deviation, min, max) for all
   * selected estimates in the room. Only defined cards are included. If no
   * cards have been selected, undefined is returned.
   */
  getStatistics(roomName: string): { mean: number; sd: number; min: number; max: number } | undefined {
    return undefined;
  }
}
