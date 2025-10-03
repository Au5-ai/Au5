using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCreatedAtUpdatedAtFromSpace : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Space");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Space");

            migrationBuilder.AddColumn<bool>(
                name: "IsAdmin",
                table: "UserSpace",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAdmin",
                table: "UserSpace");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Space",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Space",
                type: "datetime2",
                nullable: true);
        }
    }
}
