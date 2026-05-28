import { afterNextRender, Component, inject } from '@angular/core';
import { DailySummaryComponent } from '../../components/daily-summary/daily-summary.component';
import { SmartRecommendationComponent } from '../../components/smart-recommendation/smart-recommendation.component';
import { WeeklyProgressComponent } from '../../components/weekly-progress/weekly-progress.component';
import { AchievementsComponent } from '../../components/achievements/achievements.component';
import { LeaderboardComponent } from '../../components/leaderboard/leaderboard.component';
import { PromoCarouselComponent } from '../../components/promo-carousel/promo-carousel.component';
import { WelcomeBannerComponent } from '../../components/welcome-banner/welcome-banner.component';
import { NewsListComponent, NewsStore } from '@adrian-badilla/news';
import { injectHomeStore, provideHomeStore } from '../../store/home.providers';

@Component({
  selector: 'lib-home-page',
  standalone: true,
  imports: [
    DailySummaryComponent,
    SmartRecommendationComponent,
    WeeklyProgressComponent,
    AchievementsComponent,
    LeaderboardComponent,
    PromoCarouselComponent,
    WelcomeBannerComponent,
    NewsListComponent,
  ],
  providers: [...provideHomeStore(), NewsStore],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  private readonly store = injectHomeStore();
  private readonly newsStore = inject(NewsStore);

  readonly dailySummary = this.store.dailySummary;
  readonly recommendation = this.store.recommendation;
  readonly streak = this.store.streak;
  readonly weeklyProgress = this.store.weeklyProgress;
  readonly achievements = this.store.achievements;
  readonly remainingCalories = this.store.remainingCalories;
  readonly isGoalReached = this.store.isGoalReached;
  readonly macroPercentages = this.store.macroPercentages;
  readonly topThree = this.store.topThree;
  readonly restOfList = this.store.restOfList;
  readonly latestNews = this.newsStore.latestNews;

  /** Trigger data loading after first render — replaces ngOnInit. */
  readonly #load = afterNextRender(() => {
    this.store.loadHomeData();
    this.newsStore.loadNews();
  });
}
