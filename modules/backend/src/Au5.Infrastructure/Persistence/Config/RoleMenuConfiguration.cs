using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class RoleMenuConfiguration : IEntityTypeConfiguration<RoleMenu>
{
	public void Configure(EntityTypeBuilder<RoleMenu> builder)
	{
		builder.ToTable("RoleMenus");

		builder.HasKey(rm => new { rm.RoleType, rm.MenuId });

		builder.Property(rm => rm.RoleType)
			   .IsRequired();

		builder.HasOne(rm => rm.Menu)
			   .WithMany(m => m.RoleMenus)
			   .HasForeignKey(rm => rm.MenuId)
			   .OnDelete(DeleteBehavior.Cascade);
	}
}
