using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Au5.Infrastructure.Migrations
{
	/// <inheritdoc />
	public partial class AddSomeFieldInSystemConfig : Migration
	{
		/// <inheritdoc />
		protected override void Up(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.AddColumn<int>(
				name: "AutoLeaveAllParticipantsLeft",
				table: "SystemConfig",
				type: "int",
				nullable: false,
				defaultValue: 0);

			migrationBuilder.AddColumn<int>(
				name: "AutoLeaveNoParticipant",
				table: "SystemConfig",
				type: "int",
				nullable: false,
				defaultValue: 0);

			migrationBuilder.AddColumn<int>(
				name: "AutoLeaveWaitingEnter",
				table: "SystemConfig",
				type: "int",
				nullable: false,
				defaultValue: 0);

			migrationBuilder.AddColumn<bool>(
				name: "MeetingAudioRecording",
				table: "SystemConfig",
				type: "bit",
				nullable: false,
				defaultValue: false);

			migrationBuilder.AddColumn<bool>(
				name: "MeetingTranscription",
				table: "SystemConfig",
				type: "bit",
				nullable: false,
				defaultValue: false);

			migrationBuilder.AddColumn<string>(
				name: "MeetingTranscriptionModel",
				table: "SystemConfig",
				type: "varchar(20)",
				unicode: false,
				maxLength: 20,
				nullable: false,
				defaultValue: string.Empty);

			migrationBuilder.AddColumn<bool>(
				name: "MeetingVideoRecording",
				table: "SystemConfig",
				type: "bit",
				nullable: false,
				defaultValue: false);
		}

		/// <inheritdoc />
		protected override void Down(MigrationBuilder migrationBuilder)
		{
			migrationBuilder.DropColumn(
				name: "AutoLeaveAllParticipantsLeft",
				table: "SystemConfig");

			migrationBuilder.DropColumn(
				name: "AutoLeaveNoParticipant",
				table: "SystemConfig");

			migrationBuilder.DropColumn(
				name: "AutoLeaveWaitingEnter",
				table: "SystemConfig");

			migrationBuilder.DropColumn(
				name: "MeetingAudioRecording",
				table: "SystemConfig");

			migrationBuilder.DropColumn(
				name: "MeetingTranscription",
				table: "SystemConfig");

			migrationBuilder.DropColumn(
				name: "MeetingTranscriptionModel",
				table: "SystemConfig");

			migrationBuilder.DropColumn(
				name: "MeetingVideoRecording",
				table: "SystemConfig");
		}
	}
}
