using System.Security.Cryptography;
using System.Text;
using Au5.Application.Common.Abstractions;

namespace Au5.Application.Features.Meetings.AddBot;

public class AddBotCommandHandler : IRequestHandler<AddBotCommand, Result<Guid>>
{
	private readonly IApplicationDbContext _dbContext;

	public AddBotCommandHandler(IApplicationDbContext dbContext)
	{
		_dbContext = dbContext;
	}

	public async ValueTask<Result<Guid>> Handle(AddBotCommand request, CancellationToken cancellationToken)
	{
		var meetingId = Guid.NewGuid();
		var raw = $"{meetingId}{DateTime.Now:O}";
		var bytes = Encoding.UTF8.GetBytes(raw);
		var hash = SHA256.HashData(bytes);
		var hashToken = Convert.ToBase64String(hash);

		_dbContext.Set<Meeting>().Add(new Meeting()
		{
			Id = meetingId,
			MeetId = request.MeetId,
			BotName = request.BotName,
			IsBotAdded = false,
			BotInviterUserId = Guid.Parse("EDADA1F7-CBDA-4C13-8504-A57FE72D5960"),
			CreatedAt = DateTime.UtcNow,
			Platform = request.Platform,
			Status = MeetingStatus.NotStarted,
			HashToken = hashToken
		});

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);

		return dbResult.IsSuccess ? meetingId : Error.Failure(description: "Failed to add bot to the meeting.");
	}
}
