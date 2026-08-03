<?php

namespace App\Filament\Widgets;

use App\Enums\ProjectStatus;
use App\Enums\UserRole;
use App\Models\Project;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class PlatformOverview extends StatsOverviewWidget
{
    protected static ?int $sort = -1;

    /**
     * @return array<int, Stat>
     */
    protected function getStats(): array
    {
        $byStatus = Project::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            Stat::make('Students', User::where('role', UserRole::Student)->count())
                ->description('Registered students')
                ->color('primary'),

            Stat::make('Lecturers', User::where('role', UserRole::Lecturer)->count())
                ->description('Registered lecturers')
                ->color('primary'),

            Stat::make('Hiring now', (int) $byStatus->get(ProjectStatus::Hiring->value, 0))
                ->description('Projects accepting applications')
                ->color('success'),

            Stat::make('Ongoing', (int) $byStatus->get(ProjectStatus::Ongoing->value, 0))
                ->description('Projects underway'),

            Stat::make('Finished', (int) $byStatus->get(ProjectStatus::Finished->value, 0))
                ->description('Projects completed'),

            Stat::make('Drafts', (int) $byStatus->get(ProjectStatus::Draft->value, 0))
                ->description('Unpublished, visible only to their author')
                ->color('gray'),
        ];
    }
}
