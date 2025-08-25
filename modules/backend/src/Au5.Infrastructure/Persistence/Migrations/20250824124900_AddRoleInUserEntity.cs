using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddRoleInUserEntity : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AddColumn<DateTime>(
				name: "CreatedAt",
				table: "User",
				type: "datetime2",
				nullable: false,
				defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

			migrationBuilder.AddColumn<DateTime>(
				name: "LastLoginAt",
				table: "User",
				type: "datetime2",
				nullable: true);

			migrationBuilder.AddColumn<DateTime>(
				name: "LastPasswordChangeAt",
				table: "User",
				type: "datetime2",
				nullable: true);

			migrationBuilder.AddColumn<byte>(
				name: "Role",
				table: "User",
				type: "tinyint",
				nullable: false,
				defaultValue: (byte)0);

			migrationBuilder.UpdateData(
				table: "User",
				keyColumn: "Id",
				keyValue: new Guid("edada1f7-cbda-4c13-8504-a57fe72d5960"),
				columns: new[] { "CreatedAt", "LastLoginAt", "LastPasswordChangeAt", "Role" },
				values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, (byte)0 });
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropColumn(
				name: "CreatedAt",
				table: "User");

			migrationBuilder.DropColumn(
				name: "LastLoginAt",
				table: "User");

			migrationBuilder.DropColumn(
				name: "LastPasswordChangeAt",
				table: "User");

			migrationBuilder.DropColumn(
				name: "Role",
				table: "User");
		}
	}
}
