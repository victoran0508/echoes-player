import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { EchoesState } from '@store/reducers';
import { NowPlaylistService } from '@core/services/now-playlist.service';
import { INowPlaylist } from '@store/now-playlist';
import * as AppPlayer from '@store/app-player/app-player.actions';
import { NowPlaylistComponent } from './now-playlist';

@Component({
  selector: 'now-playing',
  styleUrls: ['./now-playing.scss'],
  template: `
  <div class="sidebar-pane">
    <now-playlist-filter
      [playlist]="nowPlaylist$ | async"
      (clear)="clearPlaylist()"
      (filter)="updateFilter($event)"
      (reset)="resetFilter()"
      (headerClick)="onHeaderClick()"
    ></now-playlist-filter>
    <now-playlist
      [playlist]="nowPlaylist$ | async"
      (select)="selectVideo($event)"
      (selectTrack)="selectTrackInVideo($event)"
      (remove)="removeVideo($event)"
      (sort)="sortPlaylist($event)"
    ></now-playlist>
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NowPlayingComponent implements OnInit {
  public nowPlaylist$: Observable<INowPlaylist>;
  @ViewChild(NowPlaylistComponent, { static: true }) nowPlaylistComponent: NowPlaylistComponent;

  constructor(
    public store: Store<EchoesState>,
    public nowPlaylistService: NowPlaylistService
  ) {}

  ngOnInit() {
    this.nowPlaylist$ = this.nowPlaylistService.playlist$;
  }

  selectVideo(media: GoogleApiYouTubeVideoResource) {
    this.store.dispatch(new AppPlayer.PlayVideo(media));
    this.nowPlaylistService.updateIndexByMedia(media.id);
  }

  sortPlaylist(playlist) {
    this.nowPlaylistService.sortPlaylist(playlist);
  }

  updateFilter(searchFilter: string) {
    this.nowPlaylistService.updateFilter(searchFilter);
  }

  resetFilter() {
    this.nowPlaylistService.updateFilter('');
  }

  clearPlaylist() {
    this.nowPlaylistService.clearPlaylist();
  }

  removeVideo(media) {
    this.nowPlaylistService.removeVideo(media);
  }

  onHeaderClick() {
    this.nowPlaylistComponent.scrollToActiveTrack();
  }

  selectTrackInVideo(trackEvent: {
    time: string;
    media: GoogleApiYouTubeVideoResource;
  }) {
    this.store.dispatch(new AppPlayer.PlayVideo(trackEvent.media));
    this.nowPlaylistService.seekToTrack(trackEvent);
  }
}
