using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangePKInMeetingSpace : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_dbo_MeetingSpace",
                table: "MeetingSpace");

            migrationBuilder.DropIndex(
                name: "IX_MeetingSpace_MeetingId",
                table: "MeetingSpace");

            migrationBuilder.AddPrimaryKey(
                name: "PK_dbo_MeetingSpace",
                table: "MeetingSpace",
                columns: new[] { "MeetingId", "SpaceId" });

            migrationBuilder.CreateIndex(
                name: "IX_MeetingSpace_UserId",
                table: "MeetingSpace",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_dbo_MeetingSpace",
                table: "MeetingSpace");

            migrationBuilder.DropIndex(
                name: "IX_MeetingSpace_UserId",
                table: "MeetingSpace");

            migrationBuilder.AddPrimaryKey(
                name: "PK_dbo_MeetingSpace",
                table: "MeetingSpace",
                columns: new[] { "UserId", "SpaceId" });

            migrationBuilder.CreateIndex(
                name: "IX_MeetingSpace_MeetingId",
                table: "MeetingSpace",
                column: "MeetingId");
        }
    }
}
