import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';

export default function Policies() {
  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const res = await fetch('/api/policies');
      if (!res.ok) throw new Error('Failed to fetch policies');
      return res.json();
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Policies</h2>
        <p className="text-muted-foreground">Active insurance policies and coverage data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          policies?.map((policy: any) => (
            <Card key={policy._id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{policy.policy_number}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{policy.policy_holder_id?.name}</p>
                  </div>
                  <Badge variant="outline">{policy.event_id?.event_name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="flex justify-between items-center py-2 border-y">
                  <span className="text-muted-foreground">Coverage</span>
                  <span className="font-medium text-lg">₹{policy.coverage_amount?.$numberDecimal}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>
                    <span className="block text-xs">Start Date</span>
                    <span className="text-foreground font-medium">{format(new Date(policy.start_date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs">End Date</span>
                    <span className="text-foreground font-medium">{format(new Date(policy.end_date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
