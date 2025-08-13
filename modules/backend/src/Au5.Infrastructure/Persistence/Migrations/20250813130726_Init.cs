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
					Type = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
					Emoji = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
					ClassName = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
					IsActive = table.Column<bool>(type: "bit", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_Reaction", x => x.Id);
				});

			migrationBuilder.CreateTable(
				name: "SystemConfig",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					OrganizationName = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
					BotName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
					HubUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false),
					Direction = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
					Language = table.Column<string>(type: "varchar(5)", unicode: false, maxLength: 5, nullable: false),
					ServiceBaseUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false),
					OpenAIToken = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false),
					PanelUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_SystemConfig", x => x.Id);
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
					MeetName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
					BotInviterUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					HashToken = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
					Platform = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
					BotName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
					IsBotAdded = table.Column<bool>(type: "bit", nullable: false),
					CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
					Status = table.Column<int>(type: "int", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_Meeting", x => x.Id);
					table.ForeignKey(
						name: "FK_Meeting_User_BotInviterUserId",
						column: x => x.BotInviterUserId,
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
					FullName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
					Content = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
					Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
					Timeline = table.Column<string>(type: "varchar(8)", unicode: false, maxLength: 8, nullable: true),
					EntryType = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
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
					FullName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
					PictureUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_ParticipantInMeeting", x => x.Id);
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
					Participants = table.Column<string>(type: "nvarchar(max)", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_AppliedReactions", x => x.Id);
					table.ForeignKey(
						name: "FK_AppliedReactions_Entry_EntryId",
						column: x => x.EntryId,
						principalTable: "Entry",
						principalColumn: "Id");
					table.ForeignKey(
						name: "FK_AppliedReactions_Reaction_ReactionId",
						column: x => x.ReactionId,
						principalTable: "Reaction",
						principalColumn: "Id");
				});

			migrationBuilder.InsertData(
				table: "Reaction",
				columns: new[] { "Id", "ClassName", "Emoji", "IsActive", "Type" },
				values: new object[,]
				{
					{ 1, "reaction-task", "⚡", false, "Task" },
					{ 2, "reaction-important", "⭐", false, "GoodPoint" },
					{ 3, "reaction-question", "🎯", false, "Goal" }
				});

			migrationBuilder.InsertData(
				table: "User",
				columns: new[] { "Id", "Email", "FullName", "IsActive", "Password", "PictureUrl" },
				values: new object[] { new Guid("edada1f7-cbda-4c13-8504-a57fe72d5960"), "mha.karimi@gmail.com", "Mohammad Karimi", true, "0PVQk0Qiwb8gY3iUipZQKhBQgDMJ/1PJfmIDhG5hbrA=", "https://lh3.googleusercontent.com/ogw/AF2bZyiAms4ctDeBjEnl73AaUCJ9KbYj2alS08xcAYgAJhETngQ=s64-c-mo" });

			migrationBuilder.CreateIndex(
				name: "IX_AppliedReactions_EntryId",
				table: "AppliedReactions",
				column: "EntryId");

			migrationBuilder.CreateIndex(
				name: "IX_AppliedReactions_ReactionId",
				table: "AppliedReactions",
				column: "ReactionId");

			migrationBuilder.CreateIndex(
				name: "IX_Entry_MeetingId",
				table: "Entry",
				column: "MeetingId");

			migrationBuilder.CreateIndex(
				name: "IX_Meeting_BotInviterUserId",
				table: "Meeting",
				column: "BotInviterUserId");

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
				name: "SystemConfig");

			migrationBuilder.DropTable(
				name: "Entry");

			migrationBuilder.DropTable(
				name: "Reaction");

			migrationBuilder.DropTable(
				name: "Meeting");

			migrationBuilder.DropTable(
				name: "User");
		}
	}
}
