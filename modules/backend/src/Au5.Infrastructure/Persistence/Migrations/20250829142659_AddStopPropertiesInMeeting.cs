using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddStopPropertiesInMeeting : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AddColumn<Guid>(
				name: "ClosedMeetingUserId",
				table: "Meeting",
				type: "uniqueidentifier",
				nullable: false,
				defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

			migrationBuilder.AddColumn<DateTime>(
				name: "StopedAt",
				table: "Meeting",
				type: "datetime2",
				nullable: false,
				defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropColumn(
				name: "ClosedMeetingUserId",
				table: "Meeting");

			migrationBuilder.DropColumn(
				name: "StopedAt",
				table: "Meeting");

			migrationBuilder.InsertData(
				table: "User",
				columns: new[] { "Id", "CreatedAt", "Email", "FullName", "IsActive", "LastLoginAt", "LastPasswordChangeAt", "Password", "PictureUrl", "Role" },
				values: new object[] { new Guid("edada1f7-cbda-4c13-8504-a57fe72d5960"), new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "mha.karimi@gmail.com", "Mohammad Karimi", true, null, null, "0PVQk0Qiwb8gY3iUipZQKhBQgDMJ/1PJfmIDhG5hbrA=", "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo", (byte)0 });
		}
	}
}
