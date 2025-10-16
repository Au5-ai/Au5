using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddNewMenuAndRole : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.InsertData(
				table: "Menus",
				columns: new[] { "Id", "Icon", "IsActive", "ParentId", "SortOrder", "Title", "Url" },
				values: new object[] { 600, "Frame", true, null, 6, "Spaces", "/spaces" });

			migrationBuilder.InsertData(
				table: "RoleMenus",
				columns: new[] { "MenuId", "RoleType" },
				values: new object[] { 600, (byte)1 });
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DeleteData(
				table: "RoleMenus",
				keyColumns: new[] { "MenuId", "RoleType" },
				keyValues: new object[] { 600, (byte)1 });

			migrationBuilder.DeleteData(
				table: "Menus",
				keyColumn: "Id",
				keyValue: 600);
		}
	}
}
