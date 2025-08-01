import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Setup() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to Au5!
            </h1>
            <p className="text-muted-foreground mt-2">
              Let's set up your meeting bot configuration
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Setup Complete</CardTitle>
              <CardDescription>
                Your account has been successfully authenticated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You can now proceed to configure your meeting bots and start
                  managing your meetings.
                </p>
                <div className="flex space-x-2">
                  <a
                    href="/meetings"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Go to Meetings
                  </a>
                  <a
                    href="/settings"
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    Configure Settings
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
