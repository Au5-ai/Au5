using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class AssistantConfig : IEntityTypeConfiguration<Assistant>
{
	public void Configure(EntityTypeBuilder<Assistant> builder)
	{
		builder.HasKey(x => x.Id);
		builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
		builder.Property(x => x.Icon).HasMaxLength(200);
		builder.Property(x => x.Description).HasMaxLength(500);
		builder.Property(x => x.Prompt).HasMaxLength(2000);
		builder.Property(x => x.IsDefault).IsRequired();
		builder.Property(x => x.IsActive).IsRequired();
		builder.Property(x => x.CreatedAt).IsRequired();
	}
}
