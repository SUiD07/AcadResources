import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, Loader2 } from 'lucide-react';

interface YearSelectionPageProps {
  onYearSelected: (year: string) => void;
  isSaving?: boolean;
}

export function YearSelectionPage({ onYearSelected, isSaving = false }: YearSelectionPageProps) {
  const [selectedYear, setSelectedYear] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onYearSelected(selectedYear);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#E5007D] rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-slate-900">Welcome to Academic Resources</CardTitle>
          <CardDescription>Please select your current academic year to personalize your experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {['1', '2', '3', '4', '5', '6'].map((year) => (
                <label
                  key={year}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                    selectedYear === year
                      ? 'border-[#E5007D] bg-pink-50 text-[#E5007D]'
                      : 'border-slate-200 hover:border-[#E5007D] hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="academic_year"
                    value={year}
                    checked={selectedYear === year}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="hidden"
                  />
                  <div className="flex-1 font-medium text-center">Year {year}</div>
                </label>
              ))}
            </div>
            <Button
              type="submit"
              className="w-full bg-[#E5007D] hover:bg-[#c00069] text-white"
              size="lg"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
