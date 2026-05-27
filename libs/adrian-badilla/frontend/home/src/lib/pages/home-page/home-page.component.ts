import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    CommonModule,
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
export class HomePageComponent implements OnInit {
  private readonly store = injectHomeStore();
  private readonly newsStore = inject(NewsStore);

  dailySummary = this.store.dailySummary;
  recommendation = this.store.recommendation;
  streak = this.store.streak;
  weeklyProgress = this.store.weeklyProgress;
  achievements = this.store.achievements;
  remainingCalories = this.store.remainingCalories;
  isGoalReached = this.store.isGoalReached;
  macroPercentages = this.store.macroPercentages;
  topThree = this.store.topThree;
  restOfList = this.store.restOfList;
  latestNews = this.newsStore.latestNews;

  ngOnInit(): void {
    this.store.loadHomeData();
    this.newsStore.loadNews();
  }
}
