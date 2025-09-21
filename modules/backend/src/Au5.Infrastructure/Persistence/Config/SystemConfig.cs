using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class SystemDbConfig : IEntityTypeConfiguration<SystemConfig>
{
	public void Configure(EntityTypeBuilder<SystemConfig> builder)
	{
		builder.HasKey(t => t.Id)
			.HasName("PK_dbo_SystemConfig");

		builder.Property(t => t.OrganizationName)
			.IsRequired()
			.HasMaxLength(100);

		builder.Property(t => t.BotName)
			.IsUnicode(true)
			.IsRequired()
			.HasMaxLength(50);

		builder.Property(t => t.HubUrl)
			.IsRequired()
			.HasMaxLength(200);

		builder.Property(t => t.Direction)
			.IsRequired()
			.HasMaxLength(10);

		builder.Property(t => t.ServiceBaseUrl)
			.IsRequired()
			.HasMaxLength(200);

		builder.Property(t => t.BotFatherUrl)
			.IsRequired()
			.HasMaxLength(200);

		builder.Property(t => t.PanelUrl)
			.IsRequired()
			.HasMaxLength(200);

		builder.Property(t => t.OpenAIToken)
			.IsRequired()
			.HasMaxLength(200);

		builder.Property(t => t.OpenAIProxyUrl)
			.IsRequired(false)
			.HasMaxLength(200);

		builder.Property(t => t.Language)
			.IsRequired()
			.HasMaxLength(5);

		builder.Property(t => t.SmtpUser)
			.IsRequired()
			.HasMaxLength(50);

		builder.Property(t => t.SmtpHost)
			.IsRequired()
			.HasMaxLength(50);

		builder.Property(t => t.SmtpPassword)
			.IsRequired()
			.HasMaxLength(100);

		builder.Property(t => t.SmtpPort)
			.IsRequired();

		builder.Property(t => t.MeetingTranscriptionModel)
			.IsRequired()
			.HasMaxLength(20);

		builder.Property(t => t.SmtpUseSSl)
			.HasDefaultValue(false);
	}
}
