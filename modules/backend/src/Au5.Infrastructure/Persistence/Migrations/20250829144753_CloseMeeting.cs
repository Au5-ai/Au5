using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CloseMeeting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StopedAt",
                table: "Meeting",
                newName: "ClosedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ClosedAt",
                table: "Meeting",
                newName: "StopedAt");
        }
    }
}
