using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddAIContentsEntity : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.CreateTable(
				name: "AIContents",
				columns: table => new
				{
					Id = table.Column<int>(type: "int", nullable: false)
						.Annotation("SqlServer:Identity", "1, 1"),
					UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					MeetingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					AssistantId = table.Column<int>(type: "int", nullable: false),
					AssistantId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
					Content = table.Column<string>(type: "nvarchar(max)", maxLength: 200, nullable: false),
					CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_AIContents", x => x.Id);
					table.ForeignKey(
						name: "FK_AIContents_Assistant_AssistantId1",
						column: x => x.AssistantId1,
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

			migrationBuilder.CreateIndex(
				name: "IX_AIContents_AssistantId1",
				table: "AIContents",
				column: "AssistantId1");

			migrationBuilder.CreateIndex(
				name: "IX_AIContents_MeetingId",
				table: "AIContents",
				column: "MeetingId");

			migrationBuilder.CreateIndex(
				name: "IX_AIContents_UserId",
				table: "AIContents",
				column: "UserId");
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropTable(
				name: "AIContents");
		}
	}
}
