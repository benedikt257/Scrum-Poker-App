import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';

// Define application routes. The home page is used to create or join a room,
// while the room page displays the poker session identified by the room name.
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'room/:roomId', component: RoomComponent },
  // Redirect unknown routes back to home
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
