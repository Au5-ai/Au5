var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.Au5_MeetingHub>("au5-meetinghub");

builder.Build().Run();
