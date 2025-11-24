using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddBlackListEntity : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.CreateTable(
				name: "BlacklistedToken",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					UserId = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
					Jti = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
					ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
					BlacklistedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_BlacklistedToken", x => x.Id);
				});

			migrationBuilder.CreateIndex(
				name: "IX_BlacklistedToken_ExpiresAt",
				table: "BlacklistedToken",
				column: "ExpiresAt");

			migrationBuilder.CreateIndex(
				name: "IX_BlacklistedToken_UserId_Jti",
				table: "BlacklistedToken",
				columns: new[] { "UserId", "Jti" },
				unique: true);
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropTable(
				name: "BlacklistedToken");
		}
	}
}
