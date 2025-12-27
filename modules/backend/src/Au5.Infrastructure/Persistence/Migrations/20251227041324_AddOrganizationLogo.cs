using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddOrganizationLogo : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AlterColumn<bool>(
				name: "IsFavorite",
				table: "ParticipantInMeeting",
				type: "bit",
				nullable: false,
				defaultValue: false,
				oldClrType: typeof(bool),
				oldType: "bit");

			migrationBuilder.AddColumn<string>(
				name: "LogoAddress",
				table: "Organization",
				type: "varchar(250)",
				unicode: false,
				maxLength: 250,
				nullable: false,
				defaultValue: string.Empty);
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropColumn(
				name: "LogoAddress",
				table: "Organization");

			migrationBuilder.AlterColumn<bool>(
				name: "IsFavorite",
				table: "ParticipantInMeeting",
				type: "bit",
				nullable: false,
				oldClrType: typeof(bool),
				oldType: "bit",
				oldDefaultValue: false);
		}
	}
}
