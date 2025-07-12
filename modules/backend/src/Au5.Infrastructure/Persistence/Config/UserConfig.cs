using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class UserConfig : IEntityTypeConfiguration<User>
{
	public void Configure(EntityTypeBuilder<User> builder)
	{
		builder.HasKey(t => t.Id)
			.HasName("PK_dbo_User");

		builder.Property(x => x.Password)
			.IsRequired()
			.HasMaxLength(500);

		builder.Property(x => x.Email)
			.IsRequired()
			.HasMaxLength(75);

		builder.HasIndex(x => x.Email)
			.IsUnique();

		builder.Property(x => x.FullName)
			.IsRequired()
			.HasMaxLength(50);

		builder.Property(x => x.IsActive)
			.IsRequired();

		builder.Property(x => x.PictureUrl)
			.HasMaxLength(250);
	}
}
