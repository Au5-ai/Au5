using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAIContentEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AIContents");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AIContents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AssistantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MeetingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompletionTokens = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PromptTokens = table.Column<int>(type: "int", nullable: false),
                    TotalTokens = table.Column<int>(type: "int", nullable: false)
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
        }
    }
}
