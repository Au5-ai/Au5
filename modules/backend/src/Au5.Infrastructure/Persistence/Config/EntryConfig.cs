using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class EntryConfig : IEntityTypeConfiguration<Entry>
{
	public void Configure(EntityTypeBuilder<Entry> builder)
	{
		builder.HasKey(t => t.Id)
			.HasName("PK_dbo_Entry");

		builder.Property(e => e.BlockId)
			.IsRequired();

		builder.Property(b => b.Content)
			.IsRequired()
			.IsUnicode(true)
			.HasMaxLength(4000);

		builder.Property(e => e.FullName)
			.IsUnicode(true)
			.HasMaxLength(50);

		builder.Property(e => e.Timeline)
			.HasMaxLength(8);

		builder.Property(e => e.EntryType)
			.IsUnicode(true)
			.HasMaxLength(10);
	}
}
