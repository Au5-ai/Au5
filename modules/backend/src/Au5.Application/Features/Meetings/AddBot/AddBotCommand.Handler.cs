using System.Security.Cryptography;
using System.Text;
using Au5.Application.Common.Abstractions;
using Au5.Application.Common.Resources;

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
			BotInviterUserId = request.UserId,
			CreatedAt = DateTime.UtcNow,
			Platform = request.Platform,
			Status = MeetingStatus.NotStarted,
			HashToken = hashToken
		});

		var dbResult = await _dbContext.SaveChangesAsync(cancellationToken);

		return dbResult.IsSuccess ? meetingId : Error.Failure(description: AppResources.FailedToAddBot);
	}
}
