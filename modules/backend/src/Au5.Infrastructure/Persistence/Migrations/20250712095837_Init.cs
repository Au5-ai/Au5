using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class Init : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.CreateTable(
				name: "Reaction",
				columns: table => new
				{
					Id = table.Column<int>(type: "int", nullable: false)
						.Annotation("SqlServer:Identity", "1, 1"),
					Type = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					Emoji = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					ClassName = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_Reaction", x => x.Id);
				});

			migrationBuilder.CreateTable(
				name: "User",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					FullName = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
					PictureUrl = table.Column<string>(type: "varchar(250)", unicode: false, maxLength: 250, nullable: true),
					Email = table.Column<string>(type: "varchar(75)", unicode: false, maxLength: 75, nullable: false),
					Password = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: false),
					IsActive = table.Column<bool>(type: "bit", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_User", x => x.Id);
				});

			migrationBuilder.CreateTable(
				name: "Meeting",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					MeetId = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					CreatorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					BotInviterUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					HashToken = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					Platform = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					BotName = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					IsBotAdded = table.Column<bool>(type: "bit", nullable: false),
					CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
					Status = table.Column<int>(type: "int", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_Meeting", x => x.Id);
					table.ForeignKey(
						name: "FK_Meeting_User_CreatorUserId",
						column: x => x.CreatorUserId,
						principalTable: "User",
						principalColumn: "Id");
				});

			migrationBuilder.CreateTable(
				name: "Entry",
				columns: table => new
				{
					Id = table.Column<int>(type: "int", nullable: false)
						.Annotation("SqlServer:Identity", "1, 1"),
					BlockId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					ParticipantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					Content = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
					Timeline = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					EntryType = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					MeetingId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_Entry", x => x.Id);
					table.ForeignKey(
						name: "FK_Entry_Meeting_MeetingId",
						column: x => x.MeetingId,
						principalTable: "Meeting",
						principalColumn: "Id");
				});

			migrationBuilder.CreateTable(
				name: "ParticipantInMeeting",
				columns: table => new
				{
					Id = table.Column<int>(type: "int", nullable: false)
						.Annotation("SqlServer:Identity", "1, 1"),
					MeetingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					FullName = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					PictureUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_ParticipantInMeeting", x => x.Id);
					table.ForeignKey(
						name: "FK_ParticipantInMeeting_Meeting_MeetingId",
						column: x => x.MeetingId,
						principalTable: "Meeting",
						principalColumn: "Id");
				});

			migrationBuilder.CreateTable(
				name: "AppliedReactions",
				columns: table => new
				{
					Id = table.Column<int>(type: "int", nullable: false)
						.Annotation("SqlServer:Identity", "1, 1"),
					EntryId = table.Column<int>(type: "int", nullable: false),
					ReactionId = table.Column<int>(type: "int", nullable: false),
					Users = table.Column<string>(type: "nvarchar(max)", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_AppliedReactions", x => x.Id);
					table.ForeignKey(
						name: "FK_AppliedReactions_Entry_EntryId",
						column: x => x.EntryId,
						principalTable: "Entry",
						principalColumn: "Id");
				});

			migrationBuilder.CreateIndex(
				name: "IX_AppliedReactions_EntryId",
				table: "AppliedReactions",
				column: "EntryId");

			migrationBuilder.CreateIndex(
				name: "IX_Entry_MeetingId",
				table: "Entry",
				column: "MeetingId");

			migrationBuilder.CreateIndex(
				name: "IX_Meeting_CreatorUserId",
				table: "Meeting",
				column: "CreatorUserId");

			migrationBuilder.CreateIndex(
				name: "IX_ParticipantInMeeting_MeetingId",
				table: "ParticipantInMeeting",
				column: "MeetingId");

			migrationBuilder.CreateIndex(
				name: "IX_User_Email",
				table: "User",
				column: "Email",
				unique: true);
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropTable(
				name: "AppliedReactions");

			migrationBuilder.DropTable(
				name: "ParticipantInMeeting");

			migrationBuilder.DropTable(
				name: "Reaction");

			migrationBuilder.DropTable(
				name: "Entry");

			migrationBuilder.DropTable(
				name: "Meeting");

			migrationBuilder.DropTable(
				name: "User");
		}
	}
}
