import {
  ChangeDetectionStrategy,
  Component,
  signal,
  OnInit,
  OnDestroy,
  ElementRef,
  inject,
  AfterViewInit,
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService } from '@core/auth/auth.service';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin: string;
}

interface FeatureCard {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

@Component({
  selector: 'sb-landing',
  standalone: true,
  imports: [RouterLink, CarouselModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly el = inject(ElementRef);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private typewriterInterval: ReturnType<typeof setInterval> | null = null;
  private observer: IntersectionObserver | null = null;

  readonly currentWord = signal('habit tracker');
  readonly isTyping = signal(true);

  private readonly words = [
    'habit tracker',
    'time tracker',
    'finance tracker',
    'debt tracker',
  ];
  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;

  readonly carouselOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    nav: false,
    responsive: {
      0: { items: 1 },
      640: { items: 2 },
      1024: { items: 3 },
    },
  };

  readonly features: FeatureCard[] = [
    {
      title: 'Life Vision',
      subtitle: 'See Your Life as a Whole',
      description:
        'Every sleeping hour, every workout, every lecture — your days reveal the story of who you\'re becoming. See the full picture before chasing the next goal.',
      image: 'assets/1.png',
    },
    {
      title: 'Habit Tracking',
      subtitle: 'Track Every Part of You',
      description:
        'Sleep quality, workout sessions, meals, study hours — break your life into trackable habits and watch the invisible patterns finally become visible.',
      image: 'assets/3.png',
    },
    {
      title: 'Spending & Health',
      subtitle: 'Every Purchase Tells a Story',
      description:
        'A spontaneous phone, a mindless snack run — small choices compound over time. Spending that doesn\'t serve you quietly drains your mental and physical wellbeing.',
      image: 'assets/4.png',
    },
    {
      title: 'Less Consumption, More Clarity',
      subtitle: 'Quiet the Noise Around You',
      description:
        'The more you consume without intention, the heavier life feels. Reduce mindless spending and watch your mental clarity rise naturally.',
      image: 'assets/5.png',
    },
    {
      title: 'Build Causes, Not Goals',
      subtitle: 'Plant the Right Roots',
      description:
        'We don\'t ask you to chase results. We help you build the right causes — better sleep, cleaner habits, focused time. The outcomes will follow on their own.',
      image: 'assets/6.png',
    },
    {
      title: 'Own Every Hour',
      subtitle: 'See Where Your Time Really Goes',
      description:
        'Track your hours every day and discover the truth about how you spend your most valuable resource — then decide if you like what you see.',
      image: 'assets/7.png',
    },
  ];

  readonly team: TeamMember[] = [
    {
      name: 'Hassan',
      role: 'CTO',
      image: 'assets/p1.png',
      linkedin: 'https://www.linkedin.com/in/hassansaiedhassan/',
    },
    {
      name: 'Omar',
      role: 'SWE',
      image: 'assets/p2.png',
      linkedin: 'https://www.linkedin.com/in/omar-diaa-1672362a0/',
    },
    {
      name: 'Yara',
      role: 'SWE',
      image: 'assets/p5.jpeg',
      linkedin: 'https://www.linkedin.com/in/yara-khatab-796379275/',
    },
    {
      name: 'Farida',
      role: 'SWE',
      image: 'assets/p4.png',
      linkedin: 'https://www.linkedin.com/in/farida-sherief187/',
    },
  ];

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/tasks']);
      return;
    }
    this.startTypewriter();
  }

  ngAfterViewInit(): void {
    this.initScrollAnimations();
  }

  ngOnDestroy(): void {
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
    if (this.observer) this.observer.disconnect();
  }

  private startTypewriter(): void {
    this.charIndex = this.words[0].length;
    this.isDeleting = true;

    this.typewriterInterval = setInterval(() => {
      const currentWordStr = this.words[this.wordIndex];

      if (this.isDeleting) {
        this.charIndex--;
        this.currentWord.set(currentWordStr.substring(0, this.charIndex));

        if (this.charIndex === 0) {
          this.isDeleting = false;
          this.wordIndex = (this.wordIndex + 1) % this.words.length;
        }
      } else {
        const nextWord = this.words[this.wordIndex];
        this.charIndex++;
        this.currentWord.set(nextWord.substring(0, this.charIndex));

        if (this.charIndex === nextWord.length) {
          this.isDeleting = true;
          // Pause before deleting
          clearInterval(this.typewriterInterval!);
          this.typewriterInterval = setTimeout(() => {
            this.startTypewriterLoop();
          }, 2000) as unknown as ReturnType<typeof setInterval>;
          return;
        }
      }
    }, 100);
  }

  private startTypewriterLoop(): void {
    this.typewriterInterval = setInterval(() => {
      const currentWordStr = this.words[this.wordIndex];

      if (this.isDeleting) {
        this.charIndex--;
        this.currentWord.set(currentWordStr.substring(0, this.charIndex));

        if (this.charIndex === 0) {
          this.isDeleting = false;
          this.wordIndex = (this.wordIndex + 1) % this.words.length;
        }
      } else {
        const nextWord = this.words[this.wordIndex];
        this.charIndex++;
        this.currentWord.set(nextWord.substring(0, this.charIndex));

        if (this.charIndex === nextWord.length) {
          this.isDeleting = true;
          clearInterval(this.typewriterInterval!);
          this.typewriterInterval = setTimeout(() => {
            this.startTypewriterLoop();
          }, 2000) as unknown as ReturnType<typeof setInterval>;
          return;
        }
      }
    }, 100);
  }

  private initScrollAnimations(): void {
    const targets = this.el.nativeElement.querySelectorAll('.scroll-reveal');
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((t: Element) => this.observer!.observe(t));
  }
}
