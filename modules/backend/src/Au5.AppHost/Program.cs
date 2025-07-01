var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.Au5_BackEnd>("au5-backend");

builder.Build().Run();
