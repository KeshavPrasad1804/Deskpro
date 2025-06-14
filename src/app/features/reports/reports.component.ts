import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface ReportData {
  ticketsByStatus: { [key: string]: number };
  ticketsByPriority: { [key: string]: number };
  ticketsOverTime: { date: string; count: number }[];
  agentPerformance: { agent: string; resolved: number; avgTime: number }[];
  customerSatisfaction: { rating: number; count: number }[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-responsive py-6">
      <div class="page-header">
        <h1 class="page-title">Reports & Analytics</h1>
        <p class="page-subtitle">Performance metrics and insights</p>
      </div>

      <!-- Filters -->
      <div class="card p-6 mb-6">
        <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="form-label">Date Range</label>
            <select formControlName="dateRange" class="form-input">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <div>
            <label class="form-label">Department</label>
            <select formControlName="department" class="form-input">
              <option value="">All Departments</option>
              <option value="support">Support</option>
              <option value="sales">Sales</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          <div>
            <label class="form-label">Agent</label>
            <select formControlName="agent" class="form-input">
              <option value="">All Agents</option>
              <option value="agent1">John Smith</option>
              <option value="agent2">Jane Doe</option>
              <option value="agent3">Mike Johnson</option>
            </select>
          </div>
          <div class="flex items-end">
            <button type="button" (click)="applyFilters()" class="btn-primary w-full">
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="stats-card">
          <div class="stats-icon bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div class="stats-value">{{ totalTickets }}</div>
          <div class="stats-label">Total Tickets</div>
          <div class="stats-change positive">+12% from last period</div>
        </div>

        <div class="stats-card">
          <div class="stats-icon bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stats-value">{{ resolvedTickets }}</div>
          <div class="stats-label">Resolved Tickets</div>
          <div class="stats-change positive">+8% from last period</div>
        </div>

        <div class="stats-card">
          <div class="stats-icon bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="stats-value">{{ avgResolutionTime }}h</div>
          <div class="stats-label">Avg Resolution Time</div>
          <div class="stats-change negative">+2h from last period</div>
        </div>

        <div class="stats-card">
          <div class="stats-icon bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </div>
          <div class="stats-value">{{ customerSatisfactionScore }}</div>
          <div class="stats-label">Customer Satisfaction</div>
          <div class="stats-change positive">+0.2 from last period</div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Tickets by Status -->
        <div class="card p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Tickets by Status</h3>
          <div class="chart-container">
            <canvas #statusChart width="400" height="300"></canvas>
          </div>
        </div>

        <!-- Tickets by Priority -->
        <div class="card p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Tickets by Priority</h3>
          <div class="chart-container">
            <canvas #priorityChart width="400" height="300"></canvas>
          </div>
        </div>

        <!-- Tickets Over Time -->
        <div class="card p-6 lg:col-span-2">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Tickets Over Time</h3>
          <div class="chart-container">
            <canvas #timeChart width="800" height="300"></canvas>
          </div>
        </div>
      </div>

      <!-- Agent Performance Table -->
      <div class="card mb-8">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Agent Performance</h3>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th class="table-header-cell">Agent</th>
                <th class="table-header-cell">Tickets Resolved</th>
                <th class="table-header-cell">Avg Resolution Time</th>
                <th class="table-header-cell">Customer Rating</th>
                <th class="table-header-cell">Response Time</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let agent of agentPerformanceData" class="table-row">
                <td class="table-cell">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
                        {{ getAgentInitials(agent.agent) }}
                      </span>
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">{{ agent.agent }}</span>
                  </div>
                </td>
                <td class="table-cell">{{ agent.resolved }}</td>
                <td class="table-cell">{{ agent.avgTime }}h</td>
                <td class="table-cell">
                  <div class="flex items-center space-x-1">
                    <span class="text-yellow-400">★</span>
                    <span>{{ agent.rating }}</span>
                  </div>
                </td>
                <td class="table-cell">{{ agent.responseTime }}m</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Customer Satisfaction -->
      <div class="card p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Customer Satisfaction Distribution</h3>
        <div class="chart-container">
          <canvas #satisfactionChart width="400" height="300"></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }

    .stats-change {
      font-size: 0.75rem;
      font-weight: 500;
      margin-top: 0.5rem;
    }

    .stats-change.positive {
      color: rgb(34 197 94);
    }

    .stats-change.negative {
      color: rgb(239 68 68);
    }

    .stats-change.positive::before {
      content: '↗ ';
    }

    .stats-change.negative::before {
      content: '↘ ';
    }

    canvas {
      max-width: 100%;
      height: auto;
    }
  `]
})
export class ReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('statusChart') statusChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('priorityChart') priorityChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('timeChart') timeChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('satisfactionChart') satisfactionChart!: ElementRef<HTMLCanvasElement>;

  filterForm: FormGroup;
  
  // Mock data
  totalTickets = 1247;
  resolvedTickets = 1089;
  avgResolutionTime = 4.2;
  customerSatisfactionScore = 4.6;

  agentPerformanceData = [
    { agent: 'John Smith', resolved: 156, avgTime: 3.2, rating: 4.8, responseTime: 12 },
    { agent: 'Jane Doe', resolved: 142, avgTime: 4.1, rating: 4.6, responseTime: 15 },
    { agent: 'Mike Johnson', resolved: 128, avgTime: 5.2, rating: 4.4, responseTime: 18 },
    { agent: 'Sarah Wilson', resolved: 134, avgTime: 3.8, rating: 4.7, responseTime: 14 }
  ];

  private reportData: ReportData = {
    ticketsByStatus: {
      'Open': 45,
      'In Progress': 32,
      'Pending': 18,
      'Resolved': 89,
      'Closed': 156
    },
    ticketsByPriority: {
      'Low': 120,
      'Normal': 180,
      'High': 85,
      'Urgent': 25
    },
    ticketsOverTime: [
      { date: '2024-01-01', count: 12 },
      { date: '2024-01-02', count: 15 },
      { date: '2024-01-03', count: 8 },
      { date: '2024-01-04', count: 22 },
      { date: '2024-01-05', count: 18 },
      { date: '2024-01-06', count: 25 },
      { date: '2024-01-07', count: 19 }
    ],
    agentPerformance: this.agentPerformanceData,
    customerSatisfaction: [
      { rating: 5, count: 245 },
      { rating: 4, count: 189 },
      { rating: 3, count: 67 },
      { rating: 2, count: 23 },
      { rating: 1, count: 8 }
    ]
  };

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      dateRange: ['30'],
      department: [''],
      agent: ['']
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  private initializeCharts(): void {
    this.createStatusChart();
    this.createPriorityChart();
    this.createTimeChart();
    this.createSatisfactionChart();
  }

  private createStatusChart(): void {
    const canvas = this.statusChart.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.drawDoughnutChart(ctx, {
      labels: Object.keys(this.reportData.ticketsByStatus),
      data: Object.values(this.reportData.ticketsByStatus),
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#6B7280']
    });
  }

  private createPriorityChart(): void {
    const canvas = this.priorityChart.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.drawBarChart(ctx, {
      labels: Object.keys(this.reportData.ticketsByPriority),
      data: Object.values(this.reportData.ticketsByPriority),
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
    });
  }

  private createTimeChart(): void {
    const canvas = this.timeChart.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.drawLineChart(ctx, {
      labels: this.reportData.ticketsOverTime.map(d => new Date(d.date).toLocaleDateString()),
      data: this.reportData.ticketsOverTime.map(d => d.count),
      color: '#3B82F6'
    });
  }

  private createSatisfactionChart(): void {
    const canvas = this.satisfactionChart.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.drawBarChart(ctx, {
      labels: this.reportData.customerSatisfaction.map(d => `${d.rating} Star${d.rating !== 1 ? 's' : ''}`),
      data: this.reportData.customerSatisfaction.map(d => d.count),
      colors: ['#F59E0B']
    });
  }

  private drawDoughnutChart(ctx: CanvasRenderingContext2D, config: any): void {
    const { labels, data, colors } = config;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    const innerRadius = radius * 0.6;

    let total = data.reduce((sum: number, value: number) => sum + value, 0);
    let currentAngle = -Math.PI / 2;

    // Draw segments
    data.forEach((value: number, index: number) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      currentAngle += sliceAngle;
    });

    // Draw legend
    this.drawLegend(ctx, labels, colors, 20, 20);
  }

  private drawBarChart(ctx: CanvasRenderingContext2D, config: any): void {
    const { labels, data, colors } = config;
    const padding = 40;
    const chartWidth = ctx.canvas.width - padding * 2;
    const chartHeight = ctx.canvas.height - padding * 2;
    const barWidth = chartWidth / data.length * 0.8;
    const maxValue = Math.max(...data);

    // Draw bars
    data.forEach((value: number, index: number) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + index * (chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
      const y = ctx.canvas.height - padding - barHeight;

      ctx.fillStyle = Array.isArray(colors) ? colors[index % colors.length] : colors[0];
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value on top of bar
      ctx.fillStyle = '#374151';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(value.toString(), x + barWidth / 2, y - 5);

      // Draw label
      ctx.fillText(labels[index], x + barWidth / 2, ctx.canvas.height - padding + 15);
    });
  }

  private drawLineChart(ctx: CanvasRenderingContext2D, config: any): void {
    const { labels, data, color } = config;
    const padding = 40;
    const chartWidth = ctx.canvas.width - padding * 2;
    const chartHeight = ctx.canvas.height - padding * 2;
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const valueRange = maxValue - minValue || 1;

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    data.forEach((value: number, index: number) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw point
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    labels.forEach((label: string, index: number) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      ctx.fillText(label, x, ctx.canvas.height - padding + 15);
    });
  }

  private drawLegend(ctx: CanvasRenderingContext2D, labels: string[], colors: string[], x: number, y: number): void {
    ctx.font = '12px Inter';
    ctx.textAlign = 'left';

    labels.forEach((label, index) => {
      const legendY = y + index * 20;
      
      // Draw color box
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, legendY, 12, 12);
      
      // Draw label
      ctx.fillStyle = '#374151';
      ctx.fillText(label, x + 20, legendY + 9);
    });
  }

  applyFilters(): void {
    // In a real app, this would fetch new data based on filters
    console.log('Applying filters:', this.filterForm.value);
  }

  getAgentInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}