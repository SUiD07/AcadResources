import { useState, useEffect } from 'react';
import { Calendar, Users, Award, BookOpen, Plus, Settings, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { getActivities } from '../lib/dataService';
import type { Activity } from '../lib/types';

interface AcademicActivitiesSectionProps {
  isAdmin?: boolean;
}

// Icon mapping for dynamic icon loading
const iconMap: Record<string, any> = {
  Users,
  Award,
  BookOpen,
  Calendar,
};

export function AcademicActivitiesSection({ isAdmin = false }: AcademicActivitiesSectionProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getActivities();
        setActivities(data);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddActivity = () => {
    console.log('Add new activity');
  };

  const handleManageActivities = () => {
    console.log('Manage activities');
  };

  const handleEditActivity = (activityId: string) => {
    console.log('Edit activity:', activityId);
  };

  const handleDeleteActivity = (activityId: string) => {
    console.log('Delete activity:', activityId);
  };

  return (
    <div className="pb-20 lg:pb-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-slate-900 font-bold text-[24px]">Academic Activities</h1>
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={handleAddActivity}
                className="bg-[#E5007D] hover:bg-[#c00069] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Activity
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleManageActivities}
                className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Activities
              </Button>
            </div>
          )}
        </div>
        <p className="text-slate-600 text-sm sm:text-base">Events, workshops, and collaborative learning opportunities</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-slate-600">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {activities.map((activity) => {
            const Icon = iconMap[activity.icon] || Calendar;
            
            return (
              <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5007D]" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ${
                        activity.status === 'Completed'
                          ? 'bg-green-50 text-green-700'
                          : activity.status === 'Upcoming'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-pink-50 text-[#E5007D]'
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
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      View Details
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditActivity(activity.id)}
                          className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}