using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddSmtpHost : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AddColumn<string>(
				name: "SmtpHost",
				table: "SystemConfig",
				type: "varchar(50)",
				unicode: false,
				maxLength: 50,
				nullable: false,
				defaultValue: string.Empty);

			migrationBuilder.AddColumn<string>(
				name: "SmtpPassword",
				table: "SystemConfig",
				type: "varchar(100)",
				unicode: false,
				maxLength: 100,
				nullable: false,
				defaultValue: string.Empty);

			migrationBuilder.AddColumn<int>(
				name: "SmtpPort",
				table: "SystemConfig",
				type: "int",
				nullable: false,
				defaultValue: 0);

			migrationBuilder.AddColumn<string>(
				name: "SmtpUser",
				table: "SystemConfig",
				type: "varchar(50)",
				unicode: false,
				maxLength: 50,
				nullable: false,
				defaultValue: string.Empty);
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropColumn(
				name: "SmtpHost",
				table: "SystemConfig");

			migrationBuilder.DropColumn(
				name: "SmtpPassword",
				table: "SystemConfig");

			migrationBuilder.DropColumn(
				name: "SmtpPort",
				table: "SystemConfig");

			migrationBuilder.DropColumn(
				name: "SmtpUser",
				table: "SystemConfig");
		}
	}
}
