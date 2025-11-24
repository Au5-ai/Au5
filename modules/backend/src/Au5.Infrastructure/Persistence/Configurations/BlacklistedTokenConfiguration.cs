using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Configurations;

public class BlacklistedTokenConfiguration : IEntityTypeConfiguration<BlacklistedToken>
{
	public void Configure(EntityTypeBuilder<BlacklistedToken> builder)
	{
		builder.HasKey(x => x.Id);

		builder.Property(x => x.UserId)
			.IsRequired()
			.HasMaxLength(50);

		builder.Property(x => x.Jti)
			.IsRequired()
			.HasMaxLength(50);

		builder.Property(x => x.ExpiresAt)
			.IsRequired();

		builder.Property(x => x.BlacklistedAt)
			.IsRequired();

		builder.HasIndex(x => new { x.UserId, x.Jti })
			.IsUnique();

		builder.HasIndex(x => x.ExpiresAt);
	}
}
