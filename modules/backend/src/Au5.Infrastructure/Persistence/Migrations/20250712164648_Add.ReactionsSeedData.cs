using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddReactionsSeedData : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.Sql(@"
				SET IDENTITY_INSERT [Reaction] ON;

				INSERT INTO [Reaction] ([Id], [ClassName], [Emoji], [Type])
				VALUES
				(1, 'reaction-task', N'⚡', 'Task'),
				(2, 'reaction-important', N'⭐', 'GoodPoint'),
				(3, 'reaction-question', N'🎯', 'Goal');

				SET IDENTITY_INSERT [Reaction] OFF;
			");
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DeleteData(
				table: "Reaction",
				keyColumn: "Id",
				keyValue: 1);

			migrationBuilder.DeleteData(
				table: "Reaction",
				keyColumn: "Id",
				keyValue: 2);

			migrationBuilder.DeleteData(
				table: "Reaction",
				keyColumn: "Id",
				keyValue: 3);
		}
	}
}
