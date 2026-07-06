import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface AdminModule {
  id: string;
  icon: string;
  title: string;
  description: string;
  route: string;
  available: boolean;
}

@Component({
  selector: 'admin-dashboard-page',
  standalone: true,
  imports: [RouterModule, ButtonModule],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardPageComponent {
  readonly modules: AdminModule[] = [
    {
      id: 'exercise-library',
      icon: 'pi pi-book',
      title: 'Biblioteca de Ejercicios',
      description:
        'Administra todos los ejercicios disponibles para crear rutinas y para que la Inteligencia Artificial pueda recomendarlos.',
      route: '/admin/exercise-library',
      available: true,
    },
    {
      id: 'routine-builder',
      icon: 'pi pi-list-check',
      title: 'Creador de Rutinas',
      description:
        'Diseña y administra rutinas de entrenamiento personalizadas.',
      route: '/admin/routine-builder',
      available: false,
    },
    {
      id: 'diet-library',
      icon: 'pi pi-apple',
      title: 'Biblioteca de Dietas',
      description:
        'Gestiona planes de alimentación y macros para los usuarios.',
      route: '/admin/diet-library',
      available: false,
    },
    {
      id: 'users',
      icon: 'pi pi-users',
      title: 'Usuarios',
      description: 'Consulta y gestiona las cuentas y perfiles de los atletas.',
      route: '/admin/users',
      available: false,
    },
    {
      id: 'analytics',
      icon: 'pi pi-chart-bar',
      title: 'Analytics',
      description:
        'Visualiza métricas de uso, progreso y actividad en la plataforma.',
      route: '/admin/analytics',
      available: false,
    },
    {
      id: 'ai-management',
      icon: 'pi pi-microchip-ai',
      title: 'Gestión de IA',
      description:
        'Configura y supervisa los modelos y recomendaciones de inteligencia artificial.',
      route: '/admin/ai-management',
      available: false,
    },
    {
      id: 'reports',
      icon: 'pi pi-file-export',
      title: 'Reportes',
      description:
        'Genera y descarga reportes personalizados sobre la actividad del sistema.',
      route: '/admin/reports',
      available: false,
    },
    {
      id: 'settings',
      icon: 'pi pi-cog',
      title: 'Configuración',
      description: 'Ajusta los parámetros globales del sistema administrativo.',
      route: '/admin/settings',
      available: false,
    },
  ];
}
