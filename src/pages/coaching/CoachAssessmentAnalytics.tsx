import { Card } from "@/components/ui/card";

const CoachAssessmentAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">📈 Assessment Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aggregate trends and insights across all your seekers
        </p>
      </div>

      <Card className="p-12 text-center space-y-4">
        <p className="text-5xl">📊</p>
        <h2 className="text-xl font-semibold text-foreground">Analytics Dashboard Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Track cohort-level trends, identify common danger zones, measure transformation
          velocity, and compare batch performance — all in one place.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 max-w-2xl mx-auto">
          {["Cohort Trends", "Danger Zone Heatmap", "Transformation Velocity", "Batch Comparison"].map((f) => (
            <Card key={f} className="p-3 text-center">
              <p className="text-xs font-medium text-muted-foreground">{f}</p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CoachAssessmentAnalytics;
