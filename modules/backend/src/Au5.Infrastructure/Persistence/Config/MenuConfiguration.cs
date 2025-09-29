using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class MenuConfiguration : IEntityTypeConfiguration<Menu>
{
	public void Configure(EntityTypeBuilder<Menu> builder)
	{
		builder.ToTable("Menus");

		builder.HasKey(m => m.Id);

		builder.Property(m => m.Title)
			.IsRequired()
			.HasMaxLength(100);

		builder.Property(m => m.Url)
			.HasMaxLength(200);

		builder.Property(m => m.Icon)
			.HasMaxLength(50);

		builder.Property(m => m.SortOrder)
			.HasDefaultValue(0);

		builder.Property(m => m.IsActive)
			.HasDefaultValue(true);

		builder.HasMany(m => m.Children)
			   .WithOne(m => m.Parent)
			   .HasForeignKey(m => m.ParentId)
			   .OnDelete(DeleteBehavior.Restrict);

		builder.HasMany(m => m.RoleMenus)
			   .WithOne(rm => rm.Menu)
			   .HasForeignKey(rm => rm.MenuId)
			   .OnDelete(DeleteBehavior.Cascade);
	}
}
