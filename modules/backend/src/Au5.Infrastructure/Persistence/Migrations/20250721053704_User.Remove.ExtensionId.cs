using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class UserRemoveExtensionId : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropColumn(
				name: "ExtensionId",
				table: "User");

			migrationBuilder.AddColumn<string>(
				name: "FullName",
				table: "Entry",
				type: "varchar(200)",
				unicode: false,
				maxLength: 200,
				nullable: true);
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropColumn(
				name: "FullName",
				table: "Entry");

			migrationBuilder.AddColumn<Guid>(
				name: "ExtensionId",
				table: "User",
				type: "uniqueidentifier",
				nullable: false,
				defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
		}
	}
}
