import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TimelineEvent, TaskTimelineEvent, SessionTimelineEvent } from '../../models/timeline.models';
import { DurationPipe } from '../../../../shared/pipes/duration.pipe';
import { CoinsPipe } from '../../../../shared/pipes/coins.pipe';
import { SbBehaviorBadgeComponent } from '../../../../shared/ui/behavior-badge/sb-behavior-badge.component';

@Component({
  selector: 'sb-timeline-block',
  standalone: true,
  imports: [DatePipe, DurationPipe, CoinsPipe, SbBehaviorBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="timeline-block flex gap-4">
      
      <!-- Time Gutter -->
      <div class="w-16 flex-shrink-0 text-right text-xs text-subtle font-mono pt-1">
        {{ event().time | date:'shortTime' }}
      </div>

      <!-- Connector & Node -->
      <div class="relative flex flex-col items-center">
        <!-- The line (handled by parent typically, but we extend it through) -->
        <div class="absolute top-0 bottom-0 w-0.5 bg-border z-0"></div>
        
        <!-- The node -->
        <div class="node z-10 w-4 h-4 rounded-full border-2 border-surface mt-1 relative"
             [style.background]="event().color">
             
             <!-- Icon inside node based on type -->
             @if (event().type === 'session') {
               <div class="absolute inset-0 flex items-center justify-center text-[8px] text-white">⏱</div>
             } @else {
               <div class="absolute inset-0 flex items-center justify-center text-[8px] text-white">✓</div>
             }
        </div>
      </div>

      <!-- Content Card -->
      <div class="content-card flex-1 bg-surface border border-border rounded-xl p-3 mb-6 shadow-sm hover:shadow-md transition-shadow">
        
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-semibold text-text text-sm">
             {{ event().title }}
          </h4>
          <sb-behavior-badge [behavior]="event().behaviorType" />
        </div>

        @if (isSession(event())) {
           <div class="flex items-center gap-4 text-xs mt-2">
             <div class="bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
               Duration: {{ asSession(event()).durationSecs | duration:'text' }}
             </div>
             <div class="text-warning font-medium">
               +{{ asSession(event()).coinsEarned | coins:false }} 🪙
             </div>
           </div>
        } @else {
           <div class="text-xs text-subtle mt-1">
             @if (asTask(event()).folderName) {
               <span>Folder: {{ asTask(event()).folderName }}</span>
             }
           </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .text-subtle { color: var(--color-text-muted); }
    .text-text { color: var(--color-text); }
    .bg-border { background: var(--color-border); }
    .bg-surface { background: var(--color-surface); }
    .border-surface { border-color: var(--color-surface); }
    .border-border { border-color: var(--color-border); }
    
    .text-primary { color: var(--color-primary); }
    .bg-primary\\/10 { background: color-mix(in srgb, var(--color-primary) 10%, transparent); }
    
    .text-warning { color: var(--color-warning); }
    
    .content-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .content-card:hover {
      transform: translateX(4px);
    }
  `]
})
export class TimelineBlockComponent {
  event = input.required<TimelineEvent>();

  isSession(e: TimelineEvent): boolean { return e.type === 'session'; }
  asSession(e: TimelineEvent): SessionTimelineEvent { return e as SessionTimelineEvent; }
  asTask(e: TimelineEvent): TaskTimelineEvent { return e as TaskTimelineEvent; }
}
