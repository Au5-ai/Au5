using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAssistantID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AIContents_Assistant_AssistantId1",
                table: "AIContents");

            migrationBuilder.DropIndex(
                name: "IX_AIContents_AssistantId1",
                table: "AIContents");

            migrationBuilder.DropColumn(
                name: "AssistantId1",
                table: "AIContents");

            migrationBuilder.RenameColumn(
                name: "AssistantId",
                table: "AIContents",
                newName: "TotalTokens");

            migrationBuilder.AddColumn<int>(
                name: "CompletionTokens",
                table: "AIContents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PromptTokens",
                table: "AIContents",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletionTokens",
                table: "AIContents");

            migrationBuilder.DropColumn(
                name: "PromptTokens",
                table: "AIContents");

            migrationBuilder.RenameColumn(
                name: "TotalTokens",
                table: "AIContents",
                newName: "AssistantId");

            migrationBuilder.AddColumn<Guid>(
                name: "AssistantId1",
                table: "AIContents",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AIContents_AssistantId1",
                table: "AIContents",
                column: "AssistantId1");

            migrationBuilder.AddForeignKey(
                name: "FK_AIContents_Assistant_AssistantId1",
                table: "AIContents",
                column: "AssistantId1",
                principalTable: "Assistant",
                principalColumn: "Id");
        }
    }
}
