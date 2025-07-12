using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class ReactionConfig : IEntityTypeConfiguration<Reaction>
{
	public void Configure(EntityTypeBuilder<Reaction> builder)
	{
		builder.HasKey(t => t.Id)
			.HasName("PK_dbo_Reaction");

		builder.Property(r => r.Type)
			.IsRequired()
			.HasMaxLength(100);

		builder.Property(r => r.Emoji)
			.IsRequired()
			.HasMaxLength(10);

		builder.Property(r => r.ClassName)
			.IsRequired()
			.HasMaxLength(100);
	}
}
