using Au5.Application.Features.Meetings.DeleteEntry;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.Meetings.DeleteEntry;

public class DeleteEntryCommandValidatorTests
{
	private readonly DeleteEntryCommandValidator _validator = new();

	[Fact]
	public void Should_ReturnValidationError_When_MeetingIdIsEmpty()
	{
		var command = new DeleteEntryCommand(Guid.Empty, 1);

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.MeetingId)
			.WithErrorMessage("Meeting ID is required.");
	}

	[Theory]
	[InlineData(0)]
	[InlineData(-1)]
	[InlineData(-100)]
	public void Should_ReturnValidationError_When_EntryIdIsInvalid(int entryId)
	{
		var command = new DeleteEntryCommand(Guid.NewGuid(), entryId);

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.EntryId)
			.WithErrorMessage("Entry ID must be greater than zero.");
	}

	[Fact]
	public void Should_NotReturnValidationError_When_AllFieldsAreValid()
	{
		var command = new DeleteEntryCommand(Guid.NewGuid(), 1);

		var result = _validator.TestValidate(command);

		result.ShouldNotHaveAnyValidationErrors();
	}

	[Fact]
	public void Should_ReturnMultipleValidationErrors_When_MultipleFieldsAreInvalid()
	{
		var command = new DeleteEntryCommand(Guid.Empty, 0);

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.MeetingId);
		result.ShouldHaveValidationErrorFor(x => x.EntryId);
	}

	[Fact]
	public void Should_NotReturnValidationError_When_EntryIdIsLargeNumber()
	{
		var command = new DeleteEntryCommand(Guid.NewGuid(), int.MaxValue);

		var result = _validator.TestValidate(command);

		result.ShouldNotHaveAnyValidationErrors();
	}
}