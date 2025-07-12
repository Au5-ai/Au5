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
	}
}
