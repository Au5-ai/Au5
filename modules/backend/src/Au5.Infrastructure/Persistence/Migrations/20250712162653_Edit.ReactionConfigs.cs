using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class EditReactionConfigs : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropPrimaryKey(
				name: "PK_Reaction",
				table: "Reaction");

			migrationBuilder.AlterColumn<string>(
				name: "Type",
				table: "Reaction",
				type: "varchar(100)",
				unicode: false,
				maxLength: 100,
				nullable: false,
				defaultValue: string.Empty,
				oldClrType: typeof(string),
				oldType: "varchar(200)",
				oldUnicode: false,
				oldMaxLength: 200,
				oldNullable: true);

			migrationBuilder.AlterColumn<string>(
				name: "Emoji",
				table: "Reaction",
				type: "nvarchar(8)",
				unicode: true,
				maxLength: 8,
				nullable: false,
				collation: "Latin1_General_100_CI_AS_SC",
				defaultValue: string.Empty,
				oldClrType: typeof(string),
				oldType: "varchar(200)",
				oldUnicode: false,
				oldMaxLength: 200,
				oldNullable: true);

			migrationBuilder.AlterColumn<string>(
				name: "ClassName",
				table: "Reaction",
				type: "varchar(100)",
				unicode: false,
				maxLength: 100,
				nullable: false,
				defaultValue: string.Empty,
				oldClrType: typeof(string),
				oldType: "varchar(200)",
				oldUnicode: false,
				oldMaxLength: 200,
				oldNullable: true);

			migrationBuilder.AddPrimaryKey(
				name: "PK_dbo_Reaction",
				table: "Reaction",
				column: "Id");
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropPrimaryKey(
				name: "PK_dbo_Reaction",
				table: "Reaction");

			migrationBuilder.AlterColumn<string>(
				name: "Type",
				table: "Reaction",
				type: "varchar(200)",
				unicode: false,
				maxLength: 200,
				nullable: true,
				oldClrType: typeof(string),
				oldType: "varchar(100)",
				oldUnicode: false,
				oldMaxLength: 100);

			migrationBuilder.AlterColumn<string>(
				name: "Emoji",
				table: "Reaction",
				type: "varchar(200)",
				unicode: false,
				maxLength: 200,
				nullable: true,
				oldClrType: typeof(string),
				oldType: "varchar(10)",
				oldUnicode: false,
				oldMaxLength: 10);

			migrationBuilder.AlterColumn<string>(
				name: "ClassName",
				table: "Reaction",
				type: "varchar(200)",
				unicode: false,
				maxLength: 200,
				nullable: true,
				oldClrType: typeof(string),
				oldType: "varchar(100)",
				oldUnicode: false,
				oldMaxLength: 100);

			migrationBuilder.AddPrimaryKey(
				name: "PK_Reaction",
				table: "Reaction",
				column: "Id");
		}
	}
}
