"use client";

export default function MyMeetingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Meetings</h1>
        <p className="text-muted-foreground">
          Manage and view your meetings, transcriptions, and recordings.
        </p>
      </div>
      
      {/* Meeting content goes here */}
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Recent Meetings</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Your recent meetings will appear here.
          </p>
        </div>
        
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Upcoming Meetings</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Your upcoming meetings will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}