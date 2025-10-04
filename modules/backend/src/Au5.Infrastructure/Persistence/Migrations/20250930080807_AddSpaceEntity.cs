using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddSpaceEntity : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.CreateTable(
				name: "Space",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					Name = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
					Description = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
					CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
					UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
					IsActive = table.Column<bool>(type: "bit", nullable: false),
					ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_Space", x => x.Id);
					table.ForeignKey(
						name: "FK_Space_Space_ParentId",
						column: x => x.ParentId,
						principalTable: "Space",
						principalColumn: "Id");
				});

			migrationBuilder.CreateTable(
				name: "UserSpace",
				columns: table => new
				{
					UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					SpaceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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

			migrationBuilder.CreateIndex(
				name: "IX_Space_ParentId",
				table: "Space",
				column: "ParentId");

			migrationBuilder.CreateIndex(
				name: "IX_UserSpace_SpaceId",
				table: "UserSpace",
				column: "SpaceId");
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropTable(
				name: "UserSpace");

			migrationBuilder.DropTable(
				name: "Space");
		}
	}
}
