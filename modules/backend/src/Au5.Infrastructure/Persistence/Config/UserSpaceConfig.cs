using Au5.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Au5.Infrastructure.Persistence.Config;

public class UserSpaceConfig : IEntityTypeConfiguration<UserSpace>
{
	public void Configure(EntityTypeBuilder<UserSpace> builder)
	{
		builder.HasKey(us => new { us.UserId, us.SpaceId })
			.HasName("PK_dbo_UserSpace");

		builder.Property(x => x.JoinedAt)
			.IsRequired();

		builder.HasOne(us => us.User)
			.WithMany(u => u.UserSpaces)
			.HasForeignKey(us => us.UserId)
			.OnDelete(DeleteBehavior.Restrict);

		builder.HasOne(us => us.Space)
			.WithMany(s => s.UserSpaces)
			.HasForeignKey(us => us.SpaceId)
			.OnDelete(DeleteBehavior.Restrict);
	}
}
