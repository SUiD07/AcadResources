import { Calendar, Users, Award, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function AcademicActivitiesSection() {
  const activities = [
    {
      id: '1',
      title: 'Clinical Skills Workshop',
      description: 'Hands-on practice sessions for essential clinical examination techniques',
      icon: Users,
      date: 'Every Tuesday, 14:00-16:00',
      status: 'Ongoing',
    },
    {
      id: '2',
      title: 'Research Symposium',
      description: 'Annual student research presentation and poster session',
      icon: Award,
      date: 'December 15, 2025',
      status: 'Upcoming',
    },
    {
      id: '3',
      title: 'Journal Club',
      description: 'Monthly discussion of recent medical literature and evidence-based practice',
      icon: BookOpen,
      date: 'First Friday of each month',
      status: 'Ongoing',
    },
    {
      id: '4',
      title: 'OSCE Preparation',
      description: 'Mock OSCE stations with feedback from senior students and faculty',
      icon: Calendar,
      date: 'November 25-28, 2025',
      status: 'Registration Open',
    },
  ];

  return (
    <div className="pb-20 lg:pb-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-slate-900 mb-2 font-bold text-[24px]">Academic Activities</h1>
        <p className="text-slate-600 text-sm sm:text-base">Events, workshops, and collaborative learning opportunities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {activities.map((activity) => {
          const Icon = activity.icon;
          
          return (
            <Card key={activity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <span
                    className={`px-2 sm:px-2.5 py-1 rounded-full text-xs ${
                      activity.status === 'Ongoing'
                        ? 'bg-green-50 text-green-700'
                        : activity.status === 'Upcoming'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
                <CardTitle className="text-base sm:text-lg">{activity.title}</CardTitle>
                <CardDescription className="text-sm">{activity.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{activity.date}</span>
                </div>
                <Button variant="outline" className="w-full" size="sm">
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}