using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddAssistantId : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AddColumn<Guid>(
				name: "AssistantId",
				table: "AIContents",
				type: "uniqueidentifier",
				nullable: false,
				defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

			migrationBuilder.CreateIndex(
				name: "IX_AIContents_AssistantId",
				table: "AIContents",
				column: "AssistantId");

			migrationBuilder.AddForeignKey(
				name: "FK_AIContents_Assistant_AssistantId",
				table: "AIContents",
				column: "AssistantId",
				principalTable: "Assistant",
				principalColumn: "Id");
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropForeignKey(
				name: "FK_AIContents_Assistant_AssistantId",
				table: "AIContents");

			migrationBuilder.DropIndex(
				name: "IX_AIContents_AssistantId",
				table: "AIContents");

			migrationBuilder.DropColumn(
				name: "AssistantId",
				table: "AIContents");
		}
	}
}
