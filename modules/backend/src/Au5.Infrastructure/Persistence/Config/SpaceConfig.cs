using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class SpaceConfig : IEntityTypeConfiguration<Space>
{
	public void Configure(EntityTypeBuilder<Space> builder)
	{
		builder.HasKey(t => t.Id)
			.HasName("PK_dbo_Space");

		builder.Property(x => x.Name)
			.IsRequired()
			.HasMaxLength(100);

		builder.Property(x => x.Description)
			.HasMaxLength(500);

		builder.Property(x => x.IsActive)
			.IsRequired();

		builder.Property(x => x.CreatedAt)
			.IsRequired();

		builder.HasOne(s => s.Parent)
			.WithMany(s => s.Children)
			.HasForeignKey(s => s.ParentId)
			.OnDelete(DeleteBehavior.Restrict);
	}
}
