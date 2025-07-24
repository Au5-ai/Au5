using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class CompanyConfig : IEntityTypeConfiguration<Company>
{
	public void Configure(EntityTypeBuilder<Company> builder)
	{
		builder.HasKey(t => t.Id)
			.HasName("PK_dbo_Company");

		builder.Property(t => t.Name)
			.IsRequired()
			.HasMaxLength(100);

		builder.Property(t => t.BotName)
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

		builder.Property(t => t.PanelUrl)
			.IsRequired()
			.HasMaxLength(200);

		builder.Property(t => t.Language)
			.IsRequired()
			.HasMaxLength(10);
	}
}
