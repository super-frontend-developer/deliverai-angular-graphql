import {Component, HostListener, OnInit} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AuthService } from '@app/@core/services/auth/auth.service';
import { CurrentUserDocument } from '@app/@core/graphql/operations/user/query.ops.g';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: [ './layout.component.scss' ]
})
export class LayoutComponent implements OnInit {

  private readonly subscriptions = [];

  sidebarVisible = false;

  avatar = '';
  defaultImage = 'assets/images/profile-placeholder.png';
  currentUser: any;

  constructor(
    public authService: AuthService,
    private router: Router,
    public apollo: Apollo) {
      router.events.subscribe((val: any) => {
        if (val.url === '/dashboard' && val.url !== undefined && val.url !== null) {
          if (localStorage.getItem('avatar') !== 'null' &&
          localStorage.getItem('avatar') !== undefined &&
          localStorage.getItem('avatar') !== '') {
            this.avatar = localStorage.getItem('avatar');
          } else {
            this.avatar = this.defaultImage;
          }
        }
      })
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CurrentUserDocument,
        variables: {}
      }).valueChanges.subscribe((response: any) => {
        this.currentUser = response.data.me;
        this.avatar = this.currentUser.avatar;
        localStorage.setItem('avatar', this.avatar);
      })
    )
  }

  sideBarToggle() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  @HostListener('window:resize')
  onResize() {
    this.sidebarVisible = false;
  }

  logout() {
    this.authService.logout$().subscribe();
    this.router.navigate([ '/auth' ]);
  }

}
