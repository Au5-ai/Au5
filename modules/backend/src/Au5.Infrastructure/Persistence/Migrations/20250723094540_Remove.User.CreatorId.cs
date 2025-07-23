using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class RemoveUserCreatorId : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropForeignKey(
				name: "FK_Meeting_User_CreatorUserId",
				table: "Meeting");

			migrationBuilder.DropIndex(
				name: "IX_Meeting_CreatorUserId",
				table: "Meeting");

			migrationBuilder.DropColumn(
				name: "CreatorUserId",
				table: "Meeting");

			migrationBuilder.CreateIndex(
				name: "IX_Meeting_BotInviterUserId",
				table: "Meeting",
				column: "BotInviterUserId");

			migrationBuilder.CreateIndex(
				name: "IX_AppliedReactions_ReactionId",
				table: "AppliedReactions",
				column: "ReactionId");

			migrationBuilder.AddForeignKey(
				name: "FK_AppliedReactions_Reaction_ReactionId",
				table: "AppliedReactions",
				column: "ReactionId",
				principalTable: "Reaction",
				principalColumn: "Id");

			migrationBuilder.AddForeignKey(
				name: "FK_Meeting_User_BotInviterUserId",
				table: "Meeting",
				column: "BotInviterUserId",
				principalTable: "User",
				principalColumn: "Id");
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropForeignKey(
				name: "FK_AppliedReactions_Reaction_ReactionId",
				table: "AppliedReactions");

			migrationBuilder.DropForeignKey(
				name: "FK_Meeting_User_BotInviterUserId",
				table: "Meeting");

			migrationBuilder.DropIndex(
				name: "IX_Meeting_BotInviterUserId",
				table: "Meeting");

			migrationBuilder.DropIndex(
				name: "IX_AppliedReactions_ReactionId",
				table: "AppliedReactions");

			migrationBuilder.AddColumn<Guid>(
				name: "CreatorUserId",
				table: "Meeting",
				type: "uniqueidentifier",
				nullable: false,
				defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

			migrationBuilder.CreateIndex(
				name: "IX_Meeting_CreatorUserId",
				table: "Meeting",
				column: "CreatorUserId");

			migrationBuilder.AddForeignKey(
				name: "FK_Meeting_User_CreatorUserId",
				table: "Meeting",
				column: "CreatorUserId",
				principalTable: "User",
				principalColumn: "Id");
		}
	}
}
