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
				name: "Menus",
				columns: table => new
				{
					Id = table.Column<int>(type: "int", nullable: false)
						.Annotation("SqlServer:Identity", "1, 1"),
					Title = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
					Url = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					Icon = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
					ParentId = table.Column<int>(type: "int", nullable: true),
					SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
					IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_Menus", x => x.Id);
					table.ForeignKey(
						name: "FK_Menus_Menus_ParentId",
						column: x => x.ParentId,
						principalTable: "Menus",
						principalColumn: "Id");
				});

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
				name: "Space",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					Name = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
					Description = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
					IsActive = table.Column<bool>(type: "bit", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_Space", x => x.Id);
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
					BotFatherUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false),
					BotHubUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					AIProviderUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false),
					OpenAIToken = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false),
					OpenAIProxyUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					PanelUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false),
					AutoLeaveWaitingEnter = table.Column<int>(type: "int", nullable: false),
					AutoLeaveNoParticipant = table.Column<int>(type: "int", nullable: false),
					AutoLeaveAllParticipantsLeft = table.Column<int>(type: "int", nullable: false),
					MeetingVideoRecording = table.Column<bool>(type: "bit", nullable: false),
					MeetingAudioRecording = table.Column<bool>(type: "bit", nullable: false),
					MeetingTranscription = table.Column<bool>(type: "bit", nullable: false),
					MeetingTranscriptionModel = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
					SmtpHost = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
					SmtpPassword = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
					SmtpPort = table.Column<int>(type: "int", nullable: false),
					SmtpUser = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
					SmtpUseSSl = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
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
					IsActive = table.Column<bool>(type: "bit", nullable: false),
					CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
					LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
					LastPasswordChangeAt = table.Column<DateTime>(type: "datetime2", nullable: true),
					Role = table.Column<byte>(type: "tinyint", nullable: false),
					Status = table.Column<int>(type: "int", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_User", x => x.Id);
				});

			migrationBuilder.CreateTable(
				name: "RoleMenus",
				columns: table => new
				{
					RoleType = table.Column<byte>(type: "tinyint", nullable: false),
					MenuId = table.Column<int>(type: "int", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_RoleMenus", x => new { x.RoleType, x.MenuId });
					table.ForeignKey(
						name: "FK_RoleMenus_Menus_MenuId",
						column: x => x.MenuId,
						principalTable: "Menus",
						principalColumn: "Id");
				});

			migrationBuilder.CreateTable(
				name: "Assistant",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
					Icon = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
					Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
					Instructions = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
					LLMModel = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
					OpenAIAssistantId = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
					UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					IsDefault = table.Column<bool>(type: "bit", nullable: false),
					IsActive = table.Column<bool>(type: "bit", nullable: false),
					CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_Assistant", x => x.Id);
					table.ForeignKey(
						name: "FK_Assistant_User_UserId",
						column: x => x.UserId,
						principalTable: "User",
						principalColumn: "Id");
				});

			migrationBuilder.CreateTable(
				name: "Meeting",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					MeetId = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					MeetName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
					ClosedMeetingUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					BotInviterUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					HashToken = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
					Platform = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
					BotName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
					IsBotAdded = table.Column<bool>(type: "bit", nullable: false),
					CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
					ClosedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
					Duration = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					Status = table.Column<byte>(type: "tinyint", nullable: false),
					IsFavorite = table.Column<bool>(type: "bit", nullable: false)
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
				name: "UserSpace",
				columns: table => new
				{
					UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					SpaceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
					IsAdmin = table.Column<bool>(type: "bit", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_UserSpace", x => new { x.UserId, x.SpaceId });
					table.ForeignKey(
						name: "FK_UserSpace_Space_SpaceId",
						column: x => x.SpaceId,
						principalTable: "Space",
						principalColumn: "Id");
					table.ForeignKey(
						name: "FK_UserSpace_User_UserId",
						column: x => x.UserId,
						principalTable: "User",
						principalColumn: "Id");
				});

			migrationBuilder.CreateTable(
				name: "AIContents",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					MeetingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					AssistantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					Content = table.Column<string>(type: "nvarchar(max)", maxLength: 200, nullable: false),
					CompletionTokens = table.Column<int>(type: "int", nullable: false),
					PromptTokens = table.Column<int>(type: "int", nullable: false),
					TotalTokens = table.Column<int>(type: "int", nullable: false),
					CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
					IsActive = table.Column<bool>(type: "bit", nullable: false),
					RemoverUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_AIContents", x => x.Id);
					table.ForeignKey(
						name: "FK_AIContents_Assistant_AssistantId",
						column: x => x.AssistantId,
						principalTable: "Assistant",
						principalColumn: "Id");
					table.ForeignKey(
						name: "FK_AIContents_Meeting_MeetingId",
						column: x => x.MeetingId,
						principalTable: "Meeting",
						principalColumn: "Id");
					table.ForeignKey(
						name: "FK_AIContents_User_UserId",
						column: x => x.UserId,
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
					EntryType = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: true),
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
				name: "GuestsInMeeting",
				columns: table => new
				{
					Id = table.Column<int>(type: "int", nullable: false)
						.Annotation("SqlServer:Identity", "1, 1"),
					MeetingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					FullName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
					PictureUrl = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_GuestsInMeeting", x => x.Id);
					table.ForeignKey(
						name: "FK_GuestsInMeeting_Meeting_MeetingId",
						column: x => x.MeetingId,
						principalTable: "Meeting",
						principalColumn: "Id");
				});

			migrationBuilder.CreateTable(
				name: "MeetingSpace",
				columns: table => new
				{
					MeetingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					SpaceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
					UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_MeetingSpace", x => new { x.MeetingId, x.SpaceId });
					table.ForeignKey(
						name: "FK_MeetingSpace_Meeting_MeetingId",
						column: x => x.MeetingId,
						principalTable: "Meeting",
						principalColumn: "Id");
					table.ForeignKey(
						name: "FK_MeetingSpace_Space_SpaceId",
						column: x => x.SpaceId,
						principalTable: "Space",
						principalColumn: "Id");
					table.ForeignKey(
						name: "FK_MeetingSpace_User_UserId",
						column: x => x.UserId,
						principalTable: "User",
						principalColumn: "Id");
				});

			migrationBuilder.CreateTable(
				name: "ParticipantInMeeting",
				columns: table => new
				{
					Id = table.Column<int>(type: "int", nullable: false)
						.Annotation("SqlServer:Identity", "1, 1"),
					MeetingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_ParticipantInMeeting", x => x.Id);
					table.ForeignKey(
						name: "FK_ParticipantInMeeting_Meeting_MeetingId",
						column: x => x.MeetingId,
						principalTable: "Meeting",
						principalColumn: "Id");
					table.ForeignKey(
						name: "FK_ParticipantInMeeting_User_UserId",
						column: x => x.UserId,
						principalTable: "User",
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
				table: "Menus",
				columns: new[] { "Id", "Icon", "IsActive", "ParentId", "SortOrder", "Title", "Url" },
				values: new object[,]
				{
					{ 100, "ClosedCaption", true, null, 1, "My Meetings", "/meetings/my" },
					{ 200, "ArchiveIcon", true, null, 2, "Archived Transcripts", "/meetings/archived" },
					{ 300, "Brain", true, null, 3, "AI Tools", "/assistants" },
					{ 400, "Settings", true, null, 4, "System Settings", "/system" },
					{ 500, "UserPlus", true, null, 5, "User Management", "/users" },
					{ 600, "Frame", true, null, 6, "Spaces", "/spaces" }
				});

			migrationBuilder.InsertData(
				table: "Reaction",
				columns: new[] { "Id", "ClassName", "Emoji", "IsActive", "Type" },
				values: new object[,]
				{
					{ 1, "reaction-task bg-blue-100 text-blue-700 border-blue-200", "⚡", false, "Task" },
					{ 2, "reaction-important bg-amber-100 text-amber-700 border-amber-200", "⭐", false, "GoodPoint" },
					{ 3, "reaction-bug bg-rose-100 text-rose-700 border-rose-200", "🐞", false, "Bug" }
				});

			migrationBuilder.InsertData(
				table: "RoleMenus",
				columns: new[] { "MenuId", "RoleType" },
				values: new object[,]
				{
					{ 300, (byte)1 },
					{ 400, (byte)1 },
					{ 500, (byte)1 },
					{ 600, (byte)1 },
					{ 100, (byte)2 },
					{ 200, (byte)2 },
					{ 300, (byte)2 }
				});

			migrationBuilder.CreateIndex(
				name: "IX_AIContents_AssistantId",
				table: "AIContents",
				column: "AssistantId");

			migrationBuilder.CreateIndex(
				name: "IX_AIContents_MeetingId",
				table: "AIContents",
				column: "MeetingId");

			migrationBuilder.CreateIndex(
				name: "IX_AIContents_UserId",
				table: "AIContents",
				column: "UserId");

			migrationBuilder.CreateIndex(
				name: "IX_AppliedReactions_EntryId",
				table: "AppliedReactions",
				column: "EntryId");

			migrationBuilder.CreateIndex(
				name: "IX_AppliedReactions_ReactionId",
				table: "AppliedReactions",
				column: "ReactionId");

			migrationBuilder.CreateIndex(
				name: "IX_Assistant_UserId",
				table: "Assistant",
				column: "UserId");

			migrationBuilder.CreateIndex(
				name: "IX_Entry_MeetingId",
				table: "Entry",
				column: "MeetingId");

			migrationBuilder.CreateIndex(
				name: "IX_GuestsInMeeting_MeetingId",
				table: "GuestsInMeeting",
				column: "MeetingId");

			migrationBuilder.CreateIndex(
				name: "IX_Meeting_BotInviterUserId",
				table: "Meeting",
				column: "BotInviterUserId");

			migrationBuilder.CreateIndex(
				name: "IX_MeetingSpace_SpaceId",
				table: "MeetingSpace",
				column: "SpaceId");

			migrationBuilder.CreateIndex(
				name: "IX_MeetingSpace_UserId",
				table: "MeetingSpace",
				column: "UserId");

			migrationBuilder.CreateIndex(
				name: "IX_Menus_ParentId",
				table: "Menus",
				column: "ParentId");

			migrationBuilder.CreateIndex(
				name: "IX_ParticipantInMeeting_MeetingId",
				table: "ParticipantInMeeting",
				column: "MeetingId");

			migrationBuilder.CreateIndex(
				name: "IX_ParticipantInMeeting_UserId",
				table: "ParticipantInMeeting",
				column: "UserId");

			migrationBuilder.CreateIndex(
				name: "IX_RoleMenus_MenuId",
				table: "RoleMenus",
				column: "MenuId");

			migrationBuilder.CreateIndex(
				name: "IX_User_Email",
				table: "User",
				column: "Email",
				unique: true);

			migrationBuilder.CreateIndex(
				name: "IX_UserSpace_SpaceId",
				table: "UserSpace",
				column: "SpaceId");
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropTable(
				name: "AIContents");

			migrationBuilder.DropTable(
				name: "AppliedReactions");

			migrationBuilder.DropTable(
				name: "GuestsInMeeting");

			migrationBuilder.DropTable(
				name: "MeetingSpace");

			migrationBuilder.DropTable(
				name: "ParticipantInMeeting");

			migrationBuilder.DropTable(
				name: "RoleMenus");

			migrationBuilder.DropTable(
				name: "SystemConfig");

			migrationBuilder.DropTable(
				name: "UserSpace");

			migrationBuilder.DropTable(
				name: "Assistant");

			migrationBuilder.DropTable(
				name: "Entry");

			migrationBuilder.DropTable(
				name: "Reaction");

			migrationBuilder.DropTable(
				name: "Menus");

			migrationBuilder.DropTable(
				name: "Space");

			migrationBuilder.DropTable(
				name: "Meeting");

			migrationBuilder.DropTable(
				name: "User");
		}
	}
}
