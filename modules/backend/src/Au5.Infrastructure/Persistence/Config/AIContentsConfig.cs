using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class AIContentsConfig : IEntityTypeConfiguration<AIContents>
{
	public void Configure(EntityTypeBuilder<AIContents> builder)
	{
		builder.HasKey(t => t.Id)
		   .HasName("PK_dbo_AIContents");

		builder.Property(x => x.Content)
		   .IsRequired()
		   .IsUnicode(true)
		   .HasColumnType("nvarchar(max)");

		builder.Property(x => x.UserId).IsRequired();

		builder.Property(x => x.AssistantId).IsRequired();

		builder.Property(x => x.MeetingId).IsRequired();
	}
}
