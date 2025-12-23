using Au5.Application.Features.Meetings.GetFullTranscription;
using Au5.Domain.Entities;
using MockQueryable.Moq;

namespace Au5.UnitTests.Application.Features.Meetings.FullTranscription;
public class GetFullTranscriptionQueryHandlerTests
{
	private readonly Mock<IApplicationDbContext> _dbContextMock;
	private readonly GetFullTranscriptionQueryHandler _handler;

	public GetFullTranscriptionQueryHandlerTests()
	{
		_dbContextMock = new();
		_handler = new GetFullTranscriptionQueryHandler(_dbContextMock.Object);
	}

	[Fact]
	public async Task Should_ReturnNotFound_When_MeetingDoesNotExist()
	{
		var dbSet = new List<Meeting>().BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(dbSet.Object);

		var query = new GetFullTranscriptionQuery(Guid.NewGuid());

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.False(result.IsSuccess);
		Assert.Equal("No meeting with this ID was found.", result.Error.Description);
	}

	[Fact]
	public async Task Should_ReturnFullTranscriptionResponse_When_MeetingExists()
	{
		var userId = Guid.Parse("edada1f7-cbda-4c13-8504-a57fe72d5960");
		var meetingId = Guid.Parse("727cccfe-054d-4c45-8fb2-6762df1197ef");
		var createdAt = new DateTime(2025, 8, 30, 0, 32, 1, 101, DateTimeKind.Unspecified).AddTicks(9808);

		var user = new User
		{
			Id = userId,
			FullName = "Mohammad Karimi",
			PictureUrl = "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo",
			Email = "mha.karimi@gmail.com",
		};

		var participant = new ParticipantInMeeting
		{
			User = user
		};

		var reactions = new List<AppliedReactions>
		{
			new()
			{
				ReactionId = 3,
				Reaction = new Reaction { Type = "Goal", Emoji = "??" },
				Participants =
				[
					new(userId, null, null, null)
				]
			},
			new()
			{
				ReactionId = 2,
				Reaction = new Reaction { Type = "GoodPoint", Emoji = "?" },
				Participants =
				[
					new(userId, null, null, null)
				]
			},
			new()
			{
				ReactionId = 1,
				Reaction = new Reaction { Type = "Task", Emoji = "?" },
				Participants =
				[
					new(userId, null, null, null)
				]
			}
		};

		var entries = new List<Entry>
		{
			new()
			{
				BlockId = Guid.Parse("fb0e0485-3bd4-4e6f-9c2e-90706fc90ea9"),
				ParticipantId = userId,
				FullName = "Mohammad Karimi",
				Content = "Sfdljadf",
				Timestamp = new DateTime(2025, 8, 29, 14, 33, 56, 498, DateTimeKind.Unspecified),
				EntryType = "Chat",
				Reactions = reactions,
				Timeline = "00:01:55"
			}
		};

		var meeting = new Meeting
		{
			Id = meetingId,
			MeetId = "dzc-awqw-ioi",
			MeetName = "TranscriptionMeeting",
			BotInviterUserId = userId,
			User = user,
			HashToken = "D45EE09FC19733549FA1A91E7E7176F572D7BF22F17F712C3C12C3C91FFF7330",
			Platform = "GoogleMeet",
			BotName = "Candoo",
			IsBotAdded = false,
			CreatedAt = createdAt,
			Status = MeetingStatus.Ended,
			Participants = [participant],
			Guests = [new GuestsInMeeting() { FullName = "Ali A", MeetingId = meetingId, Id = 1, PictureUrl = "PicUrl" }],
			Entries = entries
		};

		var dbSet = new List<Meeting> { meeting }.BuildMockDbSet();
		_dbContextMock.Setup(db => db.Set<Meeting>()).Returns(dbSet.Object);

		var query = new GetFullTranscriptionQuery(meetingId);

		var result = await _handler.Handle(query, CancellationToken.None);

		Assert.True(result.IsSuccess);
		var response = result.Data;
		Assert.Equal(meetingId, response.Id);
		Assert.Equal("dzc-awqw-ioi", response.MeetingId);
		Assert.Equal("Mohammad Karimi", response.UserRecorder.FullName);
		Assert.Equal("GoogleMeet", response.Platform);
		Assert.Equal("Candoo", response.BotName);
		Assert.False(response.IsBotAdded);
		Assert.Equal(createdAt.ToString("o"), response.CreatedAt);
		Assert.Equal("Ended", response.Status);
		Assert.Single(response.Participants);
		Assert.Single(response.Guests);
		Assert.Single(response.Entries);
		Assert.Equal("TranscriptionMeeting", response.Title);

		var entryDto = response.Entries[0];
		Assert.Equal("Sfdljadf", entryDto.Content);
		Assert.Equal("Chat", entryDto.EntryType);
		Assert.Equal("fb0e0485-3bd4-4e6f-9c2e-90706fc90ea9", entryDto.BlockId.ToString());
		Assert.Equal("Mohammad Karimi", entryDto.FullName);
		Assert.Equal("14:33", entryDto.Time);
		Assert.Equal(3, entryDto.Reactions.Count);
		Assert.Equal("Goal", entryDto.Reactions[0].Type);
		Assert.Equal("??", entryDto.Reactions[0].Emoji);
		Assert.Equal("GoodPoint", entryDto.Reactions[1].Type);
		Assert.Equal("?", entryDto.Reactions[1].Emoji);
		Assert.Equal("Task", entryDto.Reactions[2].Type);
		Assert.Equal("?", entryDto.Reactions[2].Emoji);
	}
}
