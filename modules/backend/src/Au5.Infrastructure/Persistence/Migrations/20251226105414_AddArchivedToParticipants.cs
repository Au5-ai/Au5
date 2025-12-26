using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddArchivedToParticipants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "ParticipantInMeeting",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsFavorite",
                table: "ParticipantInMeeting",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "ParticipantInMeeting");

            migrationBuilder.DropColumn(
                name: "IsFavorite",
                table: "ParticipantInMeeting");
        }
    }
}
