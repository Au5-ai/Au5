using Au5.Application.Features.Meetings.UpdateEntry;
using FluentValidation.TestHelper;

namespace Au5.UnitTests.Application.Features.Meetings.UpdateEntry;

public class UpdateEntryCommandValidatorTests
{
	private readonly UpdateEntryCommandValidator _validator = new();

	[Fact]
	public void Should_ReturnValidationError_When_MeetingIdIsEmpty()
	{
		var command = new UpdateEntryCommand(Guid.Empty, 1, "Valid content");

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
		var command = new UpdateEntryCommand(Guid.NewGuid(), entryId, "Valid content");

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.EntryId)
			.WithErrorMessage("Entry ID must be greater than zero.");
	}

	[Theory]
	[InlineData("")]
	[InlineData(null)]
	[InlineData("   ")]
	public void Should_ReturnValidationError_When_ContentIsEmptyOrWhitespace(string content)
	{
		var command = new UpdateEntryCommand(Guid.NewGuid(), 1, content);

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.Content)
			.WithErrorMessage("Content cannot be empty.");
	}

	[Fact]
	public void Should_ReturnValidationError_When_ContentExceedsMaxLength()
	{
		var longContent = new string('a', 5001);
		var command = new UpdateEntryCommand(Guid.NewGuid(), 1, longContent);

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.Content)
			.WithErrorMessage("Content cannot exceed 5000 characters.");
	}

	[Fact]
	public void Should_NotReturnValidationError_When_ContentIsAtMaxLength()
	{
		var maxContent = new string('a', 5000);
		var command = new UpdateEntryCommand(Guid.NewGuid(), 1, maxContent);

		var result = _validator.TestValidate(command);

		result.ShouldNotHaveValidationErrorFor(x => x.Content);
	}

	[Fact]
	public void Should_NotReturnValidationError_When_AllFieldsAreValid()
	{
		var command = new UpdateEntryCommand(Guid.NewGuid(), 1, "Valid content for the entry");

		var result = _validator.TestValidate(command);

		result.ShouldNotHaveAnyValidationErrors();
	}

	[Fact]
	public void Should_NotReturnValidationError_When_ContentContainsSpecialCharacters()
	{
		var command = new UpdateEntryCommand(Guid.NewGuid(), 1, "Content with special chars: @#$%^&*()");

		var result = _validator.TestValidate(command);

		result.ShouldNotHaveAnyValidationErrors();
	}

	[Fact]
	public void Should_NotReturnValidationError_When_ContentContainsUnicodeCharacters()
	{
		var command = new UpdateEntryCommand(Guid.NewGuid(), 1, "محتوای فارسی");

		var result = _validator.TestValidate(command);

		result.ShouldNotHaveAnyValidationErrors();
	}

	[Fact]
	public void Should_ReturnMultipleValidationErrors_When_MultipleFieldsAreInvalid()
	{
		var command = new UpdateEntryCommand(Guid.Empty, 0, string.Empty);

		var result = _validator.TestValidate(command);

		result.ShouldHaveValidationErrorFor(x => x.MeetingId);
		result.ShouldHaveValidationErrorFor(x => x.EntryId);
		result.ShouldHaveValidationErrorFor(x => x.Content);
	}
}
