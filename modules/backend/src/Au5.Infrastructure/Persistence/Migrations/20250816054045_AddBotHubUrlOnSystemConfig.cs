using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBotHubUrlOnSystemConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BotHubUrl",
                table: "SystemConfig",
                type: "varchar(200)",
                unicode: false,
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BotHubUrl",
                table: "SystemConfig");
        }
    }
}
