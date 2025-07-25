using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddCompanyEntity : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropPrimaryKey(
				name: "PK_AppliedReactions",
				table: "AppliedReactions");

			migrationBuilder.RenameColumn(
				name: "Users",
				table: "AppliedReactions",
				newName: "Participants");

			migrationBuilder.AddPrimaryKey(
				name: "PK_dbo_AppliedReactions",
				table: "AppliedReactions",
				column: "Id");

			migrationBuilder.CreateTable(
				name: "Company",
				columns: table => new
				{
					Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
					Name = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
					BotName = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
					HubUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false),
					Direction = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
					Language = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
					ServiceBaseUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false),
					PanelUrl = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: false)
				},
				constraints: table =>
				{
					table.PrimaryKey("PK_dbo_Company", x => x.Id);
				});
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropTable(
				name: "Company");

			migrationBuilder.DropPrimaryKey(
				name: "PK_dbo_AppliedReactions",
				table: "AppliedReactions");

			migrationBuilder.RenameColumn(
				name: "Participants",
				table: "AppliedReactions",
				newName: "Users");

			migrationBuilder.AddPrimaryKey(
				name: "PK_AppliedReactions",
				table: "AppliedReactions",
				column: "Id");
		}
	}
}
