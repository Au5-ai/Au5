using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddAssistantEntity : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.CreateTable(
				name: "Assistant",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					Name = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false),
					Icon = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
					Description = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
					Prompt = table.Column<string>(type: "varchar(2000)", unicode: false, maxLength: 2000, nullable: true),
					IsDefault = table.Column<bool>(type: "bit", nullable: false),
					IsActive = table.Column<bool>(type: "bit", nullable: false),
					CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_Assistant", x => x.Id);
				});
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropTable(
				name: "Assistant");
		}
	}
}
