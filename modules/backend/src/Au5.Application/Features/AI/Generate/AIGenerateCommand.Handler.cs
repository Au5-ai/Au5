using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;

namespace Au5.Application.Features.AI.Generate;

public class AIGenerateCommandHandler : IStreamRequestHandler<AIGenerateCommand, string>
{
	private readonly HttpClient _httpClient;

	public AIGenerateCommandHandler(HttpClient httpClient)
	{
		_httpClient = httpClient;
	}

	public async IAsyncEnumerable<string> Handle(
		AIGenerateCommand request,
		[EnumeratorCancellation] CancellationToken cancellationToken)
	{
		var payload = new
		{
			assistant_id = request.AssistantId,
			thread = new
			{
				messages = new[]
				  {
						new { role = "user", content = "به گزارش “ورزش سه”، در چند روز گذشته ماجرای سربازی علیرضا بیرانوند بار دیگر به جریان افتاده و با افشای یک نامه از سوی فدراسیون فوتبال، این موضوع بار دیگر در میان اهالی فوتبال داغ شده است. در این نامه آمده بود که علیرضا بیرانوند تا روز ۱۴ مهر ماه اجازه بازی دارد و پس از آن باید خدمت خود را تعیین تکلیف کند.\r\n\r\nباتوجه به اینکه فعلا مسابقات باشگاهی در ایران تعطیل است، او مشکلی برای همراهی تیم خود نخواهد داشت اما بعد از فیفادی باید موضوع معافیت تحصیلی را تعیین تکلیف کند.\r\n\r\nبر اساس خبری که مجری برنامه فوتبال برتر در آنتن زنده اعلام کرد، بیرانوند بعد از فیفادی باید دفاع خود از پایان نامه تحصیلی در مقطع ارشد را انجام دهد و در صورت دریافت نمره قبولی، می‌تواند به کارش در تیم باشگاهی ادامه دهد." }
				  }
			},
			api_key = "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",
			proxy_url = string.Empty
		};

		var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

		using var req = new HttpRequestMessage(HttpMethod.Post, "http://localhost:8000/api/threads/runs")
		{
			Content = content
		};

		var response = await _httpClient.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
		response.EnsureSuccessStatusCode();

		await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
		using var reader = new StreamReader(stream, Encoding.UTF8);

		while (!reader.EndOfStream && !cancellationToken.IsCancellationRequested)
		{
			var line = await reader.ReadLineAsync();
			if (string.IsNullOrWhiteSpace(line))
			{
				continue;
			}

			Console.WriteLine(line);
			yield return line;
		}
	}
}
