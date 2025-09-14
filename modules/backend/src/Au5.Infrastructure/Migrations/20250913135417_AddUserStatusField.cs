using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddUserStatusField : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AddColumn<int>(
				name: "Status",
				table: "User",
				type: "int",
				nullable: false,
				defaultValue: 0);

			migrationBuilder.UpdateData(
				table: "User",
				keyColumn: "Id",
				keyValue: new Guid("edada1f7-cbda-4c13-8504-a57fe72d5960"),
				column: "Status",
				value: 0);
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropColumn(
				name: "Status",
				table: "User");
		}
	}
}
