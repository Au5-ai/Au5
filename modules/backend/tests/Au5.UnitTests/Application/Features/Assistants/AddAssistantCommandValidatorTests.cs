using Au5.Application.Features.Assistants.AddAssistant;

namespace Au5.UnitTests.Application.Features.Assistants;

public class AddAssistantCommandValidatorTests
{
	private readonly AddAssistantCommandValidator _validator = new();

	[Fact]
	public void Should_Fail_When_Name_Is_Empty()
	{
		var command = new AddAssistantCommand { Name = string.Empty, Instructions = "Instructions" };
		var result = _validator.Validate(command);
		Assert.False(result.IsValid);
		Assert.Contains(result.Errors, e => e.PropertyName == "Name");
	}

	[Fact]
	public void Should_Fail_When_Name_TooLong()
	{
		var command = new AddAssistantCommand { Name = new string('a', 201), Instructions = "Instructions" };
		var result = _validator.Validate(command);
		Assert.False(result.IsValid);
		Assert.Contains(result.Errors, e => e.PropertyName == "Name");
	}

	[Fact]
	public void Should_Fail_When_Icon_TooLong()
	{
		var command = new AddAssistantCommand { Name = "Test", Icon = new string('a', 201), Instructions = "Instructions" };
		var result = _validator.Validate(command);
		Assert.False(result.IsValid);
		Assert.Contains(result.Errors, e => e.PropertyName == "Icon");
	}

	[Fact]
	public void Should_Fail_When_Description_TooLong()
	{
		var command = new AddAssistantCommand { Name = "Test", Description = new string('a', 501), Instructions = "Instructions" };
		var result = _validator.Validate(command);
		Assert.False(result.IsValid);
		Assert.Contains(result.Errors, e => e.PropertyName == "Description");
	}

	[Fact]
	public void Should_Fail_When_Instructions_Is_Empty()
	{
		var command = new AddAssistantCommand { Name = "Test", Instructions = string.Empty };
		var result = _validator.Validate(command);
		Assert.False(result.IsValid);
		Assert.Contains(result.Errors, e => e.PropertyName == "Instructions");
	}

	[Fact]
	public void Should_Fail_When_Instructions_TooLong()
	{
		var command = new AddAssistantCommand { Name = "Test", Instructions = new string('a', 2001) };
		var result = _validator.Validate(command);
		Assert.False(result.IsValid);
		Assert.Contains(result.Errors, e => e.PropertyName == "Instructions");
	}

	[Fact]
	public void Should_Pass_When_All_Valid()
	{
		var command = new AddAssistantCommand
		{
			Name = "Test",
			Icon = "icon.png",
			Description = "desc",
			Instructions = "Instructions",
		};
		var result = _validator.Validate(command);
		Assert.True(result.IsValid);
	}
}
