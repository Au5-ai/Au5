using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddAIProvider : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.RenameColumn(
				name: "Prompt",
				table: "Assistant",
				newName: "Instructions");

			migrationBuilder.AddColumn<string>(
				name: "AIProviderUrl",
				table: "SystemConfig",
				type: "varchar(200)",
				unicode: false,
				maxLength: 200,
				nullable: false,
				defaultValue: string.Empty);

			migrationBuilder.AlterColumn<string>(
				name: "OpenAIAssistantId",
				table: "Assistant",
				type: "varchar(100)",
				unicode: false,
				maxLength: 100,
				nullable: false,
				defaultValue: string.Empty,
				oldClrType: typeof(string),
				oldType: "varchar(100)",
				oldUnicode: false,
				oldMaxLength: 100,
				oldNullable: true);

			migrationBuilder.AddColumn<Guid>(
				name: "UserId",
				table: "Assistant",
				type: "uniqueidentifier",
				nullable: false,
				defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

			migrationBuilder.InsertData(
				table: "RoleMenus",
				columns: new[] { "MenuId", "RoleType" },
				values: new object[] { 300, (byte)2 });

			migrationBuilder.CreateIndex(
				name: "IX_Assistant_UserId",
				table: "Assistant",
				column: "UserId");

			migrationBuilder.AddForeignKey(
				name: "FK_Assistant_User_UserId",
				table: "Assistant",
				column: "UserId",
				principalTable: "User",
				principalColumn: "Id");
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropForeignKey(
				name: "FK_Assistant_User_UserId",
				table: "Assistant");

			migrationBuilder.DropIndex(
				name: "IX_Assistant_UserId",
				table: "Assistant");

			migrationBuilder.DeleteData(
				table: "RoleMenus",
				keyColumns: new[] { "MenuId", "RoleType" },
				keyValues: new object[] { 300, (byte)2 });

			migrationBuilder.DropColumn(
				name: "AIProviderUrl",
				table: "SystemConfig");

			migrationBuilder.DropColumn(
				name: "UserId",
				table: "Assistant");

			migrationBuilder.RenameColumn(
				name: "Instructions",
				table: "Assistant",
				newName: "Prompt");

			migrationBuilder.AlterColumn<string>(
				name: "OpenAIAssistantId",
				table: "Assistant",
				type: "varchar(100)",
				unicode: false,
				maxLength: 100,
				nullable: true,
				oldClrType: typeof(string),
				oldType: "varchar(100)",
				oldUnicode: false,
				oldMaxLength: 100);
		}
	}
}
