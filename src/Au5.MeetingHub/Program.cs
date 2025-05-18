using Au5.MeetingHub;
using Au5.MeetingHub.Models;
using MessagePack;
using System.Text.Json;
using MessagePack;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);



#region Size
//var dto = new JoinMeetingDto
//{
//    MeetingId = "123",
//    UserId = "456",
//    FullName = "Mohammad Karimi"
//};

//// JSON
//var jsonBytes = JsonSerializer.SerializeToUtf8Bytes(dto);
//Console.WriteLine($"JSON size: {jsonBytes.Length} bytes");

//// MessagePack
//var msgPackBytes = MessagePackSerializer.Serialize(dto);
//Console.WriteLine($"MessagePack size: {msgPackBytes.Length} bytes");

#endregion

#region Serialization

var dto = new JoinMeetingDto
{
    MeetingId = "123",
    UserId = "456",
    FullName = "Mohammad Karimi"
};

// Measure JSON time
var sw = Stopwatch.StartNew();
for (int i = 0; i < 10000; i++)
{
    var json = JsonSerializer.Serialize(dto);
    var obj = JsonSerializer.Deserialize<JoinMeetingDto>(json);
}
sw.Stop();
Console.WriteLine($"JSON time: {sw.ElapsedMilliseconds}ms");

// Measure MessagePack time
sw.Restart();
for (int i = 0; i < 10000; i++)
{
    var options = MessagePackSerializerOptions.Standard.WithCompression(MessagePackCompression.Lz4Block);
    var bin = MessagePackSerializer.Serialize(dto, options);
    var obj = MessagePackSerializer.Deserialize<JoinMeetingDto>(bin);
}
sw.Stop();
Console.WriteLine($"MessagePack time: {sw.ElapsedMilliseconds}ms");

#endregion

builder.Services.AddSignalR()
    .AddMessagePackProtocol(options =>
    {
        options.SerializerOptions = MessagePackSerializerOptions.Standard
        .WithSecurity(MessagePackSecurity.UntrustedData);
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin()
    );
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllWithCredentials", policy =>
    {
        policy
            .SetIsOriginAllowed(origin => true)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});


var app = builder.Build();

app.UseCors("AllowAllWithCredentials");

app.UseCors();
app.MapHub<MeetingHub>("/meetinghub");
app.Run();
