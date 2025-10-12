using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddLLMModelToConfig : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AddColumn<string>(
				name: "LLMModel",
				table: "SystemConfig",
				type: "varchar(50)",
				unicode: false,
				maxLength: 50,
				nullable: false,
				defaultValue: string.Empty);
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropColumn(
				name: "LLMModel",
				table: "SystemConfig");
		}
	}
}
