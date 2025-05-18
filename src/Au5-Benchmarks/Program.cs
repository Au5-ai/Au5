using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;
using MessagePack;
using System.Text.Json;

[MessagePackObject(keyAsPropertyName: true)]
public class JoinMeetingDto
{
    public string MeetingId { get; set; }

    public string UserId { get; set; }

    public string FullName { get; set; }
}

[MemoryDiagnoser]
public class SerializationBenchmark
{
    private readonly JoinMeetingDto dto;
    private readonly MessagePackSerializerOptions msgPackOptions;

    public SerializationBenchmark()
    {
        dto = new JoinMeetingDto
        {
            MeetingId = "123",
            UserId = "456",
            FullName = "Mohammad Karimi"
        };
        msgPackOptions = MessagePackSerializerOptions.Standard.WithCompression(MessagePackCompression.Lz4Block);
    }

    [Benchmark]
    public void JsonSerialization()
    {
        var json = JsonSerializer.Serialize(dto);
        var obj = JsonSerializer.Deserialize<JoinMeetingDto>(json);
    }

    [Benchmark]
    public void MessagePackSerialization()
    {
        var bin = MessagePackSerializer.Serialize(dto, msgPackOptions);
        var obj = MessagePackSerializer.Deserialize<JoinMeetingDto>(bin);
    }
}


public class Program
{
    public static void Main(string[] args)
    {
        BenchmarkRunner.Run<SerializationBenchmark>();
    }
}
